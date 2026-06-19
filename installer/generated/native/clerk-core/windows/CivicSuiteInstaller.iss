; CivicSuite Windows installer wrapper manifest.
; CivicSuite OSS public-use starter installer package: build with Inno Setup after reviewing the generated package payload.

#define AppName "CivicSuite"
#define AppVersion "0.1.0"
#define AppPublisher "CivicSuite"
#define PackageSource "..\..\packages\clerk-core\windows"

[Setup]
AppId={{93D44C49-0CF0-44FB-B041-0EF20C43FA32}
AppName={#AppName}
AppVersion={#AppVersion}
AppPublisher={#AppPublisher}
DefaultDirName={autopf}\CivicSuite
DefaultGroupName=CivicSuite
OutputBaseFilename=CivicSuite-clerk-core-Setup-0.1.0
Compression=lzma
SolidCompression=yes
PrivilegesRequired=lowest

[Files]
Source: "{#PackageSource}\*"; DestDir: "{app}"; Flags: recursesubdirs createallsubdirs

[Icons]
Name: "{group}\CivicSuite Installer"; Filename: "powershell.exe"; Parameters: "-ExecutionPolicy Bypass -File ""{app}\start-civicsuite-installer.ps1"" -Readiness"
