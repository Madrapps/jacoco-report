import {getFilesWithCoverage, TAG} from './util'
import {ChangedFile} from './models/github'
import {Coverage, File, Module, Project} from './models/project'

/* eslint-disable @typescript-eslint/no-explicit-any */
export function getProjectCoverage(
  reports: any[],
  changedFiles: ChangedFile[]
): Project {
  const moduleCoverages: Module[] = []
  const modules = getModulesFromReports(reports)
  for (const module of modules) {
    const files = getFileCoverageFromPackages(
      [].concat(...module.packages),
      changedFiles
    )
    if (files.length !== 0) {
      const moduleCoverage = getModuleCoverage(module.root)
      const changedMissed = files
        .map(file => file.changed.missed)
        .reduce(sumReducer, 0.0)
      const changedCovered = files
        .map(file => file.changed.covered)
        .reduce(sumReducer, 0.0)
      moduleCoverages.push({
        name: module.name,
        files,
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
  }
  moduleCoverages.sort(
    (a, b) => (b.overall.percentage ?? 0) - (a.overall.percentage ?? 0)
  )
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
  const totalPercentage = getTotalPercentage(totalFiles)
  return {
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
    'coverage-changed-files': totalPercentage ?? 100,
  }
}

function sumReducer(total: number, value: number): number {
  return total + value
}

function toFloat(value: number): number {
  return parseFloat(value.toFixed(2))
}

function getModulesFromReports(reports: any[]): any[] {
  const modules = []
  for (const report of reports) {
    const groupTag = report[TAG.GROUP]
    if (groupTag) {
      const groups = groupTag.filter((group: any) => group !== undefined)
      for (const group of groups) {
        const module = getModuleFromParent(group)
        modules.push(module)
      }
    }
    const module = getModuleFromParent(report)
    if (module) {
      modules.push(module)
    }
  }
  return modules
}

function getModuleFromParent(parent: any): any | null {
  const packageTag = parent[TAG.PACKAGE]
  if (packageTag) {
    const packages = packageTag.filter((pacage: any) => pacage !== undefined)
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

function getFileCoverageFromPackages(
  packages: any[],
  files: ChangedFile[]
): File[] {
  const resultFiles: File[] = []
  const jacocoFiles = getFilesWithCoverage(packages)
  for (const jacocoFile of jacocoFiles) {
    const name = jacocoFile.name
    const packageName = jacocoFile.packageName
    const githubFile = files.find(function (f) {
      return f.filePath.endsWith(`${packageName}/${name}`)
    })
    if (githubFile) {
      const instruction = jacocoFile.counters.find(
        counter => counter.name === 'instruction'
      )
      if (instruction) {
        const missed = instruction.missed
        const covered = instruction.covered
        const lines = []
        for (const lineNumber of githubFile.lines) {
          const jacocoLine = jacocoFile.lines.find(
            line => line.number === lineNumber
          )
          if (jacocoLine) {
            lines.push({
              ...jacocoLine,
            })
          }
        }
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
  }
  resultFiles.sort(
    (a, b) => (b.overall.percentage ?? 0) - (a.overall.percentage ?? 0)
  )

  return resultFiles
}

function calculatePercentage(
  covered: number,
  missed: number
): number | undefined {
  const total = covered + missed
  if (total !== 0) {
    return parseFloat(((covered / total) * 100).toFixed(2))
  } else {
    return undefined
  }
}

function getTotalPercentage(files: File[]): number | null {
  let missed = 0
  let covered = 0
  if (files.length !== 0) {
    for (const file of files) {
      missed += file.overall.missed
      covered += file.overall.covered
    }
    return parseFloat(((covered / (covered + missed)) * 100).toFixed(2))
  } else {
    return null
  }
}

function getModuleCoverage(report: any): Coverage {
  const counters = report['counter']
  return getDetailedCoverage(counters, 'INSTRUCTION')
}

function getOverallProjectCoverage(reports: any[]): Coverage {
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

function getDetailedCoverage(counters: any[], type: string): Coverage {
  const counterTag = counters.find(counter => counter[TAG.SELF].type === type)
  if (counterTag) {
    const attr = counterTag[TAG.SELF]
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
