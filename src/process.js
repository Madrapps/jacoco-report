const { TAG, getFilesWithCoverage } = require('./util')

function getProjectCoverage(reports, files) {
  const moduleCoverages = []
  const modules = getModulesFromReports(reports)
  modules.forEach((module) => {
    const filesCoverage = getFileCoverageFromPackages(
      [].concat(...module.packages),
      files
    )
    if (filesCoverage.files.length !== 0) {
      moduleCoverages.push({
        name: module.name,
        percentage: getModuleCoverage(module.root),
        files: filesCoverage.files,
      })
    }
  })
  moduleCoverages.sort((a, b) => b.percentage - a.percentage)
  const totalFiles = moduleCoverages.flatMap((module) => {
    return module.files
  })
  const project = {
    modules: moduleCoverages,
    isMultiModule: reports.length > 1 || modules.length > 1,
  }
  const totalPercentage = getTotalPercentage(totalFiles)
  if (totalPercentage) {
    project['coverage-changed-files'] = totalPercentage
  } else {
    project['coverage-changed-files'] = 100
  }
  return project
}

function getModulesFromReports(reports) {
  const modules = []
  reports.forEach((report) => {
    const groupTag = report[TAG.GROUP]
    if (groupTag) {
      const groups = groupTag.filter((group) => group !== undefined)
      groups.forEach((group) => {
        const module = getModuleFromParent(group)
        modules.push(module)
      })
    }
    const module = getModuleFromParent(report)
    if (module) {
      modules.push(module)
    }
  })
  return modules
}

function getModuleFromParent(parent) {
  const packageTag = parent[TAG.PACKAGE]
  if (packageTag) {
    const packages = packageTag.filter((pacage) => pacage !== undefined)
    if (packages.length !== 0) {
      return {
        name: parent['$'].name,
        packages,
        root: parent, // TODO just pass array of 'counters'
      }
    }
  }
  return null
}

function getFileCoverageFromPackages(packages, files) {
  const result = {}
  const resultFiles = []
  const jacocoFiles = getFilesWithCoverage(packages)
  jacocoFiles.forEach((jacocoFile) => {
    const name = jacocoFile.name
    const packageName = jacocoFile.packageName
    const githubFile = files.find(function (f) {
      return f.filePath.endsWith(`${packageName}/${name}`)
    })
    if (githubFile) {
      const instruction = jacocoFile.instruction
      if (instruction) {
        const missed = parseFloat(instruction.missed)
        const covered = parseFloat(instruction.covered)
        const lines = []
        githubFile.lines.forEach((lineNumber) => {
          const jacocoLine = jacocoFile.lines[lineNumber]
          if (jacocoLine) {
            lines.push({
              number: lineNumber,
              ...jacocoLine,
            })
          }
        })
        resultFiles.push({
          name,
          url: githubFile.url,
          missed,
          covered,
          percentage: parseFloat(
            ((covered / (covered + missed)) * 100).toFixed(2)
          ),
          lines,
        })
      }
    }
  })
  resultFiles.sort((a, b) => b.percentage - a.percentage)

  result.files = resultFiles
  if (resultFiles.length !== 0) {
    result.percentage = getTotalPercentage(resultFiles)
  } else {
    result.percentage = 100
  }
  return result
}

function getTotalPercentage(files) {
  let missed = 0
  let covered = 0
  if (files.length !== 0) {
    files.forEach((file) => {
      missed += file.missed
      covered += file.covered
    })
    return parseFloat(((covered / (covered + missed)) * 100).toFixed(2))
  } else {
    return null
  }
}

function getOverallCoverage(reports) {
  const coverage = {}
  const modules = []
  reports.forEach((report) => {
    const moduleName = report['$'].name
    const moduleCoverage = getModuleCoverage(report)
    modules.push({
      module: moduleName,
      coverage: moduleCoverage,
    })
  })
  coverage.project = getOverallProjectCoverage(reports)
  coverage.modules = modules
  return coverage
}

function getModuleCoverage(report) {
  const counters = report['counter']
  const coverage = getDetailedCoverage(counters, 'INSTRUCTION')
  return coverage.percentage
}

function getOverallProjectCoverage(reports) {
  const coverages = reports.map((report) =>
    getDetailedCoverage(report['counter'], 'INSTRUCTION')
  )
  const covered = coverages.reduce((acc, coverage) => acc + coverage.covered, 0)
  const missed = coverages.reduce((acc, coverage) => acc + coverage.missed, 0)
  return parseFloat(((covered / (covered + missed)) * 100).toFixed(2))
}

function getDetailedCoverage(counters, type) {
  const coverage = {}
  counters.forEach((counter) => {
    const attr = counter[TAG.SELF]
    if (attr.type === type) {
      const missed = parseFloat(attr['missed'])
      const covered = parseFloat(attr['covered'])
      coverage.missed = missed
      coverage.covered = covered
      coverage.percentage = parseFloat(
        ((covered / (covered + missed)) * 100).toFixed(2)
      )
    }
  })
  return coverage
}

module.exports = {
  getProjectCoverage,
  getOverallCoverage,
}
