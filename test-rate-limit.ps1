$token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJsa2RhMjNAY2xjLmZpdHVzLmVkdS52biIsImlhdCI6MTc3ODk5Mzg4OSwiZXhwIjoxNzc5MDgwMjg5fQ.tYiwGf4KfmRQo9wZeDgUlmHVpa7nT1gIot1yRsqO1DI"
$workshopId = 3
$baseUrl = "http://localhost:8081"
$totalRequests = 10

$headers = @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" }
$ok = 0; $blocked = 0; $other = 0

Write-Host "`n=== Ban $totalRequests request lien tiep toi /api/tickets/register/$workshopId ===`n" -ForegroundColor Cyan

for ($i = 1; $i -le $totalRequests; $i++) {
    try {
        $response = Invoke-WebRequest -Method POST -Uri "$baseUrl/api/tickets/register/$workshopId" -Headers $headers -UseBasicParsing -ErrorAction Stop
        $status = $response.StatusCode
        $body = $response.Content
        $ok++
        Write-Host ("Lan {0,2}: HTTP {1} OK  -> {2}" -f $i, $status, ($body.Substring(0, [Math]::Min(80, $body.Length)))) -ForegroundColor Green
    }
    catch {
        $status = $_.Exception.Response.StatusCode.value__
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $body = $reader.ReadToEnd()
        
        if ($status -eq 429) {
            $blocked++
            Write-Host ("Lan {0,2}: HTTP 429 BI CHAN -> {1}" -f $i, $body) -ForegroundColor Yellow
        }
        else {
            $other++
            Write-Host ("Lan {0,2}: HTTP {1} -> {2}" -f $i, $status, $body) -ForegroundColor Magenta
        }
    }
    Start-Sleep -Milliseconds 100
}

Write-Host "`n=== Tong ket ===" -ForegroundColor Cyan
Write-Host "  Thanh cong (200): $ok" -ForegroundColor Green
Write-Host "  Bi chan (429):    $blocked" -ForegroundColor Yellow
Write-Host "  Loi khac:         $other`n" -ForegroundColor Magenta

if ($blocked -ge 1) {
    Write-Host "v Rate limit dang hoat dong!" -ForegroundColor Green
} else {
    Write-Host "x Rate limit co ve chua hoat dong. Kiem tra:" -ForegroundColor Red
    Write-Host "  - app.rate-limit.enabled=true trong application-local.properties"
    Write-Host "  - Da restart backend chua"
}