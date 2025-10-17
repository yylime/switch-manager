import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { isLoggedIn } from '@/hooks/use-auth'

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
  beforeLoad: async () => {
    // If the user is not logged in, redirect to sign-in
    if (!isLoggedIn()) {
      throw redirect({ to: '/sign-in' })
    }
  },
})
