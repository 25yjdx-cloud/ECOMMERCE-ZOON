# Verifies that every path listed in docs/architecture/structure.manifest.txt exists.
# Usage (PowerShell): powershell -ExecutionPolicy Bypass -File tools/check-structure.ps1
$root = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $root
$manifest = 'docs/architecture/structure.manifest.txt'
if (-not (Test-Path -LiteralPath $manifest)) { Write-Host "Missing $manifest"; exit 2 }
$missing = 0
$total = 0
foreach ($raw in (Get-Content -LiteralPath $manifest -Encoding UTF8)) {
  $line = $raw.Trim()
  if ($line -eq '' -or $line.StartsWith('#')) { continue }
  $total++
  $path = $line.TrimEnd('/')
  if ($line.EndsWith('/')) { $ok = Test-Path -LiteralPath $path -PathType Container }
  else { $ok = Test-Path -LiteralPath $path -PathType Leaf }
  if (-not $ok) { Write-Host "MISSING: $line"; $missing++ }
}
Write-Host "Checked $total paths, $missing missing."
if ($missing -eq 0) { Write-Host 'OK: structure matches the manifest.'; exit 0 } else { Write-Host 'FAIL'; exit 1 }
