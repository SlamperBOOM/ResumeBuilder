@echo off
setlocal enabledelayedexpansion

set JAVA_VERSION=17
set NODE_MAJOR=24
set TARGET_DIR=jre\win-x64

set DOWNLOAD_NPM=0
set REUSE_JRE=0
if "%~1"=="" echo Run "%~nx0 --help" to see available arguments.

REM shift /1 keeps %0 intact, so %~dp0 still works below
:parse_args
if "%~1"=="" goto :args_done
if /i "%~1"=="--download-npm" (
    set DOWNLOAD_NPM=1
) else if /i "%~1"=="--reuse-jre" (
    set REUSE_JRE=1
) else if /i "%~1"=="--help" (
    goto :usage
) else if /i "%~1"=="-h" (
    goto :usage
) else if "%~1"=="/?" (
    goto :usage
) else (
    echo Unknown argument: %~1
    echo Run "%~nx0 --help" to see available arguments.
    exit /b 1
)
shift /1
goto :parse_args

:usage
echo Usage: %~nx0 [options]
echo.
echo Options:
echo   --download-npm   Download a portable Node.js %NODE_MAJOR% for the build instead of using the system npm.
echo   --reuse-jre      Keep the downloaded JRE archive in .jre-cache\ and reuse it on later builds.
echo                    Delete .jre-cache\ to fetch a fresh JRE.
echo   --help, -h, /?   Show this help.
exit /b 0

:args_done

set STAGE_COUNT=0
for /f "usebackq delims=" %%T in (`powershell -NoProfile -Command "[DateTime]::UtcNow.Ticks"`) do (
    set START_TICKS=%%T
    set STAGE_TICKS=%%T
)

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

REM -----------------------------
REM Clear folder
REM -----------------------------
if exist %TARGET_DIR% (
    rmdir /s /q %TARGET_DIR%
)
mkdir %TARGET_DIR%

set ARCHIVE=jre-win-x64.zip
if "%REUSE_JRE%"=="1" (
    set ARCHIVE=.jre-cache\jre-win-x64.zip
    if not exist .jre-cache mkdir .jre-cache
)
if "%REUSE_JRE%"=="1" if exist "%ARCHIVE%" (
    echo Reusing cached JRE archive %ARCHIVE%
    goto :unpack_jre
)

REM -----------------------------
REM Download jre
REM -----------------------------
echo Downloading JRE from:
echo   %URL%
powershell -Command ^
  "Invoke-WebRequest -Uri '%URL%' -OutFile '%ARCHIVE%'"
if errorlevel 1 (
    echo Failed to download JRE
    del "%ARCHIVE%" 2>nul
    exit /b 1
)

REM -----------------------------
REM Unpack
REM -----------------------------
:unpack_jre
powershell -Command ^
  "Expand-Archive -Path '%ARCHIVE%' -DestinationPath '%TARGET_DIR%'"

if "%REUSE_JRE%"=="0" del %ARCHIVE%

for /d %%D in (%TARGET_DIR%\*) do (
    xcopy "%%D\*" "%TARGET_DIR%\" /E /H /Y
    rmdir /s /q "%%D"
    goto :done
)

:done
echo JRE successfully installed to .\%TARGET_DIR%
call :stage_end "JRE download"

echo Building backend

cd backend
set JAVA_HOME=%~dp0jre\win-x64\
call ./gradlew.bat :quarkusBuild --no-daemon
cd ..

echo Backend built

ren "%TARGET_DIR%\bin\java.exe" "ResumeBuilderBackend.exe"
call :stage_end "Backend"

echo Building frontend

REM -----------------------------
REM Node.js/npm are only needed to build the frontend - they are not
REM bundled into the final app (Electron ships its own JS runtime).
REM By default the system npm is used; with --download-npm a portable
REM copy is downloaded into a temp folder and removed after the build.
REM -----------------------------

if "%DOWNLOAD_NPM%"=="1" goto :download_node

where npm >nul 2>nul
if errorlevel 1 (
    echo npm not found. Install Node.js %NODE_MAJOR%+ or re-run with --download-npm to fetch a portable copy for the build.
    call :print_elapsed
    exit /b 1
)
echo Using system npm
goto :build_frontend

:download_node
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
    call :stage_end "Node.js download (failed)"
    call :print_elapsed
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
    call :stage_end "Node.js download (failed)"
    call :print_elapsed
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
call :stage_end "Node.js download"

set PATH=%~dp0.tmp-node;%PATH%

:build_frontend
cd frontend/resume-builder-frontend/
call npm install
if errorlevel 1 goto :frontend_failed
call npm run package
if errorlevel 1 goto :frontend_failed
cd /d %~dp0
call :stage_end "Frontend"

echo Frontend built
call :remove_node
call :print_elapsed
exit /b 0

:frontend_failed
cd /d %~dp0
call :stage_end "Frontend (failed)"
echo Frontend build failed.
if "%DOWNLOAD_NPM%"=="0" echo If your system Node.js/npm is missing or incompatible, re-run with --download-npm to build with a portable Node.js %NODE_MAJOR%.
call :remove_node
call :print_elapsed
exit /b 1

:remove_node
if "%DOWNLOAD_NPM%"=="0" goto :eof

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
goto :eof

:stage_end
set /a STAGE_COUNT+=1
for /f "usebackq tokens=1,2 delims=|" %%A in (`powershell -NoProfile -Command "$now = [DateTime]::UtcNow.Ticks; '{0:hh\:mm\:ss}|{1}' -f ([TimeSpan]::FromTicks($now - %STAGE_TICKS%)), $now"`) do (
    set STAGE_TIME_!STAGE_COUNT!=%%A
    set STAGE_TICKS=%%B
)
set STAGE_NAME_!STAGE_COUNT!=%~1
goto :eof

:print_elapsed
echo.
echo Time spent:
for /l %%i in (1,1,%STAGE_COUNT%) do echo   !STAGE_NAME_%%i!: !STAGE_TIME_%%i!
for /f "usebackq delims=" %%T in (`powershell -NoProfile -Command "'{0:hh\:mm\:ss}' -f ([TimeSpan]::FromTicks([DateTime]::UtcNow.Ticks - %START_TICKS%))"`) do echo   Total: %%T
goto :eof
