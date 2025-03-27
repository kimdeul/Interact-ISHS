import Contents from "@/layouts/contents"
import Header from "@/layouts/header"

export default function PageReserve() {

  return <>
    <Header></Header>
    <Contents>
      <p>Welcome to Reserving Page</p>
      <select defaultValue={0}>
        <option value={0}>선택하지 않음</option>
        <option value={1}>1번 회의실</option>
        <option value={2}>2번 회의실</option>
        <option value={3}>3번 회의실</option>
        <option value={4}>4번 회의실</option>
        <option value={5}>5번 회의실</option>
      </select>
    </Contents>
  </>
  
}