param(
    [int]$Port = 8000
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$python = ".venv-win\Scripts\python.exe"
if (-not (Test-Path $python)) {
    py -3.13 -m venv .venv-win
}

& $python -m pip install --upgrade pip
& $python -m pip install -r requirements.txt
& $python -m uvicorn main:app --host 127.0.0.1 --port $Port
