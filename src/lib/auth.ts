import { supabase } from './supabase'
import { env } from './env'
import type { User, AuthError, AuthChangeEvent, Session, Provider } from '@supabase/supabase-js'

export interface AuthResponse {
  user: User | null
  error: AuthError | null
}

export interface SignUpResponse {
  user: User | null
  error: AuthError | null
  isExistingUser?: boolean
  needsEmailConfirmation?: boolean
}

export interface SignUpData {
  email: string
  password: string
  options?: {
    data?: {
      full_name?: string
      username?: string
    }
  }
}

export interface SignInData {
  email: string
  password: string
}

export type SocialProvider = 'google' | 'github' | 'kakao'

// 에러 메시지 한글화
const getErrorMessage = (error: AuthError): string => {
  const errorMessages: Record<string, string> = {
    'Invalid login credentials': '이메일 또는 비밀번호가 올바르지 않습니다.',
    'Email not confirmed': '이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.',
    'User already registered': '이미 가입된 이메일입니다.',
    'Password should be at least 6 characters': '비밀번호는 최소 6자 이상이어야 합니다.',
    'Unable to validate email address: invalid format': '올바른 이메일 형식이 아닙니다.',
    'Signup requires a valid password': '유효한 비밀번호를 입력해주세요.',
    'To signup, please provide your email': '이메일을 입력해주세요.',
    'email rate limit exceeded': '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
    'over_email_send_rate_limit': '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
  }

  return errorMessages[error.message] || error.message
}

export const auth = {
  async signUp({ email, password, options }: SignUpData): Promise<SignUpResponse> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options
    })

    // 이미 가입된 사용자인지 확인 (identities가 빈 배열이면 이미 존재하는 사용자)
    const isExistingUser = data.user && data.user.identities && data.user.identities.length === 0

    if (isExistingUser) {
      return {
        user: null,
        error: {
          message: '이미 가입된 이메일입니다. 로그인해주세요.',
          name: 'AuthApiError',
          status: 400
        } as AuthError,
        isExistingUser: true
      }
    }

    // 이메일 확인이 필요한지 체크
    const needsEmailConfirmation = !!(data.user && !data.session)

    return {
      user: data.user,
      error: error ? { ...error, message: getErrorMessage(error) } as AuthError : null,
      needsEmailConfirmation
    }
  },

  async signIn({ email, password }: SignInData): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    return {
      user: data.user,
      error: error ? { ...error, message: getErrorMessage(error) } as AuthError : null
    }
  },

  async signInWithSocial(provider: SocialProvider): Promise<{ error: AuthError | null }> {
    // 동적으로 현재 origin 사용 (포트가 변경될 수 있음)
    const redirectUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback`
      : `${env.NEXT_PUBLIC_APP_URL}/auth/callback`

    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider as Provider,
      options: {
        redirectTo: redirectUrl
      }
    })
    return { error }
  },

  async signOut(): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  async getUser(): Promise<{ user: User | null; error: AuthError | null }> {
    const { data, error } = await supabase.auth.getUser()
    return {
      user: data.user,
      error
    }
  },

  async getSession(): Promise<{ session: Session | null; error: AuthError | null }> {
    const { data, error } = await supabase.auth.getSession()
    return {
      session: data.session,
      error
    }
  },

  async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${env.NEXT_PUBLIC_APP_URL}/reset-password`
    })
    return { error }
  },

  async updatePassword(password: string): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.updateUser({
      password
    })
    return { error }
  },

  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}