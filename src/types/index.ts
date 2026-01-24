// 전역 타입 정의 파일
import type { LucideIcon } from 'lucide-react'

// ============================================
// 역할 및 상태 타입
// ============================================

export type GlobalRole = 'user' | 'admin' | 'super_admin'
export type TeamRole = 'member' | 'lead' | 'admin'
export type UserStatus = 'active' | 'inactive' | 'suspended'

// ============================================
// API 응답 타입
// ============================================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginationParams {
  page: number
  limit: number
  sort?: string
  order?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ============================================
// 사용자 관련 타입
// ============================================

export interface User {
  id: string
  email: string
  name?: string
  createdAt: Date
  updatedAt: Date
}

export interface UserProfile {
  id: string
  email: string
  username?: string | null
  full_name?: string | null
  avatar_url?: string | null
  global_role: GlobalRole
  created_at: string
  updated_at?: string
  last_sign_in?: string | null
  email_confirmed?: boolean | null
  status?: UserStatus
}

export interface UserMetadata {
  full_name?: string
  username?: string
  avatar_url?: string
}

// ============================================
// 팀 관련 타입
// ============================================

export interface Team {
  id: number
  name: string
  organization_id: number | null
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: number
  team_id: number
  user_id: string
  email: string
  name?: string
  avatar_url?: string
  role: TeamRole
  joined_at: string
  last_active?: string | null
}

export interface TeamMembership {
  team_id: number
  team_name: string
  role: TeamRole
  joined_at: string
}

// ============================================
// 폼 타입
// ============================================

export interface LoginFormData {
  email: string
  password: string
  remember?: boolean
}

export interface SignupFormData {
  email: string
  password: string
  confirmPassword: string
  fullName?: string
  terms: boolean
}

export interface ForgotPasswordFormData {
  email: string
}

// ============================================
// 통계 타입
// ============================================

export interface UserStats {
  total_users: number
  active_users: number
  admin_users: number
  new_users_this_month: number
}

// ============================================
// 네비게이션 타입
// ============================================

export interface NavSubItem {
  title: string
  url: string
}

export interface NavMainItem {
  title: string
  url: string
  icon: LucideIcon
  isActive?: boolean
  items?: NavSubItem[]
}

export interface NavProject {
  name: string
  url: string
  icon: LucideIcon
}

export interface NavTeam {
  name: string
  logo: LucideIcon
  plan: string
}

// ============================================
// 권한 관련 타입
// ============================================

export interface Permission {
  action: string
  resource: string
  allowed: boolean
}

export interface TeamPermission {
  team_id: number
  role: TeamRole
}

export interface UserPermissions {
  global_role: GlobalRole
  team_memberships: TeamPermission[]
}
