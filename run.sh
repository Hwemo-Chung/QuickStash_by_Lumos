#!/bin/bash

# QuickStash 로컬 실행 스크립트

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 프로젝트 디렉토리
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo -e "${GREEN}==== QuickStash 시작 ====${NC}"
echo ""

# 1. 의존성 설치 확인
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 의존성 설치 중...${NC}"
    npm install
    echo ""
fi

# 2. 빌드
echo -e "${YELLOW}🔨 프로덕션 빌드 중...${NC}"
npm run build
echo ""

# 3. 웹 서버 시작
PORT=5173
echo -e "${GREEN}✅ 빌드 완료!${NC}"
echo ""
echo -e "${GREEN}🚀 웹 서버 시작 중...${NC}"
echo -e "${GREEN}📍 브라우저를 열고 http://localhost:${PORT} 에 접속하세요${NC}"
echo ""
echo -e "${YELLOW}종료하려면 Ctrl+C를 누르세요${NC}"
echo ""

cd dist
python3 -m http.server $PORT
