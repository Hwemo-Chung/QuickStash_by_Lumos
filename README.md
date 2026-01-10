# QuickStash

빠르고 쉽게 메모와 항목들을 저장하고 검색할 수 있는 웹 애플리케이션입니다.

## 🚀 빠른 시작

### 자동 실행 (권장)

#### macOS / Linux
프로젝트 디렉토리에서 다음 명령어를 실행하세요:

```bash
./run.sh
```

#### Windows
프로젝트 디렉토리에서 `run.bat` 파일을 **더블클릭**하거나 다음을 실행하세요:

```bash
run.bat
```

또는 커맨드 프롬프트에서:
```cmd
run.bat
```

---

이 스크립트는 자동으로:
1. 필요한 의존성을 설치합니다
2. 프로덕션 빌드를 생성합니다
3. 로컬 웹 서버를 시작합니다 (포트 5173)

브라우저에서 **http://localhost:5173** 에 접속하면 앱을 사용할 수 있습니다.

### 수동 실행

#### 1단계: 의존성 설치
```bash
npm install
```

#### 2단계: 빌드
```bash
npm run build
```

#### 3단계: 로컬 서버 시작
```bash
cd dist
python3 -m http.server 5173
```

브라우저에서 **http://localhost:5173** 에 접속하세요.

## 📋 사용 가능한 명령어

| 명령어 | 설명 |
|--------|------|
| `./run.sh` | 자동 빌드 및 실행 (macOS/Linux) |
| `run.bat` | 자동 빌드 및 실행 (Windows) |
| `npm run dev` | 개발 서버 시작 (핫 리로드) |
| `npm run build` | 프로덕션 빌드 생성 |
| `npm run preview` | 빌드된 앱 미리보기 |
| `npm run test` | 테스트 실행 (감시 모드) |
| `npm run test:run` | 테스트 한 번 실행 |
| `npm run lint` | 코드 린팅 |

## 🛑 앱 종료

웹 서버를 종료하려면 터미널에서 **Ctrl+C** 를 누르세요.

## 📦 기술 스택

- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Dexie (IndexedDB)
- **Build Tool**: Vite
- **Testing**: Vitest
- **PWA**: Workbox

## 📝 요구사항

- **Node.js**: 16 이상 (권장: v18 LTS 또는 v20 LTS)
- **npm**: 8 이상
- **Python**: 3.x (로컬 서버용)

현재 Node.js 버전 확인:
```bash
node --version
npm --version
```

## 🐛 문제 해결

### "Unexpected token" 오류
Node.js 버전이 너무 낮을 수 있습니다. Node.js 16 이상으로 업그레이드하세요.

### 포트 5173이 이미 사용 중인 경우
```bash
cd dist
python3 -m http.server 5174  # 다른 포트 사용
```

## 📄 라이선스

MIT
