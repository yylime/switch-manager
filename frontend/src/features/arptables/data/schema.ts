import { z } from 'zod'

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const switchSchema = z.object({
  id: z.string(),
  interface: z.string(),
  ip: z.string(),
  mac: z.string(),
  vlan: z.string().optional(),

  switch: z.object({
    ip: z.string(),
    name: z.string(),
    branch: z.object({
      name: z.string(),
    }),
  }),
  updated: z.string(),
})

export type Switch = z.infer<typeof switchSchema>
