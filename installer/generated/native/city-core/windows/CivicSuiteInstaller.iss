; CivicSuite Windows installer wrapper manifest.
; CivicSuite city-core unsigned beta installer package: build with Inno Setup after reviewing the generated package payload.

#define AppName "CivicSuite"
#define AppVersion "0.1.2"
#define AppPublisher "CivicSuite"
#define PackageSource "..\..\packages\city-core\windows"

[Setup]
AppId={{CIVICSUITE-CITY-CORE-0.1.2}}
AppName={#AppName}
AppVersion={#AppVersion}
AppPublisher={#AppPublisher}
DefaultDirName={autopf}\CivicSuite
DefaultGroupName=CivicSuite
OutputBaseFilename=CivicSuite-city-core-Setup-0.1.2
Compression=lzma
SolidCompression=yes
PrivilegesRequired=lowest

[Files]
Source: "{#PackageSource}\*"; DestDir: "{app}"; Flags: recursesubdirs createallsubdirs

[Icons]
Name: "{group}\CivicSuite Installer"; Filename: "powershell.exe"; Parameters: "-ExecutionPolicy Bypass -File ""{app}\start-civicsuite-installer.ps1"" -Readiness"
