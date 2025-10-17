
import { z } from 'zod'

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const vrfSchema = z.object({
  id: z.string(),
  name: z.string(),
  rd: z.string(),
  rt: z.string(),
  describtion: z.string().optional(),

})

export type Vrf = z.infer<typeof vrfSchema>
