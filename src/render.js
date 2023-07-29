function getPRComment(
  overallCoverage,
  project,
  minCoverageOverall,
  minCoverageChangedFiles,
  title,
  emoji
) {
  const heading = getTitle(title)
  const overallTable = getOverallTable(
    project,
    overallCoverage,
    minCoverageOverall,
    minCoverageChangedFiles,
    emoji
  )
  const moduleTable = getModuleTable(
    project.modules,
    minCoverageChangedFiles,
    emoji
  )
  const filesTable = getFileTable(project, minCoverageChangedFiles, emoji)

  const tables =
    project.modules.length === 0
      ? '> There is no coverage information present for the Files changed'
      : project.isMultiModule
      ? moduleTable + '\n\n' + filesTable
      : filesTable

  return heading + overallTable + '\n\n' + tables
}

function getModuleTable(modules, minCoverage, emoji) {
  const tableHeader = '|Module|Coverage||'
  const tableStructure = '|:-|:-|:-:|'
  let table = tableHeader + '\n' + tableStructure
  modules.forEach((module) => {
    const coverageDifference = getCoverageDifferenceForModule(module)
    renderFileRow(module.name, module.percentage, coverageDifference, emoji)
  })
  return table

  function renderFileRow(name, coverage, coverageDiff, emoji) {
    const changedModuleCoverage = 100 + coverageDiff
    const status = getStatus(changedModuleCoverage, minCoverage, emoji)
    let coveragePercentage = `${formatCoverage(coverage)}`
    if (shouldShow(coverageDiff)) {
      coveragePercentage += ` **\`${formatCoverage(coverageDiff)}\`**`
    }
    const row = `|${name}|${coveragePercentage}|${status}|`
    table = table + '\n' + row
  }
}

function getFileTable(project, minCoverage, emoji) {
  const tableHeader = project.isMultiModule
    ? '|Module|File|Coverage||'
    : '|File|Coverage||'
  const tableStructure = project.isMultiModule
    ? '|:-|:-|:-|:-:|'
    : '|:-|:-|:-:|'
  let table = tableHeader + '\n' + tableStructure
  project.modules.forEach((module) => {
    module.files.forEach((file, index) => {
      let moduleName = module.name
      if (index !== 0) {
        moduleName = ''
      }
      const coverageDifference = getCoverageDifferenceForFile(file)
      renderFileRow(
        moduleName,
        `[${file.name}](${file.url})`,
        file.percentage,
        coverageDifference,
        project.isMultiModule,
        emoji
      )
    })
  })
  return project.isMultiModule
    ? '<details>\n' + '<summary>Files</summary>\n\n' + table + '\n\n</details>'
    : table

  function renderFileRow(
    moduleName,
    fileName,
    coverage,
    coverageDiff,
    isMultiModule,
    emoji
  ) {
    const changedFilesCoverage = 100 + coverageDiff
    const status = getStatus(changedFilesCoverage, minCoverage, emoji)
    let coveragePercentage = `${formatCoverage(coverage)}`
    if (shouldShow(coverageDiff)) {
      coveragePercentage += ` **\`${formatCoverage(coverageDiff)}\`**`
    }
    const row = isMultiModule
      ? `|${moduleName}|${fileName}|${coveragePercentage}|${status}|`
      : `|${fileName}|${coveragePercentage}|${status}|`
    table = table + '\n' + row
  }
}

const sumReducer = (total, value) => {
  return total + value
}

function getCoverageDifferenceForFile(file) {
  const totalInstructions = file.covered + file.missed
  const missed = file.lines
    .map((line) => {
      return toFloat(line.instruction.missed)
    })
    .reduce(sumReducer, 0.0)
  return -(missed / totalInstructions) * 100
}

function getCoverageDifferenceForModule(module) {
  const totalInstructions = module.covered + module.missed
  const missed = module.files
    .flatMap((file) => file.lines)
    .map((line) => toFloat(line.instruction.missed))
    .reduce(sumReducer, 0.0)
  return -(missed / totalInstructions) * 100
}

function getCoverageDifferenceForProject(project) {
  const totalInstructions = project.covered + project.missed
  const missed = project.modules
    .flatMap((module) => module.files.flatMap((file) => file.lines))
    .map((line) => toFloat(line.instruction.missed))
    .reduce(sumReducer, 0.0)
  return -(missed / totalInstructions) * 100
}

function getOverallTable(
  project,
  coverage,
  minCoverageOverall,
  minCoverageChanged,
  emoji
) {
  const status = getStatus(coverage, minCoverageOverall, emoji)
  const coverageDifference = getCoverageDifferenceForProject(project)
  let coveragePercentage = `${formatCoverage(coverage)}`
  if (shouldShow(coverageDifference)) {
    coveragePercentage += ` **\`${formatCoverage(coverageDifference)}\`**`
  }
  const tableHeader = `|Overall Project|${coveragePercentage}|${status}|`
  const tableStructure = '|:-|:-|:-:|'

  const changedLines = project.modules.flatMap((module) =>
    module.files.flatMap((file) => file.lines)
  )
  const missedLines = changedLines
    .map((line) => toFloat(line.instruction.missed))
    .reduce(sumReducer, 0.0)
  const coveredLines = changedLines
    .map((line) => toFloat(line.instruction.covered))
    .reduce(sumReducer, 0.0)
  const totalChangedLines = missedLines + coveredLines
  let changedCoverageRow = ''
  if (totalChangedLines !== 0) {
    const changedLinesPercentage = (coveredLines / totalChangedLines) * 100
    const status = getStatus(changedLinesPercentage, minCoverageChanged, emoji)
    changedCoverageRow =
      '\n' +
      `|Changed files|${formatCoverage(changedLinesPercentage)}|${status}|`
  }
  return tableHeader + '\n' + tableStructure + changedCoverageRow
}

function round(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function shouldShow(value) {
  const rounded = Math.abs(round(value))
  return rounded !== 0 && rounded !== 100
}

function getTitle(title) {
  if (title != null && title.length > 0) {
    return '### ' + title + '\n'
  } else {
    return ''
  }
}

function getStatus(coverage, minCoverage, emoji) {
  let status = emoji.pass
  if (coverage < minCoverage) {
    status = emoji.fail
  }
  return status
}

function formatCoverage(coverage) {
  return `${toFloat(coverage)}%`
}

function toFloat(value) {
  return parseFloat(value.toFixed(2))
}

module.exports = {
  getPRComment,
  getTitle,
}
