import { readFileSync, writeFileSync } from "fs"
import { join } from "path"

export class Cacher<T> {

  private readonly path: string

  constructor(path: string) {
    this.path = path
  }

  read() {
    return JSON.parse(readFileSync(join(process.cwd(), this.path)).toString()) as T
  }

  write(data: T) {
    writeFileSync(this.path, JSON.stringify(data))
  }

}