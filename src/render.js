function getPRComment(project, minCoverage, title, emoji) {
  const heading = getTitle(title)
  const overallTable = getOverallTable(project, minCoverage, emoji)
  const moduleTable = getModuleTable(project.modules, minCoverage, emoji)
  const filesTable = getFileTable(project, minCoverage, emoji)

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
    const coverageDifference = getCoverageDifference(
      module.overall,
      module.changed
    )
    renderFileRow(
      module.name,
      module.overall.percentage,
      coverageDifference,
      emoji
    )
  })
  return table

  function renderFileRow(name, coverage, coverageDiff, emoji) {
    const changedModuleCoverage = 100 + coverageDiff
    const status = getStatus(changedModuleCoverage, minCoverage.changed, emoji)
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
      const coverageDifference = getCoverageDifference(
        file.overall,
        file.changed
      )
      renderFileRow(
        moduleName,
        `[${file.name}](${file.url})`,
        file.overall.percentage,
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
    const status = getStatus(changedFilesCoverage, minCoverage.changed, emoji)
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

function getCoverageDifference(overall, changed) {
  const totalInstructions = overall.covered + overall.missed
  const missed = changed.missed
  return -(missed / totalInstructions) * 100
}

function getOverallTable(project, minCoverage, emoji) {
  const status = getStatus(
    project.overall.percentage,
    minCoverage.overall,
    emoji
  )
  const coverageDifference = getCoverageDifference(
    project.overall,
    project.changed
  )
  let coveragePercentage = `${formatCoverage(project.overall.percentage)}`
  if (shouldShow(coverageDifference)) {
    coveragePercentage += ` **\`${formatCoverage(coverageDifference)}\`**`
  }
  const tableHeader = `|Overall Project|${coveragePercentage}|${status}|`
  const tableStructure = '|:-|:-|:-:|'

  const missedLines = project.changed.missed
  const coveredLines = project.changed.covered
  const totalChangedLines = missedLines + coveredLines
  let changedCoverageRow = ''
  if (totalChangedLines !== 0) {
    const changedLinesPercentage = (coveredLines / totalChangedLines) * 100
    const status = getStatus(changedLinesPercentage, minCoverage.changed, emoji)
    changedCoverageRow =
      '\n' +
      `|Files changed|${formatCoverage(changedLinesPercentage)}|${status}|` +
      '\n<br>'
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
