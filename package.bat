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

cd frontend/resume-builder-frontend/
call npm install && npm run package

echo Frontend built
