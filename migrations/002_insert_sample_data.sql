-- 권한 관리 시스템 샘플 데이터 삽입

-- 더미 사용자 생성 (실제 환경에서는 auth.users에 실제 사용자가 있어야 함)
-- 이 부분은 Supabase Auth를 통해 실제 사용자를 생성한 후 사용해야 합니다.

-- 샘플 팀 데이터
INSERT INTO public.teams (name, organization_id) VALUES
  ('프론트엔드팀', 1),
  ('백엔드팀', 1),
  ('DevOps팀', 1),
  ('QA팀', 1),
  ('UI/UX팀', 2),
  ('마케팅팀', 2),
  ('영업팀', 2)
ON CONFLICT DO NOTHING;

-- 실제 사용자 UUID를 사용한 샘플 데이터
-- 주의: 이 UUID들은 실제 auth.users 테이블에 존재하는 사용자여야 합니다
-- 실제 환경에서는 아래 UUID를 실제 사용자 ID로 교체해야 합니다

-- 샘플 사용자 역할 (실제 사용자 ID로 교체 필요)
-- INSERT INTO public.user_roles (user_id, global_role) VALUES
--   ('00000000-0000-0000-0000-000000000001', 'super_admin'),
--   ('00000000-0000-0000-0000-000000000002', 'admin'),
--   ('00000000-0000-0000-0000-000000000003', 'user'),
--   ('00000000-0000-0000-0000-000000000004', 'user'),
--   ('00000000-0000-0000-0000-000000000005', 'user'),
--   ('00000000-0000-0000-0000-000000000006', 'user'),
--   ('00000000-0000-0000-0000-000000000007', 'user'),
--   ('00000000-0000-0000-0000-000000000008', 'user')
-- ON CONFLICT (user_id) DO NOTHING;

-- 샘플 팀 멤버십 (실제 사용자 ID로 교체 필요)
-- INSERT INTO public.team_members (team_id, user_id, role) VALUES
--   -- 프론트엔드팀 (team_id: 1)
--   (1, '00000000-0000-0000-0000-000000000002', 'admin'),
--   (1, '00000000-0000-0000-0000-000000000003', 'lead'),
--   (1, '00000000-0000-0000-0000-000000000004', 'member'),
--   (1, '00000000-0000-0000-0000-000000000005', 'member'),
--   
--   -- 백엔드팀 (team_id: 2)
--   (2, '00000000-0000-0000-0000-000000000002', 'admin'),
--   (2, '00000000-0000-0000-0000-000000000006', 'lead'),
--   (2, '00000000-0000-0000-0000-000000000007', 'member'),
--   
--   -- DevOps팀 (team_id: 3)
--   (3, '00000000-0000-0000-0000-000000000002', 'admin'),
--   (3, '00000000-0000-0000-0000-000000000008', 'lead'),
--   
--   -- QA팀 (team_id: 4)
--   (4, '00000000-0000-0000-0000-000000000003', 'admin'),
--   (4, '00000000-0000-0000-0000-000000000005', 'member'),
--   (4, '00000000-0000-0000-0000-000000000007', 'member'),
--   
--   -- UI/UX팀 (team_id: 5)
--   (5, '00000000-0000-0000-0000-000000000004', 'admin'),
--   (5, '00000000-0000-0000-0000-000000000006', 'member'),
--   
--   -- 마케팅팀 (team_id: 6)
--   (6, '00000000-0000-0000-0000-000000000005', 'admin'),
--   (6, '00000000-0000-0000-0000-000000000008', 'member'),
--   
--   -- 영업팀 (team_id: 7)
--   (7, '00000000-0000-0000-0000-000000000007', 'admin'),
--   (7, '00000000-0000-0000-0000-000000000008', 'member')
-- ON CONFLICT (team_id, user_id) DO NOTHING;

-- 실제 사용자를 위한 샘플 데이터 생성 함수
CREATE OR REPLACE FUNCTION public.create_sample_data_for_existing_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
  team_count INTEGER;
  random_team_id INTEGER;
  random_role TEXT;
BEGIN
  -- 기존 사용자들에 대해 샘플 데이터 생성
  FOR user_record IN 
    SELECT id FROM auth.users 
    WHERE id NOT IN (SELECT user_id FROM public.user_roles)
    LIMIT 10
  LOOP
    -- 사용자 역할이 없다면 기본 역할 부여
    INSERT INTO public.user_roles (user_id, global_role)
    VALUES (user_record.id, 'user')
    ON CONFLICT (user_id) DO NOTHING;
    
    -- 팀 수 확인
    SELECT COUNT(*) INTO team_count FROM public.teams;
    
    IF team_count > 0 THEN
      -- 랜덤 팀에 사용자 추가 (1-3개 팀)
      FOR i IN 1..(1 + FLOOR(RANDOM() * 3))::INTEGER LOOP
        -- 랜덤 팀 선택
        SELECT id INTO random_team_id 
        FROM public.teams 
        ORDER BY RANDOM() 
        LIMIT 1;
        
        -- 랜덤 역할 선택
        SELECT CASE 
          WHEN RANDOM() < 0.1 THEN 'admin'
          WHEN RANDOM() < 0.3 THEN 'lead'
          ELSE 'member'
        END INTO random_role;
        
        -- 팀 멤버 추가 (중복 방지)
        INSERT INTO public.team_members (team_id, user_id, role)
        VALUES (random_team_id, user_record.id, random_role)
        ON CONFLICT (team_id, user_id) DO NOTHING;
      END LOOP;
    END IF;
  END LOOP;
  
  RAISE NOTICE '샘플 데이터 생성이 완료되었습니다.';
END;
$$;

-- 함수 실행
SELECT public.create_sample_data_for_existing_users();

-- 추가 샘플 팀 생성
INSERT INTO public.teams (name, organization_id) VALUES
  ('보안팀', 1),
  ('데이터팀', 1),
  ('인프라팀', 1),
  ('고객지원팀', 2),
  ('HR팀', 2),
  ('재무팀', 2)
ON CONFLICT DO NOTHING;

-- 팀 통계 뷰 생성 (선택사항)
CREATE OR REPLACE VIEW public.team_stats AS
SELECT 
  t.id,
  t.name,
  t.organization_id,
  COUNT(tm.user_id) as member_count,
  COUNT(CASE WHEN tm.role = 'admin' THEN 1 END) as admin_count,
  COUNT(CASE WHEN tm.role = 'lead' THEN 1 END) as lead_count,
  COUNT(CASE WHEN tm.role = 'member' THEN 1 END) as member_count_regular,
  t.created_at
FROM public.teams t
LEFT JOIN public.team_members tm ON t.id = tm.team_id
GROUP BY t.id, t.name, t.organization_id, t.created_at
ORDER BY t.created_at;

-- 사용자 권한 통계 뷰 생성 (선택사항)
CREATE OR REPLACE VIEW public.user_permission_stats AS
SELECT 
  ur.global_role,
  COUNT(*) as user_count
FROM public.user_roles ur
GROUP BY ur.global_role
ORDER BY 
  CASE ur.global_role 
    WHEN 'super_admin' THEN 1
    WHEN 'admin' THEN 2
    WHEN 'user' THEN 3
  END;