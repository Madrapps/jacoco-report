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
    overallCoverage,
    minCoverageOverall,
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
  const tableStructure = '|:-|:-:|:-:|'
  let table = tableHeader + '\n' + tableStructure
  modules.forEach((module) => {
    renderFileRow(module.name, module.percentage, emoji)
  })
  return table

  function renderFileRow(name, coverage, emoji) {
    const status = getStatus(coverage, minCoverage, emoji)
    const row = `|${name}|${formatCoverage(coverage)}|${status}|`
    table = table + '\n' + row
  }
}

function getFileTable(project, minCoverage, emoji) {
  const coverage = project['coverage-changed-files']
  const tableHeader = project.isMultiModule
    ? `|Module|File|Coverage [${formatCoverage(coverage)}]||`
    : `|File|Coverage [${formatCoverage(coverage)}]||`
  const tableStructure = project.isMultiModule
    ? '|:-|:-|:-:|:-:|'
    : '|:-|:-:|:-:|'
  let table = tableHeader + '\n' + tableStructure
  project.modules.forEach((module) => {
    module.files.forEach((file, index) => {
      let moduleName = module.name
      if (index !== 0) {
        moduleName = ''
      }
      renderFileRow(
        moduleName,
        `[${file.name}](${file.url})`,
        file.percentage,
        project.isMultiModule,
        emoji
      )
    })
  })
  return project.isMultiModule
    ? '<details>\n' + '<summary>Files</summary>\n\n' + table + '\n\n</details>'
    : table

  function renderFileRow(moduleName, fileName, coverage, isMultiModule, emoji) {
    const status = getStatus(coverage, minCoverage, emoji)
    const row = isMultiModule
      ? `|${moduleName}|${fileName}|${formatCoverage(coverage)}|${status}|`
      : `|${fileName}|${formatCoverage(coverage)}|${status}|`
    table = table + '\n' + row
  }
}

function getOverallTable(coverage, minCoverage, emoji) {
  const status = getStatus(coverage, minCoverage, emoji)
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

function getStatus(coverage, minCoverage, emoji) {
  let status = emoji.pass
  if (coverage < minCoverage) {
    status = emoji.fail
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
