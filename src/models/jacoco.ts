export interface JacocoFile {
  name: string
  packageName: string
  counters: JacocoCounter[]
  lines: JacocoLine[]
}

export interface JacocoLine {
  number: number
  instruction: JacocoCoverage
  branch: JacocoCoverage
}

export interface JacocoCoverage {
  missed: number
  covered: number
}

export interface JacocoCounter extends JacocoCoverage {
  name: string
}
