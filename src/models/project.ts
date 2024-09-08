export interface Project {
  modules: Module[]
  isMultiModule: boolean
  'coverage-changed-files': number
  overall: Coverage | null
  changed: Coverage | null
}

export interface Module {
  name: string
  overall: Coverage
  changed: Coverage | null
  files: File[]
}

export interface File {
  name: string
  url: string
  overall: Coverage
  changed: Coverage | null
  lines: Line[]
}

export interface Coverage {
  missed: number
  covered: number
  percentage: number
}

export interface Line {
  number: number
  instruction: Coverage
  branch: Coverage
}

export interface MinCoverage {
  overall: number
  changed: number
}

export interface Emoji {
  pass: string
  fail: string
}
