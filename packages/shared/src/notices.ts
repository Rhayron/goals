import { z } from 'zod'

export const NoticeOutlineSchema = z
  .array(
    z.object({
      name: z.string().trim().min(1).max(200),
      topics: z.array(z.string().trim().min(1).max(1000)).max(500),
    }),
  )
  .min(1)
  .max(100)
  .refine((rows) => rows.reduce((n, s) => n + s.topics.length, 0) <= 2000, 'Limite de 2.000 tópicos por importação.')
export type NoticeOutline = z.infer<typeof NoticeOutlineSchema>

export interface CatalogNotice {
  id: string
  title: string
  agency: string
  organizer: string
  state: string
  positions: string[]
  year: number
  sourceUrl: string
  pdfUrl: string | null
  provider: string
  providerStatus: string
  registrationStart: string
  registrationEnd: string
  examDateText: string
  checkedAt: string
  version: number
}
export interface CatalogSearch {
  items: CatalogNotice[]
  total: number
  page: number
}
export interface NoticeSourceLinks {
  kind: 'links'
  sourceUrl: string
  links: { title: string; url: string }[]
}
