#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME="weixin-household-agent-acp"
DEFAULT_APP_DIR="/opt/weixin-household-agent-acp"
DEFAULT_DATA_DIR="/var/lib/weixin-household-agent-acp"
LEGACY_TMP_ENV="/tmp/${SERVICE_NAME}.env"
LEGACY_TMP_SERVICE="/tmp/${SERVICE_NAME}.service"

YES=0
APP_DIR="${DEFAULT_APP_DIR}"
DATA_DIR="${DEFAULT_DATA_DIR}"
SERVICE_USER="weixin-agent"
REMOVE_USER=1

usage() {
  cat <<EOF
Usage: bash infra/scripts/linux/uninstall.sh [options]

Options:
  -y, --yes                 Use defaults without prompts
      --app-dir PATH        App directory to remove
      --data-dir PATH       Data directory to remove
      --service-user USER   Dedicated service user to remove if it exists
      --keep-user           Do not remove the service user
  -h, --help                Show this help
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
    return
  fi

  read -r -p "${label} [${default_value}]: " input
  input="${input:-$default_value}"
  case "${input}" in
    y|Y|yes|YES) return 0 ;;
    *) return 1 ;;
  esac
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
      --service-user)
        SERVICE_USER="$2"
        shift 2
        ;;
      --keep-user)
        REMOVE_USER=0
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

require_safe_path() {
  local label="$1"
  local target="$2"

  if [[ -z "${target}" || "${target}" == "/" ]]; then
    echo "Refusing to remove unsafe ${label}: ${target}" >&2
    exit 1
  fi
}

main() {
  parse_args "$@"

  APP_DIR="$(prompt_default "Install directory to remove" "${APP_DIR}")"
  DATA_DIR="$(prompt_default "Data directory to remove" "${DATA_DIR}")"
  SERVICE_USER="$(prompt_default "Service user to remove if dedicated" "${SERVICE_USER}")"

  require_safe_path "app_dir" "${APP_DIR}"
  require_safe_path "data_dir" "${DATA_DIR}"

  echo ""
  echo "This will remove:"
  echo "  service=${SERVICE_NAME}"
  echo "  app_dir=${APP_DIR}"
  echo "  data_dir=${DATA_DIR}"
  echo "  sudoers=/etc/sudoers.d/${SERVICE_NAME}"
  if [[ "${REMOVE_USER}" -eq 1 ]]; then
    echo "  user=${SERVICE_USER} (if it exists)"
  else
    echo "  user removal skipped"
  fi
  echo ""

  if ! prompt_yes_no "Continue uninstall?" "n"; then
    echo "Uninstall cancelled."
    exit 0
  fi

  sudo systemctl stop "${SERVICE_NAME}" 2>/dev/null || true
  sudo systemctl disable "${SERVICE_NAME}" 2>/dev/null || true
  sudo rm -f "/etc/systemd/system/${SERVICE_NAME}.service"
  sudo rm -f "/etc/sudoers.d/${SERVICE_NAME}"
  sudo rm -rf "${APP_DIR}"
  sudo rm -rf "${DATA_DIR}"
  sudo rm -f "${LEGACY_TMP_ENV}" "${LEGACY_TMP_SERVICE}"
  sudo rm -f "/tmp/${SERVICE_NAME}.env."* "/tmp/${SERVICE_NAME}.service."* 2>/dev/null || true
  sudo systemctl daemon-reload
  sudo systemctl reset-failed

  if [[ "${REMOVE_USER}" -eq 1 ]] && id "${SERVICE_USER}" >/dev/null 2>&1; then
    sudo userdel -r "${SERVICE_USER}" 2>/dev/null || sudo userdel "${SERVICE_USER}"
  fi

  echo ""
  echo "Uninstall completed."
}

main "$@"
