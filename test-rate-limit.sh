
BASE_URL="http://localhost:8081"
TEST_EMAIL="ratelimit_test@example.com"
TEST_PWD="123456"
TOTAL_REQUESTS=8

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
MAGENTA='\033[0;35m'
RED='\033[0;31m'
NC='\033[0m' 

TMP_RESP=$(mktemp)
trap "rm -f $TMP_RESP" EXIT

# ---------- 1. Lấy token (register hoặc login) ----------
echo -e "${CYAN}[1/4] Chuẩn bị test user...${NC}"

REGISTER_BODY=$(cat <<EOF
{"email": "$TEST_EMAIL", "password": "$TEST_PWD", "fullName": "Rate Test", "studentId": "SE_TEST_RATELIMIT_001", "faculty": "CNTT"}
EOF
)

HTTP_CODE=$(curl -s -o "$TMP_RESP" -w "%{http_code}" -X POST "$BASE_URL/api/auth/register" \
    -H "Content-Type: application/json" -d "$REGISTER_BODY")

if [[ "$HTTP_CODE" =~ ^2 ]]; then
    echo -e "  -> ${GREEN}Đã tạo mới user.${NC}"
else
    LOGIN_BODY=$(cat <<EOF
{"email": "$TEST_EMAIL", "password": "$TEST_PWD"}
EOF
)
    HTTP_CODE=$(curl -s -o "$TMP_RESP" -w "%{http_code}" -X POST "$BASE_URL/api/auth/login" \
        -H "Content-Type: application/json" -d "$LOGIN_BODY")
    
    if [[ "$HTTP_CODE" =~ ^2 ]]; then
        echo -e "  -> ${GREEN}User đã tồn tại, login OK.${NC}"
    else
        echo -e "${RED}Lỗi Auth. HTTP Code: $HTTP_CODE${NC}"
        cat "$TMP_RESP"
        exit 1
    fi
fi

TOKEN=$(jq -r '.token' "$TMP_RESP")

# ---------- 2. Pick workshop có phí ----------
echo -e "\n${CYAN}[2/4] Tìm workshop có phí để test...${NC}"
curl -s -o "$TMP_RESP" "$BASE_URL/api/workshops"

# Tìm workshop price > 0 và khác CANCELLED
WS_INFO=$(jq -r '[.[] | select(.price > 0 and .status != "CANCELLED")] | .[0]' "$TMP_RESP")

if [ "$WS_INFO" == "null" ]; then
    # Fallback: tìm workshop bất kỳ khác CANCELLED
    WS_INFO=$(jq -r '[.[] | select(.status != "CANCELLED")] | .[0]' "$TMP_RESP")
fi

if [ "$WS_INFO" == "null" ]; then
    echo -e "${RED}Không tìm thấy workshop nào!${NC}"
    exit 1
fi

WS_ID=$(echo "$WS_INFO" | jq -r '.id')
WS_TITLE=$(echo "$WS_INFO" | jq -r '.title')
WS_PRICE=$(echo "$WS_INFO" | jq -r '.price')

echo -e "  -> ${GREEN}Dùng workshop id=$WS_ID ($WS_TITLE), price=$WS_PRICE${NC}"

# ---------- 3. Burst requests ----------
echo -e "\n${CYAN}[3/4] Bursting $TOTAL_REQUESTS requests tới /api/tickets/register/$WS_ID${NC}\n"

OK=0
BLOCKED_429=0
OTHER=0

for ((i=1; i<=TOTAL_REQUESTS; i++)); do
    HTTP_CODE=$(curl -s -o "$TMP_RESP" -w "%{http_code}" -X POST "$BASE_URL/api/tickets/register/$WS_ID" \
        -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json")
    
    BODY=$(cat "$TMP_RESP")
    PREVIEW=$(echo "$BODY" | cut -c 1-70)

    if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 201 ]; then
        ((OK++))
        echo -e "${GREEN}Try $i: HTTP $HTTP_CODE OK  -> $PREVIEW${NC}"
    elif [ "$HTTP_CODE" -eq 429 ]; then
        ((BLOCKED_429++))
        echo -e "${YELLOW}Try $i: HTTP 429 [RATE LIMIT] -> $BODY${NC}"
    else
        ((OTHER++))
        echo -e "${MAGENTA}Try $i: HTTP $HTTP_CODE -> $BODY${NC}"
    fi
    
    sleep 0.08 # 80 milliseconds
done

echo -e "\n${CYAN}=== Summary ===${NC}"
echo -e "  ${GREEN}HTTP 200 (OK):           $OK${NC}"
echo -e "  ${YELLOW}HTTP 429 (rate limited): $BLOCKED_429${NC}"
echo -e "  ${MAGENTA}Other:                   $OTHER${NC}"

# ---------- 4. Verify Redis store ----------
echo -e "\n${CYAN}[4/4] Kiểm tra Redis store...${NC}"

CLI=""
if docker ps --filter name=unihub-redis --format '{{.Names}}' | grep -q "unihub-redis"; then
    CLI="docker exec unihub-redis redis-cli"
    echo -e "  -> ${CYAN}Dùng docker exec unihub-redis redis-cli${NC}"
elif command -v redis-cli &> /dev/null; then
    CLI="redis-cli"
    echo -e "  -> ${CYAN}Dùng redis-cli local${NC}"
else
    echo -e "  -> \033[1;30mKhông tìm thấy redis-cli (local hoặc docker). Bỏ qua kiểm tra Redis.${NC}"
    exit 0
fi

DBSIZE=$($CLI DBSIZE)
echo "DBSIZE: $DBSIZE"

KEYS=$($CLI KEYS "rate_limit:*")
if [ -n "$KEYS" ]; then
    echo "Keys:"
    for k in $KEYS; do
        # Xóa ký tự \r nếu có
        k=$(echo "$k" | tr -d '\r')
        COUNT=$($CLI ZCARD "$k")
        echo -e "  ${GREEN}$k  -> $COUNT entries${NC}"
    done
    echo -e "\n${GREEN}OK: Rate limit đang dùng Redis store.${NC}"
else
    echo -e "  ${YELLOW}Không có key rate_limit:* (có thể đã hết TTL hoặc đang fallback in-memory)${NC}"
fi