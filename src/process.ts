// @ts-nocheck
import {getFilesWithCoverage, TAG} from './util'

export function getProjectCoverage(reports, files) {
  const moduleCoverages = []
  const modules = getModulesFromReports(reports)
  modules.forEach(module => {
    const filesCoverage = getFileCoverageFromPackages(
      [].concat(...module.packages),
      files
    )
    if (filesCoverage.files.length !== 0) {
      const moduleCoverage = getModuleCoverage(module.root)
      const changedMissed = filesCoverage.files
        .map(file => file.changed.missed)
        .reduce(sumReducer, 0.0)
      const changedCovered = filesCoverage.files
        .map(file => file.changed.covered)
        .reduce(sumReducer, 0.0)
      moduleCoverages.push({
        name: module.name,
        files: filesCoverage.files,
        overall: {
          percentage: moduleCoverage.percentage,
          covered: moduleCoverage.covered,
          missed: moduleCoverage.missed,
        },
        changed: {
          covered: changedCovered,
          missed: changedMissed,
          percentage: calculatePercentage(changedCovered, changedMissed),
        },
      })
    }
  })
  moduleCoverages.sort((a, b) => b.overall.percentage - a.overall.percentage)
  const totalFiles = moduleCoverages.flatMap(module => {
    return module.files
  })

  const changedMissed = moduleCoverages
    .map(module => module.changed.missed)
    .reduce(sumReducer, 0.0)
  const changedCovered = moduleCoverages
    .map(module => module.changed.covered)
    .reduce(sumReducer, 0.0)

  const projectCoverage = getOverallProjectCoverage(reports)
  const project = {
    modules: moduleCoverages,
    isMultiModule: reports.length > 1 || modules.length > 1,
    overall: {
      covered: projectCoverage.covered,
      missed: projectCoverage.missed,
      percentage: projectCoverage.percentage,
    },
    changed: {
      covered: changedCovered,
      missed: changedMissed,
      percentage: calculatePercentage(changedCovered, changedMissed),
    },
  }
  const totalPercentage = getTotalPercentage(totalFiles)
  if (totalPercentage) {
    project['coverage-changed-files'] = totalPercentage
  } else {
    project['coverage-changed-files'] = 100
  }
  return project
}

const sumReducer = (total, value) => {
  return total + value
}

function toFloat(value) {
  return parseFloat(value.toFixed(2))
}

function getModulesFromReports(reports) {
  const modules = []
  reports.forEach(report => {
    const groupTag = report[TAG.GROUP]
    if (groupTag) {
      const groups = groupTag.filter(group => group !== undefined)
      groups.forEach(group => {
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
    const packages = packageTag.filter(pacage => pacage !== undefined)
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
  jacocoFiles.forEach(jacocoFile => {
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
        githubFile.lines.forEach(lineNumber => {
          const jacocoLine = jacocoFile.lines[lineNumber]
          if (jacocoLine) {
            lines.push({
              number: lineNumber,
              ...jacocoLine,
            })
          }
        })
        const changedMissed = lines
          .map(line => toFloat(line.instruction.missed))
          .reduce(sumReducer, 0.0)
        const changedCovered = lines
          .map(line => toFloat(line.instruction.covered))
          .reduce(sumReducer, 0.0)
        resultFiles.push({
          name,
          url: githubFile.url,
          overall: {
            missed,
            covered,
            percentage: calculatePercentage(covered, missed),
          },
          changed: {
            missed: changedMissed,
            covered: changedCovered,
            percentage: calculatePercentage(changedCovered, changedMissed),
          },
          lines,
        })
      }
    }
  })
  resultFiles.sort((a, b) => b.overall.percentage - a.overall.percentage)

  result.files = resultFiles
  if (resultFiles.length !== 0) {
    result.percentage = getTotalPercentage(resultFiles)
  } else {
    result.percentage = 100
  }
  return result
}

function calculatePercentage(covered, missed) {
  const total = covered + missed
  if (total !== 0) {
    return parseFloat(((covered / total) * 100).toFixed(2))
  } else {
    return null
  }
}

function getTotalPercentage(files) {
  let missed = 0
  let covered = 0
  if (files.length !== 0) {
    files.forEach(file => {
      missed += file.overall.missed
      covered += file.overall.covered
    })
    return parseFloat(((covered / (covered + missed)) * 100).toFixed(2))
  } else {
    return null
  }
}

function getModuleCoverage(report) {
  const counters = report['counter']
  return getDetailedCoverage(counters, 'INSTRUCTION')
}

function getOverallProjectCoverage(reports) {
  const coverages = reports.map(report =>
    getDetailedCoverage(report['counter'], 'INSTRUCTION')
  )
  const covered = coverages.reduce((acc, coverage) => acc + coverage.covered, 0)
  const missed = coverages.reduce((acc, coverage) => acc + coverage.missed, 0)
  return {
    covered,
    missed,
    percentage: parseFloat(((covered / (covered + missed)) * 100).toFixed(2)),
  }
}

function getDetailedCoverage(counters, type) {
  const counter = counters.find(counter => counter[TAG.SELF].type === type)
  if (counter) {
    const attr = counter[TAG.SELF]
    const missed = parseFloat(attr.missed)
    const covered = parseFloat(attr.covered)
    return {
      missed,
      covered,
      percentage: parseFloat(((covered / (covered + missed)) * 100).toFixed(2)),
    }
  }
  return {missed: 0, covered: 0, percentage: 100}
}
