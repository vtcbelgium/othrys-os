param(
  [ValidateSet("start","stop","status")]
  [string]$Action = "status"
)

$ErrorActionPreference = "Stop"
$distro = "Ubuntu-24.04"
$user = "othrys"
$workerName = "OTHRYS-Legion-WSL"
$match = "[c]ursor-agent.*worker"

function Wsl([string]$Command) {
  & wsl.exe -d $distro -u $user -- bash -lc $Command
}

if ($Action -eq "status") {
  Wsl "ps -eo pid,args | grep -E '$match' || true"
  exit $LASTEXITCODE
}

if ($Action -eq "stop") {
  Wsl "pkill -f 'cursor-agent.*worker' 2>/dev/null || true"
  Write-Output "OTHRYS Cursor My Machine stopped."
  exit 0
}

if ($Action -eq "start") {
  $existing = Wsl "ps -eo args | grep -E '$match' || true"
  if ($existing) {
    Write-Output "OTHRYS Cursor My Machine already running."
    exit 0
  }

  Write-Warning "Supervised route: current WSL identity is not a permanent agent security boundary."
  $args = @("-d", $distro, "-u", $user, "--", "/home/othrys/cursor-left-hand-worker.sh")
  Start-Process -FilePath "wsl.exe" -ArgumentList $args -WindowStyle Hidden
  Start-Sleep -Seconds 3
  Wsl "ps -eo pid,args | grep -E '$match' || true"
}
