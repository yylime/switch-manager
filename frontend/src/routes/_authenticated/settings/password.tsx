import { createFileRoute } from '@tanstack/react-router'
import { SettingsAccount } from '@/features/settings/password'

export const Route = createFileRoute('/_authenticated/settings/password')({
  component: SettingsAccount,
})
