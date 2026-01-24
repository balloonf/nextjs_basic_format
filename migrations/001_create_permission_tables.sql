-- 권한 관리를 위한 데이터베이스 테이블 생성 및 RLS 정책 설정

-- teams 테이블 생성
CREATE TABLE IF NOT EXISTS public.teams (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  organization_id BIGINT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- team_members 테이블 생성
CREATE TABLE IF NOT EXISTS public.team_members (
  id BIGSERIAL PRIMARY KEY,
  team_id BIGINT NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'lead', 'admin')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(team_id, user_id)
);

-- user_roles 테이블 생성
CREATE TABLE IF NOT EXISTS public.user_roles (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  global_role TEXT NOT NULL DEFAULT 'user' CHECK (global_role IN ('user', 'admin', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

-- RLS 활성화
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- teams 테이블 RLS 정책
CREATE POLICY "Teams are viewable by authenticated users"
  ON public.teams FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Team creation restricted to admins"
  ON public.teams FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND global_role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Team management restricted to team admins and global admins"
  ON public.teams FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND global_role IN ('admin', 'super_admin')
    )
    OR
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = teams.id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Team deletion restricted to global admins"
  ON public.teams FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND global_role IN ('admin', 'super_admin')
    )
  );

-- team_members 테이블 RLS 정책
CREATE POLICY "Team members are viewable by team members"
  ON public.team_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND global_role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Team member management restricted to team leads/admins and global admins"
  ON public.team_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = team_members.team_id
      AND user_id = auth.uid()
      AND role IN ('lead', 'admin')
    )
    OR
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND global_role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Team member role changes restricted to team admins and global admins"
  ON public.team_members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = team_members.team_id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND global_role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Team member removal restricted to team admins and global admins"
  ON public.team_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = team_members.team_id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND global_role IN ('admin', 'super_admin')
    )
    OR
    user_id = auth.uid() -- 사용자는 자신을 팀에서 제거할 수 있음
  );

-- user_roles 테이블 RLS 정책
CREATE POLICY "User roles are viewable by admins and users can see their own"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.global_role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Global role management restricted to super admins"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND global_role = 'super_admin'
    )
  );

CREATE POLICY "Global role changes restricted to super admins"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND global_role = 'super_admin'
    )
  );

CREATE POLICY "Global role deletion restricted to super admins"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND global_role = 'super_admin'
    )
  );

-- 첫 번째 사용자를 super_admin으로 설정하는 트리거 함수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- 총 사용자 수 확인
  SELECT COUNT(*) INTO user_count FROM auth.users;
  
  -- 첫 번째 사용자라면 super_admin으로 설정
  IF user_count = 1 THEN
    INSERT INTO public.user_roles (user_id, global_role)
    VALUES (NEW.id, 'super_admin');
  ELSE
    -- 기본적으로 user 역할 부여
    INSERT INTO public.user_roles (user_id, global_role)
    VALUES (NEW.id, 'user');
  END IF;
  
  RETURN NEW;
END;
$$;

-- 새 사용자 생성 시 자동으로 user_roles에 추가하는 트리거
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_teams_organization_id ON public.teams(organization_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_global_role ON public.user_roles(global_role);

-- 샘플 데이터 생성 (개발용)
INSERT INTO public.teams (name, organization_id) VALUES
  ('개발팀', 1),
  ('디자인팀', 1),
  ('마케팅팀', 1)
ON CONFLICT DO NOTHING;