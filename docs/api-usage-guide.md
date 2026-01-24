    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error creating document:', error)
    return { data: null, error }
  }
}

// 문서 업데이트
export async function updateDocument(id, updates) {
  try {
    const { data, error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error updating document:', error)
    return { data: null, error }
  }
}

// 문서 삭제
export async function deleteDocument(id) {
  try {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error deleting document:', error)
    return { error }
  }
}
```

## 👥 팀 관리

### 팀 목록 조회

```javascript
// hooks/useTeams.js
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useTeams() {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTeams()
  }, [])

  async function fetchTeams() {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          organizations (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTeams(data || [])
    } catch (error) {
      console.error('Error fetching teams:', error)
    } finally {
      setLoading(false)
    }
  }

  return { teams, loading, refetch: fetchTeams }
}
```

### 팀 멤버 관리

```javascript
// api/teams.js
export async function getTeamMembers(teamId) {
  try {
    const { data, error } = await supabase
      .from('team_members_view')
      .select('*')
      .eq('team_id', teamId)

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching team members:', error)
    return { data: null, error }
  }
}

export async function addTeamMember(teamId, userId, role = 'member') {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .insert([{
        team_id: teamId,
        user_id: userId,
        role: role
      }])
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error adding team member:', error)
    return { data: null, error }
  }
}

export async function updateTeamMemberRole(teamId, userId, newRole) {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .update({ role: newRole })
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error updating team member role:', error)
    return { data: null, error }
  }
}

export async function removeTeamMember(teamId, userId) {
  try {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId)

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error removing team member:', error)
    return { error }
  }
}

export async function createTeam(teamData) {
  try {
    const { data, error } = await supabase
      .rpc('create_team_with_owner', {
        team_name: teamData.name,
        org_id: teamData.organization_id || null,
        owner_id: teamData.owner_id
      })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error creating team:', error)
    return { data: null, error }
  }
}
```

## 🚀 프로젝트 관리

### 프로젝트 API

```javascript
// api/projects.js
export async function getProjects() {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        teams (
          id,
          name,
          organizations (
            id,
            name
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching projects:', error)
    return { data: null, error }
  }
}

export async function createProject(projectData) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert([projectData])
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error creating project:', error)
    return { data: null, error }
  }
}

export async function updateProject(id, updates) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error updating project:', error)
    return { data: null, error }
  }
}
```

## 🛡️ 권한 기반 컴포넌트

### 조건부 렌더링 컴포넌트

```jsx
// components/PermissionGuard.jsx
import { useUser } from '@/hooks/useUser'
import { isAdmin, isTeamMember, isTeamAdmin } from '@/utils/permissions'

export function AdminOnly({ children, fallback = null }) {
  const { profile } = useUser()
  
  if (!isAdmin(profile)) {
    return fallback
  }
  
  return children
}

export function TeamMemberOnly({ teamId, children, fallback = null }) {
  const { permissions } = useUser()
  
  if (!isTeamMember(permissions, teamId)) {
    return fallback
  }
  
  return children
}

export function TeamAdminOnly({ teamId, children, fallback = null }) {
  const { permissions } = useUser()
  
  if (!isTeamAdmin(permissions, teamId)) {
    return fallback
  }
  
  return children
}

export function OwnerOnly({ ownerId, children, fallback = null }) {
  const { user } = useUser()
  
  if (user?.id !== ownerId) {
    return fallback
  }
  
  return children
}
```

### 사용 예시

```jsx
// pages/dashboard.jsx
import { AdminOnly, TeamMemberOnly, OwnerOnly } from '@/components/PermissionGuard'

export default function Dashboard() {
  return (
    <div>
      <h1>대시보드</h1>
      
      <AdminOnly fallback={<p>관리자만 접근할 수 있습니다.</p>}>
        <div>
          <h2>관리자 패널</h2>
          <button>모든 사용자 관리</button>
          <button>시스템 설정</button>
        </div>
      </AdminOnly>
      
      <TeamMemberOnly teamId={1} fallback={<p>팀 멤버만 접근할 수 있습니다.</p>}>
        <div>
          <h2>팀 프로젝트</h2>
          <ProjectList teamId={1} />
        </div>
      </TeamMemberOnly>
    </div>
  )
}
```

## 🔄 실시간 업데이트

### 실시간 구독 설정

```javascript
// hooks/useRealtimeDocuments.js
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useRealtimeDocuments() {
  const [documents, setDocuments] = useState([])

  useEffect(() => {
    // 초기 데이터 로드
    fetchDocuments()

    // 실시간 구독 설정
    const subscription = supabase
      .channel('documents')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'documents' 
        }, 
        (payload) => {
          console.log('Change received!', payload)
          
          if (payload.eventType === 'INSERT') {
            setDocuments(prev => [payload.new, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setDocuments(prev => 
              prev.map(doc => 
                doc.id === payload.new.id ? payload.new : doc
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setDocuments(prev => 
              prev.filter(doc => doc.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function fetchDocuments() {
    const { data } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false })
    
    setDocuments(data || [])
  }

  return documents
}
```

## 🎨 UI 컴포넌트 예시

### 문서 카드 컴포넌트

```jsx
// components/DocumentCard.jsx
import { useState } from 'react'
import { useUser } from '@/hooks/useUser'
import { canAccessDocument } from '@/utils/permissions'
import { deleteDocument } from '@/api/documents'

export function DocumentCard({ document, onUpdate }) {
  const { user, profile } = useUser()
  const [loading, setLoading] = useState(false)
  
  const canAccess = canAccessDocument(document, user?.id, profile)
  const isOwner = document.owner_id === user?.id
  
  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    
    setLoading(true)
    const { error } = await deleteDocument(document.id)
    
    if (!error) {
      onUpdate()
    }
    setLoading(false)
  }
  
  if (!canAccess) {
    return (
      <div className="bg-gray-100 p-4 rounded-lg">
        <p className="text-gray-500">접근 권한이 없습니다.</p>
      </div>
    )
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold">{document.title}</h3>
        <span className={`px-2 py-1 rounded text-xs ${
          document.visibility === 'public' ? 'bg-green-100 text-green-800' :
          document.visibility === 'private' ? 'bg-gray-100 text-gray-800' :
          'bg-red-100 text-red-800'
        }`}>
          {document.visibility}
        </span>
      </div>
      
      <p className="text-gray-600 mb-4 line-clamp-3">
        {document.content}
      </p>
      
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          {new Date(document.created_at).toLocaleDateString()}
        </span>
        
        {isOwner && (
          <div className="space-x-2">
            <button 
              className="text-blue-600 hover:text-blue-800"
              onClick={() => onEdit(document)}
            >
              편집
            </button>
            <button 
              className="text-red-600 hover:text-red-800"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? '삭제 중...' : '삭제'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
```

### 팀 멤버 관리 컴포넌트

```jsx
// components/TeamMemberManager.jsx
import { useState, useEffect } from 'react'
import { getTeamMembers, addTeamMember, updateTeamMemberRole, removeTeamMember } from '@/api/teams'
import { useUser } from '@/hooks/useUser'
import { isTeamAdmin } from '@/utils/permissions'

export function TeamMemberManager({ teamId }) {
  const { permissions } = useUser()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [newMemberEmail, setNewMemberEmail] = useState('')
  
  const canManage = isTeamAdmin(permissions, teamId)
  
  useEffect(() => {
    fetchMembers()
  }, [teamId])
  
  async function fetchMembers() {
    const { data } = await getTeamMembers(teamId)
    setMembers(data || [])
    setLoading(false)
  }
  
  async function handleAddMember() {
    // 이메일로 사용자 ID 찾기 (실제 구현에서는 더 복잡할 수 있음)
    const { data: users } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', newMemberEmail)
      .single()
    
    if (users) {
      await addTeamMember(teamId, users.id, 'member')
      setNewMemberEmail('')
      fetchMembers()
    }
  }
  
  async function handleRoleChange(userId, newRole) {
    await updateTeamMemberRole(teamId, userId, newRole)
    fetchMembers()
  }
  
  async function handleRemoveMember(userId) {
    if (confirm('정말 팀에서 제거하시겠습니까?')) {
      await removeTeamMember(teamId, userId)
      fetchMembers()
    }
  }
  
  if (loading) return <div>로딩 중...</div>
  
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">팀 멤버</h3>
      
      {canManage && (
        <div className="mb-6 p-4 bg-gray-50 rounded">
          <h4 className="font-medium mb-2">새 멤버 추가</h4>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="이메일 주소"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              className="flex-1 px-3 py-2 border rounded"
            />
            <button
              onClick={handleAddMember}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              추가
            </button>
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        {members.map((member) => (
          <div key={member.user_id} className="flex items-center justify-between p-3 bg-white rounded border">
            <div>
              <div className="font-medium">{member.email}</div>
              <div className="text-sm text-gray-500">
                {new Date(member.joined_at).toLocaleDateString()}에 가입
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {canManage ? (
                <select
                  value={member.team_role}
                  onChange={(e) => handleRoleChange(member.user_id, e.target.value)}
                  className="px-2 py-1 border rounded"
                >
                  <option value="member">멤버</option>
                  <option value="lead">리더</option>
                  <option value="admin">관리자</option>
                </select>
              ) : (
                <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                  {member.team_role}
                </span>
              )}
              
              {canManage && (
                <button
                  onClick={() => handleRemoveMember(member.user_id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  제거
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

## 🚨 에러 처리

### 권한 오류 처리

```javascript
// utils/errorHandler.js
export function handleSupabaseError(error) {
  console.error('Supabase Error:', error)
  
  // RLS 정책 위반 오류
  if (error.code === '42501' || error.message.includes('RLS')) {
    return {
      type: 'PERMISSION_DENIED',
      message: '이 작업을 수행할 권한이 없습니다.',
      userMessage: '접근 권한이 없습니다. 관리자에게 문의하세요.'
    }
  }
  
  // 중복 데이터 오류
  if (error.code === '23505') {
    return {
      type: 'DUPLICATE_ERROR',
      message: '이미 존재하는 데이터입니다.',
      userMessage: '이미 존재하는 항목입니다.'
    }
  }
  
  // 외래키 제약 위반
  if (error.code === '23503') {
    return {
      type: 'FOREIGN_KEY_ERROR',
      message: '참조된 데이터가 존재하지 않습니다.',
      userMessage: '유효하지 않은 참조입니다.'
    }
  }
  
  return {
    type: 'UNKNOWN_ERROR',
    message: error.message,
    userMessage: '알 수 없는 오류가 발생했습니다.'
  }
}
```

## 📱 모바일 최적화

### React Native 사용 예시

```javascript
// hooks/useUserRN.js (React Native)
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useUser() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 초기 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // 인증 상태 변화 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription?.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  return { user, profile, loading }
}
```

## 🔍 디버깅 도구

### 권한 디버거 컴포넌트

```jsx
// components/PermissionDebugger.jsx (개발 환경에서만 사용)
import { useUser } from '@/hooks/useUser'

export function PermissionDebugger() {
  const { user, profile, permissions } = useUser()
  
  if (process.env.NODE_ENV !== 'development') {
    return null
  }
  
  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-90 text-white p-4 rounded max-w-md max-h-96 overflow-auto">
      <h4 className="font-bold mb-2">권한 디버거</h4>
      
      <div className="text-xs space-y-2">
        <div>
          <strong>User ID:</strong> {user?.id || 'None'}
        </div>
        <div>
          <strong>Global Role:</strong> {profile?.global_role || 'None'}
        </div>
        <div>
          <strong>Teams:</strong>
          <pre>{JSON.stringify(permissions?.team_memberships, null, 2)}</pre>
        </div>
        <div>
          <strong>Organizations:</strong>
          <pre>{JSON.stringify(permissions?.organization_memberships, null, 2)}</pre>
        </div>
      </div>
    </div>
  )
}
```

---

**이제 클라이언트 애플리케이션에서 Supabase RBAC 시스템을 완전히 활용할 수 있습니다!**

각 API 함수와 컴포넌트는 RLS 정책에 의해 자동으로 권한이 제어되므로, 안전하고 확장 가능한 애플리케이션을 구축할 수 있습니다.