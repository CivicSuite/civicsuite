#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

PROFILE="clerk-core"
MENU_STYLE="guided"
SHOW_MENU=()
SHOW_READINESS=()
DETECT_HOST=()
READINESS_SCENARIO="nominal"
EXECUTE=()
APPROVAL_ARGS=()
MODULE_ARGS=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --profile)
      PROFILE="$2"
      shift 2
      ;;
    --module)
      MODULE_ARGS+=("--module" "$2")
      shift 2
      ;;
    --menu-style)
      MENU_STYLE="$2"
      shift 2
      ;;
    --show-menu)
      SHOW_MENU=("--show-menu")
      shift
      ;;
    --show-readiness)
      SHOW_READINESS=("--show-readiness")
      shift
      ;;
    --detect-host)
      DETECT_HOST=("--detect-host")
      shift
      ;;
    --readiness-scenario)
      READINESS_SCENARIO="$2"
      shift 2
      ;;
    --execute)
      EXECUTE=("--execute")
      shift
      ;;
    --approval-token)
      APPROVAL_ARGS=("--approval-token" "$2")
      shift 2
      ;;
    *)
      echo "ERROR: Unknown argument: $1" >&2
      exit 2
      ;;
  esac
done

echo "CivicSuite installer launcher: Linux dry-run only"
echo "Profile: ${PROFILE}"
echo "Menu style: ${MENU_STYLE}"
if [[ ${#SHOW_READINESS[@]} -gt 0 ]]; then
  echo "Readiness scenario: ${READINESS_SCENARIO}"
  if [[ ${#DETECT_HOST[@]} -gt 0 ]]; then
    echo "Detection mode: host read-only"
  fi
fi
if [[ ${#EXECUTE[@]} -gt 0 ]]; then
  echo "Execution gate requested: blocked by default"
fi
python3 "${REPO_ROOT}/scripts/plan-installer.py" --profile "${PROFILE}" --menu-style "${MENU_STYLE}" --dry-run "${SHOW_MENU[@]}" "${SHOW_READINESS[@]}" "${DETECT_HOST[@]}" "${EXECUTE[@]}" --readiness-scenario "${READINESS_SCENARIO}" "${APPROVAL_ARGS[@]}" "${MODULE_ARGS[@]}"
