-- ============================================
-- 전체 데이터베이스 설정 스크립트
-- Supabase SQL Editor에서 실행하세요
-- ============================================

-- ============================================
-- 1. ENUMS 생성
-- ============================================

DO $$ BEGIN
  CREATE TYPE global_role AS ENUM ('user', 'admin', 'super_admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE team_role AS ENUM ('member', 'lead', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- 2. PROFILES 테이블
-- ============================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  global_role global_role NOT NULL DEFAULT 'user',
  status user_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_sign_in TIMESTAMPTZ,
  email_confirmed BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_global_role ON profiles(global_role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);

-- ============================================
-- 3. ORGANIZATIONS 테이블
-- ============================================

CREATE TABLE IF NOT EXISTS organizations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_owner ON organizations(owner_id);

-- ============================================
-- 4. TEAMS 테이블
-- ============================================

CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, name)
);

CREATE INDEX IF NOT EXISTS idx_teams_organization ON teams(organization_id);

-- ============================================
-- 5. TEAM_MEMBERS 테이블
-- ============================================

CREATE TABLE IF NOT EXISTS team_members (
  id SERIAL PRIMARY KEY,
  team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role team_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active TIMESTAMPTZ,
  UNIQUE(team_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_role ON team_members(role);

-- ============================================
-- 6. ORGANIZATION_MEMBERS 테이블
-- ============================================

CREATE TABLE IF NOT EXISTS organization_members (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role team_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_members_org ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);

-- ============================================
-- 7. UPDATED_AT 트리거 함수
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. 새 사용자 가입 시 프로필 자동 생성
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url, email_confirmed)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email_confirmed_at IS NOT NULL
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    email_confirmed = NEW.email_confirmed_at IS NOT NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 9. RLS 정책
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- Profiles 정책
DROP POLICY IF EXISTS "profiles_select_authenticated" ON profiles;
CREATE POLICY "profiles_select_authenticated"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_admin" ON profiles;
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

-- Organizations 정책
DROP POLICY IF EXISTS "organizations_select_authenticated" ON organizations;
CREATE POLICY "organizations_select_authenticated"
  ON organizations FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "organizations_insert_authenticated" ON organizations;
CREATE POLICY "organizations_insert_authenticated"
  ON organizations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Teams 정책
DROP POLICY IF EXISTS "teams_select_authenticated" ON teams;
CREATE POLICY "teams_select_authenticated"
  ON teams FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "teams_insert_authenticated" ON teams;
CREATE POLICY "teams_insert_authenticated"
  ON teams FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Team Members 정책
DROP POLICY IF EXISTS "team_members_select_authenticated" ON team_members;
CREATE POLICY "team_members_select_authenticated"
  ON team_members FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "team_members_insert_authenticated" ON team_members;
CREATE POLICY "team_members_insert_authenticated"
  ON team_members FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "team_members_update_authenticated" ON team_members;
CREATE POLICY "team_members_update_authenticated"
  ON team_members FOR UPDATE
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "team_members_delete_authenticated" ON team_members;
CREATE POLICY "team_members_delete_authenticated"
  ON team_members FOR DELETE
  TO authenticated
  USING (true);

-- Organization Members 정책
DROP POLICY IF EXISTS "org_members_select_authenticated" ON organization_members;
CREATE POLICY "org_members_select_authenticated"
  ON organization_members FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- 10. 헬퍼 함수들
-- ============================================

CREATE OR REPLACE FUNCTION get_my_global_role()
RETURNS global_role AS $$
  SELECT global_role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_admin_or_higher()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND global_role IN ('admin', 'super_admin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

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
-- 11. 기존 사용자 프로필 생성 (이미 가입한 사용자용)
-- ============================================

INSERT INTO profiles (id, email, email_confirmed)
SELECT
  id,
  email,
  email_confirmed_at IS NOT NULL
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 12. 샘플 데이터 (선택사항)
-- ============================================

-- 샘플 조직
INSERT INTO organizations (name, slug, description)
VALUES ('기본 조직', 'default-org', '기본 조직입니다')
ON CONFLICT (slug) DO NOTHING;

-- 샘플 팀
INSERT INTO teams (name, description, organization_id)
SELECT '프론트엔드팀', '프론트엔드 개발팀', id FROM organizations WHERE slug = 'default-org'
ON CONFLICT DO NOTHING;

INSERT INTO teams (name, description, organization_id)
SELECT '백엔드팀', '백엔드 개발팀', id FROM organizations WHERE slug = 'default-org'
ON CONFLICT DO NOTHING;

INSERT INTO teams (name, description, organization_id)
SELECT 'DevOps팀', 'DevOps 팀', id FROM organizations WHERE slug = 'default-org'
ON CONFLICT DO NOTHING;

SELECT 'Database setup completed!' as message;
