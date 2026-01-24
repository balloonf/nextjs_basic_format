import {
  supabase,
  Database,
  GlobalRole,
  TeamRole,
  UserStatus,
  Profile,
  Team,
  TeamMember,
} from './supabase'

// ============================================
// Profile Queries
// ============================================

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

export async function getCurrentProfile() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  return getProfile(user.id)
}

export async function updateProfile(
  userId: string,
  updates: Database['public']['Tables']['profiles']['Update']
) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getAllProfiles(options?: {
  status?: UserStatus
  role?: GlobalRole
  limit?: number
  offset?: number
}) {
  let query = supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (options?.status) {
    query = query.eq('status', options.status)
  }
  if (options?.role) {
    query = query.eq('global_role', options.role)
  }
  if (options?.limit) {
    query = query.limit(options.limit)
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  const { data, error, count } = await query

  if (error) throw error
  return { data, count }
}

// ============================================
// Organization Queries
// ============================================

export async function getOrganizations() {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getOrganization(id: number) {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createOrganization(
  org: Database['public']['Tables']['organizations']['Insert']
) {
  const { data, error } = await supabase
    .from('organizations')
    .insert(org)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateOrganization(
  id: number,
  updates: Database['public']['Tables']['organizations']['Update']
) {
  const { data, error } = await supabase
    .from('organizations')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteOrganization(id: number) {
  const { error } = await supabase
    .from('organizations')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ============================================
// Team Queries
// ============================================

export async function getTeams(organizationId?: number) {
  let query = supabase
    .from('teams')
    .select('*, organization:organizations(*)')
    .order('created_at', { ascending: false })

  if (organizationId) {
    query = query.eq('organization_id', organizationId)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function getTeam(id: number) {
  const { data, error } = await supabase
    .from('teams')
    .select('*, organization:organizations(*)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createTeam(
  team: Database['public']['Tables']['teams']['Insert']
) {
  const { data, error } = await supabase
    .from('teams')
    .insert(team)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateTeam(
  id: number,
  updates: Database['public']['Tables']['teams']['Update']
) {
  const { data, error } = await supabase
    .from('teams')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteTeam(id: number) {
  const { error } = await supabase
    .from('teams')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ============================================
// Team Member Queries
// ============================================

export async function getTeamMembers(teamId: number) {
  const { data, error } = await supabase
    .from('team_members')
    .select('*, profile:profiles(*)')
    .eq('team_id', teamId)
    .order('joined_at', { ascending: false })

  if (error) throw error
  return data
}

export async function addTeamMember(
  teamId: number,
  userId: string,
  role: TeamRole = 'member'
) {
  const { data, error } = await supabase
    .from('team_members')
    .insert({ team_id: teamId, user_id: userId, role })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateTeamMemberRole(
  teamId: number,
  userId: string,
  role: TeamRole
) {
  const { data, error } = await supabase
    .from('team_members')
    .update({ role })
    .eq('team_id', teamId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function removeTeamMember(teamId: number, userId: string) {
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('team_id', teamId)
    .eq('user_id', userId)

  if (error) throw error
}

export async function getMyTeams() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('team_members')
    .select('*, team:teams(*, organization:organizations(*))')
    .eq('user_id', user.id)
    .order('joined_at', { ascending: false })

  if (error) throw error
  return data
}

// ============================================
// Organization Member Queries
// ============================================

export async function getOrganizationMembers(organizationId: number) {
  const { data, error } = await supabase
    .from('organization_members')
    .select('*, profile:profiles(*)')
    .eq('organization_id', organizationId)
    .order('joined_at', { ascending: false })

  if (error) throw error
  return data
}

export async function addOrganizationMember(
  organizationId: number,
  userId: string,
  role: TeamRole = 'member'
) {
  const { data, error } = await supabase
    .from('organization_members')
    .insert({ organization_id: organizationId, user_id: userId, role })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getMyOrganizations() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('organization_members')
    .select('*, organization:organizations(*)')
    .eq('user_id', user.id)
    .order('joined_at', { ascending: false })

  if (error) throw error
  return data
}

// ============================================
// RPC Functions (Database Functions)
// ============================================

export async function getMyGlobalRole() {
  const { data, error } = await supabase.rpc('get_my_global_role')
  if (error) throw error
  return data as GlobalRole
}

export async function isAdminOrHigher() {
  const { data, error } = await supabase.rpc('is_admin_or_higher')
  if (error) throw error
  return data as boolean
}

export async function getUserStats() {
  const { data, error } = await supabase.rpc('get_user_stats')
  if (error) throw error
  return data as {
    total_users: number
    active_users: number
    admin_users: number
    new_users_this_month: number
  }[]
}

export async function updateUserRole(userId: string, newRole: GlobalRole) {
  const { error } = await supabase
    .from('profiles')
    .update({ global_role: newRole, updated_at: new Date().toISOString() })
    .eq('id', userId)
  if (error) throw error
  return true
}

export async function updateUserStatus(userId: string, newStatus: UserStatus) {
  const { error } = await supabase
    .from('profiles')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', userId)
  if (error) throw error
  return true
}

// ============================================
// Realtime Subscriptions
// ============================================

export function subscribeToProfiles(
  callback: (payload: { new: Profile; old: Profile }) => void
) {
  return supabase
    .channel('profiles-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'profiles' },
      (payload) => callback(payload as unknown as { new: Profile; old: Profile })
    )
    .subscribe()
}

export function subscribeToTeams(
  callback: (payload: { new: Team; old: Team }) => void
) {
  return supabase
    .channel('teams-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'teams' },
      (payload) => callback(payload as unknown as { new: Team; old: Team })
    )
    .subscribe()
}

export function subscribeToTeamMembers(
  teamId: number,
  callback: (payload: { new: TeamMember; old: TeamMember }) => void
) {
  return supabase
    .channel(`team-${teamId}-members`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'team_members',
        filter: `team_id=eq.${teamId}`,
      },
      (payload) => callback(payload as unknown as { new: TeamMember; old: TeamMember })
    )
    .subscribe()
}
