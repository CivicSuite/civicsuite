# VMHOST-DIRECTIVE-006 - SET UP AI HEARTBEAT LOOP (10-minute repo check)

This directive is for the AI agent session running on this machine.

## What you must do right now

Call `ScheduleWakeup` with a 10-minute delay (600 seconds) after you finish reading this
directive. Every time you wake up, do the following:

1. Pull the repo: `git fetch origin stage-3a-baremetal-windows --force` then
   `git checkout -f -B stage-3a-baremetal-windows FETCH_HEAD` in `C:\dev\Codex\civicsuite`
2. Look for any `test-comms/vmhost-beelink/VMHOST-DIRECTIVE-NNN.md` or `.ps1` file
   that has no matching `VMHOST-RESULT-NNN.md`
3. If there is unprocessed work: read it, do it, write the result, push it
4. Schedule the NEXT wakeup (600 seconds) so the loop continues

## How to know when to stop

Stop the loop ONLY when you find a directive that explicitly says "STOP HEARTBEAT"
or "SHUTDOWN LOOP". Until then, keep looping every 10 minutes forever.

## Also note

The OS-level scheduled task (`CivicSuiteVMHostRunner`) already handles `.ps1` directive
scripts autonomously. Your AI heartbeat is the complement: it handles `.md` directives
that need judgment, and it lets the dev side verify you are awake without manual prompting.

## How to schedule the wakeup

Use the `ScheduleWakeup` tool (built into this session) with:
- `delaySeconds`: 600
- `prompt`: the same /loop prompt that drives your session (or a self-contained
  "check the stage-3a-baremetal-windows repo channel and process new directives" instruction)
- `reason`: "heartbeat: checking vmhost-beelink directive channel every 10 min"

Do this NOW before anything else -- the loop must start before this session could go idle.

Push `VMHOST-RESULT-006.md` confirming the heartbeat is set, with the scheduled wakeup time.
