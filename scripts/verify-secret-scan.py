"""Lightweight secret-pattern scan for the CivicSuite umbrella repo.

This is not a replacement for a dedicated scanner such as gitleaks in product
repos. It is a zero-dependency CI ratchet for the umbrella docs/scripts repo.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]

EXCLUDED_DIRS = {
    ".git",
    ".pytest_cache",
    ".ruff_cache",
    "__pycache__",
    "audit-browser-qa",
    ".venv",
    "reports",
    "test-results",
}

EXCLUDED_SUFFIXES = {
    ".docx",
    ".pdf",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".svg",
    ".ico",
}

ALLOWLIST = {
    "${{ github.token }}",
    "mock-client-secret-not-reported",
    "No secrets in client code",
}

PATTERNS = [
    re.compile(r"-----BEGIN (?:RSA |OPENSSH |EC |DSA |)PRIVATE KEY-----"),
    re.compile(r"ghp_[A-Za-z0-9_]{20,}"),
    re.compile(r"github_pat_[A-Za-z0-9_]{20,}"),
    re.compile(r"sk-[A-Za-z0-9]{20,}"),
    re.compile(r"(?i)(api[_-]?key|client[_-]?secret|password|token)\s*=\s*['\"][^'\"\s]{12,}['\"]"),
]


def should_scan(path: Path) -> bool:
    if path.suffix.lower() in EXCLUDED_SUFFIXES:
        return False
    return not any(part in EXCLUDED_DIRS for part in path.relative_to(ROOT).parts)


def main() -> int:
    findings: list[str] = []
    for path in ROOT.rglob("*"):
        if not path.is_file() or not should_scan(path):
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        for line_no, line in enumerate(text.splitlines(), start=1):
            if any(allowed in line for allowed in ALLOWLIST):
                continue
            if any(pattern.search(line) for pattern in PATTERNS):
                rel = path.relative_to(ROOT).as_posix()
                findings.append(f"{rel}:{line_no}: possible secret pattern")

    if findings:
        print("VERIFY-SECRET-SCAN: FAILED")
        for finding in findings:
            print(f"  {finding}")
        return 1

    print("VERIFY-SECRET-SCAN: PASSED")
    return 0


if __name__ == "__main__":
    sys.exit(main())
