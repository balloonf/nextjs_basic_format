import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  Shield,
  SquareTerminal,
} from 'lucide-react'
import type { NavMainItem, NavProject, NavTeam } from '@/types'

// ============================================
// 팀 데이터
// ============================================

export const DEFAULT_TEAMS: NavTeam[] = [
  {
    name: 'Acme Inc',
    logo: GalleryVerticalEnd,
    plan: 'Enterprise',
  },
  {
    name: 'Acme Corp.',
    logo: AudioWaveform,
    plan: 'Startup',
  },
  {
    name: 'Evil Corp.',
    logo: Command,
    plan: 'Free',
  },
]

// ============================================
// 메인 네비게이션 데이터
// ============================================

export const NAV_MAIN_ITEMS: NavMainItem[] = [
  {
    title: 'Playground',
    url: '#',
    icon: SquareTerminal,
    isActive: true,
    items: [
      {
        title: 'History',
        url: 'sample',
      },
      {
        title: 'Starred',
        url: 'starred',
      },
      {
        title: 'Settings',
        url: 'playground-settings',
      },
    ],
  },
  {
    title: 'Models',
    url: '#',
    icon: Bot,
    items: [
      {
        title: 'Genesis',
        url: 'genesis',
      },
      {
        title: 'Explorer',
        url: 'explorer',
      },
      {
        title: 'Quantum',
        url: 'quantum',
      },
    ],
  },
  {
    title: 'Documentation',
    url: '#',
    icon: BookOpen,
    items: [
      {
        title: 'Introduction',
        url: 'intro',
      },
      {
        title: 'Get Started',
        url: 'get-started',
      },
      {
        title: 'Tutorials',
        url: 'tutorials',
      },
      {
        title: 'Changelog',
        url: 'changelog',
      },
    ],
  },
  {
    title: 'Settings',
    url: '#',
    icon: Settings2,
    items: [
      {
        title: 'General',
        url: 'general-settings',
      },
      {
        title: 'Team',
        url: 'team-settings',
      },
      {
        title: 'Billing',
        url: 'billing',
      },
      {
        title: 'Limits',
        url: 'limits',
      },
    ],
  },
  {
    title: '권한 관리',
    url: '#',
    icon: Shield,
    items: [
      {
        title: '팀 권한',
        url: 'permission-management',
      },
      {
        title: '사용자 관리',
        url: 'user-management',
      },
      {
        title: '역할 설정',
        url: 'role-settings',
      },
    ],
  },
]

// ============================================
// 프로젝트 네비게이션 데이터
// ============================================

export const NAV_PROJECTS: NavProject[] = [
  {
    name: 'Design Engineering',
    url: '#',
    icon: Frame,
  },
  {
    name: 'Sales & Marketing',
    url: '#',
    icon: PieChart,
  },
  {
    name: 'Travel',
    url: '#',
    icon: Map,
  },
]

// ============================================
// 네비게이션 유틸리티 함수
// ============================================

/**
 * URL로 네비게이션 아이템 찾기
 */
export function findNavItemByUrl(url: string): NavMainItem | undefined {
  return NAV_MAIN_ITEMS.find(
    (item) =>
      item.url === url || item.items?.some((subItem) => subItem.url === url)
  )
}

/**
 * 초기 활성 네비게이션 아이템 가져오기
 */
export function getInitialActiveItem(): NavMainItem | undefined {
  return NAV_MAIN_ITEMS.find((item) => item.isActive)
}
