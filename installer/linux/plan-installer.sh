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
SHOW_EXECUTOR_DESIGN=()
SHOW_EVIDENCE_SCHEMA=()
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
    --show-executor-design)
      SHOW_EXECUTOR_DESIGN=("--show-executor-design")
      shift
      ;;
    --show-evidence-schema)
      SHOW_EVIDENCE_SCHEMA=("--show-evidence-schema")
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
if [[ ${#SHOW_EXECUTOR_DESIGN[@]} -gt 0 ]]; then
  echo "Executor design requested: dry-run only"
fi
if [[ ${#SHOW_EVIDENCE_SCHEMA[@]} -gt 0 ]]; then
  echo "Evidence schema requested: dry-run only"
fi
python3 "${REPO_ROOT}/scripts/plan-installer.py" --profile "${PROFILE}" --menu-style "${MENU_STYLE}" --dry-run "${SHOW_MENU[@]}" "${SHOW_READINESS[@]}" "${DETECT_HOST[@]}" "${EXECUTE[@]}" "${SHOW_EXECUTOR_DESIGN[@]}" "${SHOW_EVIDENCE_SCHEMA[@]}" --readiness-scenario "${READINESS_SCENARIO}" "${APPROVAL_ARGS[@]}" "${MODULE_ARGS[@]}"
