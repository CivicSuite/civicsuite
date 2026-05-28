#!/usr/bin/env python3
"""Render the USER-MANUAL suite topology from installer/modules.json."""
from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
MODULES_JSON = ROOT / "installer" / "modules.json"
USER_MANUAL = ROOT / "USER-MANUAL.md"

START = "<!-- BEGIN GENERATED SUITE TOPOLOGY -->"
END = "<!-- END GENERATED SUITE TOPOLOGY -->"


def _module_by_id(data: dict[str, Any]) -> dict[str, dict[str, Any]]:
    return {module["id"]: module for module in data.get("modules", []) if "id" in module}


def _profile_by_id(data: dict[str, Any]) -> dict[str, dict[str, Any]]:
    return {profile["id"]: profile for profile in data.get("profiles", []) if "id" in profile}


def _fmt_commit(value: Any) -> str:
    if not isinstance(value, str) or not value:
        return "n/a"
    return f"`{value[:12]}`"


def render(data: dict[str, Any]) -> str:
    profiles = _profile_by_id(data)
    modules = _module_by_id(data)
    city_core = profiles.get("city-core", {})
    city_core_modules = [modules[module_id] for module_id in city_core.get("modules", []) if module_id in modules]
    excluded = city_core.get("excluded_modules", [])

    lines: list[str] = [
        START,
        "",
        "Generated from `installer/modules.json`. Re-run `python scripts/docs/render_topology.py --check` before publishing docs.",
        "",
        f"- Root installer truth label: `{data.get('installer_status', 'unknown')}`.",
        f"- City-core profile status: `{city_core.get('status', 'unknown')}`.",
        "- City-core modules are the only modules represented in the current beta-ready profile.",
        "- Disabled profiles and excluded modules remain documented as out of scope until their own gates clear.",
        "",
        "| Module | Version | Role | Dependencies | Source commit | Installer status |",
        "|---|---:|---|---|---|---|",
    ]

    for module in city_core_modules:
        deps = ", ".join(f"`{dep}`" for dep in module.get("dependencies", [])) or "none"
        lines.append(
            "| {name} | {version} | {role} | {deps} | {commit} | `{status}` |".format(
                name=module.get("display_name", module.get("id", "unknown")),
                version=module.get("current_version", "n/a"),
                role=module.get("role", "n/a"),
                deps=deps,
                commit=_fmt_commit(module.get("source_commit")),
                status=module.get("installer_status", "unknown"),
            )
        )

    if excluded:
        lines.extend(["", "Excluded from city-core:"])
        for item in excluded:
            module_id = item.get("id", "unknown")
            reason = item.get("reason", "No reason recorded.")
            lines.append(f"- `{module_id}`: {reason}")

    disabled = [profile for profile in profiles.values() if profile.get("disabled")]
    if disabled:
        lines.extend(["", "Disabled profiles:"])
        for profile in disabled:
            lines.append(
                "- `{id}` ({label}): {reason}".format(
                    id=profile.get("id", "unknown"),
                    label=profile.get("label", "unlabeled"),
                    reason=profile.get("disabled_reason", "disabled"),
                )
            )

    lines.extend(["", END])
    return "\n".join(lines)


def replace_block(markdown: str, block: str) -> str:
    if START not in markdown or END not in markdown:
        raise SystemExit(
            f"Sentinels not found in {USER_MANUAL}. Add {START!r} and {END!r} around the topology section."
        )
    before, rest = markdown.split(START, 1)
    _, after = rest.split(END, 1)
    return before.rstrip() + "\n\n" + block + after


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="Fail if USER-MANUAL.md is not up to date.")
    parser.add_argument("--write", action="store_true", help="Rewrite USER-MANUAL.md in place.")
    args = parser.parse_args()

    data = json.loads(MODULES_JSON.read_text(encoding="utf-8"))
    block = render(data)
    current = USER_MANUAL.read_text(encoding="utf-8")
    updated = replace_block(current, block) if args.check or args.write else None

    if args.check:
        if updated != current:
            print("FAIL: USER-MANUAL.md topology block is stale. Run python scripts/docs/render_topology.py --write")
            return 1
        print("PASS: USER-MANUAL.md topology block matches installer/modules.json")
        return 0

    if args.write:
        assert updated is not None
        USER_MANUAL.write_text(updated, encoding="utf-8", newline="\n")
        print(f"OK: updated {USER_MANUAL}")
        return 0

    print(block)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
