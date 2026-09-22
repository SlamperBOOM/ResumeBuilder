#!/bin/bash
set -euo pipefail

PROJECT_ROOT="$(pwd)"

SECONDS=0
STAGE_START=0
CURRENT_STAGE=""
STAGE_TIMES=()

fmt_time() {
  printf '%02d:%02d:%02d' $(($1 / 3600)) $(($1 % 3600 / 60)) $(($1 % 60))
}

begin_stage() {
  CURRENT_STAGE="$1"
  STAGE_START=$SECONDS
}

end_stage() {
  if [[ -n "$CURRENT_STAGE" ]]; then
    STAGE_TIMES+=("${CURRENT_STAGE}|$((SECONDS - STAGE_START))")
    CURRENT_STAGE=""
  fi
}

on_exit() {
  local status=$?
  if [[ "${DOWNLOAD_NPM:-0}" == 1 ]]; then
    echo "Removing portable Node.js"
    rm -rf "$PROJECT_ROOT/.tmp-node"
  fi
  if [[ -n "$CURRENT_STAGE" ]]; then
    CURRENT_STAGE="$CURRENT_STAGE (failed)"
    end_stage
  fi
  echo
  echo "Time spent:"
  local entry
  for entry in ${STAGE_TIMES[@]+"${STAGE_TIMES[@]}"}; do
    printf '  %-24s %s\n' "${entry%%|*}:" "$(fmt_time "${entry##*|}")"
  done
  printf '  %-24s %s\n' "Total:" "$(fmt_time "$SECONDS")"
  exit $status
}

JAVA_VERSION=17
NODE_MAJOR=24

usage() {
  cat <<EOF
Usage: $0 [options]

Options:
  --download-npm   Download a portable Node.js ${NODE_MAJOR} for the build instead of using the system npm.
  --reuse-jre      Keep the downloaded JRE archive in .jre-cache/ and reuse it on later builds.
                   Delete .jre-cache/ to fetch a fresh JRE.
  --help, -h       Show this help.
EOF
}

# Parsed before the EXIT trap so --help and bad arguments don't print timings
DOWNLOAD_NPM=0
REUSE_JRE=0
if [[ $# -eq 0 ]]; then
  echo "Run '$0 --help' to see available arguments."
fi
for arg in "$@"; do
  case "$arg" in
    --download-npm) DOWNLOAD_NPM=1 ;;
    --reuse-jre) REUSE_JRE=1 ;;
    --help|-h) usage; exit 0 ;;
    *)
      echo "Unknown argument: $arg" >&2
      echo "Run '$0 --help' to see available arguments." >&2
      exit 1
      ;;
  esac
done

trap on_exit EXIT

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

  rm -rf "$target_dir"
  mkdir -p "$target_dir"

  local archive="jre-${PLATFORM}-${eb_arch}.tar.gz"
  if [[ "$REUSE_JRE" == 1 ]]; then
    mkdir -p "$PROJECT_ROOT/.jre-cache"
    archive="$PROJECT_ROOT/.jre-cache/$archive"
  fi

  if [[ "$REUSE_JRE" == 1 && -f "$archive" ]]; then
    echo "Reusing cached JRE archive $archive"
  else
    echo "Downloading JRE for ${PLATFORM}/${eb_arch} from:"
    echo "  $url"
    download_file "$url" "$archive" || { rm -f "$archive"; exit 1; }
  fi

  tar -xzf "$archive" --strip-components=1 -C "$target_dir"
  if [[ "$REUSE_JRE" == 0 ]]; then
    rm "$archive"
  fi

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
# bundled into the final app (Electron ships its own JS runtime).
# By default the system npm is used; with --download-npm a portable
# copy is downloaded into a temp folder and removed after the build.
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

begin_stage "JRE download"
for arch in "${ARCHS_TO_FETCH[@]}"; do
  download_jre "$arch"
done
end_stage

echo "Building backend"

begin_stage "Backend"

cd backend
export JAVA_HOME="$(cd "../jre/${PLATFORM}-${ARCHS_TO_FETCH[0]}" && pwd)"
./gradlew :quarkusBuild --no-daemon
cd ..

echo "Backend built"

for arch in "${ARCHS_TO_FETCH[@]}"; do
  rename_jre_binary "$arch"
done
end_stage

echo "Building frontend"

if [[ "$DOWNLOAD_NPM" == 1 ]]; then
  begin_stage "Node.js download"
  download_node
  end_stage
  export PATH="$PROJECT_ROOT/.tmp-node/bin:$PATH"
elif command -v npm >/dev/null 2>&1; then
  echo "Using system npm"
else
  echo "npm not found. Install Node.js ${NODE_MAJOR}+ or re-run with --download-npm to fetch a portable copy for the build." >&2
  exit 1
fi

begin_stage "Frontend"
cd frontend/resume-builder-frontend/
if ! { npm install && npm run package; }; then
  echo "Frontend build failed." >&2
  if [[ "$DOWNLOAD_NPM" == 0 ]]; then
    echo "If your system Node.js/npm is missing or incompatible, re-run with --download-npm to build with a portable Node.js ${NODE_MAJOR}." >&2
  fi
  exit 1
fi
cd "$PROJECT_ROOT"
end_stage

echo "Frontend built"
