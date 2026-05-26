#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../../../.." && pwd)"
PLANNER="${REPO_ROOT}/scripts/plan-installer.py"
LIFECYCLE="${REPO_ROOT}/scripts/run-clerk-core-installer.py"

echo "CivicSuite city-core unsigned beta installer package"
echo "Signing status: unsigned. Your OS may show an unknown developer/publisher warning."
echo "Trust path: verify the SHA256 checksum from installer/dist and the official CivicSuite release source before running lifecycle commands."
echo "Project status: city-core beta; Linux and Windows matching-host lifecycle proof is required before promotion."

MODE="${1:-readiness}"
if [[ "$#" -gt 0 ]]; then
  shift || true
fi

PLANNER_ARGS=(--menu-style "guided" --dry-run)
LIFECYCLE_MODULE_ARGS=("--module" "civicrecords-ai" "--module" "civicclerk" "--module" "civiccode")
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
  PLANNER_ARGS=(--profile city-core "${PLANNER_ARGS[@]}")
fi

case "${MODE}" in
  first-run)
    echo ""
    echo "Choose setup path:"
    echo "1. Guided Setup - install missing Docker Engine components with sudo consent."
    echo "2. Manual Prerequisite - Docker Engine is already installed."
    printf "Enter 1 for Guided Setup or 2 for Manual Prerequisite: "
    read -r setup_choice
    if [[ "$setup_choice" == "1" ]]; then
      bash "$0" bootstrap-prerequisites
    elif [[ "$setup_choice" != "2" ]]; then
      echo "Choose 1 or 2. No installation was started." >&2
      exit 2
    fi
    python3 "${PLANNER}" "${PLANNER_ARGS[@]}" --show-readiness --detect-host
    python3 "${LIFECYCLE}" install "${LIFECYCLE_MODE_ARGS[@]}" "${LIFECYCLE_MODULE_ARGS[@]}"
    ;;
  bootstrap-prerequisites)
    if [[ "macos" == "macos" ]]; then
      echo "macOS prerequisite bootstrap is out of scope for this run. Use the documented beta readiness path only." >&2
      exit 2
    fi
    report_dir="${REPO_ROOT}/installer/reports/docker-wsl-bootstrap"
    mkdir -p "$report_dir"
    if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
      echo "Docker Engine is already installed and running."
      exit 0
    fi
    script_path="$report_dir/get-docker.sh"
    script_url="https://get.docker.com"
    echo "Downloading Docker's official Linux convenience script to $script_path"
    curl -fsSL "$script_url" -o "$script_path"
    sha256sum "$script_path" > "$report_dir/get-docker.sha256"
    printf '{"url":"%s","path":"%s","downloaded_at":"%s"}
' "$script_url" "$script_path" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$report_dir/get-docker-download.json"
    if [[ "$(id -u)" -eq 0 ]]; then
      sh "$script_path" 2>&1 | tee "$report_dir/get-docker-install.txt"
    else
      sudo sh "$script_path" 2>&1 | tee "$report_dir/get-docker-install.txt"
    fi
    ;;
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
    echo "Usage: $0 [first-run|bootstrap-prerequisites|readiness|plan|install|verify|repair|backup|restore|uninstall] [--staff-mode protected|bearer|open] [--workflow-proof] [--module civicrecords-ai] [--module civicclerk] [--module civiccode]" >&2
    exit 2
    ;;
esac
