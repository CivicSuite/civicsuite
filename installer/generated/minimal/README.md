# CivicSuite Minimal Install Kit

Profile: `minimal`

This generated kit installs CivicCore only. It does not install Docker, WSL,
Python, or other baseline system dependencies. It does not start services or
containers.

Run one of the platform scripts from this directory after reviewing
`civiccore-install-plan.json`.

Windows:

```powershell
.\install-civiccore.ps1
.\verify-civiccore.ps1
.\reset-civiccore.ps1
```

macOS/Linux:

```bash
bash install-civiccore.sh
bash verify-civiccore.sh
bash reset-civiccore.sh
```

The install scripts create a local `.venv` inside this generated kit and install
CivicCore from the local wheel artifact:

Windows artifact path:

`C:/Users/scott/OneDrive/Desktop/Claude/civiccore/dist/civiccore-1.2.0-py3-none-any.whl`

macOS/Linux/WSL artifact path:

`/mnt/c/Users/scott/OneDrive/Desktop/Claude/civiccore/dist/civiccore-1.2.0-py3-none-any.whl`
