#!/bin/bash
set -euo pipefail

PROJECT_ROOT="$(pwd)"

JAVA_VERSION=17
NODE_MAJOR=24

OS="$(uname -s)"
echo "Detected OS=$OS"

HOST_ARCH_RAW="$(uname -m)"
if [[ "$HOST_ARCH_RAW" == "x86_64" ]]; then
  HOST_EB_ARCH="x64"
elif [[ "$HOST_ARCH_RAW" == "arm64" || "$HOST_ARCH_RAW" == "aarch64" ]]; then
  HOST_EB_ARCH="arm64"
else
  echo "Unsupported ARCH: $HOST_ARCH_RAW"
  exit 1
fi

if [[ "$OS" == "Linux" ]]; then
  PLATFORM="linux"
  ARCHS_TO_FETCH=("$HOST_EB_ARCH")
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

fetch_text() {
  local url="$1"

  if command -v wget >/dev/null 2>&1; then
    wget -qO- "$url"
  elif command -v curl >/dev/null 2>&1; then
    curl -fsSL "$url"
  elif command -v python3 >/dev/null 2>&1; then
    python3 -c "import urllib.request, sys; sys.stdout.write(urllib.request.urlopen(sys.argv[1]).read().decode())" "$url"
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

# Node.js/npm are only needed to build the frontend - they are not
# bundled into the final app (Electron ships its own JS runtime), so we
# download a portable copy into a temp folder and remove it right after
# the build (see the call below), instead of relying on a suitable
# Node.js already being installed on the machine.
download_node() {
  local node_os="$PLATFORM"
  if [[ "$PLATFORM" == "mac" ]]; then
    node_os="darwin" # у Node.js macOS называется "darwin", не "mac"
  fi

  local dist_url="https://nodejs.org/dist/latest-v${NODE_MAJOR}.x"
  local shasums
  shasums="$(fetch_text "${dist_url}/SHASUMS256.txt")"

  local filename
  filename="$(echo "$shasums" | grep -oE "node-v[0-9]+\.[0-9]+\.[0-9]+-${node_os}-${HOST_EB_ARCH}\.tar\.gz" | head -n1)"

  if [[ -z "$filename" ]]; then
    echo "Could not determine the latest Node.js version for ${node_os}-${HOST_EB_ARCH}" >&2
    exit 1
  fi

  echo "Downloading Node.js (${filename}) from:"
  echo "  ${dist_url}/${filename}"

  rm -rf "$PROJECT_ROOT/.tmp-node"
  mkdir -p "$PROJECT_ROOT/.tmp-node"

  download_file "${dist_url}/${filename}" "$filename"
  tar -xzf "$filename" --strip-components=1 -C "$PROJECT_ROOT/.tmp-node"
  rm "$filename"

  echo "Node.js installed to $PROJECT_ROOT/.tmp-node"
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

download_node
export PATH="$PROJECT_ROOT/.tmp-node/bin:$PATH"

cd frontend/resume-builder-frontend/
npm install && npm run package
cd "$PROJECT_ROOT"

echo "Frontend built"

echo "Removing portable Node.js"
rm -rf "$PROJECT_ROOT/.tmp-node"
