'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Locale = 'ko' | 'en' | 'ja'

const translations: Record<Locale, Record<string, string>> = {
  ko: {
    // Sidebar
    'sidebar.search': '검색',
    'sidebar.newPage': '새 문서 추가',
    'sidebar.newBoard': '새 보드 추가',
    'sidebar.pages': '개인 페이지',
    'sidebar.favorites': '즐겨찾기',
    'sidebar.trash': '휴지통',
    'sidebar.logout': '로그아웃',
    'sidebar.settings': '설정',
    'sidebar.members': '멤버 관리',
    // Editor
    'editor.untitled': '제목 없음',
    'editor.placeholder': "명령어를 사용하려면 '/'를 입력하세요",
    'editor.addIcon': '아이콘 추가',
    'editor.addCover': '커버 추가',
    'editor.share': '공유',
    'editor.history': '히스토리',
    'editor.locked': '이 페이지는 잠겨 있어 편집할 수 없습니다.',
    'editor.lock': '페이지 잠금',
    'editor.unlock': '잠금 해제',
    // Board
    'board.newItem': '새로 만들기',
    'board.board': '보드',
    'board.table': '테이블',
    'board.calendar': '캘린더',
    'board.gallery': '갤러리',
    'board.timeline': '타임라인',
    // Home
    'home.getStarted': '시작하기',
    'home.description': '사이드바에서 새 문서를 추가하거나\n기존 페이지를 선택하세요.',
    'home.search': '검색',
    'home.command': '블록 커맨드',
    // Auth
    'auth.login': '로그인',
    'auth.register': '회원가입',
    'auth.email': '이메일',
    'auth.password': '비밀번호',
    'auth.name': '이름',
    'auth.noAccount': '계정이 없으신가요?',
    'auth.hasAccount': '이미 계정이 있으신가요?',
    // Modals
    'trash.title': '휴지통',
    'trash.empty': '휴지통이 비어 있습니다',
    'trash.restore': '복원',
    'trash.delete': '영구 삭제',
    'settings.title': '설정',
    'settings.profile': '프로필',
    'settings.language': '언어 설정',
    'members.title': '멤버 관리',
    // Notifications
    'notifications.title': '알림',
    'notifications.empty': '알림이 없습니다',
    'notifications.readAll': '모두 읽기',
    // Common
    'common.cancel': '취소',
    'common.save': '저장',
    'common.delete': '삭제',
    'common.confirm': '확인',
  },
  en: {
    'sidebar.search': 'Search',
    'sidebar.newPage': 'New Page',
    'sidebar.newBoard': 'New Board',
    'sidebar.pages': 'Pages',
    'sidebar.favorites': 'Favorites',
    'sidebar.trash': 'Trash',
    'sidebar.logout': 'Logout',
    'sidebar.settings': 'Settings',
    'sidebar.members': 'Members',
    'editor.untitled': 'Untitled',
    'editor.placeholder': "Type '/' for commands",
    'editor.addIcon': 'Add Icon',
    'editor.addCover': 'Add Cover',
    'editor.share': 'Share',
    'editor.history': 'History',
    'editor.locked': 'This page is locked and cannot be edited.',
    'editor.lock': 'Lock Page',
    'editor.unlock': 'Unlock Page',
    'board.newItem': 'New',
    'board.board': 'Board',
    'board.table': 'Table',
    'board.calendar': 'Calendar',
    'board.gallery': 'Gallery',
    'board.timeline': 'Timeline',
    'home.getStarted': 'Get Started',
    'home.description': 'Add a new document from the sidebar\nor select an existing page.',
    'home.search': 'Search',
    'home.command': 'Block Command',
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.name': 'Name',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
    'trash.title': 'Trash',
    'trash.empty': 'Trash is empty',
    'trash.restore': 'Restore',
    'trash.delete': 'Delete',
    'settings.title': 'Settings',
    'settings.profile': 'Profile',
    'settings.language': 'Language',
    'members.title': 'Members',
    'notifications.title': 'Notifications',
    'notifications.empty': 'No notifications',
    'notifications.readAll': 'Read All',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.confirm': 'Confirm',
  },
  ja: {
    'sidebar.search': '検索',
    'sidebar.newPage': '新規ページ',
    'sidebar.newBoard': '新規ボード',
    'sidebar.pages': 'ページ',
    'sidebar.favorites': 'お気に入り',
    'sidebar.trash': 'ゴミ箱',
    'sidebar.logout': 'ログアウト',
    'sidebar.settings': '設定',
    'sidebar.members': 'メンバー',
    'editor.untitled': '無題',
    'editor.placeholder': "'/'でコマンドを入力",
    'editor.addIcon': 'アイコン追加',
    'editor.addCover': 'カバー追加',
    'editor.share': '共有',
    'editor.history': '履歴',
    'editor.locked': 'このページはロックされ編集できません。',
    'editor.lock': 'ページロック',
    'editor.unlock': 'ロック解除',
    'board.newItem': '新規作成',
    'board.board': 'ボード',
    'board.table': 'テーブル',
    'board.calendar': 'カレンダー',
    'board.gallery': 'ギャラリー',
    'board.timeline': 'タイムライン',
    'home.getStarted': '始めましょう',
    'home.description': 'サイドバーから新規ドキュメントを追加するか\n既存のページを選択してください。',
    'home.search': '検索',
    'home.command': 'ブロックコマンド',
    'auth.login': 'ログイン',
    'auth.register': '新規登録',
    'auth.email': 'メール',
    'auth.password': 'パスワード',
    'auth.name': '名前',
    'auth.noAccount': 'アカウントをお持ちでない方',
    'auth.hasAccount': '既にアカウントをお持ちの方',
    'trash.title': 'ゴミ箱',
    'trash.empty': 'ゴミ箱は空です',
    'trash.restore': '復元',
    'trash.delete': '完全削除',
    'settings.title': '設定',
    'settings.profile': 'プロフィール',
    'settings.language': '言語設定',
    'members.title': 'メンバー管理',
    'notifications.title': '通知',
    'notifications.empty': '通知はありません',
    'notifications.readAll': 'すべて既読',
    'common.cancel': 'キャンセル',
    'common.save': '保存',
    'common.delete': '削除',
    'common.confirm': '確認',
  },
}

const LOCALE_LABELS: Record<Locale, string> = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
}

type I18nContextType = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
  locales: { value: Locale; label: string }[]
}

const I18nContext = createContext<I18nContextType>({
  locale: 'ko',
  setLocale: () => {},
  t: (key: string) => key,
  locales: [],
})

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('ko')

  useEffect(() => {
    const saved = localStorage.getItem('notion-locale') as Locale
    if (saved && translations[saved]) setLocaleState(saved)
  }, [])

  const setLocale = (l: Locale) => {
    setLocaleState(l)
    localStorage.setItem('notion-locale', l)
  }

  const t = (key: string) => {
    return translations[locale]?.[key] || translations.ko[key] || key
  }

  const locales = Object.entries(LOCALE_LABELS).map(([value, label]) => ({
    value: value as Locale,
    label,
  }))

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, locales }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return useContext(I18nContext)
}
