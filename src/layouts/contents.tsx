import { ReactNode } from "react"
import style from "./contents.module.css"

export default function Contents({ children }: { children: ReactNode }) {
  return <div className={style.frame}>
    <div className={style.main}>{children}</div>
  </div>
}