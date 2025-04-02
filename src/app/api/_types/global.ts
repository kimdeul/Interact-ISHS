import { z } from "zod"

export const Student = z.object({
  name: z.string(),
  id: z.string().regex(/[1-3][1-4][0-2][0-9]/)
})