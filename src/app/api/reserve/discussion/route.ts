import { Cacher } from '@/database/Cacher'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { Student } from '../../_types/global'
 
export const DiscussionReserve = z.object({
  room: z.number().int().min(1).max(5),
  students: z.array(Student).min(1),
  at: z.string().datetime(),
})

const cacher = new Cacher("src/database/reserve/discussion.json")

export async function GET(req: NextRequest) {
  return NextResponse.json(cacher.read(), { status: 200 })
}

export async function POST(req: NextRequest) {
  const query = await req.json()
  console.log(query)
  const validation = DiscussionReserve.safeParse(query)

  if (!validation.success) 
    return NextResponse.json(validation.error.errors, { status: 400 })

  const created = { students: validation.data.students, at: validation.data.at }
  cacher.write({ 
    ...cacher.read(),
    ...Object.fromEntries([[`${validation.data.room}`, created]])
  })
  return NextResponse.json(created, { status: 201 })
}