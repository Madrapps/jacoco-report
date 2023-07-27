const TAG = {
  SELF: '$',
  SOURCE_FILE: 'sourcefile',
  LINE: 'line',
  COUNTER: 'counter',
  PACKAGE: 'package',
  GROUP: 'group',
}

function debug(obj) {
  return JSON.stringify(obj, ' ', 4)
}

const pattern = /^@@ -([0-9]*),?\S* \+([0-9]*),?/

function getChangedLines(patch) {
  const lines = patch.split('\n')
  const groups = getDiffGroups(lines)
  const lineNumbers = new Set()
  groups.forEach((group) => {
    const firstLine = group.shift()
    if (firstLine) {
      const diffGroup = firstLine.match(pattern)
      if (diffGroup) {
        let bX = parseInt(diffGroup[2])

        group.forEach((line) => {
          bX++

          if (line.startsWith('+')) {
            lineNumbers.add(bX - 1)
          } else if (line.startsWith('-')) {
            bX--
          }
        })
      }
    }
  })
  return [...lineNumbers]
}

function getDiffGroups(lines) {
  const groups = []

  let group = []
  lines.forEach((line) => {
    if (line.startsWith('@@')) {
      group = []
      groups.push(group)
    }
    group.push(line)
  })

  return groups
}

function getFilesWithCoverage(packages) {
  const files = []
  packages.forEach((item) => {
    const packageName = item[TAG.SELF].name
    const sourceFiles = item[TAG.SOURCE_FILE] ?? []
    sourceFiles.forEach((sourceFile) => {
      const sourceFileName = sourceFile[TAG.SELF].name
      const file = {
        name: sourceFileName,
        packageName,
      }
      const counters = sourceFile[TAG.COUNTER] ?? []
      counters.forEach((counter) => {
        const counterSelf = counter[TAG.SELF]
        const type = counterSelf.type
        file[type.toLowerCase()] = {
          missed: counterSelf.missed ?? 0,
          covered: counterSelf.covered ?? 0,
        }
      })

      file.lines = {}
      const lines = sourceFile[TAG.LINE] ?? []
      lines.forEach((line) => {
        const lineSelf = line[TAG.SELF]
        file.lines[lineSelf.nr] = {
          instruction: {
            missed: lineSelf.mi ?? 0,
            covered: lineSelf.ci ?? 0,
          },
          branch: {
            missed: lineSelf.mb ?? 0,
            covered: lineSelf.cb ?? 0,
          },
        }
      })
      files.push(file)
    })
  })
  return files
}

module.exports = {
  debug,
  getChangedLines,
  getFilesWithCoverage,
  TAG,
}
