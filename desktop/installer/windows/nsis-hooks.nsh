!macro NSIS_HOOK_PREINSTALL
  MessageBox MB_ICONINFORMATION|MB_OK "CivicSuite Windows beta installer$\r$\n$\r$\nThis installer is unsigned beta software. A Microsoft Defender SmartScreen warning is expected before the installer opens on some machines.$\r$\n$\r$\nIf SmartScreen appears, confirm the installer came from CivicSuite, choose More info, then choose Run anyway.$\r$\n$\r$\nCivicSuite installs as a local Windows app and does not require Docker, WSL, or a terminal for normal city staff use."
!macroend
