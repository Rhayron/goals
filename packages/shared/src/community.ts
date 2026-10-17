export interface CommunityProfile {
  nickname: string
  globalEnabled: boolean
  focus: string
}
export interface StudyGroup {
  id: string
  name: string
  description: string
  ownerId: string
  members: number
}
export interface RankEntry {
  userId: string
  nickname: string
  value: number
  position: number
}
export interface Ranking {
  from: string
  to: string
  metric: 'time' | 'questions' | 'pages'
  entries: RankEntry[]
  me: RankEntry | null
  participants: number
}
export interface GroupMember {
  userId: string
  nickname: string
  joinedAt: string
}
