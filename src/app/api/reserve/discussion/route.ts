import { Cacher } from '@/database/Cacher'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { Student } from '../../_types/global'
 
const DiscussionReserveScheme = z.object({
  room: z.number().int().min(1).max(5),
  students: z.array(Student).min(1),
  date: z.string().datetime(),
  time: z.union([z.literal("8"), z.literal("1")])
})

type DiscussionReserve = Omit<z.infer<typeof DiscussionReserveScheme>, "room" | "time">
export type DiscussionReserves<T = DiscussionReserve> = { [key: string]: { "8": T | null, "1": T | null } }
const cacher = new Cacher<DiscussionReserves>("src/database/reserve/discussion.json")

function isToday(date: Date) {
  const now = new Date()
  return (date.getFullYear() === now.getFullYear()) &&
    (date.getMonth() === now.getMonth()) &&
    (date.getDay() === now.getDay())
}

function isAfter() {
  const now = new Date()
  return (now.getHours() >= 13) && (now.getMinutes() >= 20)
}

export async function GET(req: NextRequest) {
  const read = cacher.read()
  for (const i in read) for (const time of ["8", "1"] as const) read[i][time] = (
    read[i][time] && isToday(new Date(read[i][time].date))
  ) ? read[i][time] : null
  return NextResponse.json(read, { status: 200 })
}

export async function POST(req: NextRequest) {
  const query = DiscussionReserveScheme.safeParse(await req.json())
  if (!query.success) return NextResponse.json({ errors: "BAD_FORM", list: [query.error.errors] }, { status: 400 })
  // TODO: 13시 20분 이후부터 예약
  if (!isAfter()) return NextResponse.json({ errors: "TOO_EARLY" }, { status: 400 })

  const already = cacher.read()[query.data.room]?.[query.data.time]
  if (already && isToday(new Date(already.date)))
    return NextResponse.json({ errors: "RESERVE_EXISTS" }, { status: 400 })

  const created = { students: query.data.students, date: query.data.date }
  const edited = cacher.read()
  edited[`${query.data.room}`][query.data.time] = created
  cacher.write(edited)
  return NextResponse.json(created, { status: 201 })
}