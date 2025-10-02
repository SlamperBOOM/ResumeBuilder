@echo off
setlocal enabledelayedexpansion

set JAVA_VERSION=17
set TARGET_DIR=jre

echo Detecting platform...

set OS=windows
set ARCH=%PROCESSOR_ARCHITECTURE%

if "%ARCH%"=="AMD64" (
    set ARCH_NAME=x64
) else (
    echo Unsupported architecture: %ARCH%
    exit /b 1
)

set URL=https://api.adoptium.net/v3/binary/latest/%JAVA_VERSION%/ga/%OS%/%ARCH_NAME%/jre/hotspot/normal/eclipse

echo Downloading JRE from:
echo   %URL%

REM -----------------------------
REM Clear folder
REM -----------------------------
if exist %TARGET_DIR% (
    rmdir /s /q %TARGET_DIR%
)
mkdir %TARGET_DIR%

set ARCHIVE=jre.zip

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
set JAVA_HOME=%~dp0jre\
call ./gradlew.bat :quarkusBuild

echo Backend built
echo ""
echo Building frontend

cd ../frontend/resume-builder-frontend/
call npm install && npm run package

echo Frontend built
