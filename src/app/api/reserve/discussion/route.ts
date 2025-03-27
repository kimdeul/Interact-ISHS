import { readFileSync } from 'fs'
import type { NextApiRequest } from 'next'
import { NextResponse } from 'next/server'
import { join } from 'path'
import { Student } from '../../_types/global'
 
export interface DiscussionReserve {
  students: Student[]
  at: string;
}

export async function GET(req: NextApiRequest) {
  return NextResponse.json(
    JSON.parse(readFileSync(join(process.cwd(), 
      "src/database/reserve/discussion.json"
    )).toString()), 
    { status: 200 }
  )
}