import { promises } from 'fs'
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

const PATH = (process.cwd() + "/data/reserve/discussion.json")
async function load(): Promise<DiscussionReserves> { return JSON.parse((await promises.readFile(PATH, "utf-8")).toString()) }
async function save(data: DiscussionReserves): Promise<void> { await promises.writeFile(PATH, JSON.stringify(data)) }

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
  const read = await load()
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

  const already = (await load())[query.data.room]?.[query.data.time]
  if (already && isToday(new Date(already.date)))
    return NextResponse.json({ errors: "RESERVE_EXISTS" }, { status: 400 })

  const created = { students: query.data.students, date: query.data.date }
  const edited = await load()
  edited[`${query.data.room}`][query.data.time] = created
  await save(edited)
  return NextResponse.json(created, { status: 201 })
}