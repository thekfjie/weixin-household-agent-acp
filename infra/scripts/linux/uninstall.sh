#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME="weixin-household-agent-acp"
DEFAULT_APP_DIR="/opt/weixin-household-agent-acp"
DEFAULT_DATA_DIR="/var/lib/weixin-household-agent-acp"
LEGACY_TMP_ENV="/tmp/${SERVICE_NAME}.env"
LEGACY_TMP_SERVICE="/tmp/${SERVICE_NAME}.service"

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

main() {
  local app_dir
  app_dir="$(prompt_default "Install directory to remove" "${DEFAULT_APP_DIR}")"

  local data_dir
  data_dir="$(prompt_default "Data directory to remove" "${DEFAULT_DATA_DIR}")"

  local service_user
  service_user="$(prompt_default "Service user to remove if dedicated" "weixin-agent")"

  echo ""
  echo "This will remove:"
  echo "  service=${SERVICE_NAME}"
  echo "  app_dir=${app_dir}"
  echo "  data_dir=${data_dir}"
  echo "  sudoers=/etc/sudoers.d/${SERVICE_NAME}"
  echo "  user=${service_user} (if it exists)"
  echo ""

  if ! prompt_yes_no "Continue uninstall?" "n"; then
    echo "Uninstall cancelled."
    exit 0
  fi

  sudo systemctl stop "${SERVICE_NAME}" 2>/dev/null || true
  sudo systemctl disable "${SERVICE_NAME}" 2>/dev/null || true
  sudo rm -f "/etc/systemd/system/${SERVICE_NAME}.service"
  sudo rm -f "/etc/sudoers.d/${SERVICE_NAME}"
  sudo rm -rf "${app_dir}"
  sudo rm -rf "${data_dir}"
  sudo rm -f "${LEGACY_TMP_ENV}" "${LEGACY_TMP_SERVICE}"
  sudo rm -f "/tmp/${SERVICE_NAME}.env."* "/tmp/${SERVICE_NAME}.service."* 2>/dev/null || true
  sudo systemctl daemon-reload
  sudo systemctl reset-failed

  if id "${service_user}" >/dev/null 2>&1; then
    sudo userdel -r "${service_user}" 2>/dev/null || sudo userdel "${service_user}"
  fi

  echo ""
  echo "Uninstall completed."
}

main "$@"
