// ============================================
// 라우트 경로 상수
// ============================================

export const ROUTES = {
  // 인증 관련
  AUTH: {
    LOGIN: '/login',
    SIGNUP: '/signup',
    FORGOT_PASSWORD: '/forgot',
    RESET_PASSWORD: '/reset-password',
    CALLBACK: '/auth/callback',
  },

  // 메인 앱
  MAIN: {
    HOME: '/main',
    SAMPLE: '/main/sample',
  },

  // 권한 관리
  PERMISSIONS: {
    MANAGEMENT: '/main/permission-management',
    USERS: '/main/user-management',
    ROLES: '/main/role-settings',
  },

  // 설정
  SETTINGS: {
    GENERAL: '/main/general-settings',
    TEAM: '/main/team-settings',
    BILLING: '/main/billing',
    LIMITS: '/main/limits',
  },

  // 문서
  DOCS: {
    INTRO: '/main/intro',
    GET_STARTED: '/main/get-started',
    TUTORIALS: '/main/tutorials',
    CHANGELOG: '/main/changelog',
  },
} as const

// ============================================
// 보호된 라우트 (인증 필요)
// ============================================

export const PROTECTED_ROUTES = [
  '/main',
  '/main/*',
] as const

// ============================================
// 공개 라우트 (인증 불필요)
// ============================================

export const PUBLIC_ROUTES = [
  ROUTES.AUTH.LOGIN,
  ROUTES.AUTH.SIGNUP,
  ROUTES.AUTH.FORGOT_PASSWORD,
  ROUTES.AUTH.RESET_PASSWORD,
  ROUTES.AUTH.CALLBACK,
] as const

// ============================================
// 라우트 유틸리티 함수
// ============================================

/**
 * 경로가 보호된 라우트인지 확인
 */
export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => {
    if (route.endsWith('/*')) {
      const baseRoute = route.slice(0, -2)
      return pathname.startsWith(baseRoute)
    }
    return pathname === route
  })
}

/**
 * 경로가 공개 라우트인지 확인
 */
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.includes(pathname as typeof PUBLIC_ROUTES[number])
}
