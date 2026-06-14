import {getFilesWithCoverage} from './util.js'
import {ChangedFile} from './models/github.js'
import {Coverage, File, Line, Module, Project} from './models/project.js'
import {
  Counter,
  CoverageCounterType,
  Group,
  Package,
  Report,
} from './models/jacoco-types.js'

export function getProjectCoverage(
  reports: Report[],
  changedFiles: ChangedFile[],
  coverageCounterType: CoverageCounterType = 'INSTRUCTION',
  showAllModules = false
): Project {
  const moduleCoverages: Module[] = []
  const modules = getModulesFromReports(reports)
  for (const module of modules) {
    const files = getFileCoverageFromPackages(
      module.packages,
      changedFiles,
      coverageCounterType
    )
    if (files.length !== 0) {
      const moduleCoverage = getModuleCoverage(module.root, coverageCounterType)
      const changedCoverage = getCoverage(files)
      moduleCoverages.push({
        name: module.name,
        files,
        overall: {
          percentage: moduleCoverage.percentage,
          covered: moduleCoverage.covered,
          missed: moduleCoverage.missed,
        },
        changed: changedCoverage,
      })
    } else if (showAllModules) {
      const moduleCoverage = getModuleCoverage(module.root, coverageCounterType)
      moduleCoverages.push({
        name: module.name,
        files: [],
        overall: {
          percentage: moduleCoverage.percentage,
          covered: moduleCoverage.covered,
          missed: moduleCoverage.missed,
        },
        changed: null,
      })
    }
  }
  moduleCoverages.sort((a, b) => b.overall.percentage - a.overall.percentage)
  const changedCoverage = getCoverage(moduleCoverages)
  const projectCoverage = getOverallProjectCoverage(
    reports,
    coverageCounterType
  )
  return {
    modules: moduleCoverages,
    isMultiModule: reports.length > 1 || modules.length > 1,
    overall: projectCoverage,
    changed: changedCoverage,
  }
}

function toFloat(value: number): number {
  return parseFloat(value.toFixed(2))
}

function getModulesFromReports(reports: Report[]): LocalModule[] {
  const modules: LocalModule[] = []
  for (const report of reports) {
    const groupTag = report.group
    if (groupTag) {
      const groups = groupTag.filter(group => group !== undefined)
      for (const group of groups) {
        const module = getModuleFromParent(group, report.filePath)
        if (module) {
          modules.push(module)
        }
      }
    }
    const module = getModuleFromParent(report, report.filePath)
    if (module) {
      modules.push(module)
    }
  }
  disambiguateModuleNames(modules)
  return modules
}

interface LocalModule {
  name: string
  packages: Package[]
  root: Report | Group
  filePath?: string
}

function getModuleFromParent(
  parent: Report | Group,
  filePath?: string
): LocalModule | null {
  const packages = parent.package
  if (packages && packages.length !== 0) {
    return {
      name: parent.name,
      packages,
      root: parent,
      filePath,
    }
  }
  return null
}

function disambiguateModuleNames(modules: LocalModule[]): void {
  const nameGroups = new Map<string, LocalModule[]>()
  for (const module of modules) {
    const group = nameGroups.get(module.name) ?? []
    group.push(module)
    nameGroups.set(module.name, group)
  }
  for (const [, group] of nameGroups) {
    if (group.length <= 1) continue
    const modulePaths = group.map(m =>
      m.filePath ? getModulePathFromFilePath(m.filePath) : null
    )
    const resolvedModulePaths = modulePaths.filter(
      (p): p is string => p !== null
    )
    if (resolvedModulePaths.length !== modulePaths.length) continue
    const commonPrefix = getCommonPrefix(resolvedModulePaths)
    for (let i = 0; i < group.length; i++) {
      const fullPath = resolvedModulePaths[i]
      const uniquePart = fullPath.substring(commonPrefix.length)
      if (uniquePart) {
        group[i].name = ':' + uniquePart.split('/').join(':')
      }
    }
  }
}

export function getModulePathFromFilePath(filePath: string): string | null {
  const normalizedPath = filePath.replace(/\\/g, '/')
  const patterns = [
    /(.+?)\/build\/reports\/jacoco\b/,
    /(.+?)\/target\/site\/jacoco\b/,
    /(.+?)\/target\/jacoco\b/,
  ]
  for (const pattern of patterns) {
    const match = normalizedPath.match(pattern)
    if (match) {
      return match[1]
    }
  }
  return null
}

function getCommonPrefix(paths: string[]): string {
  if (paths.length === 0) return ''
  const segments = paths.map(p => p.split('/'))
  const minLen = Math.min(...segments.map(s => s.length))
  let commonEnd = 0
  for (let i = 0; i < minLen; i++) {
    if (segments.every(s => s[i] === segments[0][i])) {
      commonEnd = i + 1
    } else {
      break
    }
  }
  if (commonEnd === 0) return ''
  return segments[0].slice(0, commonEnd).join('/') + '/'
}

function getFileCoverageFromPackages(
  packages: Package[],
  files: ChangedFile[],
  coverageCounterType: CoverageCounterType
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
      const counter = jacocoFile.counters.find(
        c => c.name === coverageCounterType.toLowerCase()
      )
      if (counter) {
        const missed = counter.missed
        const covered = counter.covered
        const lines: Line[] = []
        for (const lineNumber of githubFile.lines) {
          const jacocoLine = jacocoFile.lines.find(
            line => line.number === lineNumber
          )
          if (jacocoLine) {
            const line: Line = {
              number: lineNumber,
              instruction: {
                missed: jacocoLine.instruction.missed,
                covered: jacocoLine.instruction.covered,
                percentage:
                  calculatePercentage(
                    jacocoLine.instruction.covered,
                    jacocoLine.instruction.missed
                  ) ?? 0,
              },
              branch: {
                missed: jacocoLine.branch.missed,
                covered: jacocoLine.branch.covered,
                percentage:
                  calculatePercentage(
                    jacocoLine.branch.covered,
                    jacocoLine.branch.missed
                  ) ?? 0,
              },
            }
            lines.push(line)
          }
        }
        let changedMissed: number
        let changedCovered: number
        if (coverageCounterType === 'LINE') {
          changedCovered = lines.filter(
            line => line.instruction.covered > 0
          ).length
          changedMissed = lines.filter(
            line =>
              line.instruction.covered === 0 && line.instruction.missed > 0
          ).length
        } else {
          const lineCounterKey: 'instruction' | 'branch' =
            coverageCounterType === 'BRANCH' ? 'branch' : 'instruction'
          changedMissed = lines
            .map(line => toFloat(line[lineCounterKey].missed))
            .reduce(sumReducer, 0.0)
          changedCovered = lines
            .map(line => toFloat(line[lineCounterKey].covered))
            .reduce(sumReducer, 0.0)
        }
        const changedPercentage = calculatePercentage(
          changedCovered,
          changedMissed
        )
        const changedCoverage =
          changedPercentage !== null
            ? {
                missed: changedMissed,
                covered: changedCovered,
                percentage: changedPercentage,
              }
            : null
        const overallPercentage = calculatePercentage(covered, missed)
        const overallCoverage =
          overallPercentage !== null
            ? {missed, covered, percentage: overallPercentage}
            : null
        if (overallCoverage) {
          resultFiles.push({
            name,
            url: githubFile.url,
            overall: overallCoverage,
            changed: changedCoverage,
            lines,
          })
        }
      }
    }
  }
  resultFiles.sort((a, b) => b.overall.percentage - a.overall.percentage)

  return resultFiles
}

function calculatePercentage(covered: number, missed: number): number | null {
  const total = covered + missed
  if (total !== 0) {
    return parseFloat(((covered / total) * 100).toFixed(2))
  } else {
    return null
  }
}

function getModuleCoverage(
  report: Report | Group,
  coverageCounterType: CoverageCounterType
): Coverage {
  const counters = report.counter ?? []
  return getDetailedCoverage(counters, coverageCounterType)
}

function getOverallProjectCoverage(
  reports: Report[],
  coverageCounterType: CoverageCounterType
): Coverage | null {
  const coverages = reports.map(report => {
    const counters = report.counter ?? []
    return getDetailedCoverage(counters, coverageCounterType)
  })
  if (coverages.length === 0) return null
  const covered = coverages.reduce((acc, coverage) => acc + coverage.covered, 0)
  const missed = coverages.reduce((acc, coverage) => acc + coverage.missed, 0)
  const percentage = parseFloat(
    ((covered / (covered + missed)) * 100).toFixed(2)
  )
  if (isNaN(percentage)) return null
  return {
    covered,
    missed,
    percentage,
  }
}

function getDetailedCoverage(counters: Counter[], type: string): Coverage {
  const counter = counters.find(ctr => ctr.type === type)
  if (counter) {
    const missed = counter.missed
    const covered = counter.covered
    return {
      missed,
      covered,
      percentage: parseFloat(((covered / (covered + missed)) * 100).toFixed(2)),
    }
  }
  return {missed: 0, covered: 0, percentage: 100}
}

function getCoverage<T extends File | Module>(entity: T[]): Coverage | null {
  if (entity.length === 0) return null
  const changedMissed = entity
    .map(item => toFloat(item.changed?.missed ?? 0))
    .reduce(sumReducer, 0.0)
  const changedCovered = entity
    .map(line => toFloat(line.changed?.covered ?? 0))
    .reduce(sumReducer, 0.0)
  const changedPercentage = calculatePercentage(changedCovered, changedMissed)
  if (changedPercentage === null || isNaN(changedPercentage)) {
    return null
  }
  return {
    missed: changedMissed,
    covered: changedCovered,
    percentage: changedPercentage,
  }
}

function sumReducer(total: number, value: number): number {
  return total + value
}
