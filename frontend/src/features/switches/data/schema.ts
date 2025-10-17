import { z } from 'zod'

const configStatusSchema = z.union([
  z.literal('success'),
  z.literal('error'),
])
export type ConfigStatus = z.infer<typeof configStatusSchema>


// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const switchSchema = z.object({
  id: z.string(),
  name: z.string(),
  ip: z.string(),
  status: z.boolean(),
  stack_num: z.number(),
  stype: z.string().nullable().optional(),
  software_version: z.string(),
  hardware_type: z.string(),
  sn: z.string(),
  add_date: z.string(),
  mod_date: z.string(),
  branch: z.object({
    id: z.string(),
    name: z.string(),
  }),
  latest_config: z.object({
    status: z.string(),
    updated: z.string(),
  }).nullable().optional(),
  description: z.string().optional(),

})

export type Switch = z.infer<typeof switchSchema>
