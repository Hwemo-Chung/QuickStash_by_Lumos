export type Locale = 'ko' | 'en' | 'ja' | 'es';

export type DrawerType = 'contacts' | 'money' | 'watch' | 'read' | 'dev' | 'schedule' | 'recipes' | 'places' | 'ideas' | 'notes' | 'shopping' | 'inbox';

export interface DrawerInputConfig {
  label: string;
  placeholder: string;
  autoDatePrefix?: boolean;
  autoDateTimePrefix?: boolean;
}

export interface Translations {
  app: {
    name: string;
    tagline: string;
  };
  quickInput: {
    placeholder: string;
    titlePlaceholder: string;
    addTitle: string;
    willSaveTo: string;
    saving: string;
    mapLinkDetected: string;
    titleLabel: string;
    autoSaveIn: string;
    autoSavePaused: string;
    saved: string;
  };
  search: {
    placeholder: string;
    shortcutHint: string;
    scopeAll: string;
    scopeIn: string;
    sortBy: string;
    sortRelevance: string;
    sortNewest: string;
    sortOldest: string;
    sortMostAccessed: string;
    dateFilter: string;
    dateAll: string;
    dateToday: string;
    dateWeek: string;
    dateMonth: string;
  };
  drawers: {
    all: string;
    contacts: string;
    money: string;
    watch: string;
    read: string;
    dev: string;
    schedule: string;
    recipes: string;
    places: string;
    ideas: string;
    notes: string;
    shopping: string;
    inbox: string;
  };
  drawerInputs: Record<DrawerType, DrawerInputConfig>;
  itemCard: {
    copied: string;
    copy: string;
    moveTo: string;
    delete: string;
    justNow: string;
    minutesAgo: string;
    hoursAgo: string;
    yesterday: string;
    daysAgo: string;
    swipeDelete: string;
    swipeMove: string;
    confirmDelete: string;
    undo: string;
  };
  itemList: {
    noItems: string;
    noItemsHint: string;
    loading: string;
    searchNoResults: string;
    searchNoResultsQuery: string;
    searchSuggestionSpelling: string;
    searchSuggestionKeywords: string;
    searchSuggestionBrowse: string;
    gridView: string;
    listView: string;
    emptyStates: {
      contacts: { title: string; hint: string };
      money: { title: string; hint: string };
      watch: { title: string; hint: string };
      read: { title: string; hint: string };
      dev: { title: string; hint: string };
      schedule: { title: string; hint: string };
      recipes: { title: string; hint: string };
      places: { title: string; hint: string };
      ideas: { title: string; hint: string };
      notes: { title: string; hint: string };
      shopping: { title: string; hint: string };
      inbox: { title: string; hint: string };
    };
  };
  lockScreen: {
    title: string;
    subtitle: string;
    wrongPin: string;
    attemptsRemaining: string;
    forgotPin: string;
  };
  common: {
    save: string;
    cancel: string;
    edit: string;
    delete: string;
    confirm: string;
  };
  settings: {
    title: string;
    language: string;
  };
  toast: {
    saved: string;
    deleted: string;
    moved: string;
    copied: string;
    error: string;
    undo: string;
  };
  itemDetail: {
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    drawer: string;
    editTitle: string;
    saveTitle: string;
    copyContent: string;
    close: string;
  };
}

const ko: Translations = {
  app: {
    name: 'QuickStash',
    tagline: '뭐든 저장하고, 바로 찾고, 정리는 자동으로',
  },
  quickInput: {
    placeholder: '아무거나 붙여넣기...',
    titlePlaceholder: '제목 추가 (선택)',
    addTitle: '제목 추가',
    willSaveTo: '에 저장됩니다',
    saving: '저장 중...',
    mapLinkDetected: '지도 링크 감지됨',
    titleLabel: '제목',
    autoSaveIn: '{seconds}초 후 자동 저장',
    autoSavePaused: '입력 중...',
    saved: '저장됨!',
  },
  search: {
    placeholder: '검색...',
    shortcutHint: '⌘K',
    scopeAll: '전체',
    scopeIn: '{drawer}에서',
    sortBy: '정렬',
    sortRelevance: '관련도순',
    sortNewest: '최신순',
    sortOldest: '오래된순',
    sortMostAccessed: '자주 사용순',
    dateFilter: '기간',
    dateAll: '전체',
    dateToday: '오늘',
    dateWeek: '이번 주',
    dateMonth: '이번 달',
  },
  drawers: {
    all: '전체',
    contacts: '연락처',
    money: '금융',
    watch: '영상',
    read: '읽기',
    dev: '개발',
    schedule: '일정',
    recipes: '레시피',
    places: '장소',
    ideas: '아이디어',
    notes: '메모',
    shopping: '쇼핑',
    inbox: '받은함',
  },
  drawerInputs: {
    contacts: { label: '이름', placeholder: '이름을 입력하세요' },
    money: { label: '용도', placeholder: '용도를 입력하세요', autoDatePrefix: true },
    watch: { label: '제목', placeholder: '영상 제목을 입력하세요' },
    read: { label: '제목', placeholder: '글 제목을 입력하세요' },
    dev: { label: '메모', placeholder: '메모를 입력하세요' },
    schedule: { label: '일정명', placeholder: '일정명을 입력하세요', autoDateTimePrefix: true },
    recipes: { label: '요리명', placeholder: '요리명을 입력하세요' },
    places: { label: '장소명', placeholder: '장소명을 입력하세요' },
    ideas: { label: '아이디어', placeholder: '아이디어를 입력하세요' },
    notes: { label: '제목', placeholder: '제목을 입력하세요' },
    shopping: { label: '상품명', placeholder: '상품명을 입력하세요' },
    inbox: { label: '제목', placeholder: '제목을 입력하세요' },
  },
  itemCard: {
    copied: '복사됨!',
    copy: '복사',
    moveTo: '이동...',
    delete: '삭제',
    justNow: '방금',
    minutesAgo: '분 전',
    hoursAgo: '시간 전',
    yesterday: '어제',
    daysAgo: '일 전',
    swipeDelete: '삭제',
    swipeMove: '이동',
    confirmDelete: '삭제하시겠습니까?',
    undo: '실행취소',
  },
  itemList: {
    noItems: '아직 항목이 없어요',
    noItemsHint: '뭔가 붙여넣어 보세요!',
    loading: '불러오는 중...',
    searchNoResults: '검색 결과 없음',
    searchNoResultsQuery: '"{query}"에 대한 결과가 없습니다',
    searchSuggestionSpelling: '철자를 확인해 보세요',
    searchSuggestionKeywords: '다른 키워드를 사용해 보세요',
    searchSuggestionBrowse: '전체 항목 둘러보기',
    gridView: '그리드 보기',
    listView: '리스트 보기',
    emptyStates: {
      contacts: { title: '연락처가 없어요', hint: '전화번호나 이메일을 붙여넣어 보세요' },
      money: { title: '금융 정보가 없어요', hint: '계좌번호나 금융 메모를 붙여넣어 보세요' },
      watch: { title: '영상이 없어요', hint: 'YouTube나 비디오 링크를 붙여넣어 보세요' },
      read: { title: '읽을거리가 없어요', hint: '기사나 블로그 링크를 붙여넣어 보세요' },
      dev: { title: '코드 스니펫이 없어요', hint: 'GitHub 링크나 코드를 붙여넣어 보세요' },
      schedule: { title: '일정이 없어요', hint: '일정이나 이벤트를 붙여넣어 보세요' },
      recipes: { title: '레시피가 없어요', hint: '요리법이나 레시피 링크를 붙여넣어 보세요' },
      places: { title: '장소가 없어요', hint: '주소나 지도 링크를 붙여넣어 보세요' },
      ideas: { title: '아이디어가 없어요', hint: '생각이나 아이디어를 붙여넣어 보세요' },
      notes: { title: '메모가 없어요', hint: '메모나 텍스트를 붙여넣어 보세요' },
      shopping: { title: '쇼핑 목록이 없어요', hint: '상품 링크나 쇼핑 메모를 붙여넣어 보세요' },
      inbox: { title: '받은함이 비어있어요', hint: '아무거나 붙여넣어 보세요!' },
    },
  },
  lockScreen: {
    title: 'QuickStash',
    subtitle: 'PIN을 입력하세요',
    wrongPin: 'PIN이 틀렸습니다',
    attemptsRemaining: '회 남음',
    forgotPin: 'PIN을 잊으셨나요? 10회 실패 시 모든 데이터가 삭제됩니다.',
  },
  common: {
    save: '저장',
    cancel: '취소',
    edit: '수정',
    delete: '삭제',
    confirm: '확인',
  },
  settings: {
    title: '설정',
    language: '언어',
  },
  toast: {
    saved: '저장되었습니다!',
    deleted: '삭제되었습니다',
    moved: '이동되었습니다',
    copied: '복사되었습니다!',
    error: '오류가 발생했습니다',
    undo: '실행취소',
  },
  itemDetail: {
    title: '제목',
    content: '내용',
    createdAt: '생성일',
    updatedAt: '수정일',
    drawer: '서랍',
    editTitle: '제목 수정',
    saveTitle: '저장',
    copyContent: '내용 복사',
    close: '닫기',
  },
};

const en: Translations = {
  app: {
    name: 'QuickStash',
    tagline: 'Save anything, find everything, organize nothing',
  },
  quickInput: {
    placeholder: 'Paste anything...',
    titlePlaceholder: 'Add title (optional)',
    addTitle: 'Add title',
    willSaveTo: 'Will be saved to',
    saving: 'Saving...',
    mapLinkDetected: 'Map link detected',
    titleLabel: 'Title',
    autoSaveIn: 'Auto-save in {seconds}s',
    autoSavePaused: 'Typing...',
    saved: 'Saved!',
  },
  search: {
    placeholder: 'Search...',
    shortcutHint: '⌘K',
    scopeAll: 'All',
    scopeIn: 'in {drawer}',
    sortBy: 'Sort',
    sortRelevance: 'Relevance',
    sortNewest: 'Newest',
    sortOldest: 'Oldest',
    sortMostAccessed: 'Most accessed',
    dateFilter: 'Date',
    dateAll: 'All time',
    dateToday: 'Today',
    dateWeek: 'This week',
    dateMonth: 'This month',
  },
  drawers: {
    all: 'All',
    contacts: 'Contacts',
    money: 'Money',
    watch: 'Watch',
    read: 'Read',
    dev: 'Dev',
    schedule: 'Schedule',
    recipes: 'Recipes',
    places: 'Places',
    ideas: 'Ideas',
    notes: 'Notes',
    shopping: 'Shopping',
    inbox: 'Inbox',
  },
  drawerInputs: {
    contacts: { label: 'Name', placeholder: 'Enter name' },
    money: { label: 'Purpose', placeholder: 'Enter purpose', autoDatePrefix: true },
    watch: { label: 'Title', placeholder: 'Enter video title' },
    read: { label: 'Title', placeholder: 'Enter article title' },
    dev: { label: 'Note', placeholder: 'Enter note' },
    schedule: { label: 'Event', placeholder: 'Enter event name', autoDateTimePrefix: true },
    recipes: { label: 'Dish', placeholder: 'Enter dish name' },
    places: { label: 'Place', placeholder: 'Enter place name' },
    ideas: { label: 'Idea', placeholder: 'Enter idea' },
    notes: { label: 'Title', placeholder: 'Enter title' },
    shopping: { label: 'Product', placeholder: 'Enter product name' },
    inbox: { label: 'Title', placeholder: 'Enter title' },
  },
  itemCard: {
    copied: 'Copied!',
    copy: 'Copy',
    moveTo: 'Move to...',
    delete: 'Delete',
    justNow: 'just now',
    minutesAgo: 'm ago',
    hoursAgo: 'h ago',
    yesterday: 'yesterday',
    daysAgo: 'd ago',
    swipeDelete: 'Delete',
    swipeMove: 'Move',
    confirmDelete: 'Delete this item?',
    undo: 'Undo',
  },
  itemList: {
    noItems: 'No items yet',
    noItemsHint: 'Paste something to get started!',
    loading: 'Loading...',
    searchNoResults: 'No results found',
    searchNoResultsQuery: 'No results for "{query}"',
    searchSuggestionSpelling: 'Check your spelling',
    searchSuggestionKeywords: 'Try different keywords',
    searchSuggestionBrowse: 'Browse all items',
    gridView: 'Grid view',
    listView: 'List view',
    emptyStates: {
      contacts: { title: 'No contacts yet', hint: 'Paste a phone number or email to get started' },
      money: { title: 'No financial items yet', hint: 'Paste account numbers or financial notes' },
      watch: { title: 'No videos yet', hint: 'Paste a YouTube or video link' },
      read: { title: 'No articles yet', hint: 'Paste an article or blog link' },
      dev: { title: 'No code snippets yet', hint: 'Paste GitHub links or code snippets' },
      schedule: { title: 'No events yet', hint: 'Paste schedule or event information' },
      recipes: { title: 'No recipes yet', hint: 'Paste recipe links or cooking notes' },
      places: { title: 'No places yet', hint: 'Paste addresses or map links' },
      ideas: { title: 'No ideas yet', hint: 'Paste your thoughts and ideas' },
      notes: { title: 'No notes yet', hint: 'Paste notes or text snippets' },
      shopping: { title: 'No shopping items yet', hint: 'Paste product links or shopping lists' },
      inbox: { title: 'Inbox is empty', hint: 'Paste anything to get started!' },
    },
  },
  lockScreen: {
    title: 'QuickStash',
    subtitle: 'Enter your PIN to unlock',
    wrongPin: 'Wrong PIN',
    attemptsRemaining: 'attempts remaining',
    forgotPin: 'Forgot PIN? After 10 failed attempts, all data will be erased.',
  },
  common: {
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    confirm: 'Confirm',
  },
  settings: {
    title: 'Settings',
    language: 'Language',
  },
  toast: {
    saved: 'Saved!',
    deleted: 'Deleted',
    moved: 'Moved',
    copied: 'Copied!',
    error: 'Something went wrong',
    undo: 'Undo',
  },
  itemDetail: {
    title: 'Title',
    content: 'Content',
    createdAt: 'Created',
    updatedAt: 'Updated',
    drawer: 'Drawer',
    editTitle: 'Edit title',
    saveTitle: 'Save',
    copyContent: 'Copy content',
    close: 'Close',
  },
};

const ja: Translations = {
  app: {
    name: 'QuickStash',
    tagline: '何でも保存、すぐ見つかる、整理は自動',
  },
  quickInput: {
    placeholder: '何でも貼り付け...',
    titlePlaceholder: 'タイトルを追加（任意）',
    addTitle: 'タイトル追加',
    willSaveTo: 'に保存されます',
    saving: '保存中...',
    mapLinkDetected: '地図リンクを検出',
    titleLabel: 'タイトル',
    autoSaveIn: '{seconds}秒後に自動保存',
    autoSavePaused: '入力中...',
    saved: '保存しました！',
  },
  search: {
    placeholder: '検索...',
    shortcutHint: '⌘K',
    scopeAll: 'すべて',
    scopeIn: '{drawer}で',
    sortBy: '並び替え',
    sortRelevance: '関連度',
    sortNewest: '新しい順',
    sortOldest: '古い順',
    sortMostAccessed: 'アクセス多',
    dateFilter: '期間',
    dateAll: 'すべて',
    dateToday: '今日',
    dateWeek: '今週',
    dateMonth: '今月',
  },
  drawers: {
    all: 'すべて',
    contacts: '連絡先',
    money: '金融',
    watch: '動画',
    read: '読み物',
    dev: '開発',
    schedule: '予定',
    recipes: 'レシピ',
    places: '場所',
    ideas: 'アイデア',
    notes: 'メモ',
    shopping: 'ショッピング',
    inbox: '受信箱',
  },
  drawerInputs: {
    contacts: { label: '名前', placeholder: '名前を入力' },
    money: { label: '用途', placeholder: '用途を入力', autoDatePrefix: true },
    watch: { label: 'タイトル', placeholder: '動画タイトルを入力' },
    read: { label: 'タイトル', placeholder: '記事タイトルを入力' },
    dev: { label: 'メモ', placeholder: 'メモを入力' },
    schedule: { label: '予定名', placeholder: '予定名を入力', autoDateTimePrefix: true },
    recipes: { label: '料理名', placeholder: '料理名を入力' },
    places: { label: '場所名', placeholder: '場所名を入力' },
    ideas: { label: 'アイデア', placeholder: 'アイデアを入力' },
    notes: { label: 'タイトル', placeholder: 'タイトルを入力' },
    shopping: { label: '商品名', placeholder: '商品名を入力' },
    inbox: { label: 'タイトル', placeholder: 'タイトルを入力' },
  },
  itemCard: {
    copied: 'コピーしました！',
    copy: 'コピー',
    moveTo: '移動...',
    delete: '削除',
    justNow: 'たった今',
    minutesAgo: '分前',
    hoursAgo: '時間前',
    yesterday: '昨日',
    daysAgo: '日前',
    swipeDelete: '削除',
    swipeMove: '移動',
    confirmDelete: 'このアイテムを削除しますか？',
    undo: '元に戻す',
  },
  itemList: {
    noItems: 'まだアイテムがありません',
    noItemsHint: '何か貼り付けてみてください！',
    loading: '読み込み中...',
    searchNoResults: '検索結果なし',
    searchNoResultsQuery: '「{query}」の結果はありません',
    searchSuggestionSpelling: 'スペルを確認してください',
    searchSuggestionKeywords: '別のキーワードを試してください',
    searchSuggestionBrowse: 'すべてのアイテムを見る',
    gridView: 'グリッド表示',
    listView: 'リスト表示',
    emptyStates: {
      contacts: { title: '連絡先がありません', hint: '電話番号やメールを貼り付けてください' },
      money: { title: '金融情報がありません', hint: '口座番号や金融メモを貼り付けてください' },
      watch: { title: '動画がありません', hint: 'YouTubeや動画リンクを貼り付けてください' },
      read: { title: '読み物がありません', hint: '記事やブログリンクを貼り付けてください' },
      dev: { title: 'コードがありません', hint: 'GitHubリンクやコードを貼り付けてください' },
      schedule: { title: '予定がありません', hint: 'スケジュールやイベントを貼り付けてください' },
      recipes: { title: 'レシピがありません', hint: 'レシピリンクや料理メモを貼り付けてください' },
      places: { title: '場所がありません', hint: '住所や地図リンクを貼り付けてください' },
      ideas: { title: 'アイデアがありません', hint: '考えやアイデアを貼り付けてください' },
      notes: { title: 'メモがありません', hint: 'メモやテキストを貼り付けてください' },
      shopping: { title: 'ショッピングリストがありません', hint: '商品リンクや買い物メモを貼り付けてください' },
      inbox: { title: '受信箱は空です', hint: '何でも貼り付けてください！' },
    },
  },
  lockScreen: {
    title: 'QuickStash',
    subtitle: 'PINを入力してください',
    wrongPin: 'PINが間違っています',
    attemptsRemaining: '回残り',
    forgotPin: 'PINを忘れましたか？10回失敗するとすべてのデータが削除されます。',
  },
  common: {
    save: '保存',
    cancel: 'キャンセル',
    edit: '編集',
    delete: '削除',
    confirm: '確認',
  },
  settings: {
    title: '設定',
    language: '言語',
  },
  toast: {
    saved: '保存しました！',
    deleted: '削除しました',
    moved: '移動しました',
    copied: 'コピーしました！',
    error: 'エラーが発生しました',
    undo: '元に戻す',
  },
  itemDetail: {
    title: 'タイトル',
    content: '内容',
    createdAt: '作成日',
    updatedAt: '更新日',
    drawer: '引き出し',
    editTitle: 'タイトル編集',
    saveTitle: '保存',
    copyContent: '内容をコピー',
    close: '閉じる',
  },
};

const es: Translations = {
  app: {
    name: 'QuickStash',
    tagline: 'Guarda todo, encuentra todo, organiza nada',
  },
  quickInput: {
    placeholder: 'Pega cualquier cosa...',
    titlePlaceholder: 'Añadir título (opcional)',
    addTitle: 'Añadir título',
    willSaveTo: 'Se guardará en',
    saving: 'Guardando...',
    mapLinkDetected: 'Enlace de mapa detectado',
    titleLabel: 'Título',
    autoSaveIn: 'Guardar en {seconds}s',
    autoSavePaused: 'Escribiendo...',
    saved: '¡Guardado!',
  },
  search: {
    placeholder: 'Buscar...',
    shortcutHint: '⌘K',
    scopeAll: 'Todo',
    scopeIn: 'en {drawer}',
    sortBy: 'Ordenar',
    sortRelevance: 'Relevancia',
    sortNewest: 'Más reciente',
    sortOldest: 'Más antiguo',
    sortMostAccessed: 'Más accedido',
    dateFilter: 'Fecha',
    dateAll: 'Todo',
    dateToday: 'Hoy',
    dateWeek: 'Esta semana',
    dateMonth: 'Este mes',
  },
  drawers: {
    all: 'Todo',
    contacts: 'Contactos',
    money: 'Finanzas',
    watch: 'Videos',
    read: 'Lectura',
    dev: 'Desarrollo',
    schedule: 'Agenda',
    recipes: 'Recetas',
    places: 'Lugares',
    ideas: 'Ideas',
    notes: 'Notas',
    shopping: 'Compras',
    inbox: 'Bandeja',
  },
  drawerInputs: {
    contacts: { label: 'Nombre', placeholder: 'Ingresa nombre' },
    money: { label: 'Propósito', placeholder: 'Ingresa propósito', autoDatePrefix: true },
    watch: { label: 'Título', placeholder: 'Ingresa título del video' },
    read: { label: 'Título', placeholder: 'Ingresa título del artículo' },
    dev: { label: 'Nota', placeholder: 'Ingresa nota' },
    schedule: { label: 'Evento', placeholder: 'Ingresa nombre del evento', autoDateTimePrefix: true },
    recipes: { label: 'Plato', placeholder: 'Ingresa nombre del plato' },
    places: { label: 'Lugar', placeholder: 'Ingresa nombre del lugar' },
    ideas: { label: 'Idea', placeholder: 'Ingresa idea' },
    notes: { label: 'Título', placeholder: 'Ingresa título' },
    shopping: { label: 'Producto', placeholder: 'Ingresa nombre del producto' },
    inbox: { label: 'Título', placeholder: 'Ingresa título' },
  },
  itemCard: {
    copied: '¡Copiado!',
    copy: 'Copiar',
    moveTo: 'Mover a...',
    delete: 'Eliminar',
    justNow: 'ahora',
    minutesAgo: 'min',
    hoursAgo: 'h',
    yesterday: 'ayer',
    daysAgo: 'd',
    swipeDelete: 'Eliminar',
    swipeMove: 'Mover',
    confirmDelete: '¿Eliminar este elemento?',
    undo: 'Deshacer',
  },
  itemList: {
    noItems: 'No hay elementos todavía',
    noItemsHint: '¡Pega algo para empezar!',
    loading: 'Cargando...',
    searchNoResults: 'Sin resultados',
    searchNoResultsQuery: 'No hay resultados para "{query}"',
    searchSuggestionSpelling: 'Revisa la ortografía',
    searchSuggestionKeywords: 'Prueba con otras palabras clave',
    searchSuggestionBrowse: 'Ver todos los elementos',
    gridView: 'Vista en cuadrícula',
    listView: 'Vista en lista',
    emptyStates: {
      contacts: { title: 'No hay contactos', hint: 'Pega un número de teléfono o correo' },
      money: { title: 'No hay información financiera', hint: 'Pega números de cuenta o notas financieras' },
      watch: { title: 'No hay videos', hint: 'Pega un enlace de YouTube o video' },
      read: { title: 'No hay artículos', hint: 'Pega un enlace de artículo o blog' },
      dev: { title: 'No hay código', hint: 'Pega enlaces de GitHub o fragmentos de código' },
      schedule: { title: 'No hay eventos', hint: 'Pega información de horarios o eventos' },
      recipes: { title: 'No hay recetas', hint: 'Pega enlaces de recetas o notas de cocina' },
      places: { title: 'No hay lugares', hint: 'Pega direcciones o enlaces de mapas' },
      ideas: { title: 'No hay ideas', hint: 'Pega tus pensamientos e ideas' },
      notes: { title: 'No hay notas', hint: 'Pega notas o fragmentos de texto' },
      shopping: { title: 'No hay lista de compras', hint: 'Pega enlaces de productos o listas de compras' },
      inbox: { title: 'La bandeja está vacía', hint: '¡Pega cualquier cosa para empezar!' },
    },
  },
  lockScreen: {
    title: 'QuickStash',
    subtitle: 'Introduce tu PIN',
    wrongPin: 'PIN incorrecto',
    attemptsRemaining: 'intentos restantes',
    forgotPin: '¿Olvidaste tu PIN? Después de 10 intentos fallidos, todos los datos serán eliminados.',
  },
  common: {
    save: 'Guardar',
    cancel: 'Cancelar',
    edit: 'Editar',
    delete: 'Eliminar',
    confirm: 'Confirmar',
  },
  settings: {
    title: 'Ajustes',
    language: 'Idioma',
  },
  toast: {
    saved: '¡Guardado!',
    deleted: 'Eliminado',
    moved: 'Movido',
    copied: '¡Copiado!',
    error: 'Algo salió mal',
    undo: 'Deshacer',
  },
  itemDetail: {
    title: 'Título',
    content: 'Contenido',
    createdAt: 'Creado',
    updatedAt: 'Actualizado',
    drawer: 'Cajón',
    editTitle: 'Editar título',
    saveTitle: 'Guardar',
    copyContent: 'Copiar contenido',
    close: 'Cerrar',
  },
};

const translations: Record<Locale, Translations> = { ko, en, ja, es };

export function getAllTranslations(): Record<Locale, Translations> {
  return translations;
}

const STORAGE_KEY = 'quickstash-locale';

let currentLocale: Locale = 'ko';

export function setLocale(locale: Locale): void {
  currentLocale = locale;
}

export function getLocale(): Locale {
  return currentLocale;
}

export function initLocaleFromStorage(): Locale {
  const stored = localStorage.getItem(STORAGE_KEY);
  
  // 입력 검증: 유효한 locale만 인정
  const validLocales = ['ko', 'en', 'ja', 'es'] as const;
  
  if (stored && validLocales.includes(stored as Locale)) {
    currentLocale = stored as Locale;
  } else if (stored) {
    // 부유효한 값이 저장된 경우 경고
    console.warn('Invalid locale in storage:', stored);
    localStorage.removeItem(STORAGE_KEY);
  }
  
  return currentLocale;
}

export function saveLocaleToStorage(locale: Locale): void {
  // 저장 전 검증
  const validLocales = ['ko', 'en', 'ja', 'es'] as const;
  
  if (!validLocales.includes(locale)) {
    console.warn('Invalid locale attempted to save:', locale);
    return;
  }
  
  currentLocale = locale;
  localStorage.setItem(STORAGE_KEY, locale);
}

export function t(): Translations {
  return translations[currentLocale];
}

export function getDrawerLabel(drawer: string): string {
  const labels = t().drawers;
  return labels[drawer as keyof typeof labels] || drawer;
}

export function getDrawerInputConfig(drawer: DrawerType): DrawerInputConfig {
  return t().drawerInputs[drawer];
}

