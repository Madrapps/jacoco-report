function getPRComment(
  overallCoverage,
  project,
  minCoverageOverall,
  minCoverageChangedFiles,
  title
) {
  const heading = getTitle(title)
  const overallTable = getOverallTable(overallCoverage, minCoverageOverall)
  const moduleTable = getModuleTable(project.modules, minCoverageChangedFiles)
  const filesTable = getFileTable(project, minCoverageChangedFiles)
  return heading + overallTable + '\n\n' + moduleTable + '\n\n' + filesTable
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

function getFileTable(project, minCoverage) {
  const coverage = project['coverage-changes-files']
  const tableHeader = `|Module|File|Coverage [${formatCoverage(coverage)}]||`
  const tableStructure = '|:-|:-|:-:|:-:|'
  let table = tableHeader + '\n' + tableStructure
  project.modules.forEach((module) => {
    module.files.forEach((file, index) => {
      let moduleName = module.name
      if (index !== 0) {
        moduleName = ''
      }
      renderFileRow(moduleName, `[${file.name}](${file.url})`, file.percentage)
    })
  })
  return (
    '<details>\n' + '<summary>Files</summary>\n\n' + table + '\n\n</details>'
  )

  function renderFileRow(moduleName, fileName, coverage) {
    addRow(getRow(moduleName, fileName, coverage))
  }

  function getRow(moduleName, fileName, coverage) {
    const status = getStatus(coverage, minCoverage)
    return `|${moduleName}|${fileName}|${formatCoverage(coverage)}|${status}|`
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
