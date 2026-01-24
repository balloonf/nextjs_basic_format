import type { Team, TeamMember, UserProfile, TeamMembership } from '@/types'

// ============================================
// 팀 목 데이터 생성
// ============================================

export function generateMockTeams(): Team[] {
  return [
    {
      id: 1,
      name: '프론트엔드팀',
      organization_id: 1,
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z',
    },
    {
      id: 2,
      name: '백엔드팀',
      organization_id: 1,
      created_at: '2024-01-20T00:00:00Z',
      updated_at: '2024-01-20T00:00:00Z',
    },
    {
      id: 3,
      name: 'DevOps팀',
      organization_id: 1,
      created_at: '2024-02-01T00:00:00Z',
      updated_at: '2024-02-01T00:00:00Z',
    },
    {
      id: 4,
      name: 'QA팀',
      organization_id: 1,
      created_at: '2024-02-10T00:00:00Z',
      updated_at: '2024-02-10T00:00:00Z',
    },
    {
      id: 5,
      name: 'UI/UX팀',
      organization_id: 2,
      created_at: '2024-02-15T00:00:00Z',
      updated_at: '2024-02-15T00:00:00Z',
    },
  ]
}

// ============================================
// 사용자 목 데이터 생성
// ============================================

export function generateMockUsers(currentUserId?: string, currentUserEmail?: string): UserProfile[] {
  return [
    {
      id: currentUserId || '1',
      email: currentUserEmail || 'admin@example.com',
      full_name: '김관리자',
      global_role: 'super_admin',
      created_at: '2024-01-01T00:00:00Z',
      last_sign_in: '2024-03-15T10:30:00Z',
      email_confirmed: true,
      status: 'active',
    },
    {
      id: '2',
      email: 'manager@example.com',
      full_name: '이매니저',
      global_role: 'admin',
      created_at: '2024-01-15T00:00:00Z',
      last_sign_in: '2024-03-14T16:45:00Z',
      email_confirmed: true,
      status: 'active',
    },
    {
      id: '3',
      email: 'developer1@example.com',
      full_name: '박개발',
      global_role: 'user',
      created_at: '2024-02-01T00:00:00Z',
      last_sign_in: '2024-03-13T09:15:00Z',
      email_confirmed: true,
      status: 'active',
    },
    {
      id: '4',
      email: 'developer2@example.com',
      full_name: '최프론트',
      global_role: 'user',
      created_at: '2024-02-15T00:00:00Z',
      last_sign_in: '2024-03-12T14:20:00Z',
      email_confirmed: true,
      status: 'active',
    },
    {
      id: '5',
      email: 'designer@example.com',
      full_name: '정디자인',
      global_role: 'user',
      created_at: '2024-03-01T00:00:00Z',
      last_sign_in: '2024-03-11T11:30:00Z',
      email_confirmed: false,
      status: 'inactive',
    },
    {
      id: '6',
      email: 'tester@example.com',
      full_name: '한테스터',
      global_role: 'user',
      created_at: '2024-03-10T00:00:00Z',
      last_sign_in: null,
      email_confirmed: true,
      status: 'inactive',
    },
  ]
}

// ============================================
// 팀 멤버 목 데이터 생성
// ============================================

export function generateMockTeamMembers(
  teamId: number,
  currentUserId?: string,
  currentUserEmail?: string
): TeamMember[] {
  const teamMemberData: Record<number, TeamMember[]> = {
    1: [
      // 프론트엔드팀
      {
        id: 1,
        team_id: 1,
        user_id: currentUserId || '1',
        email: currentUserEmail || 'admin@example.com',
        name: '김관리자',
        role: 'admin',
        joined_at: '2024-01-15T00:00:00Z',
        last_active: '2024-03-15T10:30:00Z',
      },
      {
        id: 2,
        team_id: 1,
        user_id: '2',
        email: 'frontend-lead@example.com',
        name: '이팀장',
        role: 'lead',
        joined_at: '2024-01-20T00:00:00Z',
        last_active: '2024-03-14T15:45:00Z',
      },
      {
        id: 3,
        team_id: 1,
        user_id: '3',
        email: 'frontend-dev1@example.com',
        name: '박멤버',
        role: 'member',
        joined_at: '2024-02-01T00:00:00Z',
        last_active: '2024-03-13T09:20:00Z',
      },
    ],
    2: [
      // 백엔드팀
      {
        id: 4,
        team_id: 2,
        user_id: currentUserId || '1',
        email: currentUserEmail || 'admin@example.com',
        name: '김관리자',
        role: 'admin',
        joined_at: '2024-01-15T00:00:00Z',
        last_active: '2024-03-15T10:30:00Z',
      },
      {
        id: 5,
        team_id: 2,
        user_id: '4',
        email: 'backend-lead@example.com',
        name: '최백엔드',
        role: 'lead',
        joined_at: '2024-01-25T00:00:00Z',
        last_active: '2024-03-12T14:15:00Z',
      },
    ],
    3: [
      // DevOps팀
      {
        id: 6,
        team_id: 3,
        user_id: '5',
        email: 'devops-admin@example.com',
        name: '정데브옵스',
        role: 'admin',
        joined_at: '2024-02-01T00:00:00Z',
        last_active: '2024-03-11T11:30:00Z',
      },
    ],
  }

  return (
    teamMemberData[teamId] || [
      {
        id: 999,
        team_id: teamId,
        user_id: currentUserId || '1',
        email: currentUserEmail || 'admin@example.com',
        name: '관리자',
        role: 'admin',
        joined_at: new Date().toISOString(),
      },
    ]
  )
}

// ============================================
// 사용자 팀 멤버십 목 데이터 생성
// ============================================

export function generateMockUserTeams(userId: string): TeamMembership[] {
  const teamMemberships: Record<string, TeamMembership[]> = {
    '1': [
      { team_id: 1, team_name: '프론트엔드팀', role: 'admin', joined_at: '2024-01-15T00:00:00Z' },
      { team_id: 2, team_name: '백엔드팀', role: 'admin', joined_at: '2024-01-15T00:00:00Z' },
    ],
    '2': [
      { team_id: 1, team_name: '프론트엔드팀', role: 'lead', joined_at: '2024-01-20T00:00:00Z' },
      { team_id: 4, team_name: 'QA팀', role: 'admin', joined_at: '2024-02-01T00:00:00Z' },
    ],
    '3': [
      { team_id: 1, team_name: '프론트엔드팀', role: 'member', joined_at: '2024-02-01T00:00:00Z' },
    ],
    '4': [
      { team_id: 2, team_name: '백엔드팀', role: 'member', joined_at: '2024-02-15T00:00:00Z' },
    ],
    '5': [
      { team_id: 5, team_name: 'UI/UX팀', role: 'lead', joined_at: '2024-03-01T00:00:00Z' },
    ],
  }

  return teamMemberships[userId] || []
}

// ============================================
// 유틸리티 함수
// ============================================

/**
 * 랜덤 날짜 생성 (특정 범위 내)
 */
export function getRandomDate(startDate?: Date, endDate?: Date): string {
  const start = startDate || new Date('2024-03-01')
  const end = endDate || new Date()
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  ).toISOString()
}
