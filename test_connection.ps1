# Test Frontend API Connection
Write-Host "🧪 Testing Frontend API Connection..." -ForegroundColor Cyan
Write-Host ""

# Get IP from api_config.dart
$IP = "192.168.100.17"
$FRONTEND_PORT = "3000"
$BACKEND_PORT = "3001"

Write-Host "📍 Configuration:" -ForegroundColor Yellow
Write-Host "   Frontend: http://$IP`:$FRONTEND_PORT"
Write-Host "   Backend:  http://$IP`:$BACKEND_PORT"
Write-Host ""

# Test Frontend Homepage
Write-Host "1️⃣  Testing Frontend Homepage..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://$IP`:$FRONTEND_PORT" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend is running" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Frontend is NOT running" -ForegroundColor Red
    Write-Host "   Run: cd frontend && npm run dev" -ForegroundColor Yellow
}
Write-Host ""

# Test Backend Products API
Write-Host "2️⃣  Testing Backend Products API..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://$IP`:$BACKEND_PORT/api/products" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend is running" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Backend is NOT running" -ForegroundColor Red
    Write-Host "   Run: cd backend && npm start" -ForegroundColor Yellow
}
Write-Host ""

# Test Frontend Payment API
Write-Host "3️⃣  Testing Frontend Payment Creation API..." -ForegroundColor Cyan
$orderId = "TEST-" + [DateTimeOffset]::Now.ToUnixTimeSeconds()
$body = @{
    orderId = $orderId
    amount = 10000
    customerName = "Test User"
    customerEmail = "test@example.com"
    items = @(
        @{
            id = "1"
            name = "Test Product"
            price = 10000
            quantity = 1
        }
    )
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://$IP`:$FRONTEND_PORT/api/payment/create" `
        -Method POST `
        -Body $body `
        -ContentType "application/json" `
        -UseBasicParsing `
        -TimeoutSec 10
    
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Payment API is working" -ForegroundColor Green
        $data = $response.Content | ConvertFrom-Json
        Write-Host "   Token: $($data.token.Substring(0, [Math]::Min(20, $data.token.Length)))..." -ForegroundColor Gray
        
        if ($data.redirect_url) {
            Write-Host "✅ Redirect URL received:" -ForegroundColor Green
            Write-Host "   $($data.redirect_url)" -ForegroundColor Gray
        } else {
            Write-Host "⚠️  No redirect_url in response" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "❌ Payment API failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Check:" -ForegroundColor Yellow
    Write-Host "   - Is MIDTRANS_SERVER_KEY set in frontend/.env.local?"
    Write-Host "   - Did you restart frontend after setting .env?"
}
Write-Host ""

# Summary
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📱 Mobile App Testing:" -ForegroundColor Yellow
Write-Host "   1. Open browser in your phone"
Write-Host "   2. Visit: http://$IP`:$FRONTEND_PORT"
Write-Host "   3. If page loads → Connection is OK ✅"
Write-Host ""
Write-Host "🔧 If payment still fails:" -ForegroundColor Yellow
Write-Host "   1. Check AndroidManifest.xml has INTERNET permission ✅"
Write-Host "   2. Rebuild: flutter clean && flutter build apk --debug"
Write-Host "   3. Install new APK on device"
Write-Host "   4. Check logs: flutter run --verbose"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
