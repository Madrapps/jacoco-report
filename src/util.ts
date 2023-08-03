import {JacocoFile} from './models/jacoco'

export const TAG = {
  SELF: '$',
  SOURCE_FILE: 'sourcefile',
  LINE: 'line',
  COUNTER: 'counter',
  PACKAGE: 'package',
  GROUP: 'group',
}

export function debug(obj: Object): string {
  return JSON.stringify(obj, null, 4)
}

const pattern = /^@@ -([0-9]*),?\S* \+([0-9]*),?/

export function getChangedLines(patch: string | undefined): number[] {
  const lineNumbers = new Set<number>()
  if (patch) {
    const lines = patch.split('\n')
    const groups = getDiffGroups(lines)
    for (const group of groups) {
      const firstLine = group.shift()
      if (firstLine) {
        const diffGroup = firstLine.match(pattern)
        if (diffGroup) {
          let bX = parseInt(diffGroup[2])

          for (const line of group) {
            bX++

            if (line.startsWith('+')) {
              lineNumbers.add(bX - 1)
            } else if (line.startsWith('-')) {
              bX--
            }
          }
        }
      }
    }
  }
  return [...lineNumbers]
}

function getDiffGroups(lines: string[]): string[][] {
  const groups: string[][] = []

  let group: string[] = []
  for (const line of lines) {
    if (line.startsWith('@@')) {
      group = []
      groups.push(group)
    }
    group.push(line)
  }

  return groups
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function getFilesWithCoverage(packages: any): JacocoFile[] {
  const files: JacocoFile[] = []
  for (const item of packages) {
    const packageName: string = item[TAG.SELF].name
    const sourceFiles = item[TAG.SOURCE_FILE] ?? []
    for (const sourceFile of sourceFiles) {
      const sourceFileName = sourceFile[TAG.SELF].name
      const file: JacocoFile = {
        name: sourceFileName,
        packageName,
        lines: [],
        counters: [],
      }
      const counters = sourceFile[TAG.COUNTER] ?? []
      for (const counter of counters) {
        const counterSelf = counter[TAG.SELF]
        const type = counterSelf.type
        file.counters.push({
          name: type.toLowerCase(),
          missed: parseInt(counterSelf.missed) ?? 0,
          covered: parseInt(counterSelf.covered) ?? 0,
        })
      }

      const lines = sourceFile[TAG.LINE] ?? []
      for (const line of lines) {
        const lineSelf = line[TAG.SELF]
        file.lines.push({
          number: parseInt(lineSelf.nr) ?? 0,
          instruction: {
            missed: parseInt(lineSelf.mi) ?? 0,
            covered: parseInt(lineSelf.ci) ?? 0,
          },
          branch: {
            missed: parseInt(lineSelf.mb) ?? 0,
            covered: parseInt(lineSelf.cb) ?? 0,
          },
        })
      }
      files.push(file)
    }
  }
  return files
}
