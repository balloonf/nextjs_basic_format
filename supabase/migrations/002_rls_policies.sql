-- ============================================
-- ROW LEVEL SECURITY (RLS) 정책
-- ============================================

-- ============================================
-- 1. PROFILES 테이블 RLS
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 모든 인증된 사용자가 프로필 목록 조회 가능
CREATE POLICY "profiles_select_authenticated"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- 본인 프로필만 수정 가능
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- admin, super_admin은 모든 프로필 수정 가능
CREATE POLICY "profiles_update_admin"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND global_role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- 2. ORGANIZATIONS 테이블 RLS
-- ============================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- 인증된 사용자가 조직 목록 조회 가능
CREATE POLICY "organizations_select_authenticated"
  ON organizations FOR SELECT
  TO authenticated
  USING (true);

-- 조직 생성은 인증된 사용자 누구나 가능
CREATE POLICY "organizations_insert_authenticated"
  ON organizations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 조직 소유자 또는 admin만 수정 가능
CREATE POLICY "organizations_update_owner_or_admin"
  ON organizations FOR UPDATE
  TO authenticated
  USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = organizations.id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND global_role IN ('admin', 'super_admin')
    )
  );

-- 조직 삭제는 소유자 또는 super_admin만 가능
CREATE POLICY "organizations_delete_owner_or_superadmin"
  ON organizations FOR DELETE
  TO authenticated
  USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND global_role = 'super_admin'
    )
  );

-- ============================================
-- 3. TEAMS 테이블 RLS
-- ============================================

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- 조직 멤버만 팀 목록 조회 가능
CREATE POLICY "teams_select_org_member"
  ON teams FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = teams.organization_id
      AND user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND global_role IN ('admin', 'super_admin')
    )
  );

-- 조직 admin만 팀 생성 가능
CREATE POLICY "teams_insert_org_admin"
  ON teams FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = teams.organization_id
      AND user_id = auth.uid()
      AND role IN ('admin', 'lead')
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND global_role IN ('admin', 'super_admin')
    )
  );

-- 팀 admin만 팀 수정 가능
CREATE POLICY "teams_update_team_admin"
  ON teams FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_id = teams.id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = teams.organization_id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND global_role IN ('admin', 'super_admin')
    )
  );

-- 팀 삭제
CREATE POLICY "teams_delete_org_admin"
  ON teams FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = teams.organization_id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND global_role = 'super_admin'
    )
  );

-- ============================================
-- 4. TEAM_MEMBERS 테이블 RLS
-- ============================================

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- 같은 팀 멤버만 조회 가능
CREATE POLICY "team_members_select_same_team"
  ON team_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND global_role IN ('admin', 'super_admin')
    )
  );

-- 팀 admin/lead만 멤버 추가 가능
CREATE POLICY "team_members_insert_team_admin"
  ON team_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_id = team_members.team_id
      AND user_id = auth.uid()
      AND role IN ('admin', 'lead')
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND global_role IN ('admin', 'super_admin')
    )
  );

-- 팀 admin만 멤버 역할 수정 가능
CREATE POLICY "team_members_update_team_admin"
  ON team_members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
      AND tm.role = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND global_role IN ('admin', 'super_admin')
    )
  );

-- 팀 admin만 멤버 삭제 가능 (본인 탈퇴는 허용)
CREATE POLICY "team_members_delete"
  ON team_members FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
      AND tm.role = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND global_role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- 5. ORGANIZATION_MEMBERS 테이블 RLS
-- ============================================

ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- 같은 조직 멤버만 조회 가능
CREATE POLICY "org_members_select_same_org"
  ON organization_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organization_members.organization_id
      AND om.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND global_role IN ('admin', 'super_admin')
    )
  );

-- 조직 admin만 멤버 추가 가능
CREATE POLICY "org_members_insert_org_admin"
  ON organization_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = organization_members.organization_id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM organizations
      WHERE id = organization_members.organization_id
      AND owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND global_role IN ('admin', 'super_admin')
    )
  );

-- 조직 admin만 멤버 역할 수정 가능
CREATE POLICY "org_members_update_org_admin"
  ON organization_members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organization_members.organization_id
      AND om.user_id = auth.uid()
      AND om.role = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND global_role IN ('admin', 'super_admin')
    )
  );

-- 조직 admin만 멤버 삭제 가능 (본인 탈퇴는 허용)
CREATE POLICY "org_members_delete"
  ON organization_members FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organization_members.organization_id
      AND om.user_id = auth.uid()
      AND om.role = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND global_role IN ('admin', 'super_admin')
    )
  );
