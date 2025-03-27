import Image from "next/image";
import style from "./header.module.css";

export default function Header() {

  return <header className={style.header}>
    <Image
      src="/logo-color.svg"
      alt="인천과학고 iNter"
      width={120}
      height={120}
      priority
    />
    <p>예약 및 신청</p>
  </header>

}