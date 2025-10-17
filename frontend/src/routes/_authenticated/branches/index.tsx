import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Branches } from '@/features/branches'

const BranchSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  filter: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/branches/')({
  validateSearch: BranchSearchSchema,
  component: Branches,
})
