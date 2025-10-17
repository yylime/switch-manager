
import { type ConfigStatus } from './schema'

export const callTypes = new Map<ConfigStatus, string>([
  ['success', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  [
    'error',
    'bg-destructive/10 dark:bg-destructive/50 text-destructive dark:text-primary border-destructive/10',
  ],
])