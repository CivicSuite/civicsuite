#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../../../.." && pwd)"
PLANNER="${REPO_ROOT}/scripts/plan-installer.py"
LIFECYCLE="${REPO_ROOT}/scripts/run-clerk-core-installer.py"

echo "CivicSuite OSS beta installer package"
echo "Signing status: unsigned. Your OS may show an unknown developer/publisher warning."
echo "Trust path: verify the SHA256 checksum from installer/dist before running lifecycle commands."
echo "Project status: open-source beta; code signing certificates are not available yet."

MODE="${1:-readiness}"
case "${MODE}" in
  gate)
    python3 "${PLANNER}" --profile clerk-core --menu-style guided --run-cleanroom-gate
    ;;
  plan)
    python3 "${PLANNER}" --profile clerk-core --menu-style guided --dry-run
    ;;
  install)
    python3 "${LIFECYCLE}" install
    ;;
  verify)
    python3 "${LIFECYCLE}" verify
    ;;
  repair)
    python3 "${LIFECYCLE}" repair
    ;;
  uninstall)
    python3 "${LIFECYCLE}" uninstall
    ;;
  readiness)
    python3 "${PLANNER}" --profile clerk-core --menu-style guided --show-readiness --detect-host --dry-run
    ;;
  *)
    echo "Usage: $0 [readiness|plan|install|verify|repair|uninstall|gate]" >&2
    exit 2
    ;;
esac
