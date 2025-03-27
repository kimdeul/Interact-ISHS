type StudentID = `${
    "1"|"2"|"3"
  }${
    "1"|"2"|"3"|"4"
  }${
    "0"|"1"|"2"
  }${
    "0"|"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"
  }`

export interface Student {
  name: string;
  id: StudentID;
}