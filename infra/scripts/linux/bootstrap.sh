#!/usr/bin/env bash
set -euo pipefail

SERVICE_NAME="weixin-household-agent-acp"
REPO_URL="${REPO_URL:-https://github.com/thekfjie/weixin-household-agent-acp.git}"
BRANCH="${BRANCH:-main}"
APP_DIR="${APP_DIR:-/opt/weixin-household-agent-acp}"
DATA_DIR="${DATA_DIR:-/var/lib/weixin-household-agent-acp}"
PORT="${PORT:-18080}"
TIMEZONE="${TIMEZONE:-Asia/Shanghai}"
USER_MODE="${USER_MODE:-current}"
PERMISSION_MODE="${PERMISSION_MODE:-none}"
LOGIN_ROLE="${LOGIN_ROLE:-admin}"

usage() {
  cat <<EOF
Usage: curl -fsSL <bootstrap-url> | bash

Environment overrides:
  REPO_URL=${REPO_URL}
  BRANCH=${BRANCH}
  APP_DIR=${APP_DIR}
  DATA_DIR=${DATA_DIR}
  PORT=${PORT}
  TIMEZONE=${TIMEZONE}
  USER_MODE=${USER_MODE}
  PERMISSION_MODE=${PERMISSION_MODE}
  LOGIN_ROLE=${LOGIN_ROLE}

Example:
  curl -fsSL https://raw.githubusercontent.com/thekfjie/weixin-household-agent-acp/main/infra/scripts/linux/bootstrap.sh | LOGIN_ROLE=admin PORT=18080 bash
EOF
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

if [[ "${EUID}" -eq 0 ]]; then
  echo "Please run bootstrap as your normal login user, not with sudo." >&2
  exit 1
fi

require_command() {
  local command_name="$1"
  if ! command -v "${command_name}" >/dev/null 2>&1; then
    echo "Missing required command: ${command_name}" >&2
    exit 1
  fi
}

require_command git
require_command sudo
require_command bash

echo "== ${SERVICE_NAME} bootstrap =="
echo "Repository: ${REPO_URL}"
echo "Branch: ${BRANCH}"
echo "Install directory: ${APP_DIR}"
echo ""

if [[ -d "${APP_DIR}/.git" ]]; then
  echo "Updating existing checkout..."
  git -C "${APP_DIR}" fetch origin "${BRANCH}"
  git -C "${APP_DIR}" checkout "${BRANCH}"
  git -C "${APP_DIR}" pull --ff-only origin "${BRANCH}"
else
  sudo mkdir -p "${APP_DIR}"
  sudo chown "$(id -un):$(id -gn)" "${APP_DIR}"

  if [[ -n "$(find "${APP_DIR}" -mindepth 1 -maxdepth 1 -print -quit)" ]]; then
    echo "Install directory exists but is not an empty git checkout: ${APP_DIR}" >&2
    echo "Move it away or set APP_DIR to another path." >&2
    exit 1
  fi

  echo "Cloning repository..."
  git clone --branch "${BRANCH}" "${REPO_URL}" "${APP_DIR}"
fi

cd "${APP_DIR}"

bash infra/scripts/linux/install.sh \
  --yes \
  --app-dir "${APP_DIR}" \
  --data-dir "${DATA_DIR}" \
  --port "${PORT}" \
  --timezone "${TIMEZONE}" \
  --user-mode "${USER_MODE}" \
  --permission-mode "${PERMISSION_MODE}" \
  --login-role "${LOGIN_ROLE}"
