import { toast } from 'sonner'
import type { AuthError, PostgrestError } from '@supabase/supabase-js'

// ============================================
// 에러 메시지 매핑
// ============================================

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'Invalid login credentials': '이메일 또는 비밀번호가 올바르지 않습니다.',
  'Email not confirmed': '이메일 인증이 필요합니다. 이메일을 확인해주세요.',
  'User already registered': '이미 등록된 이메일입니다.',
  'Password should be at least 6 characters': '비밀번호는 최소 6자 이상이어야 합니다.',
  'Email rate limit exceeded': '너무 많은 요청이 있었습니다. 잠시 후 다시 시도해주세요.',
  'User not found': '사용자를 찾을 수 없습니다.',
  'Invalid email': '유효하지 않은 이메일 주소입니다.',
  'Signup disabled': '현재 회원가입이 비활성화되어 있습니다.',
}

const DATABASE_ERROR_MESSAGES: Record<string, string> = {
  '23505': '이미 존재하는 데이터입니다.',
  '23503': '참조하는 데이터가 존재하지 않습니다.',
  '42501': '이 작업을 수행할 권한이 없습니다.',
  'PGRST301': '요청한 리소스를 찾을 수 없습니다.',
}

// ============================================
// 에러 처리 함수
// ============================================

/**
 * 인증 에러 처리 및 toast 표시
 */
export function handleAuthError(error: AuthError | null, fallbackMessage?: string): void {
  if (!error) return

  const message =
    AUTH_ERROR_MESSAGES[error.message] ||
    error.message ||
    fallbackMessage ||
    '인증 중 오류가 발생했습니다.'

  toast.error(message)
}

/**
 * 데이터베이스 에러 처리 및 toast 표시
 */
export function handleDatabaseError(
  error: PostgrestError | null,
  fallbackMessage?: string
): void {
  if (!error) return

  const message =
    DATABASE_ERROR_MESSAGES[error.code] ||
    error.message ||
    fallbackMessage ||
    '데이터베이스 작업 중 오류가 발생했습니다.'

  toast.error(message)
}

/**
 * 일반 API 에러 처리 및 toast 표시
 */
export function handleApiError(
  error: Error | unknown,
  fallbackMessage?: string
): void {
  if (!error) return

  let message = fallbackMessage || '오류가 발생했습니다.'

  if (error instanceof Error) {
    message = error.message || message
  }

  toast.error(message)
}

/**
 * 성공 메시지 표시
 */
export function showSuccess(message: string): void {
  toast.success(message)
}

/**
 * 정보 메시지 표시
 */
export function showInfo(message: string): void {
  toast.info(message)
}

/**
 * 경고 메시지 표시
 */
export function showWarning(message: string): void {
  toast.warning(message)
}

// ============================================
// 에러 로깅 (개발 환경용)
// ============================================

/**
 * 개발 환경에서만 에러 로깅
 */
export function logError(context: string, error: unknown): void {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}]`, error)
  }
}
