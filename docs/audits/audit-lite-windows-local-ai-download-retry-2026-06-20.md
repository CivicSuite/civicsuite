# Audit Lite: Windows Local AI Download Retry

Date: 2026-06-20

Scope:
- `desktop/src-tauri/src/model.rs`
- TESTER-RESULT-104 failure where the installed product reached the Gemma model setup screen, downloaded a large partial/full model file, then failed with an invalid-partial cleanup error and left no resumable file.

Findings:
- 0 critical
- 0 high
- 0 medium
- 0 low

Notes:
- Initial audit found one retry-path gap: if a clean retry also produced a corrupt full-size model file, the product could still fall through to a generic missing-file inspection error. The fix now returns an explicit checksum failure that tells the operator a clean retry can start over.
- The manifest was checked against the Hugging Face model API and still matches the pinned file size, blob id, and SHA-256.

Verification:
- `cargo fmt --check`
- `cargo test corrupt_full_size_download_retries_clean_file_before_failing`
- `cargo test repeated_corrupt_full_size_download_reports_checksum_failure`
- `cargo test missing_invalid_partial_cleanup_is_not_user_visible_failure`
- `cargo test model_download`
- `cargo test`
- `npm --prefix desktop test -- --runInBand`
- `npm --prefix desktop run build`
- `python scripts\verify-deployment-profile.py --static-only`
- `git diff --check` with CRLF warning only
