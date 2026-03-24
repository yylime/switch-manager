import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { ArptablesPage } from '@/features/arptables'

const SwitchesSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  filter: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/arptables/')({
  validateSearch: SwitchesSearchSchema,
  component: ArptablesPage,
})