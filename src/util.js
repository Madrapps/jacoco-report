function debug(obj) {
  return JSON.stringify(obj, ' ', 4)
}

const pattern = /^@@ -([0-9]*),?\S* \+([0-9]*),?/

function getChangedLines(patch) {
  const lines = patch.split('\n')
  console.log(`LINES = ${lines} = ${lines.length}`)
  const lineNumbers = new Set()
  const firstLine = lines.shift()
  if (firstLine) {
    const diffGroup = firstLine.match(pattern)
    if (diffGroup) {
      let aX = parseInt(diffGroup[1])
      let bX = parseInt(diffGroup[2])

      lines.forEach((line) => {
        aX++
        bX++

        if (line.startsWith('+')) {
          aX--
          lineNumbers.add(bX)
        } else if (line.startsWith('-')) {
          bX--
          lineNumbers.add(aX)
        }
      })
    }
  }
  return [...lineNumbers]
}

module.exports = {
  debug,
  getChangedLines,
}
