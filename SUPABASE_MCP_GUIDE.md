# Supabase MCP 설정 가이드

## 현재 프로젝트 정보
- **Supabase Project ID**: `jpudplkffpdbjwjdzmar`
- **Supabase URL**: `https://jpudplkffpdbjwjdzmar.supabase.co`
- **Dashboard**: https://supabase.com/dashboard/project/jpudplkffpdbjwjdzmar

## MCP 연결 방법

### 방법 1: Claude Code 플러그인 (권장)

Claude Code에서 Supabase 플러그인이 이미 활성화되어 있습니다.

```bash
# Claude Code 재시작 후 MCP 상태 확인
/mcp
```

### 방법 2: 수동 MCP 서버 설정

Claude Desktop 설정 파일 (`%APPDATA%\Claude\claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase",
        "--project-ref",
        "jpudplkffpdbjwjdzmar"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "sbp_628088522e9586f6f8d8b25fedad11fc8abdbab2"
      }
    }
  }
}
```

### 방법 3: PowerShell에서 직접 테스트

```powershell
# 환경변수 설정
$env:SUPABASE_ACCESS_TOKEN="sbp_628088522e9586f6f8d8b25fedad11fc8abdbab2"

# MCP 서버 직접 실행
npx @supabase/mcp-server-supabase --project-ref jpudplkffpdbjwjdzmar
```

## 데이터베이스 스키마

### 테이블 구조

1. **profiles** - 사용자 프로필
   - `id` (UUID, PK) - auth.users 참조
   - `email` (TEXT)
   - `username` (TEXT, UNIQUE)
   - `full_name` (TEXT)
   - `avatar_url` (TEXT)
   - `global_role` (ENUM: user, admin, super_admin)
   - `status` (ENUM: active, inactive, suspended)

2. **organizations** - 조직
   - `id` (SERIAL, PK)
   - `name` (TEXT)
   - `slug` (TEXT, UNIQUE)
   - `description` (TEXT)
   - `owner_id` (UUID, FK → profiles)

3. **teams** - 팀
   - `id` (SERIAL, PK)
   - `name` (TEXT)
   - `description` (TEXT)
   - `organization_id` (INT, FK → organizations)

4. **team_members** - 팀 멤버십
   - `id` (SERIAL, PK)
   - `team_id` (INT, FK → teams)
   - `user_id` (UUID, FK → profiles)
   - `role` (ENUM: member, lead, admin)

5. **organization_members** - 조직 멤버십
   - `id` (SERIAL, PK)
   - `organization_id` (INT, FK → organizations)
   - `user_id` (UUID, FK → profiles)
   - `role` (ENUM: member, lead, admin)

### RPC 함수

- `get_my_global_role()` - 현재 사용자의 전역 역할 반환
- `is_admin_or_higher()` - 관리자 이상인지 확인
- `get_user_stats()` - 사용자 통계 반환
- `update_user_role(p_user_id, p_new_role)` - 사용자 역할 변경
- `update_user_status(p_user_id, p_new_status)` - 사용자 상태 변경

## 초기 설정 SQL

데이터베이스를 설정하려면 Supabase SQL Editor에서 다음 파일을 실행하세요:

```
supabase/migrations/000_full_setup.sql
```

## 쿼리 함수 사용법

```typescript
import {
  getProfile,
  getCurrentProfile,
  getAllProfiles,
  getTeams,
  getMyTeams,
  getUserStats,
} from '@/lib/supabase-queries'

// 현재 로그인한 사용자 프로필
const profile = await getCurrentProfile()

// 모든 프로필 (페이지네이션)
const { data, count } = await getAllProfiles({
  status: 'active',
  limit: 10,
  offset: 0,
})

// 팀 목록
const teams = await getTeams()

// 내가 속한 팀들
const myTeams = await getMyTeams()

// 사용자 통계
const stats = await getUserStats()
```

## 문제 해결

### MCP 연결 실패 시
1. Claude Code 완전히 종료 후 재시작
2. `/mcp` 명령어로 상태 확인
3. 환경변수가 올바르게 설정되었는지 확인

### 권한 오류 시
- RLS(Row Level Security) 정책 확인
- 사용자 인증 상태 확인
- Service Role Key 사용 여부 확인 (서버 사이드에서만)

## 환경 변수

`.env.local` 파일에 다음이 설정되어 있어야 합니다:

```env
NEXT_PUBLIC_SUPABASE_URL=https://jpudplkffpdbjwjdzmar.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_ACCESS_TOKEN=sbp_... (MCP용)
```
