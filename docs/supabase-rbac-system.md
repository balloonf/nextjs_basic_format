# Supabase 역할 기반 & 조직 기반 권한 관리 시스템

## 📋 개요

이 문서는 Supabase에서 구축된 역할 기반 접근 제어(RBAC)와 조직 기반 권한 관리 시스템에 대한 종합 가이드입니다.

## 🏗️ 시스템 구조

### 핵심 테이블 구조

```
auth.users (Supabase 기본)
├── profiles (사용자 프로필 및 전역 역할)
├── organizations (조직/회사)
├── organization_members (조직 멤버십)
├── teams (팀/부서)
├── team_members (팀 멤버십)
├── projects (프로젝트)
├── documents (문서)
└── resources (리소스/파일)
```

### 역할 계층

**전역 역할 (Global Roles):**
- `user`: 일반 사용자
- `admin`: 관리자
- `super_admin`: 최고 관리자

**조직 역할 (Organization Roles):**
- `member`: 조직 멤버
- `admin`: 조직 관리자
- `owner`: 조직 소유자

**팀 역할 (Team Roles):**
- `member`: 팀 멤버
- `lead`: 팀 리더
- `admin`: 팀 관리자

## 🔐 권한 정책

### 역할 기반 접근 제어 (RBAC)

#### 문서 접근 정책
1. **소유자 접근**: 소유자는 항상 자신의 문서에 접근 가능
2. **공개 문서**: 모든 사용자는 `public` 문서를 볼 수 있음
3. **관리자 접근**: 관리자는 모든 문서에 접근 가능
4. **관리자 전용**: 관리자만 `admin_only` 문서를 볼 수 있음

#### 문서 가시성 레벨
- `public`: 모든 사용자가 볼 수 있음
- `private`: 소유자만 볼 수 있음
- `admin_only`: 관리자만 볼 수 있음

### 조직 기반 접근 제어

#### 팀 관리 정책
1. **팀 정보 조회**: 팀 멤버만 팀 정보를 볼 수 있음
2. **멤버십 조회**: 사용자는 자신의 멤버십과 같은 팀의 다른 멤버들을 볼 수 있음
3. **프로젝트 접근**: 팀 멤버만 팀의 프로젝트를 볼 수 있음
4. **프로젝트 생성**: 팀 멤버만 프로젝트를 생성할 수 있음
5. **다중 팀 소속**: 사용자는 여러 팀에 소속될 수 있음

#### 리소스 접근 정책
- `public`: 모든 사용자가 접근 가능
- `private`: 소유자만 접근 가능
- `team`: 팀 멤버만 접근 가능
- `organization`: 조직 멤버만 접근 가능

## 🛠️ 주요 기능

### 자동화 기능

1. **자동 프로필 생성**: 새 사용자 등록 시 자동으로 프로필 생성
2. **타임스탬프 관리**: `updated_at` 필드 자동 업데이트
3. **권한 필터링**: RLS를 통한 자동 권한 필터링

### 유용한 뷰

#### `user_team_memberships`
사용자의 모든 팀 멤버십 정보를 조회
```sql
SELECT * FROM user_team_memberships WHERE user_id = auth.uid();
```

#### `team_members_view`
팀의 모든 멤버 정보를 조회
```sql
SELECT * FROM team_members_view WHERE team_id = 1;
```

#### `organization_members_view`
조직의 모든 멤버 정보를 조회
```sql
SELECT * FROM organization_members_view WHERE organization_id = 1;
```

#### `user_permissions_summary`
사용자별 권한 요약 정보
```sql
SELECT * FROM user_permissions_summary WHERE user_id = auth.uid();
```

### 헬퍼 함수들

#### 권한 확인 함수
- `get_user_global_role(user_id)`: 사용자의 전역 역할 확인
- `is_team_member(user_id, team_id)`: 팀 멤버십 확인
- `is_organization_member(user_id, org_id)`: 조직 멤버십 확인
- `is_admin(user_id)`: 관리자 권한 확인
- `is_team_admin(user_id, team_id)`: 팀 관리자 권한 확인
- `is_organization_admin(user_id, org_id)`: 조직 관리자 권한 확인

#### 관리 함수
- `set_user_as_admin(email)`: 사용자를 관리자로 설정
- `create_team_with_owner(name, org_id, owner_id)`: 팀 생성 및 관리자 설정
- `create_organization_with_owner(name, slug, owner_id)`: 조직 생성 및 소유자 설정
- `get_user_all_permissions(user_id)`: 사용자의 모든 권한 조회

## 🚀 사용 방법

### 1. 초기 설정

#### 관리자 계정 설정
```sql
SELECT set_user_as_admin('admin@example.com');
```

#### 조직 생성
```sql
SELECT create_organization_with_owner('우리회사', 'our-company');
```

#### 팀 생성
```sql
-- 조직에 속한 팀 생성
SELECT create_team_with_owner('개발팀', 1); -- 1은 조직 ID

-- 독립적인 팀 생성
SELECT create_team_with_owner('디자인팀', NULL);
```

### 2. 멤버 관리

#### 팀 멤버 추가
```sql
INSERT INTO team_members (team_id, user_id, role)
VALUES (1, 'user-uuid', 'member');
```

#### 조직 멤버 추가
```sql
INSERT INTO organization_members (organization_id, user_id, role)
VALUES (1, 'user-uuid', 'member');
```

#### 멤버 역할 변경
```sql
UPDATE team_members 
SET role = 'admin' 
WHERE team_id = 1 AND user_id = 'user-uuid';
```

### 3. 콘텐츠 관리

#### 문서 생성
```sql
-- 공개 문서 생성
INSERT INTO documents (title, content, visibility, owner_id) 
VALUES ('공개 문서', '모든 사용자가 볼 수 있습니다', 'public', auth.uid());

-- 비공개 문서 생성
INSERT INTO documents (title, content, visibility, owner_id) 
VALUES ('비공개 문서', '소유자만 볼 수 있습니다', 'private', auth.uid());

-- 관리자 전용 문서 생성
INSERT INTO documents (title, content, visibility, owner_id) 
VALUES ('관리자 문서', '관리자만 볼 수 있습니다', 'admin_only', auth.uid());
```

#### 프로젝트 생성
```sql
INSERT INTO projects (name, description, team_id, visibility, created_by)
VALUES ('새 프로젝트', '프로젝트 설명', 1, 'team', auth.uid());
```

#### 리소스 생성
```sql
INSERT INTO resources (title, content, type, visibility, owner_id, team_id)
VALUES ('팀 문서', '팀 전용 리소스', 'document', 'team', auth.uid(), 1);
```

### 4. 권한 확인

#### 현재 사용자의 모든 권한 확인
```sql
SELECT get_user_all_permissions(auth.uid());
```

#### 사용자가 속한 팀 목록
```sql
SELECT * FROM user_team_memberships WHERE user_id = auth.uid();
```

#### 팀의 모든 멤버 확인
```sql
SELECT * FROM team_members_view WHERE team_id = 1;
```

#### 접근 가능한 문서 목록
```sql
SELECT * FROM documents; -- RLS가 자동으로 필터링
```

#### 접근 가능한 프로젝트 목록
```sql
SELECT * FROM projects; -- RLS가 자동으로 필터링
```

### 5. 고급 쿼리 예시

#### 특정 사용자의 모든 팀과 역할 조회
```sql
SELECT 
    utm.team_name,
    utm.team_role,
    utm.organization_name,
    utm.joined_at
FROM user_team_memberships utm
WHERE utm.user_id = 'specific-user-uuid'
ORDER BY utm.joined_at DESC;
```

#### 팀별 프로젝트 수 통계
```sql
SELECT 
    t.name as team_name,
    COUNT(p.id) as project_count
FROM teams t
LEFT JOIN projects p ON t.id = p.team_id
GROUP BY t.id, t.name
ORDER BY project_count DESC;
```

#### 사용자별 리소스 접근 권한 확인
```sql
SELECT 
    r.title,
    r.type,
    r.visibility,
    CASE 
        WHEN r.owner_id = auth.uid() THEN 'Owner'
        WHEN r.visibility = 'public' THEN 'Public Access'
        WHEN r.visibility = 'team' AND is_team_member(auth.uid(), r.team_id) THEN 'Team Access'
        WHEN r.visibility = 'organization' AND is_organization_member(auth.uid(), r.organization_id) THEN 'Organization Access'
        ELSE 'No Access'
    END as access_type
FROM resources r;
```

## 🔍 문제 해결

### 자주 발생하는 문제들

#### 1. 권한 오류 해결
```sql
-- 사용자의 현재 권한 상태 확인
SELECT 
    p.global_role,
    COUNT(DISTINCT tm.team_id) as team_count,
    COUNT(DISTINCT om.organization_id) as org_count
FROM profiles p
LEFT JOIN team_members tm ON p.id = tm.user_id
LEFT JOIN organization_members om ON p.id = om.user_id
WHERE p.id = auth.uid()
GROUP BY p.id, p.global_role;
```

#### 2. RLS 정책 확인
```sql
-- 특정 테이블의 RLS 정책 확인
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'documents';
```

#### 3. 함수 실행 권한 확인
```sql
-- 함수 실행 가능 여부 확인
SELECT has_function_privilege('public.get_user_all_permissions(uuid)', 'execute');
```

## 📚 참고 자료

### 관련 Supabase 문서
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)
- [Database Functions](https://supabase.com/docs/guides/database/functions)

### 보안 고려사항
1. **최소 권한 원칙**: 사용자에게 필요한 최소한의 권한만 부여
2. **정기적인 권한 검토**: 주기적으로 사용자 권한을 검토하고 조정
3. **감사 로그**: 중요한 작업에 대한 로그 기록 고려
4. **테스트**: 권한 정책 변경 시 충분한 테스트 수행

### 성능 최적화
1. **인덱스 활용**: 자주 쿼리되는 컬럼에 인덱스 추가
2. **뷰 활용**: 복잡한 쿼리는 뷰로 미리 정의
3. **함수 캐싱**: 자주 호출되는 함수의 결과 캐싱 고려

## 🤝 기여하기

이 시스템을 개선하거나 새로운 기능을 추가하려면:

1. 먼저 개발 브랜치에서 테스트
2. 마이그레이션 스크립트 작성
3. 문서 업데이트
4. 테스트 케이스 추가

---

**마지막 업데이트**: 2025년 8월 2일
**버전**: 1.0.0