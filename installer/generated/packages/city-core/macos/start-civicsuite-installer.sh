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
first_run_wizard() {
  local setup_path="${CIVICSUITE_SETUP_PATH:-}"
  if [[ -z "$setup_path" ]]; then
    echo ""
    echo "Choose setup path:"
    echo "1. Guided Setup - install missing Docker Engine components with sudo consent."
    echo "2. Manual Prerequisite - Docker Engine is already installed."
    printf "Enter 1 for Guided Setup or 2 for Manual Prerequisite: "
    read -r setup_path
  fi
  if [[ "$setup_path" == "guided" ]]; then setup_path="1"; fi
  if [[ "$setup_path" == "manual" ]]; then setup_path="2"; fi
  if [[ "$setup_path" != "1" && "$setup_path" != "2" ]]; then
    echo "Choose 1 or 2. No installation was started." >&2
    exit 2
  fi
  read_wizard_value "operator name" CIVICSUITE_OPERATOR_NAME "" required
  operator_name="$WIZARD_VALUE"
  read_wizard_value "organization name" CIVICSUITE_ORGANIZATION_NAME "" required
  organization_name="$WIZARD_VALUE"
  read_wizard_value "admin email" CIVICSUITE_ADMIN_EMAIL "admin@example.gov" required
  admin_email="$WIZARD_VALUE"
  read_wizard_value "time zone" CIVICSUITE_TIME_ZONE "$(detect_timezone)" required
  time_zone="$WIZARD_VALUE"
  license_accept="${CIVICSUITE_LICENSE_ACCEPT:-}"
  if [[ -z "$license_accept" ]]; then
    printf "Type ACCEPT to confirm CivicSuite terms and any Docker license prompt shown by Docker: "
    read -r license_accept
  fi
  if [[ "$license_accept" != "ACCEPT" ]]; then
    echo "License acceptance is required before first-run install. No installation was started." >&2
    exit 2
  fi
  export CIVICSUITE_FIRST_ADMIN_EMAIL="$admin_email"
  first_run_report_dir="${REPO_ROOT}/installer/reports/first-run"
  mkdir -p "$first_run_report_dir"
  first_run_report="${first_run_report_dir}/first-run-setup.json"
  setup_label="manual-prerequisite"
  if [[ "$setup_path" == "1" ]]; then setup_label="guided"; fi
  python3 - "$first_run_report" "$setup_label" "$operator_name" "$organization_name" "$admin_email" "$time_zone" "${CIVICSUITE_INSTALLER_INSTALL_ROOT:-${REPO_ROOT}/installer/runtime/clerk-core}" <<'PY'
import json, sys
from datetime import datetime, UTC
path, setup, operator, org, email, tz, root = sys.argv[1:]
payload = {
    "setup_path": setup,
    "operator_name": operator,
    "organization_name": org,
    "admin_email": email,
    "time_zone": tz,
    "license_acceptance": "accepted",
    "install_root": root,
    "generated_at": datetime.now(UTC).isoformat(),
    "rotation_required": True,
}
open(path, "w", encoding="utf-8").write(json.dumps(payload, indent=2) + "\n")
PY
  echo "First-run setup evidence: $first_run_report"
  WIZARD_SETUP_PATH="$setup_path"
  WIZARD_ADMIN_EMAIL="$admin_email"
  WIZARD_INSTALL_ROOT="${CIVICSUITE_INSTALLER_INSTALL_ROOT:-${REPO_ROOT}/installer/runtime/clerk-core}"
}

read_wizard_value() {
  local label="$1"
  local env_name="$2"
  local default="$3"
  local required="${4:-}"
  local preset="${!env_name:-}"
  if [[ -n "$preset" ]]; then
    echo "$label: $preset"
    WIZARD_VALUE="$preset"
    return
  fi
  while true; do
    if [[ -n "$default" ]]; then
      printf "%s [%s]: " "$label" "$default"
    else
      printf "%s: " "$label"
    fi
    read -r value
    if [[ -z "$value" && -n "$default" ]]; then value="$default"; fi
    if [[ -n "$value" || "$required" != "required" ]]; then
      WIZARD_VALUE="$value"
      return
    fi
    echo "This field is required so CivicSuite can finish first-run setup."
  done
}

detect_timezone() {
  if command -v timedatectl >/dev/null 2>&1; then
    timedatectl show -p Timezone --value 2>/dev/null || true
  fi
}

show_post_install_dashboard() {
  local credential_path="${WIZARD_INSTALL_ROOT}/sources/civicrecords-ai/data/secrets/first_admin_password"
  echo ""
  echo "CivicSuite staff dashboard is installed."
  echo "Admin email: $WIZARD_ADMIN_EMAIL"
  echo "Initial administrator credential file: $credential_path"
  echo "Open that file once, sign in, rotate the credential immediately, then store the rotated value in your municipal vault."
  echo "Records AI staff dashboard: http://127.0.0.1:18080/"
  echo "CivicClerk staff dashboard: http://127.0.0.1:18081/"
  echo "CivicCode API/search: http://127.0.0.1:18820/"
}

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
    first_run_wizard
    if [[ "$WIZARD_SETUP_PATH" == "1" ]]; then
      bash "$0" bootstrap-prerequisites
    fi
    python3 "${PLANNER}" "${PLANNER_ARGS[@]}" --show-readiness --detect-host
    if [[ "${CIVICSUITE_FIRST_RUN_SMOKE_ONLY:-}" == "1" ]]; then
      echo "First-run smoke only: setup wizard and readiness passed; install was not started."
      exit 0
    fi
    python3 "${LIFECYCLE}" install "${LIFECYCLE_MODE_ARGS[@]}" "${LIFECYCLE_MODULE_ARGS[@]}"
    show_post_install_dashboard
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
