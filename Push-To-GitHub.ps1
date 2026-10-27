# PowerShell Script សម្រាប់ Push ទៅកាន់ GitHub
# ដំណើរការដោយ៖ Right-click -> Run with PowerShell

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "      ភ្ជាប់ និងរុញកូដទៅកាន់ GitHub (Push to GitHub)                  " -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "Repository: https://github.com/AngkearaVychet/School-Management-.git" -ForegroundColor Yellow
Write-Host "Branch:     main" -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

$token = Read-Host "សូមបញ្ចូល ឬ Paste GitHub Personal Access Token របស់អ្នក រួចចុច Enter"

if ([string]::IsNullOrWhiteSpace($token)) {
    Write-Host "[កំហុស] Token មិនអាចទទេបានទេ!" -ForegroundColor Red
    pause
    exit
}

Write-Host "`nកំពុងរុញកូដ (Pushing to GitHub)... សូមរង់ចាំមួយភ្លែត..." -ForegroundColor Cyan

$gitExe = Join-Path $PSScriptRoot ".tools\MinGit\cmd\git.exe"
$remoteUrl = "https://AngkearaVychet:$token@github.com/AngkearaVychet/School-Management-.git"

& $gitExe push $remoteUrl main --force

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n======================================================================" -ForegroundColor Green
    Write-Host "  [ជោគជ័យ] កូដគម្រោងទាំងអស់ត្រូវបាន Push ឡើង GitHub ដោយជោគជ័យ!         " -ForegroundColor Green
    Write-Host "  មើលកូដលើ Web: https://github.com/AngkearaVychet/School-Management-    " -ForegroundColor Cyan
    Write-Host "======================================================================" -ForegroundColor Green
} else {
    Write-Host "`n[បរាជ័យ] មិនអាចរុញកូដទៅកាន់ GitHub បានទេ! សូមពិនិត្យមើល Token ឬសិទ្ធិ Access។" -ForegroundColor Red
}

Write-Host "`nចុច Enter ដើម្បីបិទ..."
pause
