import { promises } from 'fs'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
 
const PASSWORD = "25ishs!"

const EsportsMatchScheme = z.object({
  name: z.string(),
  date: z.string().datetime(),
  home: z.object({ name: z.string(), score: z.union([z.number(), z.null()])}),
  away: z.object({ name: z.string(), score: z.union([z.number(), z.null()])}),
  password: z.string(),
  index: z.number().optional(),
})

export type EsportsMatch = Omit<z.infer<typeof EsportsMatchScheme>, "password" | "index">

const PATH = (process.cwd() + "/data/esports/match.json")
async function load(): Promise<EsportsMatch[]> { return JSON.parse((await promises.readFile(PATH, "utf-8")).toString()) }
async function save(data: EsportsMatch[]): Promise<void> { await promises.writeFile(PATH, JSON.stringify(data)) }

export async function isStarted(index: number) {
  return new Date() > new Date((await load())[index].date)
}

export async function GET(req: NextRequest) {
  const read = await load()
  return NextResponse.json(read, { status: 200 })
}

export async function POST(req: NextRequest) {
  const query = EsportsMatchScheme.safeParse(await req.json())
  if (!query.success) return NextResponse.json({ errors: "BAD_FORM", list: [query.error.errors] }, { status: 400 })
  if (query.data.password !== PASSWORD) return NextResponse.json({ status: 403 })
  
  const created = { name: query.data.name, date: query.data.date, home: query.data.home, away: query.data.away }
  if (query.data.index) {
    const edited = await load()
    edited[query.data.index] = created
    await save(edited)
  } else await save([...await load(), created])
  return NextResponse.json(created, { status: 201 })
}