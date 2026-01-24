"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/providers/context/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, UserPlus, Shield, Settings, Search, Mail, Calendar, Activity, Trash2 } from 'lucide-react'
import type { UserProfile, UserStats, TeamMembership, GlobalRole, UserStatus } from '@/types'
import { getRoleBadgeVariant, getRoleIcon, getRoleDisplayName, getStatusBadgeVariant, getStatusDisplayName } from '@/lib/utils/role'
import { formatDateTime } from '@/lib/utils/date'
import { handleDatabaseError, showSuccess, logError } from '@/lib/utils/error'
import { generateMockUsers, generateMockUserTeams } from '@/lib/mock-data'

export default function UserManagement() {
  const { user } = useAuth()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [userTeams, setUserTeams] = useState<TeamMembership[]>([])
  const [userStats, setUserStats] = useState<UserStats>({
    total_users: 0,
    active_users: 0,
    admin_users: 0,
    new_users_this_month: 0
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserRole, setNewUserRole] = useState<GlobalRole>('user')
  const [loading, setLoading] = useState(false)
  const [inviteLoading, setInviteLoading] = useState(false)

  useEffect(() => {
    if (user) {
      fetchUsers()
      fetchUserStats()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      // profiles 테이블에서 사용자 목록 조회
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (profilesError) {
        logError('사용자 목록 조회', profilesError)
        // 테이블이 없거나 에러 발생 시 mock 데이터 사용
        const mockUsers = generateMockUsers(user?.id, user?.email)
        setUsers(mockUsers)
      } else if (profiles && profiles.length > 0) {
        const usersWithDetails: UserProfile[] = profiles.map(profile => ({
          id: profile.id,
          email: profile.email,
          username: profile.username,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          global_role: profile.global_role as GlobalRole,
          status: (profile.status || 'active') as UserStatus,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
          last_sign_in: profile.last_sign_in,
          email_confirmed: profile.email_confirmed
        }))
        setUsers(usersWithDetails)
      } else {
        // 데이터가 없으면 mock 데이터 사용
        setUsers(generateMockUsers(user?.id, user?.email))
      }
    } catch (error) {
      logError('사용자 목록 조회', error)
      setUsers(generateMockUsers(user?.id, user?.email))
    } finally {
      setLoading(false)
    }
  }

  const fetchUserStats = async () => {
    try {
      // Supabase 함수 호출 시도
      const { data, error } = await supabase.rpc('get_user_stats')

      if (error) {
        logError('사용자 통계 조회', error)
        // 함수가 없으면 직접 쿼리
        const { data: profiles } = await supabase
          .from('profiles')
          .select('global_role, status, created_at')

        if (profiles) {
          const now = new Date()
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

          setUserStats({
            total_users: profiles.length,
            active_users: profiles.filter(p => p.status === 'active').length,
            admin_users: profiles.filter(p => ['admin', 'super_admin'].includes(p.global_role)).length,
            new_users_this_month: profiles.filter(p => new Date(p.created_at) >= monthStart).length
          })
        } else {
          // 기본값
          setUserStats({
            total_users: users.length || 0,
            active_users: users.filter(u => u.status === 'active').length || 0,
            admin_users: users.filter(u => ['admin', 'super_admin'].includes(u.global_role)).length || 0,
            new_users_this_month: 0
          })
        }
      } else if (data && data.length > 0) {
        setUserStats({
          total_users: Number(data[0].total_users) || 0,
          active_users: Number(data[0].active_users) || 0,
          admin_users: Number(data[0].admin_users) || 0,
          new_users_this_month: Number(data[0].new_users_this_month) || 0
        })
      }
    } catch (error) {
      logError('사용자 통계 조회', error)
    }
  }

  const fetchUserTeams = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          team_id,
          role,
          joined_at,
          teams:team_id (
            name
          )
        `)
        .eq('user_id', userId)

      if (error) {
        logError('팀 멤버십 조회', error)
        setUserTeams(generateMockUserTeams(userId))
      } else if (data && data.length > 0) {
        const teams = data.map(item => {
          const teamData = item.teams as unknown as { name: string } | null
          return {
            team_id: item.team_id,
            team_name: teamData?.name || '알 수 없는 팀',
            role: item.role,
            joined_at: item.joined_at
          }
        })
        setUserTeams(teams)
      } else {
        setUserTeams([])
      }
    } catch (error) {
      logError('팀 멤버십 조회', error)
      setUserTeams(generateMockUserTeams(userId))
    }
  }

  const handleUserSelect = (selectedUser: UserProfile) => {
    setSelectedUser(selectedUser)
    fetchUserTeams(selectedUser.id)
  }

  const handleInviteUser = async () => {
    if (!newUserEmail) return

    setInviteLoading(true)
    try {
      // Supabase Admin API를 사용하여 사용자 초대
      // 참고: 실제 초대 기능은 서버 사이드에서 Admin API로 처리해야 합니다
      // 여기서는 UI 데모용으로 로컬 상태만 업데이트합니다

      const newUser: UserProfile = {
        id: `invited-${Date.now()}`,
        email: newUserEmail,
        global_role: newUserRole,
        created_at: new Date().toISOString(),
        email_confirmed: false,
        status: 'inactive'
      }

      setUsers(prev => [...prev, newUser])
      setNewUserEmail('')
      setNewUserRole('user')
      showSuccess('사용자 초대가 완료되었습니다. (데모: 실제 이메일은 발송되지 않습니다)')

      // 통계 업데이트
      fetchUserStats()
    } catch (error) {
      logError('사용자 초대', error)
      handleDatabaseError(null, '사용자 초대에 실패했습니다.')
    } finally {
      setInviteLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (userId === user?.id) {
      showSuccess('자신의 계정은 삭제할 수 없습니다.')
      return
    }

    try {
      // 실제로는 Admin API를 통해 사용자를 삭제해야 합니다
      // 여기서는 상태만 suspended로 변경
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'suspended' })
        .eq('id', userId)

      if (error) {
        logError('사용자 삭제', error)
        handleDatabaseError(error, '사용자 삭제에 실패했습니다.')
        return
      }

      setUsers(prev => prev.filter(u => u.id !== userId))
      if (selectedUser?.id === userId) {
        setSelectedUser(null)
      }
      showSuccess('사용자가 삭제되었습니다.')
      fetchUserStats()
    } catch (error) {
      logError('사용자 삭제', error)
    }
  }

  const handleRoleChange = async (userId: string, newRole: GlobalRole) => {
    try {
      // profiles 테이블에서 역할 업데이트
      const { error } = await supabase
        .from('profiles')
        .update({ global_role: newRole })
        .eq('id', userId)

      if (error) {
        logError('역할 변경', error)
        handleDatabaseError(error, '역할 변경에 실패했습니다.')
        return
      }

      setUsers(prev =>
        prev.map(u =>
          u.id === userId
            ? { ...u, global_role: newRole }
            : u
        )
      )

      if (selectedUser?.id === userId) {
        setSelectedUser(prev =>
          prev ? { ...prev, global_role: newRole } : null
        )
      }

      showSuccess('역할이 변경되었습니다.')
    } catch (error) {
      logError('역할 변경', error)
    }
  }

  const handleUserStatusChange = async (userId: string, newStatus: UserStatus) => {
    try {
      // profiles 테이블에서 상태 업데이트
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', userId)

      if (error) {
        logError('사용자 상태 변경', error)
        handleDatabaseError(error, '상태 변경에 실패했습니다.')
        return
      }

      setUsers(prev =>
        prev.map(u =>
          u.id === userId
            ? { ...u, status: newStatus }
            : u
        )
      )

      if (selectedUser?.id === userId) {
        setSelectedUser(prev =>
          prev ? { ...prev, status: newStatus } : null
        )
      }

      showSuccess('상태가 변경되었습니다.')
    } catch (error) {
      logError('사용자 상태 변경', error)
    }
  }

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">사용자 관리</h1>
          <p className="text-muted-foreground">시스템 사용자를 관리하고 권한을 설정합니다</p>
        </div>
        <Button onClick={() => fetchUsers()} variant="outline">
          <Activity className="w-4 h-4 mr-2" />
          새로고침
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 사용자</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.total_users}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 사용자</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.active_users}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">관리자</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.admin_users}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">이달의 신규</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.new_users_this_month}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            사용자 목록
          </TabsTrigger>
          <TabsTrigger value="invite" className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            사용자 초대
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            설정
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 사용자 목록 */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    사용자 목록
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="이메일로 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  {loading && <div className="p-4 text-center text-muted-foreground">로딩 중...</div>}
                  <div className="space-y-3">
                    {filteredUsers.map((userData) => {
                      const RoleIcon = getRoleIcon(userData.global_role)
                      return (
                        <div
                          key={userData.id}
                          className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                            selectedUser?.id === userData.id
                              ? 'bg-primary/10 border-primary'
                              : 'hover:bg-muted'
                          }`}
                          onClick={() => handleUserSelect(userData)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium">{userData.email}</span>
                                {!userData.email_confirmed && (
                                  <Badge variant="outline" className="text-xs">미인증</Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                <Calendar className="w-3 h-3 inline mr-1" />
                                가입: {formatDateTime(userData.created_at)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                마지막 접속: {formatDateTime(userData.last_sign_in)}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge variant={getRoleBadgeVariant(userData.global_role)} className="flex items-center gap-1">
                                {RoleIcon && <RoleIcon className="w-3 h-3" />}
                                {getRoleDisplayName(userData.global_role)}
                              </Badge>
                              <Badge variant={getStatusBadgeVariant(userData.status || 'active')}>
                                {getStatusDisplayName(userData.status || 'active')}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 사용자 상세 정보 */}
            <div>
              {selectedUser ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      사용자 상세
                    </CardTitle>
                    <CardDescription>{selectedUser.email}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="user-role">글로벌 역할</Label>
                      <Select
                        value={selectedUser.global_role}
                        onValueChange={(value) => handleRoleChange(selectedUser.id, value as GlobalRole)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">일반 사용자</SelectItem>
                          <SelectItem value="admin">관리자</SelectItem>
                          <SelectItem value="super_admin">슈퍼 관리자</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="user-status">계정 상태</Label>
                      <Select
                        value={selectedUser.status || 'active'}
                        onValueChange={(value) => handleUserStatusChange(selectedUser.id, value as UserStatus)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">활성</SelectItem>
                          <SelectItem value="inactive">비활성</SelectItem>
                          <SelectItem value="suspended">정지</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>팀 멤버십</Label>
                      <div className="space-y-2 mt-2">
                        {userTeams.length > 0 ? (
                          userTeams.map((team, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                              <span className="text-sm">{team.team_name}</span>
                              <Badge variant="outline">{getRoleDisplayName(team.role)}</Badge>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">팀에 속하지 않음</p>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <Label>계정 정보</Label>
                      <div className="space-y-2 mt-2 text-sm">
                        <div>ID: <code className="text-xs break-all">{selectedUser.id}</code></div>
                        <div>생성일: {formatDateTime(selectedUser.created_at)}</div>
                        <div>이메일 인증: {selectedUser.email_confirmed ? '완료' : '미완료'}</div>
                      </div>
                    </div>

                    {selectedUser.id !== user?.id && (
                      <div className="pt-4 border-t">
                        <Button
                          variant="destructive"
                          className="w-full"
                          onClick={() => handleDeleteUser(selectedUser.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          사용자 삭제
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-64">
                    <div className="text-center text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>사용자를 선택하여 상세 정보를 확인하세요</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="invite" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                새 사용자 초대
              </CardTitle>
              <CardDescription>이메일을 통해 새 사용자를 시스템에 초대합니다</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="invite-email">이메일 주소</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="user@example.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="invite-role">초기 권한</Label>
                <Select value={newUserRole} onValueChange={(value) => setNewUserRole(value as GlobalRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">일반 사용자</SelectItem>
                    <SelectItem value="admin">관리자</SelectItem>
                    <SelectItem value="super_admin">슈퍼 관리자</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleInviteUser}
                disabled={!newUserEmail || inviteLoading}
                className="w-full"
              >
                {inviteLoading ? '초대 중...' : '초대 보내기'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                사용자 관리 설정
              </CardTitle>
              <CardDescription>사용자 관리 시스템의 전역 설정을 관리합니다</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="default-role">새 사용자 기본 역할</Label>
                <Select defaultValue="user">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">일반 사용자</SelectItem>
                    <SelectItem value="admin">관리자</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="email-verification">이메일 인증 필수</Label>
                <Select defaultValue="required">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="required">필수</SelectItem>
                    <SelectItem value="optional">선택사항</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="session-timeout">세션 타임아웃 (시간)</Label>
                <Select defaultValue="24">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1시간</SelectItem>
                    <SelectItem value="8">8시간</SelectItem>
                    <SelectItem value="24">24시간</SelectItem>
                    <SelectItem value="168">1주일</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full">설정 저장</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
