"use client"

import { ReactNode } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, Lock, UserX, AlertTriangle, type LucideIcon } from 'lucide-react'
import type { GlobalRole, TeamRole } from '@/types'

interface User {
  id: string
  email: string
}

interface Profile {
  id: string
  global_role: GlobalRole
}

interface TeamPermission {
  team_id: number
  role: TeamRole
}

interface Permissions {
  team_memberships: TeamPermission[]
  organization_memberships?: unknown[]
}

interface PermissionGuardProps {
  children: ReactNode
  fallback?: ReactNode
}

interface AdminOnlyProps extends PermissionGuardProps {
  profile?: Profile | null
}

interface TeamMemberOnlyProps extends PermissionGuardProps {
  teamId: number
  permissions?: Permissions | null
}

interface TeamAdminOnlyProps extends PermissionGuardProps {
  teamId: number
  permissions?: Permissions | null
}

interface OwnerOnlyProps extends PermissionGuardProps {
  ownerId: string
  user?: User | null
}

interface RoleBasedProps extends PermissionGuardProps {
  allowedRoles: string[]
  userRole?: string
}

// 권한 체크 유틸리티 함수들
export const isAdmin = (profile?: Profile | null): boolean => {
  return profile?.global_role === 'admin' || profile?.global_role === 'super_admin'
}

export const isSuperAdmin = (profile?: Profile | null): boolean => {
  return profile?.global_role === 'super_admin'
}

export const isTeamMember = (permissions?: Permissions | null, teamId?: number): boolean => {
  if (!permissions || !teamId) return false
  return permissions.team_memberships.some(membership =>
    membership.team_id === teamId
  )
}

export const isTeamAdmin = (permissions?: Permissions | null, teamId?: number): boolean => {
  if (!permissions || !teamId) return false
  return permissions.team_memberships.some(membership =>
    membership.team_id === teamId && (membership.role === 'admin' || membership.role === 'lead')
  )
}

export const isOwner = (user?: User | null, ownerId?: string): boolean => {
  return user?.id === ownerId
}

// 기본 fallback 컴포넌트들
const DefaultFallback = ({ icon: Icon, title, description }: {
  icon: LucideIcon
  title: string
  description: string
}) => (
  <Alert className="border-destructive/50">
    <Icon className="h-4 w-4 text-destructive" />
    <AlertDescription className="flex flex-col gap-1">
      <strong className="text-destructive">{title}</strong>
      <span className="text-muted-foreground text-sm">{description}</span>
    </AlertDescription>
  </Alert>
)

const AdminFallback = () => (
  <DefaultFallback
    icon={Shield}
    title="관리자 권한 필요"
    description="이 기능은 관리자만 사용할 수 있습니다."
  />
)

const TeamMemberFallback = () => (
  <DefaultFallback
    icon={UserX}
    title="팀 멤버 권한 필요"
    description="이 기능은 팀 멤버만 사용할 수 있습니다."
  />
)

const TeamAdminFallback = () => (
  <DefaultFallback
    icon={Lock}
    title="팀 관리자 권한 필요"
    description="이 기능은 팀 관리자 또는 리더만 사용할 수 있습니다."
  />
)

const OwnerFallback = () => (
  <DefaultFallback
    icon={Lock}
    title="소유자 권한 필요"
    description="이 기능은 소유자만 사용할 수 있습니다."
  />
)

const RoleFallback = () => (
  <DefaultFallback
    icon={AlertTriangle}
    title="권한 부족"
    description="이 기능을 사용할 권한이 없습니다."
  />
)

// 권한 가드 컴포넌트들
export function AdminOnly({ children, profile, fallback }: AdminOnlyProps) {
  if (!isAdmin(profile)) {
    return fallback ?? <AdminFallback />
  }
  return <>{children}</>
}

export function SuperAdminOnly({ children, profile, fallback }: AdminOnlyProps) {
  if (!isSuperAdmin(profile)) {
    return fallback ?? <AdminFallback />
  }
  return <>{children}</>
}

export function TeamMemberOnly({ teamId, permissions, children, fallback }: TeamMemberOnlyProps) {
  if (!isTeamMember(permissions, teamId)) {
    return fallback ?? <TeamMemberFallback />
  }
  return <>{children}</>
}

export function TeamAdminOnly({ teamId, permissions, children, fallback }: TeamAdminOnlyProps) {
  if (!isTeamAdmin(permissions, teamId)) {
    return fallback ?? <TeamAdminFallback />
  }
  return <>{children}</>
}

export function OwnerOnly({ ownerId, user, children, fallback }: OwnerOnlyProps) {
  if (!isOwner(user, ownerId)) {
    return fallback ?? <OwnerFallback />
  }
  return <>{children}</>
}

export function RoleBasedGuard({ allowedRoles, userRole, children, fallback }: RoleBasedProps) {
  if (!userRole || !allowedRoles.includes(userRole)) {
    return fallback ?? <RoleFallback />
  }
  return <>{children}</>
}

// 조합 가드 (OR 조건)
interface CombinedGuardProps extends PermissionGuardProps {
  conditions: Array<{
    type: 'admin' | 'team_member' | 'team_admin' | 'owner'
    profile?: Profile | null
    permissions?: Permissions | null
    teamId?: number
    user?: User | null
    ownerId?: string
  }>
}

export function AnyOfGuard({ conditions, children, fallback }: CombinedGuardProps) {
  const hasAccess = conditions.some(condition => {
    switch (condition.type) {
      case 'admin':
        return isAdmin(condition.profile)
      case 'team_member':
        return isTeamMember(condition.permissions, condition.teamId)
      case 'team_admin':
        return isTeamAdmin(condition.permissions, condition.teamId)
      case 'owner':
        return isOwner(condition.user, condition.ownerId)
      default:
        return false
    }
  })

  if (!hasAccess) {
    return fallback ?? <RoleFallback />
  }
  return <>{children}</>
}

// 권한 체크 훅 (클라이언트에서 사용)
export function usePermissions() {
  // 실제 구현에서는 useUser 또는 useAuth 훅을 사용
  const mockUser: User = { id: '1', email: 'user@example.com' }
  const mockProfile: Profile = { id: '1', global_role: 'user' }
  const mockPermissions: Permissions = {
    team_memberships: [
      { team_id: 1, role: 'admin' },
      { team_id: 2, role: 'member' }
    ]
  }

  return {
    user: mockUser,
    profile: mockProfile,
    permissions: mockPermissions,
    isAdmin: isAdmin(mockProfile),
    isSuperAdmin: isSuperAdmin(mockProfile),
    isTeamMember: (teamId: number) => isTeamMember(mockPermissions, teamId),
    isTeamAdmin: (teamId: number) => isTeamAdmin(mockPermissions, teamId),
    isOwner: (ownerId: string) => isOwner(mockUser, ownerId)
  }
}

// 권한 체크 HOC
export function withPermission<T extends object>(
  Component: React.ComponentType<T>,
  permissionCheck: (props: T) => boolean,
  fallback?: ReactNode
) {
  return function WrappedComponent(props: T) {
    if (!permissionCheck(props)) {
      return fallback ?? <RoleFallback />
    }
    return <Component {...props} />
  }
}

// 권한 기반 라우팅을 위한 컴포넌트
interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: 'admin' | 'super_admin'
  requiredTeamId?: number
  requiredTeamRole?: TeamRole
  requireOwnership?: string
  fallback?: ReactNode
}

export function ProtectedRoute({
  children,
  requiredRole,
  requiredTeamId,
  requiredTeamRole,
  requireOwnership,
  fallback
}: ProtectedRouteProps) {
  const { user, profile, permissions } = usePermissions()

  // 글로벌 역할 체크
  if (requiredRole && !isAdmin(profile)) {
    return fallback ?? <AdminFallback />
  }

  // 팀 권한 체크
  if (requiredTeamId && requiredTeamRole) {
    if (requiredTeamRole === 'member' && !isTeamMember(permissions, requiredTeamId)) {
      return fallback ?? <TeamMemberFallback />
    }
    if ((requiredTeamRole === 'lead' || requiredTeamRole === 'admin') &&
        !isTeamAdmin(permissions, requiredTeamId)) {
      return fallback ?? <TeamAdminFallback />
    }
  }

  // 소유권 체크
  if (requireOwnership && !isOwner(user, requireOwnership)) {
    return fallback ?? <OwnerFallback />
  }

  return <>{children}</>
}
