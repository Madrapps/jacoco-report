// @ts-nocheck
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

export function getChangedLines(patch: string) {
  const lines = patch.split('\n')
  const groups = getDiffGroups(lines)
  const lineNumbers = new Set()
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
  return [...lineNumbers]
}

function getDiffGroups(lines) {
  const groups = []

  let group = []
  for (const line of lines) {
    if (line.startsWith('@@')) {
      group = []
      groups.push(group)
    }
    group.push(line)
  }

  return groups
}

export function getFilesWithCoverage(packages) {
  const files = []
  for (const item of packages) {
    const packageName = item[TAG.SELF].name
    const sourceFiles = item[TAG.SOURCE_FILE] ?? []
    for (const sourceFile of sourceFiles) {
      const sourceFileName = sourceFile[TAG.SELF].name
      const file = {
        name: sourceFileName,
        packageName,
      }
      const counters = sourceFile[TAG.COUNTER] ?? []
      for (const counter of counters) {
        const counterSelf = counter[TAG.SELF]
        const type = counterSelf.type
        file[type.toLowerCase()] = {
          missed: parseInt(counterSelf.missed) ?? 0,
          covered: parseInt(counterSelf.covered) ?? 0,
        }
      }

      file.lines = {}
      const lines = sourceFile[TAG.LINE] ?? []
      for (const line of lines) {
        const lineSelf = line[TAG.SELF]
        file.lines[lineSelf.nr] = {
          instruction: {
            missed: parseInt(lineSelf.mi) ?? 0,
            covered: parseInt(lineSelf.ci) ?? 0,
          },
          branch: {
            missed: parseInt(lineSelf.mb) ?? 0,
            covered: parseInt(lineSelf.cb) ?? 0,
          },
        }
      }
      files.push(file)
    }
  }
  return files
}
