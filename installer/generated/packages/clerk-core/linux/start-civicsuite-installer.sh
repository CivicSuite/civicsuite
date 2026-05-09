#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../../../.." && pwd)"
PLANNER="${REPO_ROOT}/scripts/plan-installer.py"

MODE="${1:-readiness}"
case "${MODE}" in
  gate)
    python3 "${PLANNER}" --profile clerk-core --menu-style guided --run-cleanroom-gate
    ;;
  plan)
    python3 "${PLANNER}" --profile clerk-core --menu-style guided --dry-run
    ;;
  readiness)
    python3 "${PLANNER}" --profile clerk-core --menu-style guided --show-readiness --detect-host --dry-run
    ;;
  *)
    echo "Usage: $0 [readiness|plan|gate]" >&2
    exit 2
    ;;
esac
