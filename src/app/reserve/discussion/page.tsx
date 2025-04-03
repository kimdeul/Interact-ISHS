"use client"

import Contents from "@/layouts/contents"
import Header from "@/layouts/header"
import { ChangeEvent, FormEventHandler, useState } from "react"
import { z } from "zod"
import { Student } from "../../api/_types/global"

export default function PageReserve() {

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
    alert(response.ok)
    console.log(response)
  }
  
  return <>
    <Header></Header>
    <Contents>
      <form onSubmit={reserve}>
        <p>Welcome to Reserving Page</p>
        <select defaultValue={0} onChange={updateRoomHandler}>
          <option value={0}>선택하지 않음</option>
          <option value={1}>1번 회의실</option>
          <option value={2}>2번 회의실</option>
          <option value={3}>3번 회의실</option>
          <option value={4}>4번 회의실</option>
          <option value={5}>5번 회의실</option>
        </select>
        <select defaultValue={""} onChange={updateTimeHandler}>
          <option value={""}>선택하지 않음</option>
          <option value={"8"}>8교시</option>
          <option value={"1"}>야간 1차</option>
        </select>
        <button type="button" onClick={increaseHandler}>+</button>
        <button type="button" onClick={decreaseHandler}>-</button>
        {new Array(students.length).fill(0).map((_, k) => <div key={k}>
          <input placeholder="학번" onChange={e => updateIDHandler(e, k)}></input>
          <input placeholder="이름" onChange={e => updateNameHandler(e, k)}></input>
        </div>)}
        <button type="submit">OK</button>
      </form>
    </Contents>
  </>
  
}