import { promises } from 'fs'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { Reserves, Student } from '../../_types/global'
import { isAfter, isToday } from '../../_utilities/times'
 
const DiscussionReserveScheme = z.object({
  room: z.number().int().min(1).max(5),
  students: Student.array().min(2).max(6),
  date: z.string().datetime(),
  time: z.union([z.literal("8"), z.literal("1")])
})

type DiscussionReserve = Omit<z.infer<typeof DiscussionReserveScheme>, "room" | "time">
export type DiscussionReserves<T = DiscussionReserve> = Reserves<T>

const PATH = (process.cwd() + "/data/reserve/discussion.json")
async function load(): Promise<DiscussionReserves> { return JSON.parse((await promises.readFile(PATH, "utf-8")).toString()) }
async function save(data: DiscussionReserves): Promise<void> { await promises.writeFile(PATH, JSON.stringify(data)) }

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