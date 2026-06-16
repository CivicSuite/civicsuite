# TESTER-RESULT-077

Result: FAIL

Branch: `stage-3a-baremetal-windows`
Directive commit tested: `907ac046d92c6d2f00d2e7c0c135992a87b1383e` (`Add tester directive 077`)
PR head under test: `26e66ef6f9dba43a5f28f6b7adc6a4d5b84bc09c`
Host: Windows bare-metal/local desktop test host, normal user launch after MSI install.

I read `test-comms/README.md`, `TESTER-DIRECTIVE-077.md`, `TESTER-RESULT-076.md`, `TESTER-DIRECTIVE-076.md`, and `TESTER-DIRECTIVE-067.md` before completing this result.

## Artifact verification

Downloaded and verified the public prerelease artifacts:

- MSI URL: `https://github.com/CivicSuite/civicsuite/releases/download/windows-local-msi-ci-26e66ef/CivicSuite_0.1.0_x64_en-US.msi`
- MSI bytes: `1639820535`
- MSI SHA256: `57d3dd05d126158a0eccb8a36d107b02d9ac68f3453f5864940237ffa022202e`
- Evidence URL: `https://github.com/CivicSuite/civicsuite/releases/download/windows-local-msi-ci-26e66ef/CivicSuite-msi-evidence.txt`
- Evidence bytes: `548`
- Evidence SHA256: `8e17a2cac29032f583b03f8cbd91519fa2121d9e6dab85fc6bb5c14585c9a63e`

Evidence text included `RuntimePayload=desktop/runtime/payload`, `NoDockerPrerequisite=true`, and `NoWslPrerequisite=true`.

## Cleanroom and install

Stopped existing `civicsuite-desktop.exe` and `ollama.exe` processes, uninstalled the previous CivicSuite MSI product, and removed prior CivicSuite local app/config/cache/data/install folders before installing the corrected MSI. The MSI install log reported success:

- `Product: CivicSuite -- Installation completed successfully.`
- `Installation success or error status: 0`
- `MainEngineThread is returning 0`

Before launching CivicSuite, there were no `ollama.exe` processes. The corrected MSI installed the bundled runtime binary at:

- `C:\Program Files\CivicSuite\_up_\runtime\payload\ollama\ollama.exe`
- size: `35590024` bytes

## App setup and model preparation

Launched `C:\Program Files\CivicSuite\civicsuite-desktop.exe` as the normal user and completed local city profile setup and first local-admin creation/sign-in:

- Admin email: `admin@teston.local`
- Role: `local-admin`

Pre-sign-in model controls were gated by sign-in/admin state, as expected.

After sign-in, System Health exposed the pinned Gemma model setup. Download/resume completed and produced the final GGUF at:

- `C:\Users\insty\AppData\Local\CivicSuite\Data\models\gemma-4-12b-it-qat-q4_0.gguf`
- size: `6975877728`
- SHA256: `faff1a63667fac17ac5e777f47114688fcefea96e220e211aaa8d62c2c4561f1`

The `.part` file was absent after completion. Checksum verification then persisted:

- model status: `Verified`
- message: `The pinned Gemma model file passed checksum verification and is registered with CivicCore.`
- registry runtime model: `civicsuite-gemma4-12b-qat:q4_0`

## Targeted runtime regression result

This directive fails at the required bundled Ollama runtime/load check.

Unexpected behavior observed before the explicit Load action:

- Launching CivicSuite spawned user-global Ollama automatically at `C:\Users\insty\AppData\Local\Programs\Ollama\ollama.exe`.
- Before clicking `Load in Ollama`, I stopped the user-global `ollama.exe` as directed.
- The app respawned user-global Ollama within roughly two seconds, before the Load click.

I then performed a combined final pass that stopped `ollama.exe` again immediately before clicking `Load in Ollama`. After clicking Load and waiting 90 seconds:

- CivicSuite remained running.
- The only `ollama.exe` process present was still user-global:
  - `C:\Users\insty\AppData\Local\Programs\Ollama\ollama.exe serve`
- No bundled/runtime-local Ollama process from CivicSuite was running.
- `http://127.0.0.1:15434/api/tags` was unreachable: `Unable to connect to the remote server`.
- System Health stayed at `Needs runtime`.
- The UI reported:
  - `CivicSuite could not start the bundled Ollama runtime. Local folders were prepared, but required Windows runtime files are incomplete: missing payloads: Native Ollama model runtime (ollama-runtime) source payload integrity check failed: Could not parse C:\Program Files\CivicSuite\_up_\runtime\payload\runtime-payload-lock.json: expected value at line 1 column 1; missing service executables: Local AI model. Repair or install the bundled Windows runtime files, then retry.`

Final observed runtime state:

- App process: `C:\Program Files\CivicSuite\civicsuite-desktop.exe`
- Ollama process: `C:\Users\insty\AppData\Local\Programs\Ollama\ollama.exe serve`
- CivicSuite bundled Ollama payload file present: `C:\Program Files\CivicSuite\_up_\runtime\payload\ollama\ollama.exe`
- CivicSuite model file verified and registered
- Runtime health endpoint unavailable
- Model not loaded into a CivicSuite-bundled Ollama runtime

## Classification

FAIL.

The corrected MSI does not pass the directive 077 Windows Local city-core cleanroom-equivalent gate because explicit model load does not start/use the CivicSuite bundled Ollama runtime, System Health remains `Needs runtime`, the runtime health endpoint is not reachable, and user-global Ollama is spawned/respawned from `C:\Users\insty\AppData\Local\Programs\Ollama\ollama.exe`.

Because the targeted regression failed, I did not continue into the full directive 067 gate.
