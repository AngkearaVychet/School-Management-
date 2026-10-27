# PowerShell Local Web Server សម្រាប់ដំណើរការ សាលាអន្តរជាតិ ហេមតុន (Hampton International School)
# ដំណើរការដោយ៖ powershell -ExecutionPolicy Bypass -File .\Start-Server.ps1

$Port = 8080
$Url = "http://localhost:$Port/"
$RootFolder = $PSScriptRoot

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "     សាលាអន្តរជាតិ ហេមតុន - HAMPTON LOCAL WEB SERVER      " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "កំពុងចាប់ផ្ដើម Web Server នៅលើ $Url ..." -ForegroundColor Yellow
Write-Host "Root Directory: $RootFolder" -ForegroundColor Gray
Write-Host "ចុច Ctrl + C ដើម្បីបិទ Server" -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Cyan

# បង្កើត HttpListener
$Listener = New-Object System.Net.HttpListener
$Listener.Prefixes.Add($Url)

try {
    $Listener.Start()
    Write-Host "Server កំពុងដំណើរការដោយជោគជ័យ!" -ForegroundColor Green
    Write-Host "កំពុងបើកកម្មវិធី Browser ស្វ័យប្រវត្តិ..." -ForegroundColor Cyan
    Start-Process $Url
} catch {
    Write-Host "មិនអាចបើក Server បានទេ (ប្រហែលជា Port $Port កំពុងជាប់រវល់ ឬត្រូវការ Run as Administrator)៖" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "អ្នកអាចគ្រាន់តែ Double-Click លើឯកសារ 'index.html' ដោយផ្ទាល់ក៏បានដែរ!" -ForegroundColor Yellow
    exit
}

# វចនានុក្រម MIME types
$MimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".htm"  = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".gif"  = "image/gif"
    ".svg"  = "image/svg+xml"
    ".pdf"  = "application/pdf"
    ".ico"  = "image/x-icon"
}

try {
    while ($Listener.IsListening) {
        $Context = $Listener.GetContext()
        $Request = $Context.Request
        $Response = $Context.Response

        $LocalPath = $Request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrEmpty($LocalPath) -or $LocalPath -eq "/") {
            $LocalPath = "index.html"
        }

        # បំប្លែង URL path ទៅជា Windows Path
        $FilePath = Join-Path $RootFolder ($LocalPath -replace '/', '\')

        if (Test-Path $FilePath -PathType Leaf) {
            $Extension = [System.IO.Path]::GetExtension($FilePath).ToLower()
            $ContentType = $MimeTypes[$Extension]
            if (-not $ContentType) { $ContentType = "application/octet-stream" }

            $Response.ContentType = $ContentType
            $Response.StatusCode = 200

            $Bytes = [System.IO.File]::ReadAllBytes($FilePath)
            $Response.ContentLength64 = $Bytes.Length
            $Response.OutputStream.Write($Bytes, 0, $Bytes.Length)
        } else {
            $Response.StatusCode = 404
            $NotFoundMsg = [System.Text.Encoding]::UTF8.GetBytes("<h1>404 Not Found</h1><p>ឯកសារ $LocalPath រកមិនឃើញឡើយ។</p>")
            $Response.ContentType = "text/html; charset=utf-8"
            $Response.ContentLength64 = $NotFoundMsg.Length
            $Response.OutputStream.Write($NotFoundMsg, 0, $NotFoundMsg.Length)
        }

        $Response.OutputStream.Close()
    }
} finally {
    $Listener.Stop()
    $Listener.Close()
    Write-Host "Server ត្រូវបានបិទ។" -ForegroundColor Yellow
}
