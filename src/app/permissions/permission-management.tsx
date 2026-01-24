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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Users, Shield, Settings, Plus, Trash2 } from 'lucide-react'
import type { Team, TeamMember, UserProfile, GlobalRole, TeamRole } from '@/types'
import { getRoleBadgeVariant, getRoleIcon, getRoleDisplayName } from '@/lib/utils/role'
import { formatDate } from '@/lib/utils/date'
import { handleDatabaseError, showSuccess, logError } from '@/lib/utils/error'
import { generateMockTeams, generateMockUsers, generateMockTeamMembers } from '@/lib/mock-data'

export default function PermissionManagement() {
  const { user } = useAuth()
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [users, setUsers] = useState<UserProfile[]>([])
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      fetchTeams()
      fetchUsers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const fetchTeams = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) {
        logError('팀 목록 조회', error)
        setTeams(generateMockTeams())
      } else {
        setTeams(data || [])
      }
    } catch (error) {
      logError('팀 목록 조회', error)
      setTeams(generateMockTeams())
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (profilesError) {
        logError('사용자 역할 조회', profilesError)
        setUsers(generateMockUsers(user?.id, user?.email))
        return
      }

      if (profiles && profiles.length > 0) {
        const usersWithRoles: UserProfile[] = profiles.map(profile => ({
          id: profile.id,
          email: profile.email,
          global_role: profile.global_role,
          created_at: profile.created_at,
        }))
        setUsers(usersWithRoles)
      } else {
        setUsers(generateMockUsers(user?.id, user?.email))
      }
    } catch (error) {
      logError('사용자 목록 조회', error)
      setUsers(generateMockUsers(user?.id, user?.email))
    }
  }

  const fetchTeamMembers = async (teamId: number) => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          *,
          profiles:user_id (
            id,
            username,
            full_name
          )
        `)
        .eq('team_id', teamId)

      if (error) {
        logError('팀 멤버 조회', error)
        setTeamMembers(generateMockTeamMembers(teamId, user?.id, user?.email))
        return
      }

      if (data && data.length > 0) {
        const membersWithEmails: TeamMember[] = data.map(member => ({
          ...member,
          email: `user-${member.user_id.slice(0, 8)}@example.com`,
        }))
        setTeamMembers(membersWithEmails)
      } else {
        setTeamMembers(generateMockTeamMembers(teamId, user?.id, user?.email))
      }
    } catch (error) {
      logError('팀 멤버 조회', error)
      setTeamMembers(generateMockTeamMembers(teamId, user?.id, user?.email))
    }
  }

  const handleTeamSelect = (team: Team) => {
    setSelectedTeam(team)
    fetchTeamMembers(team.id)
  }

  const handleAddMember = async () => {
    if (!selectedTeam || !newMemberEmail || !user) return

    try {
      const { error } = await supabase
        .from('team_members')
        .insert({
          team_id: selectedTeam.id,
          user_id: user.id,
          role: 'member'
        })

      if (error) {
        handleDatabaseError(error, '멤버 추가에 실패했습니다.')
        return
      }

      setNewMemberEmail('')
      fetchTeamMembers(selectedTeam.id)
      showSuccess('멤버가 성공적으로 추가되었습니다.')
    } catch (error) {
      logError('멤버 추가', error)
      handleDatabaseError(null, '멤버 추가에 실패했습니다.')
    }
  }

  const handleRoleChange = async (userId: string, newRole: TeamRole) => {
    if (!selectedTeam) return

    try {
      const { error } = await supabase
        .from('team_members')
        .update({ role: newRole })
        .eq('team_id', selectedTeam.id)
        .eq('user_id', userId)

      if (error) {
        handleDatabaseError(error)
        return
      }

      fetchTeamMembers(selectedTeam.id)
      showSuccess('역할이 변경되었습니다.')
    } catch (error) {
      logError('역할 변경', error)
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (!selectedTeam) return

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', selectedTeam.id)
        .eq('user_id', userId)

      if (error) {
        handleDatabaseError(error)
        return
      }

      fetchTeamMembers(selectedTeam.id)
      showSuccess('멤버가 제거되었습니다.')
    } catch (error) {
      logError('멤버 제거', error)
    }
  }

  const handleGlobalRoleChange = async (userId: string, newRole: GlobalRole) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ global_role: newRole })
        .eq('id', userId)

      if (error) {
        handleDatabaseError(error)
        return
      }

      fetchUsers()
      showSuccess('역할이 변경되었습니다.')
    } catch (error) {
      logError('글로벌 역할 변경', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">권한 관리</h1>
          <p className="text-muted-foreground">팀 멤버와 권한을 관리합니다</p>
        </div>
      </div>

      <Tabs defaultValue="teams" className="space-y-4">
        <TabsList>
          <TabsTrigger value="teams" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            팀 관리
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            사용자 권한
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            권한 설정
          </TabsTrigger>
        </TabsList>

        <TabsContent value="teams" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 팀 목록 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  팀 목록
                </CardTitle>
                <CardDescription>관리할 팀을 선택하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {loading && <div className="p-3 text-center text-muted-foreground">로딩 중...</div>}
                  {!loading && teams.length === 0 && (
                    <div className="p-3 text-center text-muted-foreground">
                      팀이 없습니다.
                    </div>
                  )}
                  {teams.map((team) => (
                    <div
                      key={team.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedTeam?.id === team.id
                          ? 'bg-primary/10 border-primary'
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => handleTeamSelect(team)}
                    >
                      <div className="font-medium">{team.name}</div>
                      <div className="text-sm text-muted-foreground">
                        생성일: {formatDate(team.created_at)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 팀 멤버 관리 */}
            <div className="lg:col-span-2">
              {selectedTeam ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      {selectedTeam.name} 멤버 관리
                    </CardTitle>
                    <CardDescription>팀 멤버의 역할을 관리합니다</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* 새 멤버 추가 */}
                    <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                      <Label htmlFor="new-member" className="text-sm font-medium">
                        새 멤버 추가
                      </Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          id="new-member"
                          type="email"
                          placeholder="이메일 주소"
                          value={newMemberEmail}
                          onChange={(e) => setNewMemberEmail(e.target.value)}
                        />
                        <Button onClick={handleAddMember} disabled={!newMemberEmail}>
                          <Plus className="w-4 h-4 mr-2" />
                          추가
                        </Button>
                      </div>
                    </div>

                    {/* 멤버 목록 */}
                    <div className="space-y-3">
                      {teamMembers.map((member) => {
                        const RoleIcon = getRoleIcon(member.role)
                        return (
                          <div
                            key={member.user_id}
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div className="space-y-1">
                              <div className="font-medium">{member.email}</div>
                              <div className="text-sm text-muted-foreground">
                                {formatDate(member.joined_at)}에 가입
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Select
                                value={member.role}
                                onValueChange={(value) => handleRoleChange(member.user_id, value as TeamRole)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="member">멤버</SelectItem>
                                  <SelectItem value="lead">리더</SelectItem>
                                  <SelectItem value="admin">관리자</SelectItem>
                                </SelectContent>
                              </Select>

                              <Badge variant={getRoleBadgeVariant(member.role)} className="flex items-center gap-1">
                                {RoleIcon && <RoleIcon className="w-3 h-3" />}
                                {getRoleDisplayName(member.role)}
                              </Badge>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>멤버 제거</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {member.email}를 팀에서 제거하시겠습니까?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>취소</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleRemoveMember(member.user_id)}
                                    >
                                      제거
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-64">
                    <div className="text-center text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>팀을 선택하여 멤버를 관리하세요</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                전체 사용자 권한
              </CardTitle>
              <CardDescription>시스템 전체 사용자의 글로벌 권한을 관리합니다</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {users.map((userData) => {
                  const RoleIcon = getRoleIcon(userData.global_role)
                  return (
                    <div
                      key={userData.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <div className="font-medium">{userData.email}</div>
                        <div className="text-sm text-muted-foreground">
                          가입일: {formatDate(userData.created_at)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Select
                          value={userData.global_role}
                          onValueChange={(value) => handleGlobalRoleChange(userData.id, value as GlobalRole)}
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">일반 사용자</SelectItem>
                            <SelectItem value="admin">관리자</SelectItem>
                            <SelectItem value="super_admin">슈퍼 관리자</SelectItem>
                          </SelectContent>
                        </Select>

                        <Badge variant={getRoleBadgeVariant(userData.global_role)} className="flex items-center gap-1">
                          {RoleIcon && <RoleIcon className="w-3 h-3" />}
                          {getRoleDisplayName(userData.global_role)}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  권한 설정
                </CardTitle>
                <CardDescription>시스템 권한 정책을 설정합니다</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="default-role">기본 사용자 역할</Label>
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
                  <Label htmlFor="team-creation">팀 생성 권한</Label>
                  <Select defaultValue="admin">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">모든 사용자</SelectItem>
                      <SelectItem value="admin">관리자만</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full">설정 저장</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>권한 매트릭스</CardTitle>
                <CardDescription>각 역할별 권한을 확인하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span>팀 생성</span>
                    <div className="flex gap-2">
                      <Badge variant="secondary">사용자: ❌</Badge>
                      <Badge variant="default">관리자: ✅</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span>멤버 초대</span>
                    <div className="flex gap-2">
                      <Badge variant="secondary">리더: ✅</Badge>
                      <Badge variant="default">관리자: ✅</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span>시스템 설정</span>
                    <div className="flex gap-2">
                      <Badge variant="destructive">슈퍼 관리자: ✅</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
