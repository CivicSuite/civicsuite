#!/usr/bin/env bash
set -euo pipefail
KIT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_PATH="${KIT_ROOT}/.venv"
WHEEL_PATH="/mnt/c/Users/scott/OneDrive/Desktop/Claude/civiccore/dist/civiccore-1.2.0-py3-none-any.whl"

if ! command -v python3 >/dev/null 2>&1; then
  echo "Python 3.11+ is required before installing CivicCore. Install Python, reopen this terminal, then rerun this script." >&2
  exit 1
fi

python3 -m venv "${VENV_PATH}"
"${VENV_PATH}/bin/python" -m pip install --upgrade pip
"${VENV_PATH}/bin/python" -m pip install "${WHEEL_PATH}"
"${VENV_PATH}/bin/python" -c "import civiccore; print('CivicCore ' + civiccore.__version__ + ' installed')"
