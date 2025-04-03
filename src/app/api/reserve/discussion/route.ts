import { Cacher } from '@/database/Cacher'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { Student } from '../../_types/global'
 
export const DiscussionReserveScheme = z.object({
  room: z.number().int().min(1).max(5),
  students: z.array(Student).min(1),
  date: z.string().datetime(),
  time: z.union([z.literal("8"), z.literal("1")])
})

type DiscussionReserve = Omit<z.infer<typeof DiscussionReserveScheme>, "room" | "time">
const cacher = new Cacher<{ 
  [key: string]: { "8": DiscussionReserve | null, "1": DiscussionReserve | null }
}>("src/database/reserve/discussion.json")

export async function GET(req: NextRequest) {
  return NextResponse.json(cacher.read(), { status: 200 })
}

export async function POST(req: NextRequest) {
  const query = DiscussionReserveScheme.safeParse(await req.json())
  if (!query.success) return NextResponse.json(query.error.errors, { status: 400 })

  const already = cacher.read()[query.data.room]?.[query.data.time]
  if (already) {
    const last = new Date(already.date)
    const now = new Date()
    if (
      (last.getFullYear() === now.getFullYear()) &&
      (last.getMonth() === now.getMonth()) &&
      (last.getDay() === now.getDay())
    ) return NextResponse.json({ errors: "Reserve already exists."}, { status: 400 })
  }

  const created = { students: query.data.students, date: query.data.date }
  const edited = cacher.read()
  edited[`${query.data.room}`][query.data.time] = created
  cacher.write(edited)
  return NextResponse.json(created, { status: 201 })
}