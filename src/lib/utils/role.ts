import { Crown, Shield, UserCheck, type LucideIcon } from 'lucide-react'
import type { GlobalRole, TeamRole, UserStatus } from '@/types'

// Badge variants type
type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline'

// ============================================
// 역할 관련 유틸리티 함수
// ============================================

/**
 * 역할에 따른 Badge variant 반환
 */
export function getRoleBadgeVariant(role: GlobalRole | TeamRole | string): BadgeVariant {
  switch (role) {
    case 'super_admin':
      return 'destructive'
    case 'admin':
      return 'destructive'
    case 'lead':
      return 'default'
    case 'member':
    case 'user':
      return 'secondary'
    default:
      return 'outline'
  }
}

/**
 * 역할에 따른 아이콘 컴포넌트 반환
 */
export function getRoleIcon(role: GlobalRole | TeamRole | string): LucideIcon | null {
  switch (role) {
    case 'super_admin':
    case 'admin':
      return Crown
    case 'lead':
      return Shield
    case 'member':
    case 'user':
      return UserCheck
    default:
      return null
  }
}

/**
 * 역할의 한글 표시명 반환
 */
export function getRoleDisplayName(role: GlobalRole | TeamRole | string): string {
  switch (role) {
    case 'super_admin':
      return '슈퍼 관리자'
    case 'admin':
      return '관리자'
    case 'lead':
      return '리더'
    case 'member':
      return '멤버'
    case 'user':
      return '사용자'
    default:
      return role
  }
}

// ============================================
// 상태 관련 유틸리티 함수
// ============================================

/**
 * 사용자 상태에 따른 Badge variant 반환
 */
export function getStatusBadgeVariant(status: UserStatus | string): BadgeVariant {
  switch (status) {
    case 'active':
      return 'default'
    case 'inactive':
      return 'secondary'
    case 'suspended':
      return 'destructive'
    default:
      return 'outline'
  }
}

/**
 * 사용자 상태의 한글 표시명 반환
 */
export function getStatusDisplayName(status: UserStatus | string): string {
  switch (status) {
    case 'active':
      return '활성'
    case 'inactive':
      return '비활성'
    case 'suspended':
      return '정지'
    default:
      return status
  }
}
