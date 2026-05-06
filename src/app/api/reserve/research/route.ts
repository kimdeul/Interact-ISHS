import { config } from 'dotenv';
import { promises } from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import { env } from 'process';
import { z } from "zod";
import { Reserves } from "../../_types/global";
import { isToday } from '../../_utilities/times';

config()

const ResearchReserveScheme = z.object({
  // 1~4: 과제연구실, 5~8: 융합실
  room: z.number().int().min(1).max(8),
  teacher: z.string(),
  date: z.string().datetime(),
  time: z.union([z.literal("8"), z.literal("1")]),
  password: z.literal(env.PASSWORD)
})

type ResearchReserve = Omit<z.infer<typeof ResearchReserveScheme>, "room" | "time" | "password">
export type ResearchReserves<T = ResearchReserve> = Reserves<T>

const PATH = (process.cwd() + "/data/reserve/research.json")
async function load(): Promise<ResearchReserves> { return JSON.parse((await promises.readFile(PATH, "utf-8")).toString()) }
async function save(data: ResearchReserves): Promise<void> { await promises.writeFile(PATH, JSON.stringify(data)) }

export async function GET(req: NextRequest) {
  const read = await load()
  for (const i in read) for (const time of ["8", "1"] as const) read[i][time] = (
    read[i][time] && isToday(new Date(read[i][time].date))
  ) ? read[i][time] : null
  return NextResponse.json(read, { status: 200 })
}

export async function POST(req: NextRequest) {
  const query = ResearchReserveScheme.safeParse(await req.json())
  if (!query.success) return NextResponse.json({ errors: "BAD_FORM", list: [query.error.errors] }, { status: 400 })
  const already = (await load())[query.data.room]?.[query.data.time]
  if (already && isToday(new Date(already.date)))
    return NextResponse.json({ errors: "RESERVE_EXISTS" }, { status: 400 })
  const created = { teacher: query.data.teacher, date: query.data.date }
  const edited = await load()
  edited[`${query.data.room}`][query.data.time] = created
  await save(edited)
  return NextResponse.json(created, { status: 201 })
}
