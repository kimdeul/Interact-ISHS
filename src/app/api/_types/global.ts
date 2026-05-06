import { z } from "zod"

export const Student = z.object({
  name: z.string(),
  id: z.string().regex(/[1-3][1-4][0-2][0-9]/)
})

export type Reserves<T> = { [key: string]: { "8": T | null, "1": T | null } }