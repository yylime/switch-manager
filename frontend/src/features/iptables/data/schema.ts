import { z } from 'zod'

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const switchSchema = z.object({
  id: z.string(),
  switch_id: z.string(),
  interface: z.string(),
  ip: z.string().optional(),
  mask: z.number().optional(),
  vrf: z.string().optional(),
  acl: z.string().optional(),
  status: z.string().optional(),
  created: z.string().optional(),
  updated: z.string().optional(),
  switch: z.object({
    ip: z.string(),
    name: z.string(),
    stack_num: z.number(),
    branch: z.object({
      name: z.string(),
      id: z.string(),
    }),
  }),
})

export type Switch = z.infer<typeof switchSchema>
