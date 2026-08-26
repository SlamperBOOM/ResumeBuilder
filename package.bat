@echo off
setlocal enabledelayedexpansion

set JAVA_VERSION=17
set TARGET_DIR=jre\win-x64

echo Detecting platform...

set ADOPTIUM_OS=windows
set ARCH=%PROCESSOR_ARCHITECTURE%

if "%ARCH%"=="AMD64" (
    set ARCH_NAME=x64
) else (
    echo Unsupported architecture: %ARCH%
    exit /b 1
)

set URL=https://api.adoptium.net/v3/binary/latest/%JAVA_VERSION%/ga/%ADOPTIUM_OS%/%ARCH_NAME%/jre/hotspot/normal/eclipse

echo Downloading JRE from:
echo   %URL%

REM -----------------------------
REM Clear folder
REM -----------------------------
if exist %TARGET_DIR% (
    rmdir /s /q %TARGET_DIR%
)
mkdir %TARGET_DIR%

set ARCHIVE=jre-win-x64.zip

REM -----------------------------
REM Download jre
REM -----------------------------
powershell -Command ^
  "Invoke-WebRequest -Uri '%URL%' -OutFile '%ARCHIVE%'"

REM -----------------------------
REM Unpack
REM -----------------------------
powershell -Command ^
  "Expand-Archive -Path '%ARCHIVE%' -DestinationPath '%TARGET_DIR%'"

del %ARCHIVE%

for /d %%D in (%TARGET_DIR%\*) do (
    xcopy "%%D\*" "%TARGET_DIR%\" /E /H /Y
    rmdir /s /q "%%D"
    goto :done
)

:done
echo JRE successfully installed to .\%TARGET_DIR%

echo Building backend

cd backend
set JAVA_HOME=%~dp0jre\win-x64\
call ./gradlew.bat :quarkusBuild --no-daemon
cd ..

echo Backend built

ren "%TARGET_DIR%\bin\java.exe" "ResumeBuilderBackend.exe"

echo Building frontend

set NODE_MAJOR=24

REM -----------------------------
REM Node.js/npm are only needed to build the frontend - they are not
REM bundled into the final app (Electron ships its own JS runtime),
REM so we download a portable copy into a temp folder and remove it
REM right after the build, instead of relying on a suitable Node.js
REM already being installed on the machine.
REM -----------------------------

echo $ErrorActionPreference = 'Stop' > resolve-node.ps1
echo [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 >> resolve-node.ps1
echo $major = '%NODE_MAJOR%' >> resolve-node.ps1
echo $releases = Invoke-RestMethod 'https://nodejs.org/dist/index.json' >> resolve-node.ps1
echo $matching = $releases.Where({ $_.version -like "v$major.*" }) >> resolve-node.ps1
echo if ($matching.Count -eq 0) { throw "No Node.js release found for major version $major" } >> resolve-node.ps1
echo $version = $matching[0].version >> resolve-node.ps1
echo $url = "https://nodejs.org/dist/$version/node-$version-win-x64.zip" >> resolve-node.ps1
echo Write-Host "Downloading Node.js $version from $url" >> resolve-node.ps1
echo Invoke-WebRequest -Uri $url -OutFile 'node-temp.zip' >> resolve-node.ps1

powershell -NoProfile -ExecutionPolicy Bypass -File resolve-node.ps1
if errorlevel 1 (
    echo Failed to download Node.js
    del resolve-node.ps1
    exit /b 1
)
del resolve-node.ps1

if exist .tmp-node (
    rmdir /s /q .tmp-node
)
mkdir .tmp-node

powershell -Command ^
  "Expand-Archive -Path 'node-temp.zip' -DestinationPath '.tmp-node'"
if errorlevel 1 (
    echo Failed to extract Node.js archive
    exit /b 1
)

del node-temp.zip

for /d %%D in (.tmp-node\*) do (
    xcopy "%%D\*" ".tmp-node\" /E /H /Y
    rmdir /s /q "%%D"
    goto :node_flattened
)

:node_flattened
echo Node.js installed to .\.tmp-node

set PATH=%~dp0.tmp-node;%PATH%

cd frontend/resume-builder-frontend/
call npm install && call npm run package
cd /d %~dp0

echo Frontend built

echo Removing portable Node.js

rmdir /s /q "%~dp0.tmp-node" 2>nul

if exist "%~dp0.tmp-node" (
    echo .tmp-node still locked, retrying in 3s...
    timeout /t 3 /nobreak >nul
    rmdir /s /q "%~dp0.tmp-node" 2>nul
)

if exist "%~dp0.tmp-node" (
    echo WARNING: could not remove %~dp0.tmp-node automatically ^(likely a locked file^) - please delete it manually.
) else (
    echo Portable Node.js removed
)
