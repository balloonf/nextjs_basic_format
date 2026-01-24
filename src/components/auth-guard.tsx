"use client";

import { useAuth } from "@/components/providers/context/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

export function AuthGuard({
  children,
  requireAuth = true,
  redirectTo
}: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  // 초기 로딩 완료 여부를 추적 (최초 인증 상태 확인용)
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (!loading) {
      hasInitialized.current = true
      if (requireAuth && !user) {
        router.push(redirectTo || '/login')
      } else if (!requireAuth && user) {
        router.push(redirectTo || '/main')
      }
    }
  }, [user, loading, requireAuth, redirectTo, router])

  // 최초 로딩 시에만 로딩 스피너 표시 (폼 제출 중에는 표시하지 않음)
  if (loading && !hasInitialized.current) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (requireAuth && !user) {
    return null
  }

  if (!requireAuth && user) {
    return null
  }

  return <>{children}</>
}