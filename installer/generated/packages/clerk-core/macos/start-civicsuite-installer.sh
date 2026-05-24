#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../../../.." && pwd)"
PLANNER="${REPO_ROOT}/scripts/plan-installer.py"
LIFECYCLE="${REPO_ROOT}/scripts/run-clerk-core-installer.py"

echo "CivicSuite OSS public-use starter installer package"
echo "Signing status: unsigned. Your OS may show an unknown developer/publisher warning."
echo "Trust path: verify the SHA256 checksum from installer/dist and the official CivicSuite release source before running lifecycle commands."
echo "Project status: public-use starter release; the installer is intentionally unsigned."

MODE="${1:-readiness}"
if [[ "$#" -gt 0 ]]; then
  shift || true
fi

PLANNER_ARGS=(--menu-style "guided" --dry-run)
LIFECYCLE_MODULE_ARGS=()
LIFECYCLE_MODE_ARGS=(--staff-mode protected)
SELECTED_MODULES=()
while [[ "$#" -gt 0 ]]; do
  case "$1" in
    --staff-mode)
      if [[ "$#" -lt 2 ]]; then
        echo "--staff-mode requires protected, bearer, or open" >&2
        exit 2
      fi
      LIFECYCLE_MODE_ARGS=(--staff-mode "$2")
      shift 2
      ;;
    --workflow-proof)
      LIFECYCLE_MODE_ARGS+=(--workflow-proof)
      shift
      ;;
    --module)
      if [[ "$#" -lt 2 ]]; then
        echo "--module requires civicrecords-ai, civicclerk, or civiccode" >&2
        exit 2
      fi
      SELECTED_MODULES+=("$2")
      LIFECYCLE_MODULE_ARGS+=(--module "$2")
      shift 2
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 2
      ;;
  esac
done

if [[ "${#SELECTED_MODULES[@]}" -gt 0 ]]; then
  PLANNER_ARGS=(--profile custom "${PLANNER_ARGS[@]}")
  LIFECYCLE_MODULE_ARGS=()
  for selected_module in "${SELECTED_MODULES[@]}"; do
    PLANNER_ARGS+=(--module "${selected_module}")
    LIFECYCLE_MODULE_ARGS+=(--module "${selected_module}")
  done
else
  PLANNER_ARGS=(--profile clerk-core "${PLANNER_ARGS[@]}")
fi

case "${MODE}" in
  plan)
    python3 "${PLANNER}" "${PLANNER_ARGS[@]}"
    ;;
  install)
    python3 "${LIFECYCLE}" install "${LIFECYCLE_MODE_ARGS[@]}" "${LIFECYCLE_MODULE_ARGS[@]}"
    ;;
  verify)
    python3 "${LIFECYCLE}" verify "${LIFECYCLE_MODE_ARGS[@]}" "${LIFECYCLE_MODULE_ARGS[@]}"
    ;;
  repair)
    python3 "${LIFECYCLE}" repair "${LIFECYCLE_MODE_ARGS[@]}" "${LIFECYCLE_MODULE_ARGS[@]}"
    ;;
  backup)
    python3 "${LIFECYCLE}" backup "${LIFECYCLE_MODULE_ARGS[@]}"
    ;;
  restore)
    python3 "${LIFECYCLE}" restore "${LIFECYCLE_MODULE_ARGS[@]}"
    ;;
  uninstall)
    python3 "${LIFECYCLE}" uninstall "${LIFECYCLE_MODULE_ARGS[@]}"
    ;;
  readiness)
    python3 "${PLANNER}" "${PLANNER_ARGS[@]}" --show-readiness --detect-host
    ;;
  *)
    echo "Usage: $0 [readiness|plan|install|verify|repair|backup|restore|uninstall] [--staff-mode protected|bearer|open] [--workflow-proof] [--module civicrecords-ai] [--module civicclerk] [--module civiccode]" >&2
    exit 2
    ;;
esac
