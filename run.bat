@echo off
REM QuickStash 로컬 실행 스크립트 (Windows)

setlocal enabledelayedexpansion

REM 프로젝트 디렉토리
set "PROJECT_DIR=%~dp0"
cd /d "%PROJECT_DIR%"

echo.
echo ==== QuickStash 시작 ====
echo.

REM 1. 의존성 설치 확인
if not exist "node_modules" (
    echo 📦 의존성 설치 중...
    call npm install
    echo.
)

REM 2. 빌드
echo 🔨 프로덕션 빌드 중...
call npm run build
echo.

REM 3. 웹 서버 시작
set "PORT=5173"
echo ✅ 빌드 완료!
echo.
echo 🚀 웹 서버 시작 중...
echo 📍 브라우저를 열고 http://localhost:%PORT% 에 접속하세요
echo.
echo 종료하려면 Ctrl+C를 누르세요
echo.

cd /d "%PROJECT_DIR%dist"
python -m http.server %PORT%

pause
