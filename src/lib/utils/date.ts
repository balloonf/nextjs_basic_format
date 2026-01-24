/**
 * 날짜를 한국어 형식으로 포맷팅 (년월일)
 */
export function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return '-'

  const date = typeof dateString === 'string' ? new Date(dateString) : dateString

  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * 날짜와 시간을 한국어 형식으로 포맷팅
 */
export function formatDateTime(dateString: string | Date | null | undefined): string {
  if (!dateString) return '-'

  const date = typeof dateString === 'string' ? new Date(dateString) : dateString

  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * 상대적인 시간 표시 (예: "방금 전", "2시간 전", "어제")
 */
export function formatRelativeTime(dateString: string | Date | null | undefined): string {
  if (!dateString) return '접속 기록 없음'

  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInMinutes < 1) return '방금 전'
  if (diffInMinutes < 60) return `${diffInMinutes}분 전`
  if (diffInHours < 24) return `${diffInHours}시간 전`
  if (diffInDays === 1) return '어제'
  if (diffInDays < 7) return `${diffInDays}일 전`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}주 전`

  return formatDate(date)
}

/**
 * ISO 날짜 문자열 생성
 */
export function toISOString(date: Date = new Date()): string {
  return date.toISOString()
}

/**
 * 날짜가 오늘인지 확인
 */
export function isToday(dateString: string | Date): boolean {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  const today = new Date()

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

/**
 * 이번 달에 생성되었는지 확인
 */
export function isThisMonth(dateString: string | Date): boolean {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  const now = new Date()

  return (
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  )
}
