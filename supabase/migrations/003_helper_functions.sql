-- ============================================
-- 헬퍼 함수들
-- ============================================

-- ============================================
-- 1. 현재 사용자의 전역 역할 조회
-- ============================================

CREATE OR REPLACE FUNCTION get_my_global_role()
RETURNS global_role AS $$
  SELECT global_role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- 2. 사용자가 특정 팀의 멤버인지 확인
-- ============================================

CREATE OR REPLACE FUNCTION is_team_member(p_team_id INTEGER)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM team_members
    WHERE team_id = p_team_id
    AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- 3. 사용자의 팀 내 역할 조회
-- ============================================

CREATE OR REPLACE FUNCTION get_team_role(p_team_id INTEGER)
RETURNS team_role AS $$
  SELECT role FROM team_members
  WHERE team_id = p_team_id
  AND user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- 4. 사용자가 특정 조직의 멤버인지 확인
-- ============================================

CREATE OR REPLACE FUNCTION is_org_member(p_org_id INTEGER)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = p_org_id
    AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- 5. 사용자가 admin 이상인지 확인
-- ============================================

CREATE OR REPLACE FUNCTION is_admin_or_higher()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND global_role IN ('admin', 'super_admin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- 6. 사용자가 super_admin인지 확인
-- ============================================

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND global_role = 'super_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- 7. 사용자의 모든 팀 멤버십 조회
-- ============================================

CREATE OR REPLACE FUNCTION get_my_team_memberships()
RETURNS TABLE (
  team_id INTEGER,
  team_name TEXT,
  role team_role,
  joined_at TIMESTAMPTZ
) AS $$
  SELECT
    tm.team_id,
    t.name as team_name,
    tm.role,
    tm.joined_at
  FROM team_members tm
  JOIN teams t ON t.id = tm.team_id
  WHERE tm.user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- 8. 사용자의 모든 조직 멤버십 조회
-- ============================================

CREATE OR REPLACE FUNCTION get_my_org_memberships()
RETURNS TABLE (
  organization_id INTEGER,
  organization_name TEXT,
  role team_role,
  joined_at TIMESTAMPTZ
) AS $$
  SELECT
    om.organization_id,
    o.name as organization_name,
    om.role,
    om.joined_at
  FROM organization_members om
  JOIN organizations o ON o.id = om.organization_id
  WHERE om.user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- 9. 팀 멤버 목록 조회 (이메일, 이름 포함)
-- ============================================

CREATE OR REPLACE FUNCTION get_team_members_detail(p_team_id INTEGER)
RETURNS TABLE (
  id INTEGER,
  user_id UUID,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role team_role,
  joined_at TIMESTAMPTZ,
  last_active TIMESTAMPTZ
) AS $$
  SELECT
    tm.id,
    tm.user_id,
    p.email,
    p.full_name,
    p.avatar_url,
    tm.role,
    tm.joined_at,
    tm.last_active
  FROM team_members tm
  JOIN profiles p ON p.id = tm.user_id
  WHERE tm.team_id = p_team_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- 10. 사용자 통계 조회 (admin 전용)
-- ============================================

CREATE OR REPLACE FUNCTION get_user_stats()
RETURNS TABLE (
  total_users BIGINT,
  active_users BIGINT,
  admin_users BIGINT,
  new_users_this_month BIGINT
) AS $$
  SELECT
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE status = 'active') as active_users,
    COUNT(*) FILTER (WHERE global_role IN ('admin', 'super_admin')) as admin_users,
    COUNT(*) FILTER (WHERE created_at >= date_trunc('month', NOW())) as new_users_this_month
  FROM profiles;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- 11. 사용자 역할 변경 (admin 전용)
-- ============================================

CREATE OR REPLACE FUNCTION update_user_role(
  p_user_id UUID,
  p_new_role global_role
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_user_role global_role;
BEGIN
  -- 현재 사용자의 역할 확인
  SELECT global_role INTO v_current_user_role
  FROM profiles WHERE id = auth.uid();

  -- super_admin만 역할 변경 가능
  IF v_current_user_role != 'super_admin' THEN
    RAISE EXCEPTION 'Only super_admin can change user roles';
  END IF;

  -- 본인의 역할은 변경 불가
  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot change your own role';
  END IF;

  UPDATE profiles SET global_role = p_new_role WHERE id = p_user_id;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 12. 사용자 상태 변경 (admin 전용)
-- ============================================

CREATE OR REPLACE FUNCTION update_user_status(
  p_user_id UUID,
  p_new_status user_status
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_user_role global_role;
BEGIN
  -- 현재 사용자의 역할 확인
  SELECT global_role INTO v_current_user_role
  FROM profiles WHERE id = auth.uid();

  -- admin 이상만 상태 변경 가능
  IF v_current_user_role NOT IN ('admin', 'super_admin') THEN
    RAISE EXCEPTION 'Only admin can change user status';
  END IF;

  -- 본인의 상태는 변경 불가
  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot change your own status';
  END IF;

  UPDATE profiles SET status = p_new_status WHERE id = p_user_id;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
