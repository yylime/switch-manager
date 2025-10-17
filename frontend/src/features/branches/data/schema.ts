import { z } from 'zod'

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const branchSchema = z.object({
  id: z.string(),
  name: z.string(),
})

export type Branch = z.infer<typeof branchSchema>
