
import { createFileRoute } from '@tanstack/react-router'
import { DiffsPage } from '@/features/diffs'



export const Route = createFileRoute('/_authenticated/diffs/')({
  component: DiffsPage,
})