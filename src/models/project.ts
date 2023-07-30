export interface File {
  name: string
  url: string
  overall: Coverage
  changed: Coverage
  lines: Line[]
}

export interface Coverage {
  missed: number
  covered: number
  percentage?: number
}

export interface Line {
  number: number
  instruction: Coverage
  branch: Coverage
}
