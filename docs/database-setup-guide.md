# 데이터베이스 설정 가이드

## 개요

이 프로젝트는 Supabase를 백엔드로 사용하는 권한 관리 시스템입니다. 사용자 역할 및 팀 관리 기능을 제공합니다.

## 발생 가능한 문제

### "사용자 역할 조회 실패" 오류

**증상**: 브라우저 콘솔에서 "사용자 역할 조회 실패: {}" 오류가 표시됩니다.

**원인**: 
1. **RLS (Row Level Security) 정책 문제**: `user_roles` 테이블에 설정된 RLS 정책이 순환 참조를 생성하여 접근을 차단합니다.
2. **데이터베이스 초기화 부족**: 마이그레이션이 실행되지 않았거나 초기 사용자 데이터가 없습니다.
3. **권한 부족**: 현재 사용자가 다른 사용자의 역할 정보에 접근할 권한이 없습니다.

## 해결 방법

### 1. 데이터베이스 마이그레이션 실행

Supabase 대시보드의 SQL 에디터에서 다음 마이그레이션을 순서대로 실행하세요:

1. `migrations/001_create_permission_tables.sql`
2. `migrations/002_insert_sample_data.sql`

### 2. 초기 사용자 설정

첫 번째 사용자는 자동으로 `super_admin` 역할을 받습니다. 추가 사용자를 등록한 후, 다음 SQL을 실행하여 샘플 데이터를 생성하세요:

```sql
SELECT public.create_sample_data_for_existing_users();
```

### 3. RLS 정책 임시 수정 (선택사항)

개발 환경에서 문제가 계속 발생하면, 임시로 RLS를 비활성화할 수 있습니다:

```sql
-- 주의: 프로덕션 환경에서는 사용하지 마세요
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams DISABLE ROW LEVEL SECURITY;
```

### 4. 환경 변수 확인

`.env.local` 파일에 올바른 Supabase 설정이 있는지 확인하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 개발 시 참고사항

### Mock 데이터 사용

애플리케이션은 데이터베이스 접근에 실패할 경우 자동으로 Mock 데이터를 사용합니다. 이는 개발 중에 데이터베이스 설정이 완료되지 않았을 때도 UI를 테스트할 수 있게 해줍니다.

### 에러 핸들링

- 모든 데이터베이스 쿼리에는 적절한 에러 핸들링이 구현되어 있습니다.
- 에러 발생 시 상세한 로그가 콘솔에 출력됩니다.
- 사용자에게는 적절한 대체 데이터나 메시지가 표시됩니다.

## 권장 개발 워크플로우

1. **Supabase 프로젝트 생성**
2. **마이그레이션 실행**
3. **테스트 계정 생성** (회원가입을 통해)
4. **샘플 데이터 함수 실행**
5. **애플리케이션 테스트**

## 추가 도움이 필요한 경우

- Supabase 대시보드에서 데이터베이스 로그를 확인하세요.
- 브라우저 개발자 도구의 네트워크 탭에서 API 요청을 확인하세요.
- RLS 정책이 의도한 대로 작동하는지 SQL 에디터에서 직접 쿼리를 테스트해보세요.