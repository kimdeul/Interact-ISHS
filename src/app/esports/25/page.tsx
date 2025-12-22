"use client"

import { EsportsMatch } from "@/app/api/esports/match/route";
import { EsportsPickem } from "@/app/api/esports/pickem/route";
import { SHA256 } from "crypto-js";
import Image from "next/image";
import { ChangeEvent, FormEventHandler, useEffect, useState } from "react";
import useSWR from "swr";
import style from "./page.module.css";

export default function PageEsports25() {

  const [id, setID] = useState<string>("")
  const [name, setName] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [picks, setPicks] = useState<(boolean|null)[]>([])
  const [matchPicks, setMatchPicks] = useState<[number, number][]>([])

  function updateIDHandler(event: ChangeEvent<HTMLInputElement>) {
    setID(event.target.value)
  }

  function updateNameHandler(event: ChangeEvent<HTMLInputElement>) {
    setName(event.target.value)
  }

  function updatePasswordHandler(event: ChangeEvent<HTMLInputElement>) {
    setPassword(SHA256(event.target.value).toString())
  }

  function updatePicksHandler(index: number, value: boolean) {
    setPicks(picks.map((e, i) => i === index ? value : e))
  }

  const register: FormEventHandler<HTMLFormElement> = async event => {
    event.preventDefault()
    const response = await fetch("/api/esports/pickem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student: { id: id, name: name },
        password: password,
        picks: picks,
      }),
    })
    const error = (await response.json()).errors
    if (error === "BAD_FORM") return alert("학생 정보 형식이 잘못되었습니다.")
    if (error === "PASSWORD_INCORRECT") return alert("비밀번호가 잘못되었습니다.")
    if (error === "MATCH_STARTED") return alert("이미 시작된 경기의 예측 결과를 바꾸셨습니다.")
    if (response.ok) return alert("해당 정보로 승부예측을 갱신했습니다.")
    return alert("알 수 없는 오류가 발생했습니다.")
  }

  
  function Match({ match, index }: { match: EsportsMatch, index: number }) {
    const date = new Date(match.date)
    const sum = !matchPicks.length ? 0 : (matchPicks[index][0]+matchPicks[index][1])
    const left = !sum ? 50 : Math.round(matchPicks[index][0]/sum*100)
    const right = !sum ? 50 : Math.round(matchPicks[index][1]/sum*100)
    return <div className={style.match}>
      <div className={style.title}>{match.name}</div>
      <div className={style.date}>{date.getMonth()+1}월 {date.getDate()+1}일 {date.getHours()}:{date.getMinutes()}</div>
      <div className={style.row}>
        <div className={style.blue}>{left}%</div>
        <button className={style.button} disabled={picks[index] === false} onClick={() => updatePicksHandler(index, false)}>승리로 예측</button>
        <div className={style.team}>{match.home.name}</div>
        <div className={style.score}>{(match.home.score ?? 0).toString()}</div>
        <div className={style.score}>{(match.away.score ?? 0).toString()}</div>
        <div className={style.team}>{match.away.name}</div>
        <button className={style.button} disabled={picks[index] === true} onClick={() => updatePicksHandler(index, true)}>승리로 예측</button>
        <div className={style.red}>{right}%</div>
      </div>
      <div className={style.pickem} style={{background: `linear-gradient(to right, #79ccff ${left}%, #ff7e89 ${left}%)`}}></div>
    </div>
  }
  
  function Matches() {
    const pickemsSWR = useSWR<EsportsPickem[]>("/api/esports/pickem", (arg: string) => fetch(arg).then(res => res.json()))
    const matchesSWR = useSWR<EsportsMatch[]>("/api/esports/match", (arg: string) => fetch(arg).then(res => res.json()))
    const pickems = pickemsSWR.data
    const matches = matchesSWR.data
    useEffect(() => {
      if (!matches || !pickems) return
      setPicks(prev => {
        if (prev.length === matches.length) return prev
        return new Array(matches.length).fill(0).map(() => null)
      })
      setMatchPicks(prev => {
        if (prev.length === matches.length) return prev
        return Object.values(pickems).map(pickem => pickem.picks).reduce((acc, picks) => {
          console.log(picks, acc)
          picks.forEach((value, i) => {
            if (value === true) acc[i][1]++
            if (value === false) acc[i][0]++
          })
          return acc
        }, new Array(matches.length).fill(0).map(() => [0, 0]) as [number, number][])
      })
    }, [matches])
    if (pickemsSWR.isLoading || matchesSWR.isLoading) return <div className={style.matches}>LOADING...</div>
    if (pickemsSWR.error || matchesSWR.error || !pickems || !matches) return <div className={style.matches}>LOADING FAILED</div>
    return <>
      <div className={style.matches}>{
        matches.map((match, index) => <Match match={match} index={index} key={index}></Match>)
      }</div>
    </>
  }

  return <div className={style.background}>
    <header className={style.header}>
      <Image
        src="/lci-icon.png"
        alt="LoL Champions ISHS"
        width={160}
        height={75}
        priority
      /><Image
        src="/lci-Logo.png"
        alt="LoL Champions ISHS"
        width={120}
        height={30}
        priority
      />
    </header>
    <form className={style.form} onSubmit={register}>
      <div>
        <input placeholder="학번" onChange={e => updateIDHandler(e)}></input>
        <input placeholder="이름" onChange={e => updateNameHandler(e)}></input>
        <input placeholder="비밀번호" onChange={e => updatePasswordHandler(e)}></input>
        <button type="submit">제출</button>
      </div>
    </form>
    <Matches/>
  </div>
  

}