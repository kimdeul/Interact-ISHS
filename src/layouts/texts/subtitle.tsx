import { ReactNode } from "react";
import style from "./subtitle.module.css";

export default function Subtitle({ children }: { children: ReactNode }) {
  return <div className={style.subtitle}>
    {children}
  </div>
}