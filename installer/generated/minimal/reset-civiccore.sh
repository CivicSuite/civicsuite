#!/usr/bin/env bash
set -euo pipefail
KIT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_PATH="${KIT_ROOT}/.venv"

if [[ -d "${VENV_PATH}" ]]; then
  rm -rf "${VENV_PATH}"
  echo "Removed kit-local CivicCore virtual environment: ${VENV_PATH}"
else
  echo "No kit-local CivicCore virtual environment found. Nothing to reset."
fi
