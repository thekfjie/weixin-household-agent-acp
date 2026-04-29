#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
SERVICE_NAME="weixin-household-agent-acp"
PNPM_VERSION="10.13.1"

DEFAULT_APP_DIR="${REPO_DIR}"
DEFAULT_DATA_DIR="/var/lib/weixin-household-agent-acp"
DEFAULT_PORT="18080"
DEFAULT_TIMEZONE="Asia/Shanghai"
LEGACY_TMP_ENV="/tmp/${SERVICE_NAME}.env"
LEGACY_TMP_SERVICE="/tmp/${SERVICE_NAME}.service"
TMP_ENV_FILE=""
TMP_SERVICE_FILE=""
PNPM_CMD=()

YES=0
APP_DIR="${DEFAULT_APP_DIR}"
DATA_DIR="${DEFAULT_DATA_DIR}"
PORT="${DEFAULT_PORT}"
TIMEZONE="${DEFAULT_TIMEZONE}"
USER_MODE="current"
SERVICE_USER="weixin-agent"
SERVICE_GROUP="weixin-agent"
PERMISSION_MODE="none"
ADMIN_COMMAND=""
FAMILY_COMMAND=""
LOGIN_ROLE="admin"
SKIP_LOGIN=0
FORCE_LOGIN=0
NO_START=0

cleanup() {
  if [[ -n "${TMP_ENV_FILE}" && -f "${TMP_ENV_FILE}" ]]; then
    rm -f "${TMP_ENV_FILE}"
  fi

  if [[ -n "${TMP_SERVICE_FILE}" && -f "${TMP_SERVICE_FILE}" ]]; then
    rm -f "${TMP_SERVICE_FILE}"
  fi
}

trap cleanup EXIT

usage() {
  cat <<EOF
Usage: bash infra/scripts/linux/install.sh [options]

One-command local installer. By default it uses the current login user as the
systemd service user, installs dependencies, builds, asks for QR login only when
no account exists, and starts/restarts the service.

Options:
  -y, --yes                         Use defaults without configuration prompts
      --app-dir PATH                Install directory (default: current repo)
      --data-dir PATH               Data directory (default: ${DEFAULT_DATA_DIR})
      --port PORT                   Service port (default: ${DEFAULT_PORT})
      --timezone TZ                 Business timezone (default: ${DEFAULT_TIMEZONE})
      --user-mode current|dedicated Service user mode (default: current)
      --service-user USER           Dedicated service user name
      --permission-mode MODE        none|limited|full sudo policy (default: none)
      --admin-command CMD           Codex admin command
      --family-command CMD          Codex family command
      --login-role admin|family     Role used for first QR bind (default: admin)
      --skip-login                  Do not run terminal QR login
      --force-login                 Always run QR login even if accounts exist
      --no-start                    Install/build but do not restart systemd
  -h, --help                        Show this help
EOF
}

prompt_default() {
  local label="$1"
  local default_value="$2"
  local input

  if [[ "${YES}" -eq 1 ]]; then
    printf '%s\n' "${default_value}"
    return
  fi

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

  if [[ "${YES}" -eq 1 ]]; then
    [[ "${default_value}" =~ ^[yY] ]]
    return
  fi

  read -r -p "${label} [${default_value}]: " input
  input="${input:-$default_value}"
  case "${input}" in
    y|Y|yes|YES) return 0 ;;
    *) return 1 ;;
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

validate_choice() {
  local value="$1"
  shift
  local allowed
  for allowed in "$@"; do
    if [[ "${value}" == "${allowed}" ]]; then
      return
    fi
  done

  echo "Invalid value: ${value}" >&2
  exit 1
}

parse_args() {
  while [[ "$#" -gt 0 ]]; do
    case "$1" in
      -y|--yes)
        YES=1
        shift
        ;;
      --app-dir)
        APP_DIR="$2"
        shift 2
        ;;
      --data-dir)
        DATA_DIR="$2"
        shift 2
        ;;
      --port)
        PORT="$2"
        shift 2
        ;;
      --timezone)
        TIMEZONE="$2"
        shift 2
        ;;
      --user-mode)
        USER_MODE="$2"
        shift 2
        ;;
      --service-user)
        SERVICE_USER="$2"
        USER_MODE="dedicated"
        shift 2
        ;;
      --permission-mode)
        PERMISSION_MODE="$2"
        shift 2
        ;;
      --admin-command)
        ADMIN_COMMAND="$2"
        shift 2
        ;;
      --family-command)
        FAMILY_COMMAND="$2"
        shift 2
        ;;
      --login-role)
        LOGIN_ROLE="$2"
        shift 2
        ;;
      --skip-login)
        SKIP_LOGIN=1
        shift
        ;;
      --force-login)
        FORCE_LOGIN=1
        shift
        ;;
      --no-start)
        NO_START=1
        shift
        ;;
      -h|--help)
        usage
        exit 0
        ;;
      *)
        echo "Unknown option: $1" >&2
        usage >&2
        exit 1
        ;;
    esac
  done
}

require_node_version() {
  require_command node

  if ! node -e 'const [major, minor] = process.versions.node.split(".").map(Number); process.exit(major > 22 || (major === 22 && minor >= 5) ? 0 : 1);'; then
    echo "Node.js >= 22.5.0 is required because this project uses node:sqlite." >&2
    echo "Current version: $(node -v)" >&2
    exit 1
  fi
}

resolve_codex_command() {
  command -v codex 2>/dev/null || printf '%s\n' "codex"
}

prepare_package_manager() {
  export COREPACK_HOME="${COREPACK_HOME:-${APP_DIR}/.corepack}"
  export PNPM_HOME="${PNPM_HOME:-${APP_DIR}/.pnpm-home}"
  export PATH="${PNPM_HOME}:${PATH}"

  mkdir -p "${COREPACK_HOME}" "${PNPM_HOME}"

  if command -v corepack >/dev/null 2>&1; then
    corepack enable >/dev/null 2>&1 || true
    corepack prepare "pnpm@${PNPM_VERSION}" --activate >/dev/null 2>&1 || true
  fi

  if command -v pnpm >/dev/null 2>&1; then
    PNPM_CMD=(pnpm)
    return
  fi

  if command -v corepack >/dev/null 2>&1; then
    PNPM_CMD=(corepack pnpm)
    return
  fi

  if command -v npm >/dev/null 2>&1; then
    PNPM_CMD=(npm exec --yes "pnpm@${PNPM_VERSION}" --)
    return
  fi

  echo "Missing pnpm/corepack/npm. Install Node.js with Corepack enabled, then rerun." >&2
  exit 1
}

run_pnpm() {
  "${PNPM_CMD[@]}" "$@"
}

configure_interactively() {
  APP_DIR="$(prompt_default "Install directory" "${APP_DIR}")"
  DATA_DIR="$(prompt_default "Data directory" "${DATA_DIR}")"
  PORT="$(prompt_default "Service port" "${PORT}")"
  TIMEZONE="$(prompt_default "Timezone" "${TIMEZONE}")"

  if [[ "${YES}" -eq 0 ]]; then
    echo ""
    echo "Service user mode:"
    echo "  1) current login user (recommended for admin Codex)"
    echo "  2) dedicated service user"
    local service_user_mode
    read -r -p "Choose service user mode [1]: " service_user_mode
    if [[ "${service_user_mode:-1}" == "2" ]]; then
      USER_MODE="dedicated"
    else
      USER_MODE="current"
    fi
  fi

  if [[ "${USER_MODE}" == "dedicated" ]]; then
    SERVICE_USER="$(prompt_default "Dedicated service user" "${SERVICE_USER:-weixin-agent}")"
    SERVICE_GROUP="${SERVICE_USER}"
  else
    SERVICE_USER="$(id -un)"
    SERVICE_GROUP="$(id -gn)"
  fi

  if [[ "${YES}" -eq 0 ]]; then
    echo ""
    echo "Sudo policy for service user:"
    echo "  1) none    - no extra sudo access"
    echo "  2) limited - systemctl/journalctl/docker/apt"
    echo "  3) full    - full NOPASSWD sudo"
    local choice
    read -r -p "Permission mode [1]: " choice
    case "${choice:-1}" in
      1) PERMISSION_MODE="none" ;;
      2) PERMISSION_MODE="limited" ;;
      3) PERMISSION_MODE="full" ;;
      *) PERMISSION_MODE="none" ;;
    esac
  fi

  ADMIN_COMMAND="$(prompt_default "Codex admin command" "${ADMIN_COMMAND:-$(resolve_codex_command)}")"
  FAMILY_COMMAND="$(prompt_default "Codex family command" "${FAMILY_COMMAND:-${ADMIN_COMMAND}}")"
  LOGIN_ROLE="$(prompt_default "First QR bind role" "${LOGIN_ROLE}")"

  validate_choice "${USER_MODE}" current dedicated
  validate_choice "${PERMISSION_MODE}" none limited full
  validate_choice "${LOGIN_ROLE}" admin family
}

ensure_service_user() {
  if [[ "${USER_MODE}" == "current" ]]; then
    SERVICE_USER="$(id -un)"
    SERVICE_GROUP="$(id -gn)"
    return
  fi

  SERVICE_GROUP="${SERVICE_USER}"

  if ! getent group "${SERVICE_GROUP}" >/dev/null 2>&1; then
    echo "Creating group ${SERVICE_GROUP}"
    sudo groupadd --system "${SERVICE_GROUP}"
  fi

  if ! id "${SERVICE_USER}" >/dev/null 2>&1; then
    echo "Creating user ${SERVICE_USER}"
    sudo useradd -m -s /bin/bash -g "${SERVICE_GROUP}" "${SERVICE_USER}"
  fi
}

write_env_file() {
  local target_file="$1"
  local admin_workspace="${DATA_DIR}/runtime/admin"
  local family_workspace="${DATA_DIR}/runtime/family"

  cat > "${target_file}" <<EOF
PORT=${PORT}
TIMEZONE=${TIMEZONE}
DATA_DIR=${DATA_DIR}

WECHAT_API_BASE_URL=https://ilinkai.weixin.qq.com
WECHAT_CDN_BASE_URL=https://novac2c.cdn.weixin.qq.com/c2c
WECHAT_CHANNEL_VERSION=weixin-household-agent-acp-0.1.0
WECHAT_ROUTE_TAG=

CODEX_ADMIN_COMMAND=${ADMIN_COMMAND}
CODEX_ADMIN_MODE=full-auto
CODEX_ADMIN_WORKSPACE=${admin_workspace}

CODEX_FAMILY_COMMAND=${FAMILY_COMMAND}
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

  cat > "${service_file}" <<EOF
[Unit]
Description=${SERVICE_NAME}
After=network.target

[Service]
Type=simple
WorkingDirectory=${APP_DIR}
Environment=NODE_ENV=production
EnvironmentFile=${APP_DIR}/.env
ExecStart=/usr/bin/env node dist/apps/server/index.js
Restart=always
RestartSec=5
User=${SERVICE_USER}
Group=${SERVICE_GROUP}

[Install]
WantedBy=multi-user.target
EOF
}

write_sudoers() {
  local sudoers_file="/etc/sudoers.d/${SERVICE_NAME}"

  sudo rm -f "${sudoers_file}"

  case "${PERMISSION_MODE}" in
    none)
      return
      ;;
    limited)
      sudo tee "${sudoers_file}" >/dev/null <<EOF
Defaults:${SERVICE_USER} !requiretty
${SERVICE_USER} ALL=(root) NOPASSWD: /usr/bin/systemctl, /usr/bin/journalctl, /usr/bin/docker, /usr/bin/apt, /usr/bin/apt-get
EOF
      ;;
    full)
      sudo tee "${sudoers_file}" >/dev/null <<EOF
Defaults:${SERVICE_USER} !requiretty
${SERVICE_USER} ALL=(ALL) NOPASSWD: ALL
EOF
      ;;
  esac

  sudo chmod 440 "${sudoers_file}"
}

sync_app_dir() {
  sudo mkdir -p "${APP_DIR}" "${DATA_DIR}" "${DATA_DIR}/runtime/admin" "${DATA_DIR}/runtime/family"
  sudo rm -f "${LEGACY_TMP_ENV}" "${LEGACY_TMP_SERVICE}"
  sudo rm -f "/tmp/${SERVICE_NAME}.env."* "/tmp/${SERVICE_NAME}.service."* 2>/dev/null || true

  if [[ "${APP_DIR}" != "${REPO_DIR}" ]]; then
    require_command rsync
    sudo rsync -a --delete \
      --exclude ".git" \
      --exclude "node_modules" \
      --exclude "dist" \
      --exclude "data" \
      "${REPO_DIR}/" "${APP_DIR}/"
    sudo chown -R "$(id -un):$(id -gn)" "${APP_DIR}"
  fi

  sudo chown -R "${SERVICE_USER}:${SERVICE_GROUP}" "${DATA_DIR}"
}

install_env_and_service() {
  TMP_ENV_FILE="$(mktemp "/tmp/${SERVICE_NAME}.env.XXXXXX")"
  TMP_SERVICE_FILE="$(mktemp "/tmp/${SERVICE_NAME}.service.XXXXXX")"

  write_env_file "${TMP_ENV_FILE}"
  sudo install -m 640 -o root -g "${SERVICE_GROUP}" "${TMP_ENV_FILE}" "${APP_DIR}/.env"

  write_sudoers
  write_systemd_service "${TMP_SERVICE_FILE}"
  sudo install -m 644 -o root -g root "${TMP_SERVICE_FILE}" "/etc/systemd/system/${SERVICE_NAME}.service"
}

build_project() {
  pushd "${APP_DIR}" >/dev/null
  prepare_package_manager

  if ! CI=1 run_pnpm install --frozen-lockfile; then
    CI=1 run_pnpm install
  fi

  run_pnpm build
  popd >/dev/null
}

run_node_as_service_user() {
  local script_path="$1"
  shift
  local env_args=(
    "PORT=${PORT}"
    "TIMEZONE=${TIMEZONE}"
    "DATA_DIR=${DATA_DIR}"
    "WECHAT_API_BASE_URL=https://ilinkai.weixin.qq.com"
    "WECHAT_CDN_BASE_URL=https://novac2c.cdn.weixin.qq.com/c2c"
    "WECHAT_CHANNEL_VERSION=weixin-household-agent-acp-0.1.0"
    "CODEX_ADMIN_COMMAND=${ADMIN_COMMAND}"
    "CODEX_ADMIN_MODE=full-auto"
    "CODEX_ADMIN_WORKSPACE=${DATA_DIR}/runtime/admin"
    "CODEX_FAMILY_COMMAND=${FAMILY_COMMAND}"
    "CODEX_FAMILY_MODE=suggest"
    "CODEX_FAMILY_WORKSPACE=${DATA_DIR}/runtime/family"
    "FAMILY_STRIP_REASONING=true"
    "FAMILY_STRIP_COMMANDS=true"
    "FAMILY_STRIP_PATHS=true"
    "ALLOW_FILE_SEND=true"
  )

  if [[ "${SERVICE_USER}" == "$(id -un)" ]]; then
    env "${env_args[@]}" node "${script_path}" "$@"
  else
    sudo -u "${SERVICE_USER}" -H env "${env_args[@]}" node "${script_path}" "$@"
  fi
}

has_saved_accounts() {
  local db_file="${DATA_DIR}/weixin-household-agent-acp.sqlite"

  if [[ ! -f "${db_file}" ]]; then
    return 1
  fi

  run_node_as_service_user -e '
const { DatabaseSync } = require("node:sqlite");
const db = new DatabaseSync(process.argv[1]);
try {
  const row = db.prepare("SELECT COUNT(*) AS count FROM wechat_accounts").get();
  process.exit(Number(row.count) > 0 ? 0 : 1);
} catch {
  process.exit(1);
} finally {
  db.close();
}
' "${db_file}" >/dev/null 2>&1
}

run_login_if_needed() {
  if [[ "${SKIP_LOGIN}" -eq 1 ]]; then
    echo "Skipping QR login by request."
    return
  fi

  if [[ "${FORCE_LOGIN}" -eq 0 ]] && has_saved_accounts; then
    echo "Saved WeChat account found. Skipping QR login."
    return
  fi

  local setup_args=("${LOGIN_ROLE}")
  if [[ "${FORCE_LOGIN}" -eq 1 ]]; then
    setup_args+=("--force")
  fi

  echo ""
  echo "Starting terminal QR login for role: ${LOGIN_ROLE}"
  echo "Scan with WeChat and confirm on your phone. The installer will continue afterwards."
  echo ""

  pushd "${APP_DIR}" >/dev/null
  run_node_as_service_user "dist/apps/server/setup.js" "${setup_args[@]}"
  popd >/dev/null
}

start_service() {
  sudo chown -R "${SERVICE_USER}:${SERVICE_GROUP}" "${DATA_DIR}"
  sudo chmod -R a+rX "${APP_DIR}"

  sudo systemctl daemon-reload
  sudo systemctl enable "${SERVICE_NAME}"

  if [[ "${NO_START}" -eq 1 ]]; then
    echo "Systemd service installed but not started because --no-start was used."
    return
  fi

  sudo systemctl restart "${SERVICE_NAME}"
}

print_summary() {
  echo ""
  echo "Install completed."
  echo "Useful commands:"
  echo "  sudo systemctl status ${SERVICE_NAME}"
  echo "  journalctl -u ${SERVICE_NAME} -f"
  echo "  curl http://127.0.0.1:${PORT}/healthz"
  echo ""
  echo "Bind another account later:"
  echo "  cd ${APP_DIR} && node dist/apps/server/setup.js family --force"
}

main() {
  parse_args "$@"
  require_non_root
  require_command git
  require_command sudo
  require_node_version

  configure_interactively
  ensure_service_user

  echo "== ${SERVICE_NAME} install =="
  echo "Repository: ${REPO_DIR}"
  echo "Install directory: ${APP_DIR}"
  echo "Data directory: ${DATA_DIR}"
  echo "Service user: ${SERVICE_USER}:${SERVICE_GROUP}"
  echo "Permission mode: ${PERMISSION_MODE}"
  echo "Port: ${PORT}"
  echo "Timezone: ${TIMEZONE}"
  echo "First QR role: ${LOGIN_ROLE}"
  echo ""

  if ! prompt_yes_no "Continue installation?" "y"; then
    echo "Install cancelled."
    exit 0
  fi

  sync_app_dir
  install_env_and_service
  build_project
  run_login_if_needed
  start_service
  print_summary
}

main "$@"
