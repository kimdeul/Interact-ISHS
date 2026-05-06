"use client"

import { ResearchReserves } from "@/app/api/reserve/research/route"
import Contents from "@/layouts/contents"
import Header from "@/layouts/header"
import Subtitle from "@/layouts/texts/subtitle"
import { ChangeEvent, FormEventHandler, useState } from "react"
import useSWR from "swr"
import style from "./page.module.css"

function Reserves() {
  const { data, error, isLoading } = useSWR<ResearchReserves>("/api/reserve/research", (arg: string) => fetch(arg).then(res => res.json()))


  function ReserveTime(props: { 
    readonly label: string, 
    readonly room: string,
    readonly time: "8" | "1",
    readonly reserve: ResearchReserves[string]
  }) {
    const disable = props.reserve[props.time] !== null
    return <div className={disable ? style['time-disabled'] : ""}>
      <p className={style.unbold}>{props.label} </p>
      <p>{!disable ? "예약 가능" : props.reserve[props.time]?.teacher + "T 예약됨"}</p>
    </div>
  }  

  if (isLoading) return <div className={style.reserves}>예약 데이터를 로딩 중입니다.</div>
  if (error || !data) return <div className={style.reserves}>예약 데이터를 가져오지 못했습니다.</div>
  return <div className={style.reserves}>{Object.entries(data).map(([room, reserve]) => {
    return <div className={style.room} key={room}>
      <div>
        <p className={style.unbold}>{parseInt(room) <= 4 ? "과제연구" : "융합"} </p>
        <p>{"ABCD"[(parseInt(room) - 1) % 4]}</p>
      </div>
      <div className={style.times}>
        <ReserveTime label="8교시" room={room} time={"8"} reserve={reserve}></ReserveTime>
        <ReserveTime label="1차면학" room={room} time={"1"} reserve={reserve}></ReserveTime>
      </div>
    </div>
    })
  }</div>
}


export default function PageReserveDiscussion() {

  const [teacher, setTeacher] = useState<string>("")
  const [room, setRoom] = useState<number>(0)
  const [time, setTime] = useState<string>("")
  const [password, setPassword] = useState<string>("")

  function updateTeacherHandler(event: ChangeEvent<HTMLInputElement>) {
    setTeacher(event.target.value)
  }

  function updateTimeHandler(event: ChangeEvent<HTMLSelectElement>) {
    setTime(event.target.value)
  }

  function updateRoomHandler(event: ChangeEvent<HTMLSelectElement>) {
    setRoom(parseInt(event.target.value))
  }

  function updatePasswordHandler(event: ChangeEvent<HTMLInputElement>) {
    setPassword(event.target.value)
  }

  const reserve: FormEventHandler<HTMLFormElement> = async event => {
    event.preventDefault()
    const response = await fetch("/api/reserve/research", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        room: room,
        time: time,
        teacher: teacher,
        date: new Date().toISOString(),
        password: password
      }),
    })
    if (response.ok) return alert("예약이 완료되었습니다.")
    const error = (await response.json()).errors
    if (error === "BAD_FORM") return alert("예약 양식이 올바르지 않습니다.\n회의실과 시간을 선택했는지, 이름이 올바르게 입력되었는지, 비밀번호가 정확한지 확인하세요.")
    if (error === "RESERVE_EXISTS") return alert("이미 예약이 존재하는 시간대입니다.")
    return alert("알 수 없는 오류가 발생했습니다.")
  }

  return <>
    <Header></Header>
    <Contents>
      <Subtitle>예약 현황</Subtitle>
      <Reserves/>
      <form className={style.form} onSubmit={reserve}>
        <Subtitle>회의실 및 이용 시간</Subtitle>
        <div className={style.line}>
          <p>이용 회의실</p>
          <select defaultValue={0} onChange={updateRoomHandler}>
            <option value={0}>선택하지 않음</option>
            <option value={1}>과제연구A</option>
            <option value={2}>과제연구B</option>
            <option value={3}>과제연구C</option>
            <option value={4}>과제연구D</option>
            <option value={5}>융합A</option>
            <option value={6}>융합B</option>
            <option value={7}>융합C</option>
            <option value={8}>융합D</option>
          </select>
        </div>
        <div className={style.line}>
          <p>이용 시간</p>
          <select defaultValue={""} onChange={updateTimeHandler}>
            <option value={""}>선택하지 않음</option>
            <option value={"8"}>8교시</option>
            <option value={"1"}>야간 1차</option>
          </select>
        </div>
        <div className={style.line}>
          <p>이용 교사</p>
          <input placeholder="교사 이름" onChange={updateTeacherHandler}></input>
        </div>
        <div className={style.line}>
          <p>교사 권한 비밀번호</p>
          <input placeholder="비밀번호" onChange={updatePasswordHandler} type="password"></input>
        </div>
        <button type="submit">예약하기</button>
      </form>
    </Contents>
  </>
  
}