#!/bin/bash

# FashionAura - API Test Script
# Tests all endpoints to ensure they're working correctly

BASE_URL="http://localhost:8000/api"

echo "🧪 Testing FashionAura API"
echo "=============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test function
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    
    echo -n "Testing: $description ... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" -H "Content-Type: application/json")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✓ OK${NC} (HTTP $http_code)"
    elif [ "$http_code" -ge 300 ] && [ "$http_code" -lt 400 ]; then
        echo -e "${YELLOW}⚠ Redirect${NC} (HTTP $http_code)"
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $http_code)"
    fi
}

# Test Public Endpoints
echo "📍 PUBLIC ENDPOINTS"
echo "-------------------"
test_endpoint "GET" "/cities" "List all cities"
test_endpoint "GET" "/boutiques" "List all boutiques"
test_endpoint "GET" "/products" "List all products"

echo ""
echo "✅ Basic API endpoints are working!"
echo ""
echo "💡 To test protected endpoints, you need:"
echo "   - User login (Sanctum token)"
echo "   - Bearer token in Authorization header"
echo ""
echo "Run the frontend with 'npm run dev' to test the full application"
