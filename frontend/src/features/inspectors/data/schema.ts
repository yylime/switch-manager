import { z } from 'zod'

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const inspectorSchema = z.object({
  id: z.string(),
  name: z.string(),
  password: z.string(),
  description: z.string().optional(),

})

export type Inspector = z.infer<typeof inspectorSchema>
