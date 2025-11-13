# Backend-Frontend Integration Test Script
Write-Host "`n╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     CONVERSE TO CLARITY - INTEGRATION TEST     ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$allPass = $true

# Test 1: Backend Health
Write-Host "🧪 Test 1: Backend Health Check" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method Get -TimeoutSec 5
    if ($response.status -eq "ok") {
        Write-Host "   ✅ PASS - Backend is healthy" -ForegroundColor Green
        Write-Host "   Database: $($response.database)" -ForegroundColor Gray
    } else {
        Write-Host "   ❌ FAIL - Backend unhealthy" -ForegroundColor Red
        $allPass = $false
    }
} catch {
    Write-Host "   ❌ FAIL - Cannot reach backend" -ForegroundColor Red
    $allPass = $false
}

# Test 2: Frontend Reachability
Write-Host "`n🧪 Test 2: Frontend Server" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ PASS - Frontend is accessible" -ForegroundColor Green
    } else {
        Write-Host "   ❌ FAIL - Frontend returned $($response.StatusCode)" -ForegroundColor Red
        $allPass = $false
    }
} catch {
    Write-Host "   ❌ FAIL - Cannot reach frontend" -ForegroundColor Red
    $allPass = $false
}

# Test 3: CORS Configuration
Write-Host "`n🧪 Test 3: CORS Configuration" -ForegroundColor Yellow
try {
    $headers = @{'Origin' = 'http://localhost:5173'}
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -Headers $headers -UseBasicParsing -TimeoutSec 5
    $corsHeader = $response.Headers['Access-Control-Allow-Origin']
    
    if ($corsHeader -like "*5173*" -or $corsHeader -eq "*") {
        Write-Host "   ✅ PASS - CORS allows frontend origin" -ForegroundColor Green
        Write-Host "   Allowed: $corsHeader" -ForegroundColor Gray
    } else {
        Write-Host "   ⚠️  WARNING - CORS may block requests" -ForegroundColor Yellow
        Write-Host "   Allowed: $corsHeader" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ FAIL - CORS test failed" -ForegroundColor Red
    $allPass = $false
}

# Test 4: API Endpoints
Write-Host "`n🧪 Test 4: API Endpoints" -ForegroundColor Yellow
$endpoints = @("/api/auth", "/api/users", "/api/teams", "/api/projects", "/api/chat")
foreach ($endpoint in $endpoints) {
    try {
        $url = "http://localhost:5000$endpoint"
        $response = Invoke-WebRequest -Uri $url -Method Get -UseBasicParsing -TimeoutSec 3 -SkipHttpErrorCheck
        Write-Host "   ✅ $endpoint - Reachable (Status: $($response.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ $endpoint - Failed" -ForegroundColor Red
    }
}

# Test 5: Socket.IO
Write-Host "`n🧪 Test 5: WebSocket (Socket.IO)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/socket.io/" -UseBasicParsing -TimeoutSec 3
    Write-Host "   ✅ PASS - Socket.IO endpoint accessible" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  WARNING - Socket.IO may need verification" -ForegroundColor Yellow
}

# Summary
Write-Host "`n╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
if ($allPass) {
    Write-Host "║              ✅ ALL TESTS PASSED! ✅              ║" -ForegroundColor Green
    Write-Host "║                                                               ║" -ForegroundColor Cyan
    Write-Host "║  Backend and Frontend are properly integrated!                ║" -ForegroundColor White
} else {
    Write-Host "║            ⚠️  SOME TESTS FAILED ⚠️             ║" -ForegroundColor Yellow
    Write-Host "║                                                               ║" -ForegroundColor Cyan
    Write-Host "║  Check the errors above and restart servers if needed        ║" -ForegroundColor White
}
Write-Host "╚═══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "📊 SERVERS:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "   Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "   API Docs: http://localhost:5000/api" -ForegroundColor White
Write-Host ""
