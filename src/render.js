function getPRComment(
  overallCoverage,
  project,
  minCoverageOverall,
  minCoverageChangedFiles,
  title
) {
  const moduleTable = getModuleTable(project.modules, minCoverageChangedFiles)
  const overallTable = getOverallTable(overallCoverage, minCoverageOverall)
  const heading = getTitle(title)
  return heading + moduleTable + '\n\n' + overallTable
}

function getModuleTable(modules, minCoverage) {
  if (modules.length.size === 0) {
    return '> There is no coverage information present for the Files changed'
  }

  const tableHeader = '|Module|Coverage||'
  const tableStructure = '|:-|:-:|:-:|'
  let table = tableHeader + '\n' + tableStructure
  modules.forEach((module) => {
    renderFileRow(module.name, module.percentage)
  })
  return table

  function renderFileRow(name, coverage) {
    addRow(getRow(name, coverage))
  }

  function getRow(name, coverage) {
    const status = getStatus(coverage, minCoverage)
    return `|${name}|${formatCoverage(coverage)}|${status}|`
  }

  function addRow(row) {
    table = table + '\n' + row
  }
}

function getFileTable(filesCoverage, minCoverage) {
  const files = filesCoverage.files
  if (files.length === 0) {
    return '> There is no coverage information present for the Files changed'
  }

  const tableHeader = getHeader(filesCoverage.percentage)
  const tableStructure = '|:-|:-:|:-:|'
  let table = tableHeader + '\n' + tableStructure
  files.forEach((file) => {
    renderFileRow(`[${file.name}](${file.url})`, file.percentage)
  })
  return table

  function getHeader(coverage) {
    const status = getStatus(coverage, minCoverage)
    return `|File|Coverage [${formatCoverage(coverage)}]|${status}|`
  }

  function renderFileRow(name, coverage) {
    addRow(getRow(name, coverage))
  }

  function getRow(name, coverage) {
    const status = getStatus(coverage, minCoverage)
    return `|${name}|${formatCoverage(coverage)}|${status}|`
  }

  function addRow(row) {
    table = table + '\n' + row
  }
}

function getOverallTable(coverage, minCoverage) {
  const status = getStatus(coverage, minCoverage)
  const tableHeader = `|Total Project Coverage|${formatCoverage(
    coverage
  )}|${status}|`
  const tableStructure = '|:-|:-:|:-:|'
  return tableHeader + '\n' + tableStructure
}

function getTitle(title) {
  if (title != null && title.length > 0) {
    return '### ' + title + '\n'
  } else {
    return ''
  }
}

function getStatus(coverage, minCoverage) {
  let status = ':green_apple:'
  if (coverage < minCoverage) {
    status = ':x:'
  }
  return status
}

function formatCoverage(coverage) {
  return `${parseFloat(coverage.toFixed(2))}%`
}

module.exports = {
  getPRComment,
  getTitle,
}
