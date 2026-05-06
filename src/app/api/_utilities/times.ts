export function isToday(date: Date) {
  const now = new Date()
  return (date.getFullYear() === now.getFullYear()) &&
    (date.getMonth() === now.getMonth()) &&
    (date.getDay() === now.getDay())
}

export function isAfter() {
  const now = new Date()
  return (now.getHours() > 13) || (now.getHours() == 13 || now.getMinutes() >= 20)
}