param([int]$Port=8080)
$ErrorActionPreference='Stop'
$repoRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
Set-Location -LiteralPath $repoRoot
$taskDir=Join-Path $repoRoot 'work/b1'
New-Item -ItemType Directory -Force -Path $taskDir | Out-Null
$tunnel=Join-Path $taskDir 'cloudflared-2026.11.0.exe'
$expected='d5c1d82031da6253dcdcff64c944cd0fe063016edeb2e4fd088075fc9bd52d0a'
if(-not (Test-Path -LiteralPath $tunnel)){
  Invoke-WebRequest -Uri 'https://github.com/cloudflare/cloudflared/releases/download/2026.11.0/cloudflared-windows-amd64.exe' -OutFile $tunnel
}
if((Get-FileHash -LiteralPath $tunnel -Algorithm SHA256).Hash.ToLowerInvariant() -ne $expected){throw 'cloudflared checksum mismatch; do not run this file.'}
$config=Join-Path $taskDir 'tunnel-config.yml'
[IO.File]::WriteAllText($config,"# B1 temporary tunnel; no account, credentials or service installation.`n")
$env:PORT="$Port"
$node=(Get-Command node -ErrorAction Stop).Source
$server=Start-Process -FilePath $node -ArgumentList 'browser-emulator/scripts/serve.mjs' -WorkingDirectory $repoRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $taskDir 'server.log') -RedirectStandardError (Join-Path $taskDir 'server-error.log')
try{
  $ready=$false
  for($attempt=0;$attempt -lt 40;$attempt++){
    if($server.HasExited){throw 'B1 server failed to start. Check work/b1/server-error.log; the port may be in use.'}
    try{$response=Invoke-WebRequest -Uri "http://127.0.0.1:$Port/browser-emulator/offline-assets.json";if($response.StatusCode -eq 200){$ready=$true;break}}catch{}
    Start-Sleep -Milliseconds 100
  }
  if(-not $ready){throw 'B1 loopback server did not become ready.'}
  Write-Host 'Open the printed https://...trycloudflare.com/browser-emulator/ URL in iPhone Safari.'
  Write-Host 'Wait for Offline app ready, add to Home Screen, then open that icon and choose your ROM.'
  Write-Host 'This temporary public URL serves app assets only. Keep this terminal running during setup.'
  Write-Host 'A new tunnel gets a new origin. Export saves before changing origins or removing the icon.'
  & $tunnel tunnel --config $config --no-autoupdate --protocol http2 --url "http://127.0.0.1:$Port" --metrics '127.0.0.1:0' --logfile (Join-Path $taskDir 'tunnel.log')
}finally{
  if(-not $server.HasExited){Stop-Process -Id $server.Id}
}
