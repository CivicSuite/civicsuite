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
  install)
    python3 "${PLANNER}" --profile clerk-core --menu-style guided --execute --dry-run
    ;;
  verify)
    python3 "${PLANNER}" --profile clerk-core --menu-style guided --show-health-checks --dry-run
    ;;
  repair)
    python3 "${PLANNER}" --profile clerk-core --menu-style guided --show-preflight --dry-run
    ;;
  uninstall)
    python3 "${PLANNER}" --profile clerk-core --menu-style guided --show-executor-design --dry-run
    ;;
  readiness)
    python3 "${PLANNER}" --profile clerk-core --menu-style guided --show-readiness --detect-host --dry-run
    ;;
  *)
    echo "Usage: $0 [readiness|plan|install|verify|repair|uninstall|gate]" >&2
    exit 2
    ;;
esac
