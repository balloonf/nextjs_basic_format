## 🔄 업데이트 및 유지보수

### 시스템 업데이트 절차

#### 1. 백업 생성
```sql
-- 중요 데이터 백업
pg_dump -h your-host -U your-user -d your-db --data-only > backup_data.sql
pg_dump -h your-host -U your-user -d your-db --schema-only > backup_schema.sql
```

#### 2. 새 기능 추가 마이그레이션
```sql
-- 예: 새로운 권한 레벨 추가
ALTER TYPE access_level ADD VALUE 'team_only';

-- 새 컬럼 추가
ALTER TABLE documents ADD COLUMN team_id BIGINT REFERENCES teams(id);

-- 새 정책 추가
CREATE POLICY "team_members_can_view_team_documents" ON documents
    FOR SELECT USING (
        access_level = 'team_only' AND 
        team_id IS NOT NULL AND 
        is_team_member(auth.uid(), team_id)
    );
```

#### 3. 정책 수정
```sql
-- 기존 정책 교체
DROP POLICY IF EXISTS "old_policy_name" ON table_name;
CREATE POLICY "new_policy_name" ON table_name
    FOR operation USING (condition);
```

### 성능 최적화

#### 인덱스 추가
```sql
-- 자주 쿼리되는 컬럼에 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_documents_owner_id ON documents(owner_id);
CREATE INDEX IF NOT EXISTS idx_documents_visibility ON documents(visibility);
CREATE INDEX IF NOT EXISTS idx_team_members_user_team ON team_members(user_id, team_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_user_org ON organization_members(user_id, organization_id);

-- 복합 인덱스
CREATE INDEX IF NOT EXISTS idx_documents_owner_visibility ON documents(owner_id, visibility);
CREATE INDEX IF NOT EXISTS idx_projects_team_visibility ON projects(team_id, visibility);
```

#### 함수 최적화
```sql
-- 자주 사용되는 함수의 성능 개선
CREATE OR REPLACE FUNCTION is_team_member_optimized(user_id UUID, team_id BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
    -- 캐시된 결과 사용 (Redis 등과 연동 시)
    RETURN EXISTS (
        SELECT 1 
        FROM team_members 
        WHERE user_id = $1 AND team_id = $2
        LIMIT 1  -- 성능 최적화
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
```

### 모니터링 및 로깅

#### 감사 로그 테이블 추가
```sql
CREATE TABLE audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id TEXT,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 감사 로그 RLS 정책
CREATE POLICY "admins_can_view_audit_logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND global_role IN ('admin', 'super_admin')
        )
    );
```

#### 감사 트리거 함수
```sql
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values)
        VALUES (auth.uid(), 'DELETE', TG_TABLE_NAME, OLD.id::TEXT, to_jsonb(OLD));
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values)
        VALUES (auth.uid(), 'UPDATE', TG_TABLE_NAME, NEW.id::TEXT, to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values)
        VALUES (auth.uid(), 'INSERT', TG_TABLE_NAME, NEW.id::TEXT, to_jsonb(NEW));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 주요 테이블에 감사 트리거 추가
CREATE TRIGGER audit_documents
    AFTER INSERT OR UPDATE OR DELETE ON documents
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_team_members
    AFTER INSERT OR UPDATE OR DELETE ON team_members
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
```

## 🧪 테스트 스크립트

### 기능 테스트
```sql
-- 테스트 함수 생성
CREATE OR REPLACE FUNCTION test_rbac_system()
RETURNS TABLE(test_name TEXT, passed BOOLEAN, message TEXT) AS $$
BEGIN
    -- 테스트 1: 관리자 권한 확인
    RETURN QUERY
    SELECT 
        'Admin Permission Test'::TEXT,
        is_admin('admin-user-uuid'),
        'Admin should have admin privileges'::TEXT;
    
    -- 테스트 2: 팀 멤버십 확인
    RETURN QUERY
    SELECT 
        'Team Membership Test'::TEXT,
        is_team_member('user-uuid', 1::BIGINT),
        'User should be team member'::TEXT;
    
    -- 테스트 3: 문서 접근 권한 확인
    RETURN QUERY
    SELECT 
        'Document Access Test'::TEXT,
        EXISTS(SELECT 1 FROM documents WHERE visibility = 'public'),
        'Public documents should be accessible'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- 테스트 실행
SELECT * FROM test_rbac_system();
```

### 성능 테스트
```sql
-- 쿼리 성능 측정
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM documents WHERE owner_id = 'user-uuid';

EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM user_team_memberships WHERE user_id = 'user-uuid';
```

## 📈 확장 가능한 기능들

### 1. 시간 기반 권한
```sql
-- 임시 권한 테이블
CREATE TABLE temporary_permissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT NOT NULL,
    permission_type TEXT NOT NULL,
    granted_by UUID REFERENCES auth.users(id),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 임시 권한 확인 함수
CREATE OR REPLACE FUNCTION has_temporary_permission(
    user_id UUID, 
    resource_type TEXT, 
    resource_id TEXT, 
    permission_type TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM temporary_permissions
        WHERE user_id = $1 
        AND resource_type = $2 
        AND resource_id = $3 
        AND permission_type = $4
        AND expires_at > NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2. 세밀한 권한 제어
```sql
-- 권한 매트릭스 테이블
CREATE TABLE permission_matrix (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    role_type TEXT NOT NULL, -- 'global', 'team', 'organization'
    role_value TEXT NOT NULL, -- 'admin', 'member', etc.
    resource_type TEXT NOT NULL, -- 'document', 'project', etc.
    action TEXT NOT NULL, -- 'create', 'read', 'update', 'delete'
    allowed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 기본 권한 매트릭스 데이터
INSERT INTO permission_matrix (role_type, role_value, resource_type, action, allowed) VALUES
('global', 'admin', 'document', 'create', true),
('global', 'admin', 'document', 'read', true),
('global', 'admin', 'document', 'update', true),
('global', 'admin', 'document', 'delete', true),
('team', 'member', 'project', 'read', true),
('team', 'admin', 'project', 'create', true),
('team', 'admin', 'project', 'update', true),
('team', 'admin', 'project', 'delete', true);
```

### 3. 리소스 상속 권한
```sql
-- 상위-하위 리소스 관계 테이블
CREATE TABLE resource_hierarchy (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    parent_type TEXT NOT NULL,
    parent_id TEXT NOT NULL,
    child_type TEXT NOT NULL,
    child_id TEXT NOT NULL,
    inherit_permissions BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(parent_type, parent_id, child_type, child_id)
);

-- 상속 권한 확인 함수
CREATE OR REPLACE FUNCTION has_inherited_permission(
    user_id UUID,
    resource_type TEXT,
    resource_id TEXT,
    action TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    parent_record RECORD;
BEGIN
    -- 직접 권한이 있는지 먼저 확인
    -- ... 기존 권한 확인 로직 ...
    
    -- 상위 리소스에서 상속된 권한 확인
    FOR parent_record IN 
        SELECT parent_type, parent_id 
        FROM resource_hierarchy 
        WHERE child_type = resource_type 
        AND child_id = resource_id 
        AND inherit_permissions = true
    LOOP
        -- 재귀적으로 상위 권한 확인
        IF has_inherited_permission(user_id, parent_record.parent_type, parent_record.parent_id, action) THEN
            RETURN TRUE;
        END IF;
    END LOOP;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 🔐 보안 강화

### 1. 접근 시도 로깅
```sql
CREATE TABLE access_attempts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID,
    resource_type TEXT NOT NULL,
    resource_id TEXT NOT NULL,
    action TEXT NOT NULL,
    success BOOLEAN NOT NULL,
    ip_address INET,
    user_agent TEXT,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 접근 시도 로깅 함수
CREATE OR REPLACE FUNCTION log_access_attempt(
    user_id UUID,
    resource_type TEXT,
    resource_id TEXT,
    action TEXT,
    success BOOLEAN,
    error_message TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO access_attempts (
        user_id, resource_type, resource_id, action, 
        success, ip_address, user_agent, error_message
    ) VALUES (
        user_id, resource_type, resource_id, action,
        success, inet_client_addr(), current_setting('request.headers')::json->>'user-agent', error_message
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2. 비정상 활동 감지
```sql
-- 의심스러운 활동 감지 함수
CREATE OR REPLACE FUNCTION detect_suspicious_activity(user_id UUID)
RETURNS TABLE(alert_type TEXT, message TEXT, severity TEXT) AS $$
BEGIN
    -- 짧은 시간 내 많은 실패한 접근 시도
    RETURN QUERY
    SELECT 
        'MULTIPLE_FAILED_ATTEMPTS'::TEXT,
        'Multiple failed access attempts in the last hour'::TEXT,
        'HIGH'::TEXT
    WHERE (
        SELECT COUNT(*) 
        FROM access_attempts 
        WHERE user_id = $1 
        AND success = FALSE 
        AND created_at > NOW() - INTERVAL '1 hour'
    ) > 10;
    
    -- 비정상적인 시간대 접근
    RETURN QUERY
    SELECT 
        'UNUSUAL_HOUR_ACCESS'::TEXT,
        'Access during unusual hours'::TEXT,
        'MEDIUM'::TEXT
    WHERE EXTRACT(HOUR FROM NOW()) BETWEEN 2 AND 5
    AND EXISTS (
        SELECT 1 
        FROM access_attempts 
        WHERE user_id = $1 
        AND created_at > NOW() - INTERVAL '15 minutes'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 📊 보고서 및 분석

### 사용자 활동 보고서
```sql
CREATE OR REPLACE VIEW user_activity_report AS
SELECT 
    p.id as user_id,
    COALESCE(u.email, 'Unknown') as email,
    p.global_role,
    COUNT(DISTINCT tm.team_id) as team_count,
    COUNT(DISTINCT d.id) as document_count,
    COUNT(DISTINCT pr.id) as project_count,
    MAX(aa.created_at) as last_activity
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
LEFT JOIN team_members tm ON p.id = tm.user_id
LEFT JOIN documents d ON p.id = d.owner_id
LEFT JOIN projects pr ON p.id = pr.created_by
LEFT JOIN access_attempts aa ON p.id = aa.user_id
GROUP BY p.id, u.email, p.global_role;
```

### 권한 사용 통계
```sql
CREATE OR REPLACE VIEW permission_usage_stats AS
SELECT 
    resource_type,
    action,
    COUNT(*) as attempt_count,
    COUNT(*) FILTER (WHERE success = true) as success_count,
    ROUND(
        COUNT(*) FILTER (WHERE success = true) * 100.0 / COUNT(*), 
        2
    ) as success_rate,
    DATE_TRUNC('day', created_at) as date
FROM access_attempts
GROUP BY resource_type, action, DATE_TRUNC('day', created_at)
ORDER BY date DESC, attempt_count DESC;
```

## 🚀 배포 가이드

### 프로덕션 배포 체크리스트

#### 사전 점검
- [ ] 모든 테스트 통과 확인
- [ ] 백업 계획 수립
- [ ] 롤백 계획 준비
- [ ] 성능 테스트 완료
- [ ] 보안 검토 완료

#### 배포 순서
1. **유지보수 모드 활성화**
2. **데이터베이스 백업**
3. **마이그레이션 실행**
4. **기능 테스트**
5. **유지보수 모드 해제**

#### 배포 후 확인
- [ ] 모든 기능 정상 작동 확인
- [ ] 성능 모니터링 시작
- [ ] 오류 로그 확인
- [ ] 사용자 피드백 수집

### 환경별 설정

#### 개발 환경
```sql
-- 개발 환경용 설정
UPDATE profiles SET global_role = 'admin' 
WHERE id IN (SELECT id FROM auth.users WHERE email LIKE '%@dev.company.com');

-- 테스트 데이터 생성
SELECT create_organization_with_owner('Test Company', 'test-company');
SELECT create_team_with_owner('Test Team', 1);
```

#### 스테이징 환경
```sql
-- 스테이징 환경용 설정
-- 프로덕션과 동일한 권한 구조 유지
-- 단, 테스트 계정들에 대해서만 특별 권한 부여
```

#### 프로덕션 환경
```sql
-- 프로덕션 환경 초기 설정
-- 첫 번째 관리자만 설정하고 나머지는 UI를 통해 관리
SELECT set_user_as_admin('초기관리자@company.com');
```

---

**마이그레이션과 시스템 유지보수를 위한 모든 도구와 가이드가 준비되었습니다!**

이 문서를 참고하여 안전하고 효율적으로 시스템을 관리하세요.