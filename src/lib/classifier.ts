import type { DrawerType } from '../types';

interface DrawerPattern {
  drawer: DrawerType;
  patterns: RegExp[];
  keywords: string[];
  priority: number;
}

const DRAWER_PATTERNS: DrawerPattern[] = [
  {
    drawer: 'contacts',
    patterns: [
      // Phone numbers (international) - must start with + or country code
      /\+\d{1,3}[-.\s]?\d{2,4}[-.\s]?\d{3,4}[-.\s]?\d{4}/,
      // Email
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
      // Social handles
      /@[a-zA-Z0-9_]{2,}/,
      // Korean phone format (010 prefix required)
      /010[-.\s]?\d{4}[-.\s]?\d{4}/,
      // Japanese phone format (starts with 0, but not account-like patterns)
      /0[1-9]\d{0,3}[-.\s]?\d{2,4}[-.\s]?\d{4}/,
      // LinkedIn profiles
      /linkedin\.com\/(in|company)\//,
      // Business card services
      /remember\.co\.kr/,
      /bcard\./,
    ],
    keywords: [
      // English
      'contact', 'phone', 'email', 'call', 'text', 'message', 'sms',
      'linkedin', 'twitter', 'instagram', 'facebook', 'whatsapp', 'telegram', 'kakao',
      'name', 'person', 'friend', 'colleague', 'manager', 'boss', 'client', 'customer',
      'mobile', 'cell', 'fax', 'office', 'extension', 'ext',
      'business card', 'profile', 'account', 'handle', 'username',
      'ceo', 'cto', 'cfo', 'coo', 'vp', 'director', 'president',

      // Korean - 연락처/인물
      '연락처', '전화번호', '휴대폰', '핸드폰', '번호', '이메일', '메일',
      '카카오톡', '카톡', '라인', '텔레그램', '인스타', '페이스북', '트위터',
      '담당자', '연락', '통화', '문자', '메시지', '전화해', '연락해',
      '친구', '동료', '상사', '부장', '과장', '대리', '사장', '대표', '이사', '팀장', '실장',
      '고객', '거래처', '업체', '파트너', '협력사',
      '명함', '프로필', '계정', '아이디',
      '누구', '누가', '사람',
      // Natural expressions
      '전번', '폰번', '연락줘', '톡해', '문자해', '카톡해', '번호좀', '연락드려',

      // Japanese - 連絡先/人物
      '連絡先', '電話番号', '携帯', 'メール', 'メールアドレス', 'メアド',
      'ライン', 'カカオ', 'インスタ', 'フェイスブック', 'ツイッター',
      '担当者', '連絡', '電話', 'メッセージ', '電話して', '連絡して',
      '友達', '同僚', '上司', '部長', '課長', '社長', '取締役', 'チームリーダー',
      'お客様', '取引先', 'パートナー',
      '名刺', 'プロフィール', 'アカウント',
      '誰', '人',
      // Natural expressions
      '電話ちょうだい', '連絡ください', 'LINEして',
    ],
    priority: 100,
  },
  {
    drawer: 'money',
    patterns: [
      // Currency symbols
      /[$₩€£¥₿]\s?\d+([,.]\d+)?/,
      /\d+([,.]\d+)?\s?[$₩€£¥₿]/,
      // Korean currency
      /\d+([,.]\d+)?\s?(원|만원|천원|백만원|억|조)/,
      // Japanese currency
      /\d+([,.]\d+)?\s?(円|万円|千円|百万円|億)/,
      // English currency words
      /\d+([,.]\d+)?\s?(dollars?|cents?|euros?|pounds?|yen|won)/i,
      // Bank account patterns
      /\d{3,}-\d{2,}-\d{4,}/,
      // Percentage
      /\d+(\.\d+)?%/,
      // Finance sites
      /finance\.yahoo\.com/,
      /finance\.naver\.com/,
      /investing\.com/,
      /coinmarketcap\.com/,
      /coingecko\.com/,
      /tradingview\.com/,
      // Banking sites
      /kbstar\.com/,
      /shinhan\.com/,
      /wooribank\.com/,
      /hanabank\.com/,
      /ibk\.co\.kr/,
      /nonghyup\.com/,
      /toss\.im/,
      /kakaopay\.com/,
      /naverpay\.naver\.com/,
    ],
    keywords: [
      // English - Finance
      'price', 'cost', 'pay', 'payment', 'salary', 'wage', 'income', 'expense',
      'budget', 'money', 'cash', 'credit', 'debit', 'debt', 'loan', 'mortgage',
      'invest', 'investment', 'stock', 'bond', 'fund', 'dividend', 'interest', 'roi',
      'tax', 'refund', 'discount', 'fee', 'charge', 'bill', 'invoice', 'receipt',
      'transfer', 'deposit', 'withdraw', 'balance', 'account', 'bank', 'atm',
      'bitcoin', 'crypto', 'cryptocurrency', 'wallet', 'exchange', 'coin', 'token',
      'insurance', 'pension', 'retirement', 'savings', '401k', 'ira',
      'profit', 'loss', 'revenue', 'gross', 'net', 'margin',
      'quote', 'estimate', 'bid', 'offer',
      'paypal', 'venmo', 'zelle',
      'how much', 'total', 'sum', 'amount',

      // Korean - 금융
      '가격', '비용', '지불', '결제', '월급', '급여', '연봉', '수입', '지출',
      '예산', '돈', '현금', '카드', '신용', '체크', '빚', '대출', '담보', '모기지',
      '투자', '주식', '펀드', '배당', '이자', '금리', '수익률',
      '세금', '환급', '할인', '수수료', '청구서', '영수증', '계산서', '견적',
      '이체', '입금', '출금', '잔액', '계좌', '은행', 'ATM', '현금인출기',
      '비트코인', '코인', '암호화폐', '거래소', '업비트', '빗썸', '바이낸스',
      '보험', '연금', '퇴직금', '저축', '적금', '예금', 'IRP', '연저펀',
      '송금', '환전', '환율', '달러', '엔화', '유로',
      '이익', '손실', '매출', '순이익', '마진',
      '견적', '입찰', '낙찰',
      '토스', '카카오페이', '네이버페이', '삼성페이',
      // Natural expressions
      '얼마', '총액', '합계', '금액', '돈얼마', '가격이', '비싸', '싸다', '저렴',
      '빌려', '갚아', '내야할돈', '받을돈', '줄돈', '정산',
      '월세', '전세', '관리비', '공과금', '요금',

      // Japanese - 金融
      '価格', '費用', '支払い', '給料', '給与', '年収', '収入', '支出',
      '予算', 'お金', '現金', 'カード', 'クレジット', 'デビット', '借金', 'ローン',
      '投資', '株', '株式', 'ファンド', '配当', '利子', '金利', '利回り',
      '税金', '還付', '割引', '手数料', '請求書', '領収書', '見積もり',
      '振込', '入金', '出金', '残高', '口座', '銀行',
      'ビットコイン', '仮想通貨', '取引所',
      '保険', '年金', '退職金', '貯金', '定期預金',
      '送金', '為替', '為替レート', 'ドル', '円',
      '利益', '損失', '売上', '純利益', 'マージン',
      // Natural expressions
      'いくら', '合計', '金額', '高い', '安い', 'お得',
      '借りる', '返す', '払う', '精算', '割り勘',
      '家賃', '光熱費', '料金',
    ],
    priority: 95,
  },
  {
    drawer: 'watch',
    patterns: [
      // Video platforms
      /youtube\.com\/watch/,
      /youtube\.com\/shorts/,
      /youtube\.com\/live/,
      /youtube\.com\/playlist/,
      /youtube\.com\/@/,
      /youtu\.be\//,
      /vimeo\.com\//,
      /twitch\.tv\//,
      /netflix\.com/,
      /disneyplus\.com/,
      /hulu\.com/,
      /amazon\.com\/.*video/,
      /primevideo\.com/,
      /hbomax\.com/,
      /max\.com/,
      /wavve\.com/,
      /tving\.com/,
      /watcha\.com/,
      /coupangplay\.com/,
      /seezn\.com/,
      /bilibili\.com/,
      /nicovideo\.jp/,
      /abema\.tv/,
      /dazn\.com/,
      /tv\.naver\.com/,
      /tv\.kakao\.com/,
      /play\.afreecatv\.com/,
      // TikTok / Shorts / Reels
      /tiktok\.com/,
      /instagram\.com\/reel/,
      /instagram\.com\/tv/,
      // Movie databases
      /imdb\.com/,
      /rottentomatoes\.com/,
      /letterboxd\.com/,
      /themoviedb\.org/,
      /namu\.wiki\/w\/.*(영화|드라마|애니)/,
    ],
    keywords: [
      // English - Video/Entertainment
      'video', 'watch', 'movie', 'film', 'series', 'show', 'episode', 'season',
      'documentary', 'trailer', 'teaser', 'stream', 'streaming', 'netflix', 'youtube',
      'anime', 'animation', 'cartoon', 'drama', 'comedy', 'action', 'thriller', 'horror', 'romance', 'sci-fi',
      'subscribe', 'channel', 'playlist', 'clip', 'vlog', 'tutorial', 'review',
      'live', 'broadcast', 'premiere', 'release', 'new episode',
      'actor', 'actress', 'director', 'cast', 'starring',
      'binge', 'marathon', 'rewatch', 'spoiler',
      'subtitle', 'dubbed', 'original', 'remake', 'sequel', 'prequel',
      'imdb', 'rating', 'score',

      // Korean - 영상/엔터테인먼트
      '영상', '동영상', '비디오', '영화', '드라마', '시리즈', '에피소드', '시즌',
      '다큐멘터리', '예고편', '티저', '스트리밍', '넷플릭스', '유튜브', '왓챠', '웨이브', '티빙', '쿠팡플레이',
      '애니메이션', '애니', '만화영화', '코미디', '액션', '스릴러', '공포', '로맨스', '멜로', 'SF', '판타지',
      '구독', '채널', '재생목록', '클립', '브이로그', '튜토리얼', '리뷰', '리액션',
      '생방송', '라이브', '방송', '첫방', '본방', '공개', '개봉',
      '배우', '감독', '출연진', '주연', '조연', '캐스팅',
      '정주행', '몰아보기', '재방', '스포', '스포일러',
      '자막', '더빙', '오리지널', '리메이크', '속편', '프리퀄',
      // Natural expressions
      '볼것', '볼 것', '볼거', '볼 거', '봐야할', '봐야 할', '보고싶은', '보고 싶은',
      '뭐볼까', '뭐 볼까', '오늘뭐봄', '추천영화', '추천드라마', '재밌는', '재미있는',
      '예능', '버라이어티', '토크쇼', '뉴스', '시사', '교양',
      '먹방', '쿡방', '여행프로', '예능프로',
      '몇화', '몇부작', '완결', '연재중', '방영중',

      // Japanese - 動画/エンターテインメント
      '動画', 'ビデオ', '映画', 'ドラマ', 'シリーズ', 'エピソード', 'シーズン',
      'ドキュメンタリー', '予告編', 'ティーザー', 'ストリーミング', 'ネットフリックス', 'ユーチューブ',
      'アニメ', 'アニメーション', '漫画', 'コメディ', 'アクション', 'スリラー', 'ホラー', 'ロマンス', 'SF', 'ファンタジー',
      'チャンネル登録', 'チャンネル', 'プレイリスト', 'クリップ', 'チュートリアル', 'レビュー', 'リアクション',
      '生放送', 'ライブ', '放送', '初回', '公開', '上映',
      '俳優', '女優', '監督', 'キャスト', '主演', '助演',
      '一気見', '見直す', 'ネタバレ',
      '字幕', '吹替', 'オリジナル', 'リメイク', '続編', '前編',
      // Natural expressions
      '見る', '見たい', '視聴', '見ようかな', 'おすすめ映画', 'おすすめドラマ', '面白い',
      'バラエティ', 'トークショー', 'ニュース', '教養',
      '何話', '完結', '連載中', '放送中',
    ],
    priority: 90,
  },
  {
    drawer: 'dev',
    patterns: [
      // Code hosting
      /github\.com/,
      /gitlab\.com/,
      /bitbucket\.org/,
      /gist\.github\.com/,
      /codepen\.io/,
      /codesandbox\.io/,
      /jsfiddle\.net/,
      /replit\.com/,
      // Dev resources
      /stackoverflow\.com/,
      /stackexchange\.com/,
      /npmjs\.com/,
      /pypi\.org/,
      /crates\.io/,
      /packagist\.org/,
      /rubygems\.org/,
      /hub\.docker\.com/,
      /pkg\.go\.dev/,
      /mvnrepository\.com/,
      // Documentation
      /docs\./,
      /developer\./,
      /devdocs\.io/,
      /mdn\.mozilla\.org/,
      /w3schools\.com/,
      /freecodecamp\.org/,
      /geeksforgeeks\.org/,
      /tutorialspoint\.com/,
      // AI/ML
      /huggingface\.co/,
      /kaggle\.com/,
      /tensorflow\.org/,
      /pytorch\.org/,
      // Cloud
      /console\.aws\.amazon\.com/,
      /console\.cloud\.google\.com/,
      /portal\.azure\.com/,
      /vercel\.com/,
      /netlify\.com/,
      /heroku\.com/,
      // Code patterns
      /(function|const|let|var|import|export)\s+\w+/,
      /=>\s*[{(]/,
      /\bclass\s+\w+/,
      /\bdef\s+\w+/,
      /\bfunc\s+\w+/,
      /\bpublic\s+(class|void|static)/,
      /<\/?[a-z]+[^>]*>/i,
      /\{\{.*\}\}/,
      /```[\s\S]*```/,
      /npm\s+(install|i|run|start|build)/,
      /yarn\s+(add|install|run|build)/,
      /pip\s+install/,
      /cargo\s+(build|run|add)/,
      /docker\s+(run|build|pull|push)/,
      /git\s+(clone|pull|push|commit|checkout|merge)/,
    ],
    keywords: [
      // English - Development
      'code', 'coding', 'program', 'programming', 'developer', 'development', 'dev',
      'software', 'application', 'app', 'web', 'mobile', 'frontend', 'backend', 'fullstack',
      'api', 'rest', 'graphql', 'websocket', 'database', 'sql', 'nosql', 'query', 'orm',
      'bug', 'error', 'debug', 'fix', 'issue', 'problem', 'solution', 'workaround', 'hotfix',
      'deploy', 'deployment', 'server', 'cloud', 'aws', 'azure', 'gcp', 'serverless', 'lambda',
      'git', 'commit', 'push', 'pull', 'merge', 'branch', 'repository', 'repo', 'pr', 'pull request',
      'framework', 'library', 'package', 'module', 'dependency', 'npm', 'yarn', 'pip',
      'test', 'testing', 'unit', 'integration', 'e2e', 'ci', 'cd', 'pipeline', 'jenkins', 'github actions',
      'react', 'vue', 'angular', 'svelte', 'next', 'nuxt', 'node', 'express', 'nest', 'django', 'flask', 'spring',
      'python', 'java', 'javascript', 'typescript', 'go', 'rust', 'swift', 'kotlin', 'c++', 'c#',
      'docker', 'kubernetes', 'k8s', 'container', 'microservice', 'devops', 'sre',
      'algorithm', 'data structure', 'design pattern', 'solid', 'dry', 'kiss',
      'refactor', 'optimize', 'performance', 'security', 'authentication', 'authorization', 'oauth', 'jwt',
      'ai', 'ml', 'machine learning', 'deep learning', 'neural network', 'llm', 'gpt', 'chatgpt',
      'syntax', 'compile', 'runtime', 'exception', 'stack trace', 'log', 'logging',

      // Korean - 개발
      '코드', '코딩', '프로그램', '프로그래밍', '개발', '개발자',
      '소프트웨어', '애플리케이션', '앱', '웹', '모바일', '프론트엔드', '백엔드', '풀스택',
      'API', '데이터베이스', 'DB', '쿼리',
      '버그', '에러', '오류', '디버그', '디버깅', '수정', '이슈', '문제', '해결', '핫픽스',
      '배포', '서버', '클라우드', '서버리스',
      '깃', '깃허브', '커밋', '푸시', '풀', '머지', '브랜치', '저장소', '레포', 'PR', '풀리퀘',
      '프레임워크', '라이브러리', '패키지', '모듈', '의존성',
      '테스트', '단위테스트', '통합테스트', 'E2E', 'CI/CD', '파이프라인',
      '리액트', '뷰', '앵귤러', '넥스트', '노드', '익스프레스', '스프링', '장고', '플라스크',
      '파이썬', '자바', '자바스크립트', '타입스크립트', '고', '러스트', '스위프트', '코틀린',
      '도커', '쿠버네티스', '컨테이너', '마이크로서비스', '데브옵스',
      '알고리즘', '자료구조', '디자인패턴',
      '리팩토링', '최적화', '성능', '보안', '인증', '인가',
      'AI', 'ML', '머신러닝', '딥러닝', '인공지능', 'LLM', 'GPT', '챗GPT',
      // Natural expressions
      '개발하다', '코딩하다', '구현', '작업', '프로젝트', '사이드프로젝트',
      '문법', '컴파일', '런타임', '예외', '스택트레이스', '로그',
      '공부', '학습', '튜토리얼', '강좌', '인강',

      // Japanese - 開発
      'コード', 'コーディング', 'プログラム', 'プログラミング', '開発', '開発者',
      'ソフトウェア', 'アプリケーション', 'アプリ', 'ウェブ', 'モバイル', 'フロントエンド', 'バックエンド', 'フルスタック',
      'データベース', 'クエリ',
      'バグ', 'エラー', 'デバッグ', '修正', '問題', '解決', 'ホットフィックス',
      'デプロイ', 'サーバー', 'クラウド', 'サーバーレス',
      'コミット', 'プッシュ', 'プル', 'マージ', 'ブランチ', 'リポジトリ',
      'フレームワーク', 'ライブラリ', 'パッケージ', 'モジュール', '依存関係',
      'テスト', '単体テスト', '結合テスト', 'パイプライン',
      'アルゴリズム', 'データ構造', 'デザインパターン',
      'リファクタリング', '最適化', 'パフォーマンス', 'セキュリティ', '認証', '認可',
      '機械学習', 'ディープラーニング', '人工知能',
      // Natural expressions
      '開発する', 'コーディングする', '実装', '作業', 'プロジェクト', 'サイドプロジェクト',
      '文法', 'コンパイル', 'ランタイム', '例外', 'スタックトレース', 'ログ',
      '勉強', '学習', 'チュートリアル', '講座',
    ],
    priority: 85,
  },
  {
    drawer: 'schedule',
    patterns: [
      // Full date formats
      /\d{4}[-/.]\d{1,2}[-/.]\d{1,2}/,
      /\d{1,2}[-/.]\d{1,2}[-/.]\d{4}/,

      // Short date formats with slash only (most common for dates): 4/12, 12/25
      /\b\d{1,2}\/\d{1,2}\b/,

      // Korean date: 1월 3일, 12월 25일
      /\d{1,2}월\s?\d{1,2}일/,

      // Korean short date with 일: 4/12일, 4-12일, 4.12일
      /\d{1,2}[/\-.]\d{1,2}일/,

      // Japanese date: 1月3日, 12月25日
      /\d{1,2}月\s?\d{1,2}日/,

      // Spanish date: 3 de enero, 25 de diciembre
      /\d{1,2}\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/i,

      // English date: Jan 3, January 3rd, 3rd January
      /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{1,2}(st|nd|rd|th)?\b/i,
      /\b\d{1,2}(st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/i,

      // Time patterns
      /\d{1,2}:\d{2}/,
      /\d{1,2}\s?(am|pm|시|時|o'clock)/i,

      // Day of week - Korean
      /(월|화|수|목|금|토|일)요일/,
      /이번\s?(월|화|수|목|금|토|일)/,
      /다음\s?(월|화|수|목|금|토|일)/,

      // Day of week - Japanese
      /(月|火|水|木|金|土|日)曜日/,

      // Day of week - English
      /\b(mon|tue|wed|thu|fri|sat|sun)(day)?\b/i,
      /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
      /this\s+(mon|tue|wed|thu|fri|sat|sun)/i,
      /next\s+(mon|tue|wed|thu|fri|sat|sun)/i,

      // Day of week - Spanish
      /\b(lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo)\b/i,

      // Relative time - Korean
      /(내일|모레|다음\s?주|이번\s?주|다음\s?달|이번\s?달|올해|내년|지난주|저번주|지난달|작년)/,
      /(\d+일\s?후|\d+일\s?뒤|\d+주\s?후|\d+달\s?후)/,

      // Relative time - Japanese
      /(明日|明後日|来週|今週|来月|今月|今年|来年|先週|先月|去年)/,

      // Relative time - English
      /\b(tomorrow|today|tonight|yesterday|next\s+week|this\s+week|next\s+month|this\s+month|next\s+year|this\s+year)\b/i,
      /\b(in\s+\d+\s+(day|week|month|year)s?)\b/i,

      // D-day pattern
      /D-?\d+/i,
      /디데이/,
      /D\s?day/i,

      // Strong signal keywords as patterns (birthday, anniversary)
      /\b(birthday|anniversary)\b/i,
      /생일/,
      /기념일/,
      /誕生日/,
      /記念日/,
      /cumpleaños/i,
      /aniversario/i,

      // Calendar services
      /calendar\.google\.com/,
      /outlook\.live\.com\/calendar/,
      /calendar\.naver\.com/,
    ],
    keywords: [
      // English - Events & Occasions
      'meeting', 'appointment', 'schedule', 'event', 'deadline', 'reminder', 'remind',
      'birthday', 'anniversary', 'wedding', 'graduation', 'ceremony', 'funeral',
      'holiday', 'vacation', 'trip', 'travel', 'flight', 'departure', 'arrival',
      'interview', 'presentation', 'conference', 'seminar', 'workshop', 'webinar', 'meetup',
      'reservation', 'booking', 'checkout', 'check-in', 'check out', 'reserved',
      'exam', 'test', 'quiz', 'due', 'expiry', 'renewal', 'expires',
      'party', 'celebration', 'reception', 'gathering', 'reunion',
      'doctor', 'dentist', 'hospital', 'clinic', 'checkup', 'physical',
      'alarm', 'alert', 'notify', 'notification', 'snooze',
      'calendar', 'agenda', 'planner', 'itinerary',
      'when', 'what time', 'starts', 'ends', 'begins',
      'rsvp', 'invite', 'invitation', 'attend', 'attending',
      'cancel', 'cancellation', 'unsubscribe', 'terminate', 'expiration', 'renewal',

      // Korean - 행사/기념일
      '약속', '미팅', '회의', '일정', '예약', '예정', '스케줄',
      '생일', '기념일', '결혼식', '졸업식', '입학식', '돌잔치', '장례식', '제사',
      '명절', '설날', '추석', '크리스마스', '새해', '발렌타인', '화이트데이',
      '휴가', '여행', '출장', '귀국', '입국', '출발', '도착', '탑승',
      '면접', '발표', '세미나', '워크숍', '컨퍼런스', '웨비나', '밋업',
      '진료', '병원', '치과', '검진', '수술', '건강검진',
      '시험', '마감', '만료', '갱신', '연장', '기한', '제출',
      '파티', '모임', '동창회', '송년회', '신년회', '환영회', '송별회', '회식',
      '입금', '납부', '결제', '청구', '납기',
      '알람', '알림', '리마인더', '메모', '스누즈',
      '캘린더', '달력', '스케줄', '플래너', '일정표',
      // Natural expressions
      '언제', '몇시', '몇시에', '시작', '끝', '부터', '까지',
      '참석', '불참', '참가', '초대', '초대장',
      '잡아둬', '잡아놔', '약속잡아', '시간되면', '시간있으면',
      // Subscription/cancellation deadlines
      '해지', '구독해지', '취소', '해약', '정지', '중단', '종료', '만기',

      // Japanese - 行事/記念日
      '予定', '会議', 'ミーティング', 'スケジュール', '予約',
      '誕生日', '記念日', '結婚式', '卒業式', '入学式', '葬式', '法事',
      '祝日', '正月', 'お盆', 'クリスマス', '新年', 'バレンタイン', 'ホワイトデー',
      '休暇', '旅行', '出張', '帰国', '入国', '出発', '到着', '搭乗',
      '面接', '発表', 'セミナー', 'ワークショップ', 'カンファレンス', 'ウェビナー', 'ミートアップ',
      '診察', '病院', '歯医者', '検診', '手術', '健康診断',
      '試験', 'テスト', '締め切り', '期限', '更新', '延長', '提出',
      'パーティー', '集まり', '同窓会', '忘年会', '新年会', '歓迎会', '送別会', '飲み会',
      '支払い', '納付', '決済', '請求', '納期',
      'アラーム', '通知', 'リマインダー', 'スヌーズ',
      'カレンダー', 'スケジュール', 'プランナー', '予定表',
      // Natural expressions
      'いつ', '何時', '何時に', '開始', '終了', 'から', 'まで',
      '参加', '不参加', '出席', '欠席', '招待', '招待状',
      '予約して', '時間あれば', '時間があれば',

      // Spanish - Eventos/Fechas
      'cita', 'reunión', 'evento', 'fecha', 'plazo', 'horario',
      'cumpleaños', 'aniversario', 'boda', 'graduación', 'funeral',
      'vacaciones', 'viaje', 'vuelo', 'salida', 'llegada',
      'entrevista', 'presentación', 'conferencia', 'seminario',
      'reserva', 'reservación',
      'examen', 'vencimiento', 'renovación', 'fecha límite',
      'fiesta', 'celebración', 'reunión',
      'médico', 'dentista', 'hospital', 'cita médica', 'chequeo',
      'alarma', 'recordatorio',
      'calendario', 'agenda',
    ],
    priority: 80,
  },
  {
    drawer: 'shopping',
    patterns: [
      // Shopping platforms - Global
      /amazon\.(com|co\.jp|de|co\.uk|fr|it|es)/,
      /ebay\.(com|co\.uk|de|fr)/,
      /aliexpress\.com/,
      /alibaba\.com/,
      /etsy\.com/,
      /walmart\.com/,
      /target\.com/,
      /bestbuy\.com/,
      /costco\.com/,
      /ikea\.com/,
      // Shopping platforms - Korea
      /coupang\.com/,
      /gmarket\.(com|co\.kr)/,
      /11st\.co\.kr/,
      /auction\.co\.kr/,
      /interpark\.(com|co\.kr)/,
      /ssg\.com/,
      /lotteon\.com/,
      /hmall\.com/,
      /gsshop\.com/,
      /musinsa\.com/,
      /wconcept\.co\.kr/,
      /29cm\.co\.kr/,
      /zigzag\.kr/,
      /ably\.kr/,
      /ohou\.se/,
      /kurly\.com/,
      /emart\.com/,
      // Shopping platforms - Japan
      /rakuten\.co\.jp/,
      /mercari\.com/,
      /yahoo\.co\.jp.*shopping/,
      /zozo\.jp/,
      /uniqlo\.(com|jp)/,
      // Search - Shopping
      /shopping\.naver\.com/,
      /shopping\.google\.com/,
      /search\.shopping\.naver\.com/,
      // Product URL patterns
      /\/product\//,
      /\/item\//,
      /\/goods\//,
      /\/dp\//,
      /\/products\//,
      /[?&]product_id=/,
      /[?&]item_id=/,

      // Strong signal keywords as patterns (shopping lists)
      /살것/,
      /살 것/,
      /사야할/,
      /사야 할/,
      /장바구니/,
      /쇼핑\s?(목록|리스트)/,
      /買い物/,
      /購入/,
      /ショッピング/,
    ],
    keywords: [
      // English
      'buy', 'order', 'cart', 'shopping', 'wishlist', 'purchase', 'checkout', 'shop',
      'price', 'deal', 'sale', 'discount', 'coupon', 'promo', 'promotion', 'offer', 'clearance',
      'delivery', 'shipping', 'track', 'tracking', 'package', 'parcel', 'shipment',
      'return', 'refund', 'exchange', 'warranty', 'guarantee',
      'size', 'color', 'quantity', 'qty', 'stock', 'available', 'sold out', 'out of stock', 'in stock',
      'review', 'rating', 'recommend', 'star', 'feedback',
      'brand', 'model', 'product', 'item', 'goods', 'merchandise',
      'amazon', 'ebay', 'walmart', 'target', 'costco', 'ikea',
      'free shipping', 'fast delivery', 'prime', 'express',
      'add to cart', 'buy now', 'order now',

      // Korean
      '구매', '주문', '장바구니', '쇼핑', '위시리스트', '결제', '계산', '체크아웃',
      '가격', '할인', '세일', '쿠폰', '프로모션', '특가', '최저가', '핫딜', '타임딜', '떠리',
      '배송', '배달', '택배', '추적', '송장', '운송장', '배송조회',
      '반품', '환불', '교환', '보증', 'AS', '무상수리',
      '사이즈', '색상', '수량', '재고', '품절', '입고', '재입고',
      '후기', '리뷰', '별점', '추천', '평점', '상품평',
      '브랜드', '상품', '제품', '물건', '굿즈',
      '쿠팡', '지마켓', '옥션', '11번가', 'SSG', '롯데온', '마켓컬리', '무신사', '에이블리', '지그재그', '오늘의집',
      '무료배송', '로켓배송', '새벽배송', '당일배송',
      // Natural expressions
      '살것', '살 것', '살거', '살 거', '사야할', '사야 할', '사고싶은', '사고 싶은',
      '필요한것', '필요한 것', '사올것', '사올 것', '구입', '쇼핑리스트',
      '이거사야', '이거살까', '뭐살까', '갖고싶다', '갖고 싶다', '사줘', '선물',
      '장보기', '마트', '편의점',

      // Japanese
      '購入', '注文', 'カート', 'ショッピング', 'ウィッシュリスト', '決済', '精算', 'チェックアウト',
      '価格', '割引', 'セール', 'クーポン', 'プロモーション', '特価', '最安値', 'タイムセール',
      '配送', '配達', '宅配', '追跡', '伝票', '配送状況',
      '返品', '返金', '交換', '保証',
      'サイズ', '色', '数量', '在庫', '売り切れ', '入荷', '再入荷',
      'レビュー', '評価', '星', 'おすすめ', '口コミ',
      'ブランド', '商品', '製品', 'アイテム', 'グッズ',
      '楽天', 'メルカリ', 'アマゾン', 'ユニクロ', 'ZOZO',
      '送料無料', '即日配送', '翌日配送',
      // Natural expressions
      '買い物', '買う', '買いたい', '欲しい物', '欲しいもの', 'ほしい',
      '必要なもの', '買ってくる', '購入リスト', 'ショッピングリスト',
      'これ買おう', '何買おう', 'プレゼント', 'ギフト',
      '買い出し', 'スーパー', 'コンビニ',
    ],
    priority: 80,
  },
  {
    drawer: 'read',
    patterns: [
      // Blog/Article platforms
      /medium\.com/,
      /substack\.com/,
      /wordpress\.com/,
      /blogger\.com/,
      /ghost\.io/,
      // Korea platforms
      /tistory\.com/,
      /brunch\.co\.kr/,
      /velog\.io/,
      /blog\.naver\.com/,
      /m\.blog\.naver\.com/,
      /post\.naver\.com/,
      /cafe\.naver\.com/,
      // Japan platforms
      /note\.com/,
      /qiita\.com/,
      /zenn\.dev/,
      /hatenablog\.(com|jp)/,
      /ameblo\.jp/,
      // URL patterns
      /\.blog\//,
      /\/article\//,
      /\/post\//,
      /\/blog\//,
      /\/story\//,
      /\/entry\//,
      // News - Global
      /news\./,
      /\/news\//,
      /bbc\.(com|co\.uk)/,
      /cnn\.com/,
      /nytimes\.com/,
      /washingtonpost\.com/,
      /theguardian\.com/,
      /reuters\.com/,
      // News - Korea
      /news\.naver\.com/,
      /n\.news\.naver\.com/,
      /news\.daum\.net/,
      /chosun\.com/,
      /donga\.com/,
      /joongang\.co\.kr/,
      /hani\.co\.kr/,
      /khan\.co\.kr/,
      /yna\.co\.kr/,
      // News - Japan
      /nhk\.or\.jp\/news/,
      /asahi\.com/,
      /yomiuri\.co\.jp/,
      /mainichi\.jp/,
      /nikkei\.com/,
      // Books
      /goodreads\.com/,
      /yes24\.com/,
      /kyobobook\.co\.kr/,
      /aladin\.co\.kr/,
      /ridibooks\.com/,
      /millie\.co\.kr/,
      /amazon\.com\/.*\/dp\//,
      /books\.google\.com/,
      // Wikipedia & Knowledge
      /wikipedia\.org/,
      /namu\.wiki/,
      /wikihow\.com/,
      // Search - Articles/News
      /news\.google\.com/,
      /search\.naver\.com\/.*where=news/,
    ],
    keywords: [
      // English
      'article', 'blog', 'post', 'read', 'reading', 'story', 'essay', 'piece',
      'book', 'ebook', 'kindle', 'novel', 'fiction', 'nonfiction', 'memoir', 'biography',
      'chapter', 'page', 'author', 'writer', 'journalist', 'publish', 'publication', 'publisher',
      'magazine', 'journal', 'newspaper', 'news', 'headline', 'breaking', 'report', 'coverage',
      'review', 'summary', 'synopsis', 'excerpt', 'abstract', 'tldr',
      'newsletter', 'subscribe', 'subscription', 'subscriber',
      'bookmark', 'save', 'later', 'queue', 'pocket', 'instapaper',
      'recommend', 'must-read', 'best-seller', 'bestseller', 'popular',
      'wiki', 'wikipedia', 'encyclopedia', 'reference',
      'pdf', 'epub', 'audiobook', 'audible',

      // Korean
      '기사', '블로그', '포스트', '글', '읽기', '읽을거리', '이야기', '에세이',
      '책', '전자책', '소설', '논픽션', '단편', '장편', '자서전', '에세이집',
      '챕터', '페이지', '작가', '저자', '기자', '출판', '발행', '출판사',
      '잡지', '저널', '신문', '뉴스', '헤드라인', '속보', '보도', '기사',
      '서평', '리뷰', '요약', '발췌', '줄거리',
      '뉴스레터', '구독', '구독자',
      '북마크', '저장', '나중에', '읽기목록', '포켓',
      '추천', '필독', '베스트셀러', '인기',
      '위키', '위키피디아', '나무위키', '백과사전',
      'PDF', '이북', '오디오북',
      // Natural expressions
      '읽을것', '읽을 것', '읽을거', '읽을 거', '읽어볼', '읽어야할',
      '재밌는글', '재미있는글', '좋은글', '명문', '칼럼',
      '뭐읽을까', '추천도서', '추천책', '책추천',

      // Japanese
      '記事', 'ブログ', 'ポスト', '読み物', '読書', '物語', 'エッセイ',
      '本', '電子書籍', '小説', 'ノンフィクション', '短編', '長編', '自伝', 'エッセイ集',
      'チャプター', 'ページ', '作家', '著者', '記者', 'ジャーナリスト', '出版', '発行', '出版社',
      '雑誌', 'ジャーナル', '新聞', 'ニュース', '見出し', '速報', '報道',
      '書評', 'レビュー', '要約', '抜粋', 'あらすじ',
      'ニュースレター', '購読', '購読者',
      'ブックマーク', '保存', '後で', 'リーディングリスト', 'ポケット',
      'おすすめ', '必読', 'ベストセラー', '人気',
      'ウィキ', 'ウィキペディア', '百科事典', '参考',
      'オーディオブック',
      // Natural expressions
      '読む', '読みたい', '読もう', '読んでみたい',
      '面白い記事', '良い記事', 'コラム',
      '何読もう', 'おすすめ本', '本のおすすめ',
    ],
    priority: 70,
  },
  {
    drawer: 'recipes',
    patterns: [
      // Recipe sites - Global
      /allrecipes\.com/i,
      /food(network)?\.com/i,
      /epicurious\.com/i,
      /seriouseats\.com/i,
      /bonappetit\.com/i,
      /delish\.com/i,
      /tasty\.co/i,
      /yummly\.com/i,
      /foodandwine\.com/i,
      /simplyrecipes\.com/i,
      /budgetbytes\.com/i,
      // Recipe sites - Korea
      /10000recipe\.com/i,
      /만개의레시피/,
      /cooking\.naver\.com/i,
      /haemukja\.com/i,
      /wtable\.co\.kr/i,
      // Recipe sites - Japan
      /cookpad\.(com|jp)/i,
      /kurashiru\.com/i,
      /recipe\.rakuten\.co\.jp/i,
      /erecipe\.woman\.excite\.co\.jp/i,
      // Other regions
      /recetasgratis\.net/i,
      /kochbar\.de/i,
      /marmiton\.org/i,
      /bbcgoodfood\.com/i,

      // Recipe keywords (multilingual)
      /recipe/i,
      /레시피/,
      /レシピ/,
      /receta/i,

      // Measurements - International
      /\d+\s?(g|kg|mg|ml|l|dl|oz|lb|lbs|cup|cups|tbsp|tsp|teaspoon|tablespoon|pinch)s?\b/i,

      // Measurements - Korean
      /\d+\s?(큰술|작은술|꼬집|줌|컵|인분|스푼|티스푼)/,

      // Measurements - Japanese
      /\d+\s?(大さじ|小さじ|カップ|cc|合|人前|人分)/,

      // Measurements - Spanish
      /\d+\s?(cucharada|cucharadita|taza|pizca|gramo)s?/i,

      // Cooking verbs - Korean
      /(끓이|볶|튀기|굽|찌|삶|데치|무치|조리|졸이|버무리|재우|숙성|절이|담그)/,

      // Cooking verbs - Japanese
      /(煮る|炒める|揚げる|焼く|蒸す|茹でる|和える|漬ける|煮込む|炊く)/,

      // Cooking verbs - Spanish
      /\b(cocinar|hervir|freír|hornear|asar|cocer|saltear)\b/i,

      // Cooking verbs - English (using lookahead/lookbehind for unicode support)
      /(?<![a-zA-Z])(saut[eé]|simmer|bake|roast|grill|fry|deep.?fry|stir.?fry|steam|boil|braise|poach|broil|sear|blanch)(?![a-zA-Z])/i,

      // Korean dish suffixes
      /(찌개|볶음|구이|탕|찜|조림|무침|전|국|밥|면|죽|비빔|덮밥)$/,

      // Japanese dish patterns
      /(丼|麺|寿司|刺身|天ぷら|うどん|そば|ラーメン|カレー|煮物|焼き物)/,

      // Food prep indicators
      /\b(preheat|marinate|chop|dice|mince|slice|julienne|grate|whisk|knead|fold)\b/i,
      /\b(prep time|cook time|serves?\s+\d+|yield|makes?\s+\d+|servings?)\b/i,
    ],
    keywords: [
      // English
      'cook', 'cooking', 'ingredient', 'ingredients', 'recipe', 'cuisine', 'dish', 'meal',
      'batter', 'dough', 'seasoning', 'garnish', 'marinade', 'sauce', 'dressing', 'spice',
      'breakfast', 'brunch', 'lunch', 'dinner', 'dessert', 'appetizer', 'snack', 'side dish',
      'vegetarian', 'vegan', 'gluten-free', 'keto', 'paleo', 'healthy', 'homemade', 'organic',
      'oven', 'stove', 'pan', 'pot', 'skillet', 'wok', 'grill', 'microwave', 'air fryer', 'instant pot',
      'chef', 'food', 'kitchen', 'delicious', 'tasty', 'yummy',
      'menu', 'cookbook', 'food blog',

      // Korean
      '요리', '재료', '양념', '반죽', '육수', '소스', '드레싱', '향신료', '조미료',
      '아침', '점심', '저녁', '디저트', '간식', '안주', '반찬', '밑반찬', '국물',
      '채식', '비건', '건강식', '집밥', '홈쿡', '홈메이드', '저탄수', '키토',
      '오븐', '후라이팬', '냄비', '프라이팬', '웍', '그릴', '전자레인지', '에어프라이어', '인스턴트팟',
      '쉐프', '음식', '주방', '맛있는', '맛집', '먹방', '쿡방',
      '메뉴', '요리책', '레시피북', '푸드블로그',
      // Natural expressions
      '뭐먹지', '뭐 먹지', '뭐해먹지', '뭐 해먹지', '오늘뭐먹', '저녁뭐먹',
      '만들어볼', '해볼까', '해먹을', '요리할',
      '맛있게', '맛나게', '간단하게', '쉽게', '빠르게',

      // Japanese
      '料理', '材料', '調味料', '出汁', 'だし', 'ソース', 'ドレッシング', 'スパイス',
      '朝食', '昼食', '夕食', 'デザート', 'おやつ', 'おつまみ', 'おかず', '副菜', 'スープ',
      'ベジタリアン', 'ビーガン', 'ヘルシー', '手作り', '家庭料理', '自炊',
      'オーブン', 'フライパン', '鍋', 'ウォック', 'グリル', '電子レンジ', 'エアフライヤー',
      'シェフ', '食べ物', 'キッチン', '美味しい', 'おいしい', 'うまい',
      'メニュー', '料理本', 'レシピ本', 'フードブログ',
      // Natural expressions
      '何食べよう', '何作ろう', '今日何食べる', '晩ご飯何',
      '作ってみよう', '作ろうかな', '料理しよう',
      '美味しく', '簡単に', '手軽に', '時短',

      // Spanish
      'cocina', 'cocinar', 'ingrediente', 'salsa', 'condimento', 'aderezo', 'especia',
      'desayuno', 'almuerzo', 'cena', 'postre', 'aperitivo', 'merienda', 'guarnición',
      'vegetariano', 'vegano', 'saludable', 'casero', 'orgánico',
      'horno', 'sartén', 'olla', 'parrilla', 'microondas', 'freidora',
      'chef', 'comida', 'cocina', 'delicioso', 'rico',
    ],
    priority: 75,
  },
  {
    drawer: 'places',
    patterns: [
      // Map services
      /maps\.google\.com/,
      /google\.com\/maps/,
      /goo\.gl\/maps/,
      /map\.naver\.com/,
      /naver\.me/,
      /map\.kakao\.com/,
      /kko\.to/,
      /maps\.apple\.com/,
      /waze\.com/,
      /openstreetmap\.org/,
      /maps\.yahoo\.co\.jp/,
      /maps\.me/,
      /here\.com/,

      // Address patterns - English
      /\d+(-\d+)?\s+(street|st|avenue|ave|road|rd|boulevard|blvd|drive|dr|lane|ln|way|court|ct|place|pl|parkway|pkwy)\b/i,

      // Address patterns - Korean
      /(특별시|광역시|도|시|군|구|읍|면|동|리|로|길)\s/,
      /\d+번지/,
      /\d+층/,
      /\d+호/,

      // Address patterns - Japanese
      /(都|道|府|県|市|区|町|村|丁目|番地|号)/,

      // Station patterns - Korean (강남역, 신주쿠역, 도쿄역, etc.)
      /.+역$/,
      /.+역\s/,
      
      // Station patterns - Japanese (新宿駅, 渋谷駅, etc.)
      /.+駅/,
      
      // Station patterns - English
      /\b\w+\s+(station|terminal|airport)\b/i,
      
      // Place suffix patterns - Korean
      /(빌딩|타워|센터|몰|마트|백화점|시장|공원|광장|대학교|대학|학교|병원|약국|은행|교회|성당|절|사찰)$/,
      
      // Place suffix patterns - Japanese  
      /(ビル|タワー|センター|モール|マート|デパート|市場|公園|広場|大学|学校|病院|薬局|銀行|教会)$/,
      
      // Building/Place patterns - Korean
      /(아파트|오피스텔|주상복합|상가|터미널|정류장|선착장|항구|포구)$/,

      // Administrative district suffix - Korean (강남구, 서초동, 경기도, 수원시, 종로3가)
      /.+(시|도|군|구|읍|면|동|리|가)$/,
      
      // Administrative district suffix - Japanese (渋谷区, 新宿区, 東京都)
      /.+(都|道|府|県|市|区|町|村)$/,

      // Famous area names - Korean (standalone recognition)
      /^(강남|홍대|이태원|신촌|명동|동대문|잠실|여의도|판교|분당|일산|수원|인천|부산|대구|광주|대전|제주|해운대|서면|광안리)$/,
      
      // Famous area names - Japanese (standalone recognition)
      /^(신주쿠|시부야|하라주쿠|긴자|아키하바라|우에노|롯폰기|이케부쿠로|아사쿠사|도쿄|오사카|교토|나라|삿포로|후쿠오카|오키나와|나고야|고베|요코하마)$/,
      /^(新宿|渋谷|原宿|銀座|秋葉原|上野|六本木|池袋|浅草|東京|大阪|京都|奈良|札幌|福岡|沖縄|名古屋|神戸|横浜)$/,
      
      // Coordinates
      /-?\d+\.\d+,\s*-?\d+\.\d+/,

      // Place review/discovery sites
      /yelp\.com/,
      /tripadvisor\.(com|co\.kr|jp)/,
      /foursquare\.com/,
      /place\.naver\.com/,
      /map\.naver\.com\/v5\/entry\/place/,
      /tabelog\.com/,
      /gnavi\.co\.jp/,
      /hotpepper\.jp/,
      /mango(plate)?\.com/,
      /diningcode\.com/,
      /catchtable\.co\.kr/,

      // Travel/Booking
      /booking\.com/,
      /airbnb\.(com|co\.kr|jp)/,
      /hotels\.com/,
      /expedia\.(com|co\.kr|jp)/,
      /agoda\.com/,
      /trivago\.(com|co\.kr|jp)/,
    ],
    keywords: [
      // English
      'address', 'location', 'place', 'map', 'direction', 'directions', 'navigate', 'navigation', 'gps',
      'restaurant', 'cafe', 'coffee', 'coffee shop', 'bar', 'pub', 'club', 'lounge',
      'hotel', 'motel', 'hostel', 'inn', 'resort', 'airbnb', 'accommodation', 'lodging',
      'airport', 'station', 'terminal', 'port', 'bus stop', 'subway', 'metro',
      'hospital', 'clinic', 'pharmacy', 'drugstore', 'bank', 'atm', 'post office',
      'mall', 'store', 'shop', 'market', 'supermarket', 'grocery', 'convenience store',
      'park', 'garden', 'museum', 'gallery', 'theater', 'theatre', 'cinema', 'gym', 'fitness', 'spa', 'salon',
      'office', 'building', 'tower', 'center', 'centre', 'plaza', 'square',
      'parking', 'garage', 'lot', 'valet',
      'nearby', 'near', 'close', 'around', 'neighborhood', 'area', 'district', 'zone',
      'reservation', 'book', 'booking', 'table', 'seat',
      'review', 'rating', 'yelp', 'tripadvisor',
      'landmark', 'attraction', 'tourist', 'sightseeing', 'tour',

      // Korean
      '주소', '위치', '장소', '지도', '길찾기', '네비게이션', '내비게이션', 'GPS',
      '음식점', '식당', '레스토랑', '카페', '커피숍', '술집', '바', '클럽', '라운지', '이자카야',
      '호텔', '모텔', '게스트하우스', '펜션', '리조트', '에어비앤비', '숙소', '숙박',
      '공항', '역', '터미널', '버스정류장', '지하철역', '전철역',
      '병원', '약국', '은행', '우체국', 'ATM',
      '쇼핑몰', '백화점', '마트', '슈퍼마켓', '편의점', '시장', '아울렛',
      '공원', '박물관', '미술관', '갤러리', '극장', '영화관', '헬스장', '피트니스', '스파', '미용실', '네일샵',
      '사무실', '빌딩', '센터', '플라자', '광장',
      '주차장', '주차', '발렛',
      '근처', '가까운', '주변', '동네', '지역', '구역',
      '예약', '테이블', '좌석', '자리',
      '리뷰', '별점', '평점', '망고플레이트', '다이닝코드', '캐치테이블',
      '관광지', '명소', '핫플', '핫플레이스', '여행지',
      // Natural expressions
      '가볼곳', '가볼 곳', '갈곳', '갈 곳', '가볼만한', '가고싶은', '가고 싶은',
      '어디', '어디서', '어디가', '어디로', '여기', '거기', '저기',
      '찾아가는길', '찾아가는 길', '오시는길', '오시는 길',
      '맛집', '맛있는집', '맛있는 집', '맛집추천',
      '강남', '홍대', '이태원', '신촌', '명동', '동대문', '잠실', '여의도', '판교', '분당', '일산', '수원', '인천', '부산', '대구', '광주', '대전', '제주',
      '신주쿠', '시부야', '하라주쿠', '긴자', '아키하바라', '우에노', '도쿄', '오사카', '교토', '나라', '삿포로', '후쿠오카', '오키나와',

      // Japanese
      '住所', '場所', '地図', 'ナビ', 'ナビゲーション',
      'レストラン', 'カフェ', 'コーヒーショップ', 'バー', '居酒屋', 'クラブ', 'ラウンジ',
      'ホテル', '旅館', 'ゲストハウス', 'リゾート', 'エアビー', '宿', '宿泊',
      '空港', '駅', 'ターミナル', 'バス停', '地下鉄駅',
      '病院', '薬局', '銀行', '郵便局',
      'モール', 'デパート', 'スーパー', 'コンビニ', '市場', 'アウトレット',
      '公園', '博物館', '美術館', 'ギャラリー', '劇場', '映画館', 'ジム', 'フィットネス', 'スパ', '美容院', 'ネイルサロン',
      'オフィス', 'ビル', 'センター', 'プラザ', '広場',
      '駐車場', 'バレー',
      '近く', '周辺', '付近', '地域', 'エリア',
      '予約', 'テーブル', '席',
      'レビュー', '評価', '食べログ', 'ぐるなび', 'ホットペッパー',
      '観光地', '名所', '人気スポット', '観光',
      // Natural expressions
      '行きたい', '行く場所', 'おすすめスポット', '行ってみたい',
      'どこ', 'ここ', 'そこ', 'あそこ',
      'アクセス', '行き方',
      '美味しい店', 'おいしい店', '名店',
    ],
    priority: 75,
  },
  {
    drawer: 'ideas',
    patterns: [
      // Question patterns - English
      /^(what if|how about|why not|could we|should we|maybe we|let's try|wouldn't it be|imagine if)/i,
      /\?$/,
      // Question patterns - Korean
      /^(어떻게|뭐|왜|만약|혹시|어떨까)/,
      /(면 어떨까|하면 좋겠|해볼까|해보자|할까|어때)/,
      /(으면|면) (좋겠|어떨까)/,
      // Question patterns - Japanese
      /^(どう|なぜ|もし|どうすれば)/,
      /(したら|だったら|てみよう|てみたい|かな|のはどう)/,
      // Bullet points / lists
      /^[-•*]\s/m,
      /^\d+\.\s/m,
      /^[\u2022\u2023\u25E6\u2043\u2219]/m,
    ],
    keywords: [
      // English
      'idea', 'concept', 'thought', 'brainstorm', 'brainstorming', 'inspiration', 'creative', 'creativity',
      'imagine', 'consider', 'maybe', 'perhaps', 'possibly', 'potentially', 'hypothetically',
      'suggestion', 'proposal', 'proposition', 'plan', 'strategy', 'approach', 'method',
      'innovation', 'invention', 'experiment', 'prototype', 'mvp', 'poc', 'proof of concept',
      'improve', 'improvement', 'enhancement', 'optimization', 'upgrade', 'better',
      'goal', 'objective', 'vision', 'mission', 'dream', 'aspiration', 'ambition',
      'project', 'initiative', 'venture', 'startup', 'business idea',
      'research', 'explore', 'discover', 'investigate', 'study', 'analyze',
      'solve', 'solution', 'fix', 'resolve', 'address',
      'feature', 'function', 'capability', 'functionality',
      'wish', 'want', 'hope', 'desire',
      'todo', 'to-do', 'bucket list', 'wishlist',

      // Korean
      '아이디어', '생각', '컨셉', '브레인스토밍', '영감', '창의', '창의적',
      '상상', '고려', '아마', '혹시', '가능성', '가설',
      '제안', '계획', '전략', '접근법', '방법', '방안',
      '혁신', '발명', '실험', '프로토타입', 'MVP', 'POC',
      '개선', '향상', '최적화', '업그레이드', '더 좋게',
      '목표', '비전', '미션', '꿈', '포부', '야망',
      '프로젝트', '이니셔티브', '벤처', '스타트업', '사업아이디어',
      '연구', '탐구', '발견', '조사', '분석',
      '해결', '솔루션', '수정',
      '기능', '특징',
      '소원', '바람', '희망',
      '할일', '버킷리스트', '위시리스트',
      // Natural expressions
      '해보고싶은', '해보고 싶은', '해볼것', '해볼 것', '시도', '도전',
      '하고싶은', '하고 싶은', '해야할', '해야 할',
      '좋을텐데', '좋을 텐데', '됐으면', '되었으면',
      '생각해보니', '생각해 보니', '떠오른', '떠올랐',

      // Japanese
      'アイデア', '考え', 'コンセプト', 'ブレインストーミング', 'インスピレーション', '創造', 'クリエイティブ',
      '想像', '検討', 'もしかして', '可能性', '仮説',
      '提案', '計画', '戦略', 'アプローチ', '方法', '方策',
      '革新', '発明', '実験', 'プロトタイプ',
      '改善', '向上', '最適化', 'アップグレード', 'より良く',
      '目標', 'ビジョン', 'ミッション', '夢', '志', '野望',
      'プロジェクト', 'イニシアチブ', 'ベンチャー', 'スタートアップ', 'ビジネスアイデア',
      '研究', '探求', '発見', '調査', '分析',
      '解決', 'ソリューション', '修正',
      '機能', '特徴',
      '願い', '望み', '希望',
      'やること', 'バケットリスト', 'ウィッシュリスト',
      // Natural expressions
      'やりたい', 'やってみたい', '試してみたい', 'チャレンジ',
      'したい', 'すべき',
      'だったらいいな', 'なればいいな',
      '思いついた', '浮かんだ',
    ],
    priority: 60,
  },
  {
    drawer: 'notes',
    patterns: [
      // Multi-line content
      /\n.*\n/,
      // Long text
      /.{200,}/,
      // Markdown headers
      /^#{1,6}\s/m,
      // Code blocks
      /```[\s\S]+```/,
      // Note-taking apps
      /notion\.so/,
      /evernote\.com/,
      /onenote\.com/,
      /keep\.google\.com/,
      /bear\.app/,
      /obsidian\.md/,
    ],
    keywords: [
      // English
      'note', 'notes', 'memo', 'draft', 'document', 'documentation', 'record', 'log',
      'summary', 'outline', 'overview', 'description', 'explanation', 'definition',
      'reference', 'guide', 'manual', 'instruction', 'instructions', 'tutorial', 'how-to', 'howto',
      'template', 'format', 'structure', 'example', 'sample', 'snippet',
      'important', 'remember', 'don\'t forget', 'keep in mind', 'reminder', 'note to self',
      'update', 'revision', 'version', 'changelog', 'change log', 'history',
      'backup', 'archive', 'log', 'journal', 'diary',
      'information', 'info', 'detail', 'details', 'specification', 'spec', 'specs',
      'notion', 'evernote', 'onenote', 'obsidian', 'bear',
      'copy', 'paste', 'clipboard', 'snippet',

      // Korean
      '메모', '노트', '초안', '문서', '기록', '로그',
      '요약', '개요', '설명', '정리', '정의',
      '참고', '가이드', '매뉴얼', '설명서', '튜토리얼', '사용법',
      '템플릿', '양식', '구조', '예시', '샘플', '스니펫',
      '중요', '기억', '잊지말것', '잊지 말것', '명심', '기억해',
      '업데이트', '수정', '버전', '변경사항', '히스토리',
      '백업', '아카이브', '로그', '일지', '일기',
      '정보', '상세', '스펙', '명세',
      '노션', '에버노트', '원노트', '옵시디언',
      '복사', '붙여넣기', '클립보드',
      // Natural expressions
      '적어둘것', '적어둘 것', '적어두기', '기록할것', '기록할 것', '메모해둘',
      '써둘것', '써둘 것', '적어놔', '메모해놔',
      '나중에', '임시', '임시저장',

      // Japanese
      'メモ', 'ノート', '下書き', 'ドキュメント', '記録', 'ログ',
      '要約', '概要', '説明', 'まとめ', '定義',
      '参考', 'ガイド', 'マニュアル', '説明書', 'チュートリアル', '使い方',
      'テンプレート', 'フォーマット', '構造', '例', 'サンプル', 'スニペット',
      '重要', '覚える', '忘れない', '忘れずに', '心がける', '覚えておく',
      'アップデート', '修正', 'バージョン', '変更履歴', '履歴',
      'バックアップ', 'アーカイブ', '日誌', '日記',
      '情報', '詳細', 'スペック', '仕様',
      'ノーション', 'エバーノート', 'ワンノート', 'オブシディアン',
      'コピー', '貼り付け', 'クリップボード',
      // Natural expressions
      '書いておく', '記録しておく', 'メモしておく', '残しておく',
      'あとで', '一時', '一時保存',
    ],
    priority: 50,
  },
];

function matchesAsWord(content: string, keyword: string): boolean {
  const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`(^|[^a-zA-Z가-힣ぁ-んァ-ン一-龯])${escapedKeyword}([^a-zA-Z가-힣ぁ-んァ-ン一-龯]|$)`, 'i');
  return pattern.test(content);
}

export function classify(content: string): DrawerType {
  const scores: Partial<Record<DrawerType, number>> = {};
  const matchDetails: Partial<Record<DrawerType, { patterns: number; keywords: number }>> = {};

  for (const { drawer, patterns, keywords, priority } of DRAWER_PATTERNS) {
    let score = 0;
    let patternMatchCount = 0;
    let keywordMatchCount = 0;

    for (const pattern of patterns) {
      if (pattern.test(content)) {
        score += priority;
        patternMatchCount++;
      }
    }

    for (const keyword of keywords) {
      if (matchesAsWord(content, keyword)) {
        score += priority * 0.5;
        keywordMatchCount++;
      }
    }

    if (score > 0) {
      scores[drawer] = (scores[drawer] || 0) + score;
      matchDetails[drawer] = { patterns: patternMatchCount, keywords: keywordMatchCount };
    }
  }

  const entries = Object.entries(scores) as [DrawerType, number][];

  if (entries.length === 0) {
    return content.length < 100 ? 'ideas' : 'notes';
  }

  const validEntries = entries.filter(([drawer]) => {
    const details = matchDetails[drawer];
    if (!details) return false;
    const hasPatternMatch = details.patterns > 0;
    const hasMultipleKeywords = details.keywords >= 2;
    return hasPatternMatch || hasMultipleKeywords;
  });

  if (validEntries.length === 0) {
    return content.length < 100 ? 'ideas' : 'notes';
  }

  const topEntry = validEntries.reduce((a, b) => (a[1] > b[1] ? a : b));
  return topEntry[0];
}
