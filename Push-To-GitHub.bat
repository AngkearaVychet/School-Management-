@echo off
chcp 65001 >nul
title Push to GitHub - Hampton International School
cls
echo ======================================================================
echo      ភ្ជាប់ និងរុញកូដទៅកាន់ GitHub (Push to GitHub)
echo ======================================================================
echo Repository: https://github.com/AngkearaVychet/School-Management-.git
echo Branch:     main
echo ======================================================================
echo.
echo ដើម្បីរុញកូដ (Push) ទៅកាន់ GitHub បាន GitHub តម្រូវឱ្យប្រើ 
echo "Personal Access Token" (ជំនួសឱ្យពាក្យសម្ងាត់ធម្មតា)។
echo.
echo [1] បើកទំព័របង្កើត GitHub Token ដោយស្វ័យប្រវត្តិ
echo [2] ខ្ញុំមាន Token រួចហើយ ចង់ Push ភ្លាមៗ
echo.
set /p choice="សូមជ្រើសរើសជម្រើស (1 ឬ 2)៖ "

if "%choice%"=="1" (
    echo កំពុងបើកកម្មវិធីរុករក (Browser) ទៅកាន់ទំព័រ GitHub Settings...
    start https://github.com/settings/tokens/new?scopes=repo^&description=SchoolManagement
    echo.
    echo * ណែនាំ៖ ក្នុងទំព័រ GitHub សូមជ្រើសរើស "repo" (ពេញលេញ) រួចចុច "Generate token" ខាងក្រោមបង្អស់ ហើយចម្លង (Copy) Token នោះមក។
    echo.
)

:askToken
echo.
set /p token="សូម Paste (បិទភ្ជាប់) GitHub Token របស់អ្នកនៅទីនេះ រួចចុច Enter៖ "

if "%token%"=="" (
    echo.
    echo [កំហុស] Token មិនអាចទទេបានឡើយ! សូមព្យាយាមម្តងទៀត។
    goto askToken
)

echo.
echo កំពុងរុញកូដ (Pushing to GitHub)... សូមរង់ចាំបន្តិច...
".tools\MinGit\cmd\git.exe" push https://AngkearaVychet:%token%@github.com/AngkearaVychet/School-Management-.git main --force

if %errorlevel% equ 0 (
    echo.
    echo ======================================================================
    echo   [ជោគជ័យ ១០០%%] កូដគម្រោងទាំងអស់ត្រូវបាន Push ឡើង GitHub រួចរាល់!
    echo   អ្នកអាចមើលកូដលើ GitHub: https://github.com/AngkearaVychet/School-Management-
    echo ======================================================================
) else (
    echo.
    echo ======================================================================
    echo   [បរាជ័យ] មិនអាច Push បានទេ!
    echo   មូលហេតុអាចមកពី៖
    echo   - Token ផុតកំណត់ ឬខុស
    echo   - មិនទាន់បានគូសធីកសិទ្ធិ "repo" លើ Token
    echo ======================================================================
)

echo.
pause
