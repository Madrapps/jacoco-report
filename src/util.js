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

module.exports = {
  debug,
  getChangedLines,
}
