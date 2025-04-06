"use client"

import { DiscussionReserves } from "@/app/api/reserve/discussion/route"
import Contents from "@/layouts/contents"
import Header from "@/layouts/header"
import Subtitle from "@/layouts/texts/subtitle"
import { ChangeEvent, FormEventHandler, useState } from "react"
import useSWR from "swr"
import { z } from "zod"
import { Student } from "../../api/_types/global"
import style from "./page.module.css"

function Reserves() {
  const { data, error, isLoading } = useSWR<DiscussionReserves>("/api/reserve/discussion", (arg: string) => fetch(arg).then(res => res.json()))
  const [showing, setShowing] = useState<DiscussionReserves<boolean>>(Object.fromEntries(new Array(5).fill(0).map((_, i) => [`${i+1}`, { "8": false, "1": false }])))

  async function showHandler(room: string, time: "8" | "1") {
    const updated = { ...showing, [room]: { ...showing[room], [time]: !showing[room][time] } }
    setShowing(updated)
  }

  function ReserveTime(props: { 
    readonly label: string, 
    readonly room: string,
    readonly time: "8" | "1",
    readonly reserve: DiscussionReserves[string]
  }) {
    const disable = props.reserve[props.time] !== null
    return <div className={disable ? style['time-disabled'] : ""}>
      <p className={style.unbold}>{props.label} </p>
      <p>{!disable ? "예약 가능" : "예약 불가"}</p>
      {showing[props.room][props.time] ? props.reserve[props.time]?.students.map(student => <div className={style.students} key={student.id}>
        <p className={style.unbold}>{student.id}</p>
        <p>{student.name}</p>
      </div>) : <></>}
      <button onClick={() => showHandler(props.room, props.time)} disabled={!disable}>{
        disable ? (showing[props.room][props.time] ? "명단 덮기" : "명단 보기") : "예약 없음"
      }</button>
    </div>
  }  

  if (isLoading) return <div className={style.reserves}>예약 데이터를 로딩 중입니다.</div>
  if (error || !data) return <div className={style.reserves}>예약 데이터를 가져오지 못했습니다.</div>
  return <div className={style.reserves}>{Object.entries(data).map(([room, reserve]) => {
    return <div className={style.room} key={room}>
      <div>
        <p className={style.unbold}>Room </p>
        <p>{room}</p>
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

  const [students, setStudents] = useState<z.infer<typeof Student>[]>(new Array(2).fill(0).map(() => ({ id: "", name: "" })))
  const [room, setRoom] = useState<number>(0)
  const [time, setTime] = useState<string>("")

  function updateIDHandler(event: ChangeEvent<HTMLInputElement>, index: number) {
    const updated = [...students]
    updated[index].id = event.target.value;
    setStudents(updated)
  }

  function updateNameHandler(event: ChangeEvent<HTMLInputElement>, index: number) {
    const updated = [...students]
    updated[index].name = event.target.value;
    setStudents(updated)
  }

  function updateTimeHandler(event: ChangeEvent<HTMLSelectElement>) {
    setTime(event.target.value)
  }

  function updateRoomHandler(event: ChangeEvent<HTMLSelectElement>) {
    setRoom(parseInt(event.target.value))
  }

  function increaseHandler() {
    if (students.length >= 5) return
    setStudents([...students, { id: "1101", name: "" }])
  }

  function decreaseHandler() {
    if (students.length <= 2) return
    const updated = [...students]
    updated.pop()
    setStudents(updated)
  }

  const reserve: FormEventHandler<HTMLFormElement> = async event => {
    event.preventDefault()
    const response = await fetch("/api/reserve/discussion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        room: room,
        time: time,
        students: students,
        date: new Date().toISOString(),
      }),
    })
    if (!response.ok) alert("예약 양식이 올바르지 않습니다.\n회의실과 시간을 선택했는지, 학번과 이름이 모두 올바르게 입력되었는지 확인하세요.")
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
            <option value={1}>1번 회의실</option>
            <option value={2}>2번 회의실</option>
            <option value={3}>3번 회의실</option>
            <option value={4}>4번 회의실</option>
            <option value={5}>5번 회의실</option>
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
        <Subtitle>이용 학생 명단</Subtitle>
        <div className={style.line}>
          <button type="button" onClick={increaseHandler}>+</button>
          <button type="button" onClick={decreaseHandler}>-</button>
        </div>
        {new Array(students.length).fill(0).map((_, k) => <div className={style.line} key={k}>
          <input placeholder="학번" onChange={e => updateIDHandler(e, k)}></input>
          <input placeholder="이름" onChange={e => updateNameHandler(e, k)}></input>
        </div>)}
        <button type="submit">예약하기</button>
      </form>
    </Contents>
  </>
  
}