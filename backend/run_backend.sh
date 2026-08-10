#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if [[ ! -x ".venv/bin/python" ]]; then
  python3 -m venv .venv
fi

.venv/bin/python -m pip install --upgrade pip
.venv/bin/python -m pip install -r requirements.txt

if command -v nix >/dev/null 2>&1 || command -v nix-build >/dev/null 2>&1; then
  gcc_lib="$(nix eval --raw nixpkgs#stdenv.cc.cc.lib 2>/dev/null || nix-build '<nixpkgs>' -A stdenv.cc.cc.lib --no-out-link 2>/dev/null || true)"
  zlib_lib="$(nix eval --raw nixpkgs#zlib 2>/dev/null || nix-build '<nixpkgs>' -A zlib --no-out-link 2>/dev/null || true)"

  if [[ -n "${gcc_lib}" && -n "${zlib_lib}" ]]; then
    export LD_LIBRARY_PATH="${gcc_lib}/lib:${zlib_lib}/lib:${LD_LIBRARY_PATH:-}"
  fi
fi

exec .venv/bin/python -m uvicorn main:app --host 127.0.0.1 --port "${PORT:-8000}"
