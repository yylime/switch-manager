import { z } from 'zod'

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const dashboardSchema = z.object({
  switch_backup_count: z.number(),
  vrf_count: z.number(),
  vrf_diff_count: z.number(),
  iptable_count:  z.number(),
  iptable_diff_count: z.number(),
  config_diff_count: z.number(),
})

export type DashboardDataType = z.infer<typeof dashboardSchema>
