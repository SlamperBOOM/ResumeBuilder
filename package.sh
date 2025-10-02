#!/usr/bin/env bash
set -euo pipefail

JAVA_VERSION=17
TARGET_DIR="jre"

OS="$(uname -s)"
ARCH="$(uname -m)"

echo "Detected OS=$OS ARCH=$ARCH"

# -----------------------------
# Detect platform
# -----------------------------

if [[ "$OS" == "Linux" ]]; then
  PLATFORM="linux"
elif [[ "$OS" == "Darwin" ]]; then
  PLATFORM="mac"
else
  echo "Unsupported OS: $OS"
  exit 1
fi

if [[ "$ARCH" == "x86_64" ]]; then
  ARCH_NAME="x64"
elif [[ "$ARCH" == "arm64" || "$ARCH" == "aarch64" ]]; then
  ARCH_NAME="aarch64"
else
  echo "Unsupported ARCH: $ARCH"
  exit 1
fi

# -----------------------------
# Make URL
# -----------------------------

URL="https://api.adoptium.net/v3/binary/latest/${JAVA_VERSION}/ga/${PLATFORM}/${ARCH_NAME}/jre/hotspot/normal/eclipse"

echo "Downloading JRE from:"
echo "  $URL"

# -----------------------------
# Prepare folder
# -----------------------------

rm -rf "$TARGET_DIR"
mkdir -p "$TARGET_DIR"

ARCHIVE="jre.tar.gz"

# -----------------------------
# Download jre
# -----------------------------

curl -L "$URL" -o "$ARCHIVE"

# -----------------------------
# Unpack
# -----------------------------

tar -xzf "$ARCHIVE" --strip-components=1 -C "$TARGET_DIR"
rm "$ARCHIVE"

# -----------------------------
# Execution rights
# -----------------------------

chmod +x "$TARGET_DIR/bin/java"

echo "JRE successfully installed to ./$TARGET_DIR"

echo "Building backend"

cd backend
export JAVA_HOME=$0/jre/
./gradlew :quarkusBuild

echo Backend built
echo ""
echo Building frontend

cd ../frontend/resume-builder-frontend/
npm install && npm run package

echo Frontend built
