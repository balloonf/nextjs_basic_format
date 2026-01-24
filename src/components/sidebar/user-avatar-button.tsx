"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronsUpDown } from "lucide-react"
import type { User } from "@supabase/supabase-js"

interface UserAvatarButtonProps {
  user: User | null
  showChevron?: boolean
  className?: string
}

export function UserAvatarButton({ user, showChevron = true, className }: UserAvatarButtonProps) {
  const displayName = user?.user_metadata?.full_name || '사용자'
  const email = user?.email
  const avatarUrl = user?.user_metadata?.avatar_url
  const initials = displayName?.charAt(0) || email?.charAt(0) || 'U'

  return (
    <div className={className}>
      <Avatar className="h-8 w-8 rounded-lg">
        <AvatarImage src={avatarUrl} alt={displayName} />
        <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-semibold">{displayName}</span>
        <span className="truncate text-xs">{email}</span>
      </div>
      {showChevron && <ChevronsUpDown className="ml-auto size-4" />}
    </div>
  )
}

interface UserAvatarInfoProps {
  user: User | null
  className?: string
}

export function UserAvatarInfo({ user, className }: UserAvatarInfoProps) {
  const displayName = user?.user_metadata?.full_name || '사용자'
  const email = user?.email
  const avatarUrl = user?.user_metadata?.avatar_url
  const initials = displayName?.charAt(0) || email?.charAt(0) || 'U'

  return (
    <div className={`flex items-center gap-2 px-1 py-1.5 text-left text-sm ${className || ''}`}>
      <Avatar className="h-8 w-8 rounded-lg">
        <AvatarImage src={avatarUrl} alt={displayName} />
        <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-semibold">{displayName}</span>
        <span className="truncate text-xs">{email}</span>
      </div>
    </div>
  )
}
