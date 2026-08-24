#!/bin/bash
set -euo pipefail

JAVA_VERSION=17

OS="$(uname -s)"
echo "Detected OS=$OS"

if [[ "$OS" == "Linux" ]]; then
  PLATFORM="linux"
  HOST_ARCH="$(uname -m)"
  if [[ "$HOST_ARCH" == "x86_64" ]]; then
    ARCHS_TO_FETCH=("x64")
  elif [[ "$HOST_ARCH" == "arm64" || "$HOST_ARCH" == "aarch64" ]]; then
    ARCHS_TO_FETCH=("arm64")
  else
    echo "Unsupported ARCH: $HOST_ARCH"
    exit 1
  fi
elif [[ "$OS" == "Darwin" ]]; then
  PLATFORM="mac"
  ARCHS_TO_FETCH=("x64" "arm64")
else
  echo "Unsupported OS: $OS"
  exit 1
fi

download_file() {
  local url="$1"
  local output="$2"

  if command -v wget >/dev/null 2>&1; then
    wget -q -O "$output" "$url"
  elif command -v curl >/dev/null 2>&1; then
    curl -fL "$url" -o "$output"
  elif command -v python3 >/dev/null 2>&1; then
    python3 -c "import urllib.request, sys; urllib.request.urlretrieve(sys.argv[1], sys.argv[2])" "$url" "$output"
  else
    echo "Not found wget/curl/python3 - cannot download jre." >&2
    echo "Please install one of these" >&2
    exit 1
  fi
}

download_jre() {
  local eb_arch="$1"
  local adoptium_arch="$eb_arch"
  if [[ "$eb_arch" == "arm64" ]]; then
    adoptium_arch="aarch64"
  fi

  local target_dir="jre/${PLATFORM}-${eb_arch}"
  local url="https://api.adoptium.net/v3/binary/latest/${JAVA_VERSION}/ga/${PLATFORM}/${adoptium_arch}/jre/hotspot/normal/eclipse"

  echo "Downloading JRE for ${PLATFORM}/${eb_arch} from:"
  echo "  $url"

  rm -rf "$target_dir"
  mkdir -p "$target_dir"

  local archive="jre-${PLATFORM}-${eb_arch}.tar.gz"
  download_file "$url" "$archive"
  tar -xzf "$archive" --strip-components=1 -C "$target_dir"
  rm "$archive"

  chmod +x "$target_dir/bin/java"

  echo "JRE for ${PLATFORM}/${eb_arch} successfully installed to ./$target_dir"
}

rename_jre_binary() {
  local eb_arch="$1"
  local target_dir="jre/${PLATFORM}-${eb_arch}"

  mv "$target_dir/bin/java" "$target_dir/bin/resume-builder-backend"
  chmod +x "$target_dir/bin/resume-builder-backend"
}

for arch in "${ARCHS_TO_FETCH[@]}"; do
  download_jre "$arch"
done

echo "Building backend"

cd backend
export JAVA_HOME="$(cd "../jre/${PLATFORM}-${ARCHS_TO_FETCH[0]}" && pwd)"
./gradlew :quarkusBuild --no-daemon
cd ..

echo "Backend built"

for arch in "${ARCHS_TO_FETCH[@]}"; do
  rename_jre_binary "$arch"
done

echo "Building frontend"

cd frontend/resume-builder-frontend/
npm install && npm run package

echo "Frontend built"
