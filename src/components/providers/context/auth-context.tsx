"use client"

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import type { User, AuthError } from '@supabase/supabase-js'
import { auth } from '@/lib/auth'
import { useRouter, usePathname } from 'next/navigation'
import type { UserMetadata } from '@/types'

interface SignUpResult {
  error: AuthError | null
  needsEmailConfirmation?: boolean
  isExistingUser?: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string, userData?: UserMetadata) => Promise<SignUpResult>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const isRedirecting = useRef(false)

  // 중복 리다이렉트 방지를 위한 안전한 네비게이션
  const safeNavigate = useCallback((path: string) => {
    if (isRedirecting.current) return
    if (pathname === path) return

    isRedirecting.current = true
    router.push(path)

    // 리다이렉트 플래그 리셋
    setTimeout(() => {
      isRedirecting.current = false
    }, 1000)
  }, [router, pathname])

  useEffect(() => {
    const getUser = async () => {
      try {
        const { user, error } = await auth.getUser()
        if (!error && user) {
          setUser(user)
        }
      } catch {
        // 사용자 정보 조회 실패 시 무시
      } finally {
        setLoading(false)
      }
    }

    getUser()

    const { data: { subscription } } = auth.onAuthStateChange(
      async (event, session) => {
        try {
          const currentUser = session?.user ?? null
          setUser(currentUser)
          setLoading(false)

          if (event === 'SIGNED_IN' && currentUser) {
            safeNavigate('/main')
          } else if (event === 'SIGNED_OUT') {
            safeNavigate('/login')
          }
        } catch {
          setLoading(false)
        }
      }
    )

    return () => subscription?.unsubscribe()
  }, [safeNavigate])

  const signIn = async (email: string, password: string): Promise<{ error: AuthError | null }> => {
    setLoading(true)
    const { user, error } = await auth.signIn({ email, password })

    if (!error && user) {
      setUser(user)
    }
    setLoading(false)
    return { error }
  }

  const signUp = async (
    email: string,
    password: string,
    userData?: UserMetadata
  ): Promise<SignUpResult> => {
    setLoading(true)
    const { user, error, needsEmailConfirmation, isExistingUser } = await auth.signUp({
      email,
      password,
      options: { data: userData }
    })

    if (!error && user && !needsEmailConfirmation) {
      setUser(user)
    }
    setLoading(false)
    return { error, needsEmailConfirmation, isExistingUser }
  }

  const signOut = async () => {
    setLoading(true)
    await auth.signOut()
    setUser(null)
    setLoading(false)
  }

  const resetPassword = async (email: string): Promise<{ error: AuthError | null }> => {
    const { error } = await auth.resetPassword(email)
    return { error }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
