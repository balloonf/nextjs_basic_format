import { createClient } from '@supabase/supabase-js'
import { env } from './env'
import type { Database } from './database.types'

// Re-export types from database.types
export type { Database } from './database.types'
export type { Tables, TablesInsert, TablesUpdate, Enums } from './database.types'

// Convenience type aliases
export type GlobalRole = Database['public']['Enums']['global_role']
export type TeamRole = Database['public']['Enums']['team_role']
export type UserStatus = Database['public']['Enums']['user_status']

// Table row types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Organization = Database['public']['Tables']['organizations']['Row']
export type Team = Database['public']['Tables']['teams']['Row']
export type TeamMember = Database['public']['Tables']['team_members']['Row']
export type OrganizationMember = Database['public']['Tables']['organization_members']['Row']

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)