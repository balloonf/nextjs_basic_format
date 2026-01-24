"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Users, Plus, Trash2, Mail, Calendar, Search } from 'lucide-react'
import type { TeamRole } from '@/types'
import { getRoleBadgeVariant, getRoleIcon, getRoleDisplayName } from '@/lib/utils/role'
import { formatDate, formatRelativeTime } from '@/lib/utils/date'
import { logError } from '@/lib/utils/error'

interface TeamMember {
  user_id: string
  email: string
  name?: string
  avatar_url?: string
  team_role: TeamRole
  joined_at: string
  last_active?: string
}

interface TeamMemberManagerProps {
  teamId: number
  teamName: string
  canManage?: boolean
}

export default function TeamMemberManager({ teamId, teamName, canManage = true }: TeamMemberManagerProps) {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(false)
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [newMemberRole, setNewMemberRole] = useState<TeamRole>('member')
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  useEffect(() => {
    fetchMembers()
  }, [teamId])

  const fetchMembers = async () => {
    setLoading(true)
    try {
      // API 호출 시뮬레이션
      const mockMembers: TeamMember[] = [
        {
          user_id: '1',
          email: 'admin@example.com',
          name: '김관리자',
          team_role: 'admin',
          joined_at: '2024-01-15T00:00:00Z',
          last_active: '2024-03-15T10:30:00Z'
        },
        {
          user_id: '2',
          email: 'leader@example.com',
          name: '이팀장',
          team_role: 'lead',
          joined_at: '2024-01-20T00:00:00Z',
          last_active: '2024-03-14T15:45:00Z'
        },
        {
          user_id: '3',
          email: 'member1@example.com',
          name: '박멤버',
          team_role: 'member',
          joined_at: '2024-02-01T00:00:00Z',
          last_active: '2024-03-13T09:20:00Z'
        },
        {
          user_id: '4',
          email: 'member2@example.com',
          name: '최개발자',
          team_role: 'member',
          joined_at: '2024-02-15T00:00:00Z',
          last_active: '2024-03-12T14:15:00Z'
        }
      ]
      setMembers(mockMembers)
    } catch (error) {
      logError('팀 멤버 조회', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMember = async () => {
    if (!newMemberEmail) return

    try {
      // API 호출 시뮬레이션
      logError('새 멤버 추가', {
        teamId,
        email: newMemberEmail,
        role: newMemberRole
      })

      setNewMemberEmail('')
      setNewMemberRole('member')
      setIsAddDialogOpen(false)
      fetchMembers()
    } catch (error) {
      logError('멤버 추가', error)
    }
  }

  const handleRoleChange = async (userId: string, newRole: TeamRole) => {
    try {
      // API 호출 시뮬레이션
      setMembers(prev =>
        prev.map(m =>
          m.user_id === userId ? { ...m, team_role: newRole } : m
        )
      )
    } catch (error) {
      logError('역할 변경', error)
    }
  }

  const handleRemoveMember = async (userId: string) => {
    try {
      // API 호출 시뮬레이션
      setMembers(prev => prev.filter(m => m.user_id !== userId))
    } catch (error) {
      logError('멤버 제거', error)
    }
  }

  const filteredMembers = members.filter(member =>
    member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {teamName} 팀 멤버
            </CardTitle>
            <CardDescription>
              총 {members.length}명의 팀 멤버가 있습니다
            </CardDescription>
          </div>

          {canManage && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  멤버 추가
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>새 팀 멤버 추가</DialogTitle>
                  <DialogDescription>
                    새로운 멤버를 {teamName} 팀에 초대합니다
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="member-email">이메일 주소</Label>
                    <Input
                      id="member-email"
                      type="email"
                      placeholder="member@example.com"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="member-role">역할</Label>
                    <Select value={newMemberRole} onValueChange={(value) => setNewMemberRole(value as TeamRole)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">멤버</SelectItem>
                        <SelectItem value="lead">리더</SelectItem>
                        <SelectItem value="admin">관리자</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    취소
                  </Button>
                  <Button onClick={handleAddMember} disabled={!newMemberEmail}>
                    초대 보내기
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* 검색 */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="멤버 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* 멤버 목록 */}
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">로딩 중...</div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMembers.map((member) => {
              const RoleIcon = getRoleIcon(member.team_role)
              return (
                <div
                  key={member.user_id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.avatar_url} />
                      <AvatarFallback>
                        {member.name ? member.name[0] : member.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {member.name || member.email}
                        </span>
                        <Badge variant={getRoleBadgeVariant(member.team_role)} className="flex items-center gap-1">
                          {RoleIcon && <RoleIcon className="w-3 h-3" />}
                          {getRoleDisplayName(member.team_role)}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {member.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(member.joined_at)} 가입
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        마지막 활동: {formatRelativeTime(member.last_active)}
                      </div>
                    </div>
                  </div>

                  {canManage && (
                    <div className="flex items-center gap-2">
                      <Select
                        value={member.team_role}
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

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>멤버 제거</AlertDialogTitle>
                            <AlertDialogDescription>
                              <strong>{member.name || member.email}</strong>를 팀에서 제거하시겠습니까?
                              이 작업은 되돌릴 수 없습니다.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>취소</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemoveMember(member.user_id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              제거
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              )
            })}

            {filteredMembers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? '검색 결과가 없습니다' : '팀 멤버가 없습니다'}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
