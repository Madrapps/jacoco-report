export interface Report {
  name: string
  sessioninfo?: SessionInfo[]
  group?: Group[]
  package?: Package[]
  counter?: Counter[]
}

export interface SessionInfo {
  id: string
  start: number
  dump: number
}

export interface Group {
  name: string
  group?: Group[]
  package?: Package[]
  counter?: Counter[]
}

export interface Package {
  name: string
  class?: Class[]
  sourcefile?: SourceFile[]
  counter?: Counter[]
}

export interface Class {
  name: string
  sourcefilename?: string
  method?: Method[]
  counter?: Counter[]
}

export interface Method {
  name: string
  desc: string
  line?: number
  counter?: Counter[]
}

export interface SourceFile {
  name: string
  line?: Line[]
  counter?: Counter[]
}

export interface Line {
  nr: number
  mi?: number
  ci?: number
  mb?: number
  cb?: number
}

export interface Counter {
  type: 'INSTRUCTION' | 'BRANCH' | 'LINE' | 'COMPLEXITY' | 'METHOD' | 'CLASS'
  missed: number
  covered: number
}
