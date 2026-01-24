# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint checks

### UI Components
- `npx shadcn@latest add [component]` - Add shadcn/ui components

## Architecture Overview

This is a Next.js 15 application template with Korean language support, featuring Supabase authentication and a dashboard with sidebar navigation.

### Core Architecture Patterns

**Layered Provider System**: Root layout uses ThemeProviderWrapper → AuthProvider. The main dashboard adds ClientProviders → NavigationProvider → SidebarProvider. This creates isolated concerns for theming, auth state, navigation, and sidebar functionality.

**Supabase Authentication**: Uses `@supabase/supabase-js` for auth. The auth flow:
- `src/lib/supabase.ts` - Supabase client singleton
- `src/lib/auth.ts` - Auth helper functions (signIn, signUp, signOut, resetPassword)
- `src/components/providers/context/auth-context.tsx` - AuthProvider with `useAuth()` hook
- `src/components/auth-guard.tsx` - Route protection component

**Dynamic Component Loading**: Uses `src/utils/page-loader.tsx` which maps component names to actual components via a `componentMap` object. This enables dynamic content rendering based on sidebar navigation without traditional routing.

**Cookie-Based Persistence**: Sidebar state (open/closed and width) persists across sessions using cookies.

### Database Schema (Supabase)

Types defined in `src/lib/supabase.ts`:
- `profiles` - User profile data
- `teams` - Team entities with organization reference
- `team_members` - Team membership with roles (member, lead, admin)
- `user_roles` - Global user roles (user, admin, super_admin)

### Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Key Directories & Files

- `src/app/main/layout.tsx` - Main dashboard layout with sidebar integration
- `src/components/app-sidebar.tsx` - Navigation sidebar with collapsible sub-items
- `src/app/permissions/` - Permission and user management components
- `src/components/providers/` - Context providers and client-side wrappers

### Styling & Theming

Uses Tailwind CSS 4 with OKLCH color space. Design system based on shadcn/ui "New York" style with dark/light mode via next-themes. Custom font "Paperlogy" loaded with full weight range.

### State Management

React Context API for navigation and auth state. NavigationContext manages sidebar active states. Cookies persist sidebar preferences.

### Form Handling

React Hook Form + Zod validation integrated.

### Development Notes

- Korean language used throughout UI
- VS Code settings include auto-formatting with Prettier and ESLint
- Tailwind IntelliSense configured for `cn()` function
- TypeScript strict mode enabled
- **IMPORTANT**: Always use context7 when working on this project