# Supabase 데이터베이스 설정 가이드

## 스키마 구조

```
┌─────────────────────────────────────────────────────────────────┐
│                         Organizations                            │
│  (조직 - 최상위 단위)                                             │
└─────────────────────────────────────────────────────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                             Teams                                │
│  (팀 - 조직 내 팀)                                                │
└─────────────────────────────────────────────────────────────────┘
         │
         │ N:M (through team_members)
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                           Profiles                               │
│  (사용자 프로필 - auth.users와 1:1)                               │
└─────────────────────────────────────────────────────────────────┘
```

## 테이블 설명

### 1. profiles (사용자 프로필)
- `auth.users`와 1:1 관계
- 새 사용자 가입 시 트리거로 자동 생성
- 전역 역할(global_role): user, admin, super_admin
- 상태(status): active, inactive, suspended

### 2. organizations (조직)
- 최상위 그룹 단위
- 소유자(owner_id) 지정 가능
- 고유 slug 사용

### 3. teams (팀)
- 조직에 속한 팀
- 조직당 고유한 팀 이름

### 4. team_members (팀 멤버십)
- 사용자-팀 N:M 관계
- 팀 역할(role): member, lead, admin

### 5. organization_members (조직 멤버십)
- 사용자-조직 N:M 관계
- 조직 역할(role): member, lead, admin

## 설정 방법

### 방법 1: Supabase 대시보드에서 직접 실행

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택
3. SQL Editor 클릭
4. 아래 순서로 마이그레이션 파일 실행:
   - `001_initial_schema.sql`
   - `002_rls_policies.sql`
   - `003_helper_functions.sql`

### 방법 2: Supabase CLI 사용

```bash
# Supabase CLI 설치
npm install -g supabase

# 로그인
supabase login

# 프로젝트 연결
supabase link --project-ref your-project-ref

# 마이그레이션 실행
supabase db push
```

## 환경 변수 설정

`.env.local` 파일에 다음 변수 추가:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## RLS (Row Level Security) 정책

모든 테이블에 RLS가 활성화되어 있습니다:

| 테이블 | SELECT | INSERT | UPDATE | DELETE |
|--------|--------|--------|--------|--------|
| profiles | 인증된 사용자 | 트리거 자동생성 | 본인/admin | - |
| organizations | 인증된 사용자 | 인증된 사용자 | 소유자/admin | 소유자/super_admin |
| teams | 조직 멤버 | 조직 admin | 팀 admin | 조직 admin |
| team_members | 같은 팀 멤버 | 팀 admin/lead | 팀 admin | 팀 admin/본인 |
| organization_members | 같은 조직 멤버 | 조직 admin | 조직 admin | 조직 admin/본인 |

## 헬퍼 함수

| 함수명 | 설명 | 반환값 |
|--------|------|--------|
| `get_my_global_role()` | 현재 사용자의 전역 역할 | global_role |
| `is_team_member(team_id)` | 팀 멤버 여부 확인 | boolean |
| `get_team_role(team_id)` | 팀 내 역할 조회 | team_role |
| `is_org_member(org_id)` | 조직 멤버 여부 확인 | boolean |
| `is_admin_or_higher()` | admin 이상 여부 | boolean |
| `is_super_admin()` | super_admin 여부 | boolean |
| `get_my_team_memberships()` | 내 팀 멤버십 목록 | table |
| `get_my_org_memberships()` | 내 조직 멤버십 목록 | table |
| `get_team_members_detail(team_id)` | 팀 멤버 상세 목록 | table |
| `get_user_stats()` | 사용자 통계 (admin용) | table |
| `update_user_role(user_id, role)` | 역할 변경 (super_admin용) | boolean |
| `update_user_status(user_id, status)` | 상태 변경 (admin용) | boolean |

## 사용 예시

```typescript
import { supabase } from '@/lib/supabase'

// 내 프로필 조회
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single()

// 내 팀 멤버십 조회
const { data: memberships } = await supabase
  .rpc('get_my_team_memberships')

// 팀 멤버 상세 조회
const { data: members } = await supabase
  .rpc('get_team_members_detail', { p_team_id: teamId })

// 사용자 역할 변경 (super_admin만 가능)
const { data: success } = await supabase
  .rpc('update_user_role', { p_user_id: userId, p_new_role: 'admin' })
```
