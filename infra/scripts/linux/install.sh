#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
SERVICE_NAME="weixin-household-agent-acp"
DEFAULT_DATA_DIR="/var/lib/weixin-household-agent-acp"
DEFAULT_PORT="18080"
DEFAULT_TIMEZONE="Asia/Shanghai"
LEGACY_TMP_ENV="/tmp/${SERVICE_NAME}.env"
LEGACY_TMP_SERVICE="/tmp/${SERVICE_NAME}.service"
TMP_ENV_FILE=""
TMP_SERVICE_FILE=""

cleanup() {
  if [[ -n "${TMP_ENV_FILE}" && -f "${TMP_ENV_FILE}" ]]; then
    rm -f "${TMP_ENV_FILE}"
  fi

  if [[ -n "${TMP_SERVICE_FILE}" && -f "${TMP_SERVICE_FILE}" ]]; then
    rm -f "${TMP_SERVICE_FILE}"
  fi
}

trap cleanup EXIT

prompt_default() {
  local label="$1"
  local default_value="$2"
  local input
  read -r -p "${label} [${default_value}]: " input
  if [[ -z "${input}" ]]; then
    printf '%s\n' "${default_value}"
  else
    printf '%s\n' "${input}"
  fi
}

prompt_yes_no() {
  local label="$1"
  local default_value="$2"
  local input
  read -r -p "${label} [${default_value}]: " input
  input="${input:-$default_value}"
  case "${input}" in
    y|Y|yes|YES) return 0 ;;
    *) return 1 ;;
  esac
}

choose_permission_mode() {
  echo "" >&2
  echo "Choose sudo policy for the service user:" >&2
  echo "  1) none    - no sudo access" >&2
  echo "  2) limited - systemctl/journalctl/docker/apt" >&2
  echo "  3) full    - full NOPASSWD sudo" >&2
  local choice
  read -r -p "Permission mode [1]: " choice
  case "${choice:-1}" in
    1) printf '%s\n' "none" ;;
    2) printf '%s\n' "limited" ;;
    3) printf '%s\n' "full" ;;
    *) printf '%s\n' "none" ;;
  esac
}

require_command() {
  local command_name="$1"
  if ! command -v "${command_name}" >/dev/null 2>&1; then
    echo "Missing required command: ${command_name}" >&2
    exit 1
  fi
}

require_non_root() {
  if [[ "${EUID}" -eq 0 ]]; then
    echo "Please run this installer as your normal login user with sudo access." >&2
    echo "Do not prefix the install command with sudo." >&2
    exit 1
  fi
}

write_env_file() {
  local target_file="$1"
  local port="$2"
  local timezone="$3"
  local data_dir="$4"
  local admin_command="$5"
  local family_command="$6"
  local admin_workspace="$7"
  local family_workspace="$8"

  cat > "${target_file}" <<EOF
PORT=${port}
TIMEZONE=${timezone}
DATA_DIR=${data_dir}

WECHAT_API_BASE_URL=https://ilinkai.weixin.qq.com
WECHAT_CDN_BASE_URL=https://novac2c.cdn.weixin.qq.com/c2c
WECHAT_CHANNEL_VERSION=weixin-household-agent-acp-0.1.0
WECHAT_ROUTE_TAG=

CODEX_ADMIN_COMMAND=${admin_command}
CODEX_ADMIN_MODE=full-auto
CODEX_ADMIN_WORKSPACE=${admin_workspace}

CODEX_FAMILY_COMMAND=${family_command}
CODEX_FAMILY_MODE=suggest
CODEX_FAMILY_WORKSPACE=${family_workspace}

FAMILY_STRIP_REASONING=true
FAMILY_STRIP_COMMANDS=true
FAMILY_STRIP_PATHS=true
ALLOW_FILE_SEND=true
EOF
}

write_systemd_service() {
  local service_file="$1"
  local app_dir="$2"
  local service_user="$3"
  local service_group="$4"

  cat > "${service_file}" <<EOF
[Unit]
Description=${SERVICE_NAME}
After=network.target

[Service]
Type=simple
WorkingDirectory=${app_dir}
Environment=NODE_ENV=production
EnvironmentFile=${app_dir}/.env
ExecStart=/usr/bin/env node dist/apps/server/index.js
Restart=always
RestartSec=5
User=${service_user}
Group=${service_group}

[Install]
WantedBy=multi-user.target
EOF
}

write_sudoers() {
  local service_user="$1"
  local permission_mode="$2"
  local sudoers_file="/etc/sudoers.d/${SERVICE_NAME}"

  sudo rm -f "${sudoers_file}"

  case "${permission_mode}" in
    none)
      return
      ;;
    limited)
      sudo tee "${sudoers_file}" >/dev/null <<EOF
Defaults:${service_user} !requiretty
${service_user} ALL=(root) NOPASSWD: /usr/bin/systemctl, /usr/bin/journalctl, /usr/bin/docker, /usr/bin/apt, /usr/bin/apt-get
EOF
      ;;
    full)
      sudo tee "${sudoers_file}" >/dev/null <<EOF
Defaults:${service_user} !requiretty
${service_user} ALL=(ALL) NOPASSWD: ALL
EOF
      ;;
  esac

  sudo chmod 440 "${sudoers_file}"
}

main() {
  require_non_root
  require_command git
  require_command node
  require_command corepack

  echo "== ${SERVICE_NAME} install =="
  echo "Repository: ${REPO_DIR}"
  echo "Run mode: normal user with sudo prompts"
  echo ""

  local app_dir
  app_dir="$(prompt_default "Install directory" "${REPO_DIR}")"

  local data_dir
  data_dir="$(prompt_default "Data directory" "${DEFAULT_DATA_DIR}")"

  local port
  port="$(prompt_default "Service port" "${DEFAULT_PORT}")"

  local timezone
  timezone="$(prompt_default "Timezone" "${DEFAULT_TIMEZONE}")"

  echo ""
  echo "Service user mode:"
  echo "  1) dedicated service user"
  echo "  2) current login user (recommended for admin Codex)"
  local service_user_mode
  read -r -p "Choose service user mode [1]: " service_user_mode

  local service_user
  local service_group

  if [[ "${service_user_mode:-1}" == "2" ]]; then
    service_user="$(id -un)"
    service_group="$(id -gn)"
  else
    service_user="$(prompt_default "Dedicated service user" "weixin-agent")"
    service_group="${service_user}"
    if ! id "${service_user}" >/dev/null 2>&1; then
      echo "Creating user ${service_user}"
      sudo useradd -m -s /bin/bash "${service_user}"
    fi
  fi

  local permission_mode
  permission_mode="$(choose_permission_mode)"

  local admin_command
  admin_command="$(prompt_default "Codex admin command" "$(command -v codex || echo codex)")"

  local family_command
  family_command="$(prompt_default "Codex family command" "${admin_command}")"

  local admin_workspace="${data_dir}/runtime/admin"
  local family_workspace="${data_dir}/runtime/family"

  echo ""
  echo "Installing with:"
  echo "  app_dir=${app_dir}"
  echo "  data_dir=${data_dir}"
  echo "  service_user=${service_user}"
  echo "  permission_mode=${permission_mode}"
  echo "  port=${port}"
  echo ""

  if ! prompt_yes_no "Continue installation?" "y"; then
    echo "Install cancelled."
    exit 0
  fi

  sudo mkdir -p "${app_dir}"
  sudo mkdir -p "${data_dir}"
  sudo mkdir -p "${admin_workspace}"
  sudo mkdir -p "${family_workspace}"
  sudo rm -f "${LEGACY_TMP_ENV}" "${LEGACY_TMP_SERVICE}"
  sudo rm -f "/tmp/${SERVICE_NAME}.env."* "/tmp/${SERVICE_NAME}.service."* 2>/dev/null || true

  if [[ "${app_dir}" != "${REPO_DIR}" ]]; then
    require_command rsync
    sudo rsync -a --delete \
      --exclude ".git" \
      --exclude "node_modules" \
      --exclude "dist" \
      --exclude "data" \
      "${REPO_DIR}/" "${app_dir}/"
    sudo chown -R "$(id -un):$(id -gn)" "${app_dir}"
  fi

  TMP_ENV_FILE="$(mktemp "/tmp/${SERVICE_NAME}.env.XXXXXX")"
  TMP_SERVICE_FILE="$(mktemp "/tmp/${SERVICE_NAME}.service.XXXXXX")"

  write_env_file \
    "${TMP_ENV_FILE}" \
    "${port}" \
    "${timezone}" \
    "${data_dir}" \
    "${admin_command}" \
    "${family_command}" \
    "${admin_workspace}" \
    "${family_workspace}"

  sudo install -m 640 -o root -g "${service_group}" \
    "${TMP_ENV_FILE}" "${app_dir}/.env"

  write_sudoers "${service_user}" "${permission_mode}"
  write_systemd_service \
    "${TMP_SERVICE_FILE}" \
    "${app_dir}" \
    "${service_user}" \
    "${service_group}"

  sudo install -m 644 -o root -g root \
    "${TMP_SERVICE_FILE}" "/etc/systemd/system/${SERVICE_NAME}.service"

  pushd "${app_dir}" >/dev/null
  corepack pnpm install
  corepack pnpm build
  popd >/dev/null

  sudo chown -R "${service_user}:${service_group}" "${data_dir}"
  sudo chmod -R a+rX "${app_dir}"

  sudo systemctl daemon-reload
  sudo systemctl enable "${SERVICE_NAME}"
  sudo systemctl restart "${SERVICE_NAME}"

  echo ""
  echo "Install completed."
  echo "Useful commands:"
  echo "  sudo systemctl status ${SERVICE_NAME}"
  echo "  journalctl -u ${SERVICE_NAME} -f"
  echo "  curl http://127.0.0.1:${port}/healthz"
  echo ""
  echo "Recommended next step:"
  echo "  cd ${app_dir} && corepack pnpm run setup -- admin"
}

main "$@"
