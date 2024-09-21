export interface ChangedFile {
  filePath: string
  url: string
  lines: number[]
}

export interface Sha {
  baseSha: string
  headSha: string
  prNumber: number | undefined
}
