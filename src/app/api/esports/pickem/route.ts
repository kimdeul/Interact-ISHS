import { promises } from 'fs'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { Student } from '../../_types/global'
import { EsportsMatch } from '../match/route'
 
const PASSWORD = "25ishs!"

const EsportsPickemScheme = z.object({
  student: Student,
  password: z.string(),
  picks: z.union([z.boolean(), z.null()]).array() // true: right team pick, false: left team pick
})

export type EsportsPickem = Omit<z.infer<typeof EsportsPickemScheme>, "student">

const PATH = (process.cwd() + "/data/esports/pickem.json")
async function load(): Promise<{ [key: string]: EsportsPickem }> { return JSON.parse((await promises.readFile(PATH, "utf-8")).toString()) }
async function save(data: { [key: string]: EsportsPickem }): Promise<void> { await promises.writeFile(PATH, JSON.stringify(data)) }

export async function GET(req: NextRequest) {
  const read = await load()
  return NextResponse.json(read, { status: 200 })
}

export async function POST(req: NextRequest) {
  const query = EsportsPickemScheme.safeParse(await req.json())
  if (!query.success) return NextResponse.json({ errors: "BAD_FORM", list: [query.error.errors] }, { status: 400 })

  const edited = await load()
  if (!!edited[query.data.student.id] 
    && (query.data.password !== edited[query.data.student.id].password)
  ) return NextResponse.json({ errors: "PASSWORD_INCORRECT" }, { status: 400 })

  const matches: EsportsMatch[] = (JSON.parse((await promises.readFile(PATH, "utf-8")).toString()))
  if (!!edited[query.data.student.id]) {
    const picks = edited[query.data.student.id].picks
    for (let i=0; i<picks.length; i++) {
      if (picks[i] === query.data.picks[i]) continue
      if (new Date() > new Date(matches[i].date)) return NextResponse.json({ errors: "MATCH_STARTED" }, { status: 400 })
    }
  }

  console.log(query.data.password, edited[query.data.student.id])
  edited[query.data.student.id] = query.data
  await save(edited)
  return NextResponse.json(query.data, { status: 201 })
}