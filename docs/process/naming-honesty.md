# Naming Honesty

Test and evidence names must describe the boundary they actually exercise.

## Rule

Do not use `_live_`, `_real_wire_`, or `_integration_` in a test filename when
that file monkeypatches, stubs, or fakes the named integration boundary. A test that
replaces its outbound sender, HTTP client, socket path, module adapter, or
service boundary is unit, contract-shape, or in-process coverage. Name it that
way.

## Required Pattern

- Use `_unit_` for behavior covered with monkeypatches or fake senders.
- Use `_contract_` or `_shape_` for request/response shape validation that does
  not cross a live boundary.
- Use `_live_` or `_real_wire_` only when the test exercises the real boundary
  named in the file, such as a real local HTTP server, socket, process, or
  installed-stack lifecycle path.
- Use `_integration_` only when the test crosses a real module, process,
  protocol, or persistence boundary. Use `_contract_shape_` when it validates
  metadata or a mocked contract without crossing the boundary.
- When a mocked unit test replaces a formerly misnamed live test, keep the unit
  coverage and add a separate live/real-wire sibling only when release scope
  requires that boundary proof.

## Enforcement

`scripts/policy/check_test_naming_honesty.py` scans `_live_`, `_real_wire_`, and
`_integration_` test files and flags same-file monkeypatches of the named
boundary. The check is intentionally conservative: it looks for direct
`monkeypatch.setattr(...)` calls whose target shares the boundary words
advertised by the filename.
