import { redirect } from "next/navigation"

export default function Home() {
  redirect("/reserve/discussion")
  return <>
    <br></br>
    <p>페이지가 공사중입니다... </p>
    <strong><a href="/reserve/discussion">예약 페이지로 가기</a></strong>
  </>
}