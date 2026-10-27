@echo off
chcp 65001 >nul
title Create Desktop Shortcut - Hampton International School
cls
echo ======================================================================
echo    បង្កើត Icon លើ Desktop (Create Desktop Shortcut)
echo ======================================================================
echo.
echo កំពុងបង្កើត Shortcut ទៅកាន់ Desktop របស់អ្នក...

powershell -ExecutionPolicy Bypass -Command ^
"$WshShell = New-Object -ComObject WScript.Shell; " ^
"$desktopPath = [Environment]::GetFolderPath('Desktop'); " ^
"$shortcutPath = Join-Path $desktopPath 'Hampton International School.lnk'; " ^
"$appExe = Join-Path '%~dp0' 'HamptonSchool.exe'; " ^
"$iconPath = Join-Path '%~dp0' 'app-icon.ico'; " ^
"$Shortcut = $WshShell.CreateShortcut($shortcutPath); " ^
"$Shortcut.TargetPath = $appExe; " ^
"$Shortcut.WorkingDirectory = '%~dp0'; " ^
"$Shortcut.IconLocation = $iconPath; " ^
"$Shortcut.Description = 'Hampton International School Desktop App'; " ^
"$Shortcut.Save(); " ^
"Write-Host 'Shortcut created successfully at: ' $shortcutPath -ForegroundColor Green;"

if %errorlevel% equ 0 (
    echo.
    echo ======================================================================
    echo   [ជោគជ័យ] Icon កម្មវិធីត្រូវបានបញ្ជូនទៅកាន់ Desktop រួចរាល់ហើយ!
    echo   អ្នកអាចចូលប្រើកម្មវិធីពី Desktop របស់អ្នកបានដោយផ្ទាល់។
    echo ======================================================================
) else (
    echo.
    echo [បរាជ័យ] មិនអាចបង្កើត Shortcut បានទេ!
)

echo.
pause
