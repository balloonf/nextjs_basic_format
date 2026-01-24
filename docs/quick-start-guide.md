# 빠른 시작 가이드 - Supabase RBAC 시스템

## 🚀 5분 만에 시작하기

이 가이드는 Supabase RBAC 시스템을 빠르게 설정하고 사용하는 방법을 안내합니다.

## 📋 사전 준비

- Supabase 프로젝트가 설정되어 있어야 함
- Supabase CLI 또는 대시보드 접근 권한

## ⚡ 단계별 설정

### 1단계: 시스템 초기화 (2분)

#### Supabase 대시보드에서:
1. **SQL Editor** 열기
2. 모든 마이그레이션 스크립트를 순서대로 실행
3. RLS(Row Level Security) 활성화 확인

```sql
-- 빠른 확인: 모든 테이블과 정책이 생성되었는지 확인
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'teams', 'documents', 'projects');
```

### 2단계: 첫 번째 관리자 설정 (1분)

```sql
-- 본인을 관리자로 설정 (이메일 주소 변경 필요)
SELECT set_user_as_admin('your-email@example.com');
```

### 3단계: 조직과 팀 생성 (1분)

```sql
-- 조직 생성
SELECT create_organization_with_owner('우리회사', 'our-company');

-- 팀 생성 (위에서 생성된 조직 ID를 사용)
SELECT create_team_with_owner('개발팀', 1);
SELECT create_team_with_owner('디자인팀', 1);
```

### 4단계: 테스트 데이터 생성 (1분)

```sql
-- 테스트 문서 생성
INSERT INTO documents (title, content, visibility, owner_id) VALUES
('공개 가이드', '모든 사용자가 볼 수 있는 문서입니다.', 'public', auth.uid()),
('내 개인 노트', '나만 볼 수 있는 비공개 문서입니다.', 'private', auth.uid()),
('관리자 매뉴얼', '관리자만 볼 수 있는 문서입니다.', 'admin_only', auth.uid());

-- 테스트 프로젝트 생성
INSERT INTO projects (name, description, team_id, visibility, created_by) VALUES
('웹사이트 리뉴얼', '회사 웹사이트 리뉴얼 프로젝트', 1, 'team', auth.uid()),
('모바일 앱 개발', '새로운 모바일 앱 개발', 1, 'organization', auth.uid());
```

## ✅ 설정 완료 확인

### 권한 시스템 테스트

```sql
-- 1. 내 권한 확인
SELECT get_user_all_permissions(auth.uid());

-- 2. 접근 가능한 문서 확인
SELECT title, visibility FROM documents;

-- 3. 내가 속한 팀 확인
SELECT * FROM user_team_memberships WHERE user_id = auth.uid();

-- 4. 접근 가능한 프로젝트 확인
SELECT name, visibility FROM projects;
```

## 🎯 다음 단계

### 팀 멤버 추가하기

```sql
-- 새 사용자를 팀에 추가 (사용자 UUID 필요)
INSERT INTO team_members (team_id, user_id, role)
VALUES (1, 'new-user-uuid', 'member');
```

### 클라이언트 애플리케이션에서 사용하기

```javascript
// Next.js/React 예시
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabase = createClientComponentClient()

// 현재 사용자의 문서 조회 (RLS 자동 적용)
const { data: documents } = await supabase
  .from('documents')
  .select('*')

// 현재 사용자의 팀 멤버십 조회
const { data: teamMemberships } = await supabase
  .from('user_team_memberships')
  .select('*')
  .eq('user_id', user.id)

// 현재 사용자의 모든 권한 조회
const { data: permissions } = await supabase
  .rpc('get_user_all_permissions', { user_id: user.id })
```

## 🔧 자주 사용하는 작업

### 새 팀원 온보딩

```sql
-- 1. 사용자가 이미 가입했다면 팀에 추가
INSERT INTO team_members (team_id, user_id, role)
VALUES (1, 'user-uuid', 'member');

-- 2. 조직에도 추가 (선택사항)
INSERT INTO organization_members (organization_id, user_id, role)
VALUES (1, 'user-uuid', 'member');
```

### 권한 승격

```sql
-- 팀 멤버를 팀 리더로 승격
UPDATE team_members 
SET role = 'lead' 
WHERE team_id = 1 AND user_id = 'user-uuid';

-- 사용자를 전역 관리자로 설정
UPDATE profiles 
SET global_role = 'admin' 
WHERE id = 'user-uuid';
```

### 프로젝트 가시성 변경

```sql
-- 프로젝트를 공개로 변경
UPDATE projects 
SET visibility = 'public' 
WHERE id = 1;
```

## 🚨 주의사항

### 보안 체크리스트

- [ ] 모든 테이블에 RLS가 활성화되어 있는지 확인
- [ ] 관리자 계정이 올바르게 설정되었는지 확인
- [ ] 테스트 환경에서 권한 정책이 올바르게 작동하는지 확인
- [ ] 프로덕션 배포 전 모든 시나리오 테스트

### 자주 하는 실수

1. **RLS 미활성화**: 테이블에 RLS가 활성화되지 않으면 모든 데이터가 노출됨
2. **권한 함수 누락**: 헬퍼 함수들이 제대로 생성되지 않으면 정책이 작동하지 않음
3. **UUID 타입 불일치**: auth.users의 UUID와 다른 테이블의 UUID 타입이 일치해야 함

## 📞 도움이 필요하면

### 문제 해결 순서

1. **RLS 정책 확인**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'your_table_name';
   ```

2. **함수 존재 확인**
   ```sql
   SELECT routine_name FROM information_schema.routines 
   WHERE routine_schema = 'public' AND routine_name LIKE '%user%';
   ```

3. **권한 상태 확인**
   ```sql
   SELECT get_user_all_permissions(auth.uid());
   ```

### 추가 자료

- [상세 가이드](./supabase-rbac-system.md)
- [Supabase 공식 문서](https://supabase.com/docs)
- [RLS 가이드](https://supabase.com/docs/guides/auth/row-level-security)

---

**🎉 축하합니다! 이제 Supabase RBAC 시스템을 사용할 준비가 완료되었습니다.**