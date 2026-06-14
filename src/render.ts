import {
  Coverage,
  Emoji,
  File,
  Line,
  MinCoverage,
  Module,
  Project,
} from './models/project.js'
import {CoverageCounterType} from './models/jacoco-types.js'

const coverageAbsent =
  '> There is no coverage information present for the changed lines'

export function getPRComment(
  project: Project,
  minCoverage: MinCoverage,
  title: string,
  emoji: Emoji,
  showMissingLines = false,
  coverageCounterType: CoverageCounterType = 'INSTRUCTION'
): string {
  const heading = getTitle(title)
  if (!project.overall) {
    return `${heading + coverageAbsent}`
  }
  const overallTable = getOverallTable(
    project.overall,
    project.changed,
    minCoverage,
    emoji
  )
  const moduleTable = getModuleTable(project.modules, minCoverage, emoji)
  const filesTable = getFileTable(
    project,
    minCoverage,
    emoji,
    showMissingLines,
    coverageCounterType
  )

  const tables =
    project.modules.length === 0
      ? coverageAbsent
      : project.isMultiModule
        ? `${moduleTable}\n\n${filesTable}`
        : filesTable

  return `${heading + overallTable}\n\n${tables}`
}

const MODULE_COLLAPSE_THRESHOLD = 10

function getModuleTable(
  modules: Module[],
  minCoverage: MinCoverage,
  emoji: Emoji
): string {
  const tableHeader = '|Module|Coverage||'
  const tableStructure = '|:-|:-|:-:|'
  let table = `${tableHeader}\n${tableStructure}`
  for (const module of modules) {
    const coverageDifference = getCoverageDifference(
      module.overall,
      module.changed
    )
    renderRow(
      module.name,
      module.overall.percentage,
      coverageDifference,
      module.changed?.percentage ?? null
    )
  }
  if (modules.length > MODULE_COLLAPSE_THRESHOLD) {
    return `<details>\n<summary>Modules (${modules.length})</summary>\n\n${table}\n\n</details>`
  }
  return table

  function renderRow(
    name: string,
    overallCoverage: number | null,
    coverageDiff: number | null,
    changedCoverage: number | null
  ): void {
    const status = getStatus(changedCoverage, minCoverage.changed, emoji)
    let coveragePercentage = `${formatCoverage(overallCoverage)}`
    if (shouldShow(coverageDiff)) {
      coveragePercentage += ` **\`${formatCoverage(coverageDiff)}\`**`
    }
    const row = `|${name}|${coveragePercentage}|${status}|`
    table = `${table}\n${row}`
  }
}

function getFileTable(
  project: Project,
  minCoverage: MinCoverage,
  emoji: Emoji,
  showMissingLines: boolean,
  coverageCounterType: CoverageCounterType
): string {
  const missingLinesHeader = showMissingLines ? 'Lines missed|' : ''
  const missingLinesStructure = showMissingLines ? ':-|' : ''
  const tableHeader = project.isMultiModule
    ? `|Module|File|Coverage|${missingLinesHeader}|`
    : `|File|Coverage|${missingLinesHeader}|`
  const tableStructure = project.isMultiModule
    ? `|:-|:-|:-|${missingLinesStructure}:-:|`
    : `|:-|:-|${missingLinesStructure}:-:|`
  let table = `${tableHeader}\n${tableStructure}`
  for (const module of project.modules) {
    for (let index = 0; index < module.files.length; index++) {
      const file = module.files[index]
      let moduleName = module.name
      if (index !== 0) {
        moduleName = ''
      }
      const coverageDifference = getCoverageDifference(
        file.overall,
        file.changed
      )
      renderRow(
        moduleName,
        file,
        coverageDifference,
        file.changed?.percentage ?? null,
        project.isMultiModule
      )
    }
  }
  return project.isMultiModule
    ? `<details>\n<summary>Files</summary>\n\n${table}\n\n</details>`
    : table

  function renderRow(
    moduleName: string,
    file: File,
    coverageDiff: number | null,
    changedCoverage: number | null,
    isMultiModule: boolean
  ): void {
    const status = getStatus(changedCoverage, minCoverage.changed, emoji)
    let coveragePercentage = `${formatCoverage(file.overall.percentage)}`
    if (shouldShow(coverageDiff)) {
      coveragePercentage += ` **\`${formatCoverage(coverageDiff)}\`**`
    }
    const fileName = `[${file.name}](${file.url})`
    const missingLinesCell = showMissingLines
      ? `${getMissingLines(file, coverageCounterType)}|`
      : ''
    const row = isMultiModule
      ? `|${moduleName}|${fileName}|${coveragePercentage}|${missingLinesCell}${status}|`
      : `|${fileName}|${coveragePercentage}|${missingLinesCell}${status}|`
    table = `${table}\n${row}`
  }
}

const MISSING_LINES_MAX_GROUPS = 10

function getMissingLines(
  file: File,
  coverageCounterType: CoverageCounterType
): string {
  const missedLines = file.lines
    .filter(line => isLineMissed(line, coverageCounterType))
    .map(line => line.number)

  if (missedLines.length === 0) return ''

  const groups = groupConsecutiveLines(missedLines)
  const displayGroups = groups.slice(0, MISSING_LINES_MAX_GROUPS)
  const remaining = groups.length - displayGroups.length

  const links = displayGroups.map(group => {
    if (group.length === 1) {
      return `[L${group[0]}](${file.url}#L${group[0]})`
    }
    const start = group[0]
    const end = group[group.length - 1]
    return `[L${start}-L${end}](${file.url}#L${start}-L${end})`
  })

  if (remaining > 0) {
    links.push(`[+${remaining} more](${file.url})`)
  }

  return links.join(', ')
}

function groupConsecutiveLines(lines: number[]): number[][] {
  const groups: number[][] = []
  let current: number[] = []
  for (const line of lines) {
    if (current.length === 0 || line === current[current.length - 1] + 1) {
      current.push(line)
    } else {
      groups.push(current)
      current = [line]
    }
  }
  if (current.length > 0) {
    groups.push(current)
  }
  return groups
}

function isLineMissed(
  line: Line,
  coverageCounterType: CoverageCounterType
): boolean {
  if (coverageCounterType === 'BRANCH') {
    return line.branch.covered === 0 && line.branch.missed > 0
  }
  return line.instruction.covered === 0 && line.instruction.missed > 0
}

function getCoverageDifference(
  overall: Coverage,
  changed: Coverage | null
): number | null {
  if (!changed) return null
  const totalInstructions = overall.covered + overall.missed
  const missed = changed.missed
  const changedPercentage = (missed / totalInstructions) * 100
  if (changedPercentage > 0 && changedPercentage < 100) {
    return -changedPercentage
  } else return null
}

function getOverallTable(
  overall: Coverage,
  changed: Coverage | null,
  minCoverage: MinCoverage,
  emoji: Emoji
): string {
  const overallStatus = getStatus(
    overall.percentage,
    minCoverage.overall,
    emoji
  )
  const coverageDifference = getCoverageDifference(overall, changed)
  let coveragePercentage = `${formatCoverage(overall.percentage)}`
  if (shouldShow(coverageDifference)) {
    coveragePercentage += ` **\`${formatCoverage(coverageDifference)}\`**`
  }
  const tableHeader = `|Overall Project|${coveragePercentage}|${overallStatus}|`
  const tableStructure = '|:-|:-|:-:|'

  const missedLines = changed?.missed ?? 0
  const coveredLines = changed?.covered ?? 0
  const totalChangedLines = missedLines + coveredLines
  let changedCoverageRow = ''
  if (totalChangedLines !== 0) {
    const changedLinesPercentage = (coveredLines / totalChangedLines) * 100
    const changedLinesStatus = getStatus(
      changedLinesPercentage,
      minCoverage.changed,
      emoji
    )
    changedCoverageRow =
      '\n' +
      `|Changed lines|${formatCoverage(
        changedLinesPercentage
      )}|${changedLinesStatus}|` +
      '\n<br>'
  }
  return `${tableHeader}\n${tableStructure}${changedCoverageRow}`
}

function round(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function shouldShow(value: number | null): boolean {
  if (value === null) return false
  const rounded = Math.abs(round(value))
  return rounded !== 0 && rounded !== 100
}

export function getTitle(title?: string): string {
  if (title != null && title.trim().length > 0) {
    const trimmed = title.trim()
    return trimmed.startsWith('#') ? `${trimmed}\n` : `### ${trimmed}\n`
  } else {
    return ''
  }
}

function getStatus(
  coverage: number | null,
  minCoverage: number,
  emoji: Emoji
): string {
  let status = emoji.pass
  if (coverage !== null && coverage < minCoverage) {
    status = emoji.fail
  }
  return status
}

function formatCoverage(coverage: number | null): string {
  if (coverage == null) return 'NaN%'
  return `${toFloat(coverage)}%`
}

function toFloat(value: number): number {
  return parseFloat(value.toFixed(2))
}
