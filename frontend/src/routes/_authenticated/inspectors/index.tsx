import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Inspectors } from '@/features/inspectors'

const InspectorSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  filter: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/inspectors/')({
  validateSearch: InspectorSearchSchema,
  component: Inspectors,
})