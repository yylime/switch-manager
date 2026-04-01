import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { TasksPage } from '@/features/tasks'

const TasksSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  filter: z.string().optional().catch(''),
  status: z.array(z.string()).optional().catch([]),
})

export const Route = createFileRoute('/_authenticated/tasks/')({
  validateSearch: TasksSearchSchema,
  component: TasksPage,
})