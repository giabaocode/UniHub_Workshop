# =============================================================
# Test rate limit cho /api/tickets/register
#
# Tu dong:
#   1. Dang ky / login test user
#   2. Lay danh sach workshop, chon 1 workshop co phi (price > 0)
#   3. Bursting nhieu request, dem 200 / 429 / khac
#   4. Verify keys trong Redis (qua memurai-cli neu co, sau do docker exec)
#
# Cach dung:  powershell -ExecutionPolicy Bypass -File test-rate-limit.ps1
# =============================================================

$ErrorActionPreference = 'Stop'
$baseUrl = "http://localhost:8081"
$testEmail = "ratelimit_test@example.com"
$testPwd = "123456"
$totalRequests = 8

# ---------- 1. Lay token (register hoac login) ----------
Write-Host "[1/4] Chuan bi test user..." -ForegroundColor Cyan
$registerBody = @{
    email = $testEmail
    password = $testPwd
    fullName = "Rate Test"
    studentId = "SE_TEST_RATELIMIT_001"
    faculty = "CNTT"
} | ConvertTo-Json
try {
    $auth = Invoke-RestMethod -Method POST -Uri "$baseUrl/api/auth/register" -ContentType "application/json" -Body $registerBody
    Write-Host "  -> Da tao moi user." -ForegroundColor Green
} catch {
    $loginBody = @{ email = $testEmail; password = $testPwd } | ConvertTo-Json
    $auth = Invoke-RestMethod -Method POST -Uri "$baseUrl/api/auth/login" -ContentType "application/json" -Body $loginBody
    Write-Host "  -> User da ton tai, login OK." -ForegroundColor Green
}
$token = $auth.token
$headers = @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" }

# ---------- 2. Pick workshop co phi ----------
Write-Host "[2/4] Tim workshop co phi de test..." -ForegroundColor Cyan
$workshops = Invoke-RestMethod -Method GET -Uri "$baseUrl/api/workshops"
$paid = $workshops | Where-Object { $_.price -gt 0 -and $_.status -ne 'CANCELLED' } | Select-Object -First 1
if (-not $paid) {
    $paid = $workshops | Where-Object { $_.status -ne 'CANCELLED' } | Select-Object -First 1
}
if (-not $paid) { Write-Host "Khong tim thay workshop nao!" -ForegroundColor Red; exit 1 }
$wsId = $paid.id
Write-Host "  -> Dung workshop id=$wsId ($($paid.title)), price=$($paid.price)" -ForegroundColor Green

# ---------- 3. Burst requests ----------
Write-Host ""
Write-Host "[3/4] Bursting $totalRequests requests toi /api/tickets/register/$wsId" -ForegroundColor Cyan
Write-Host ""
$ok = 0; $blocked429 = 0; $other = 0
for ($i = 1; $i -le $totalRequests; $i++) {
    try {
        $r = Invoke-WebRequest -Method POST -Uri "$baseUrl/api/tickets/register/$wsId" -Headers $headers -UseBasicParsing
        $body = $r.Content
        $ok++
        $preview = $body.Substring(0, [Math]::Min(70, $body.Length))
        Write-Host ("Try {0}: HTTP {1} OK  -> {2}" -f $i, $r.StatusCode, $preview) -ForegroundColor Green
    } catch {
        $code = $_.Exception.Response.StatusCode.value__
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $body = $reader.ReadToEnd()
        if ($code -eq 429) {
            $blocked429++
            Write-Host ("Try {0}: HTTP 429 [RATE LIMIT] -> {1}" -f $i, $body) -ForegroundColor Yellow
        } else {
            $other++
            Write-Host ("Try {0}: HTTP {1} -> {2}" -f $i, $code, $body) -ForegroundColor Magenta
        }
    }
    Start-Sleep -Milliseconds 80
}

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host ("  HTTP 200 (OK):           {0}" -f $ok) -ForegroundColor Green
Write-Host ("  HTTP 429 (rate limited): {0}" -f $blocked429) -ForegroundColor Yellow
Write-Host ("  Other:                   {0}" -f $other) -ForegroundColor Magenta

# ---------- 4. Verify Redis store ----------
Write-Host ""
Write-Host "[4/4] Kiem tra Redis store..." -ForegroundColor Cyan
$cli = $null
$inDocker = $false
if (Get-Command memurai-cli -ErrorAction SilentlyContinue) {
    $cli = "memurai-cli"
    Write-Host "  -> Dung memurai-cli (native Windows Redis)" -ForegroundColor DarkCyan
} elseif ((docker ps --filter name=unihub-redis --format "{{.Names}}") -eq "unihub-redis") {
    $cli = "docker"
    $inDocker = $true
    Write-Host "  -> Dung docker exec unihub-redis redis-cli" -ForegroundColor DarkCyan
} else {
    Write-Host "  -> Khong tim thay redis-cli nao. Bo qua kiem tra Redis." -ForegroundColor DarkGray
    return
}

function Run-Cli {
    param([string[]]$cmdArgs)
    if ($inDocker) {
        return & docker exec unihub-redis redis-cli @cmdArgs
    } else {
        return & $cli @cmdArgs
    }
}

$dbsize = Run-Cli @("DBSIZE")
$keys = Run-Cli @("KEYS", "rate_limit:*")
Write-Host ("DBSIZE: {0}" -f $dbsize)
if ($keys) {
    Write-Host "Keys:"
    foreach ($k in @($keys)) {
        if ($k -and $k.ToString().Trim()) {
            $count = Run-Cli @("ZCARD", $k.ToString())
            Write-Host ("  {0}  -> {1} entries" -f $k, $count) -ForegroundColor Green
        }
    }
    Write-Host ""
    Write-Host "OK: Rate limit dang dung Redis store." -ForegroundColor Green
} else {
    Write-Host "  Khong co key rate_limit:* (co the da het TTL hoac dang fallback in-memory)" -ForegroundColor DarkYellow
}
