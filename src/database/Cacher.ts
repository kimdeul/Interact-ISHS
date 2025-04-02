import { readFileSync, writeFileSync } from "fs"
import { join } from "path"

export class Cacher {

  private readonly path: string

  constructor(path: string) {
    this.path = path
  }

  read() {
    return JSON.parse(readFileSync(join(process.cwd(), this.path)).toString())
  }

  write(data: object) {
    writeFileSync(this.path, JSON.stringify(data))
  }

}