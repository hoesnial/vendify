#!/bin/bash

# Test Frontend API Connection
echo "🧪 Testing Frontend API Connection..."
echo ""

# Get IP from api_config.dart
IP="192.168.100.17"
FRONTEND_PORT="3000"
BACKEND_PORT="3001"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "📍 Configuration:"
echo "   Frontend: http://$IP:$FRONTEND_PORT"
echo "   Backend:  http://$IP:$BACKEND_PORT"
echo ""

# Test Frontend Homepage
echo "1️⃣  Testing Frontend Homepage..."
if curl -s -o /dev/null -w "%{http_code}" "http://$IP:$FRONTEND_PORT" | grep -q "200"; then
    echo -e "${GREEN}✅ Frontend is running${NC}"
else
    echo -e "${RED}❌ Frontend is NOT running${NC}"
    echo "   Run: cd frontend && npm run dev"
fi
echo ""

# Test Backend Products API
echo "2️⃣  Testing Backend Products API..."
if curl -s -o /dev/null -w "%{http_code}" "http://$IP:$BACKEND_PORT/api/products" | grep -q "200"; then
    echo -e "${GREEN}✅ Backend is running${NC}"
else
    echo -e "${RED}❌ Backend is NOT running${NC}"
    echo "   Run: cd backend && npm start"
fi
echo ""

# Test Frontend Payment API
echo "3️⃣  Testing Frontend Payment Creation API..."
RESPONSE=$(curl -s -X POST "http://$IP:$FRONTEND_PORT/api/payment/create" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "TEST-'$(date +%s)'",
    "amount": 10000,
    "customerName": "Test User",
    "customerEmail": "test@example.com",
    "items": [{
      "id": "1",
      "name": "Test Product",
      "price": 10000,
      "quantity": 1
    }]
  }' -w "\n%{http_code}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Payment API is working${NC}"
    echo "   Response: $BODY"
    
    # Check if redirect_url exists
    if echo "$BODY" | grep -q "redirect_url"; then
        REDIRECT_URL=$(echo "$BODY" | grep -o '"redirect_url":"[^"]*"' | cut -d'"' -f4)
        echo -e "${GREEN}✅ Redirect URL received: $REDIRECT_URL${NC}"
    else
        echo -e "${YELLOW}⚠️  No redirect_url in response${NC}"
    fi
else
    echo -e "${RED}❌ Payment API failed (HTTP $HTTP_CODE)${NC}"
    echo "   Response: $BODY"
    echo ""
    echo -e "${YELLOW}💡 Check:${NC}"
    echo "   - Is MIDTRANS_SERVER_KEY set in frontend/.env.local?"
    echo "   - Did you restart frontend after setting .env?"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📱 Mobile App Testing:"
echo "   1. Open browser in your phone"
echo "   2. Visit: http://$IP:$FRONTEND_PORT"
echo "   3. If page loads → Connection is OK ✅"
echo ""
echo "🔧 If payment still fails:"
echo "   1. Check AndroidManifest.xml has INTERNET permission"
echo "   2. Rebuild: flutter clean && flutter build apk --debug"
echo "   3. Check logcat: flutter run --verbose"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
