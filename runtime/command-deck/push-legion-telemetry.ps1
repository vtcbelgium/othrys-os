param([switch]$Once,[int]$IntervalSeconds=10)
$ErrorActionPreference='Stop'
$configPath=if($env:OTHRYS_TELEMETRY_CONFIG){$env:OTHRYS_TELEMETRY_CONFIG}else{Join-Path $env:LOCALAPPDATA 'OTHRYS\telemetry.env'}
if(!(Test-Path $configPath)){throw 'OTHRYS_TELEMETRY_CONFIG_MISSING'}
$config=@{}
Get-Content $configPath | ForEach-Object {
  if($_ -match '^([^#=]+)=(.*)$'){$config[$matches[1].Trim()]=$matches[2].Trim()}
}
if(!$config.OTHRYS_TELEMETRY_TOKEN -or !$config.OTHRYS_TELEMETRY_URL){throw 'OTHRYS_TELEMETRY_CONFIG_INVALID'}
$errorPath=Join-Path (Split-Path $configPath) 'telemetry-last-error.txt'

function Get-LegionSample {
  $os=Get-CimInstance Win32_OperatingSystem
  $cpu=[double]((Get-CimInstance Win32_Processor | Measure-Object LoadPercentage -Average).Average)
  if([double]::IsNaN($cpu)){$cpu=0}
  $gpuLine=& nvidia-smi --query-gpu=utilization.gpu,memory.used,memory.total,temperature.gpu --format=csv,noheader,nounits 2>$null | Select-Object -First 1
  if(!$gpuLine){throw 'NVIDIA_TELEMETRY_UNAVAILABLE'}
  $g=$gpuLine.Split(',') | ForEach-Object {$_.Trim()}
  $qwen=((& ollama ps 2>$null | Out-String) -match 'qwen3:8b')
  return @{
    token=$config.OTHRYS_TELEMETRY_TOKEN; nodeId='legion'; capturedAt=(Get-Date).ToUniversalTime().ToString('o')
    cpuPercent=[math]::Round($cpu,1); ramAvailableMb=[math]::Round($os.FreePhysicalMemory/1KB)
    gpuUtilPercent=[double]$g[0]; vramUsedMb=[double]$g[1]; vramTotalMb=[double]$g[2]; gpuTempC=[double]$g[3]; qwenLoaded=[bool]$qwen
  }
}
function Push-LegionSample {
  $payload=Get-LegionSample
  $work=@{schema='othrys.mycelium.work.v0.1';work_id=('telemetry-'+[guid]::NewGuid().ToString('N'));capability='telemetry.node-status@1';payload=$payload}
  $result=Invoke-RestMethod -Uri ($config.OTHRYS_TELEMETRY_URL.TrimEnd('/')+'/work') -Method Post -ContentType 'application/json' -Body ($work|ConvertTo-Json -Depth 5 -Compress) -TimeoutSec 4
  if(!$result.ok -or $result.authorityGranted -ne $false){throw 'TELEMETRY_RECEIVER_REJECTED'}
  if(Test-Path $errorPath){Remove-Item $errorPath -Force -ErrorAction SilentlyContinue}
}

do {
  try { Push-LegionSample }
  catch { Set-Content -Path $errorPath -Value ((Get-Date).ToUniversalTime().ToString('o')+' '+$_.Exception.Message) -Encoding utf8 }
  if($Once){break}
  Start-Sleep -Seconds ([math]::Max(5,$IntervalSeconds))
} while($true)
