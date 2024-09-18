import {Coverage, Emoji, MinCoverage, Module, Project} from './models/project'

const coverageAbsent =
  '> There is no coverage information present for the Files changed'

export function getPRComment(
  project: Project,
  minCoverage: MinCoverage,
  title: string,
  emoji: Emoji
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
  const filesTable = getFileTable(project, minCoverage, emoji)

  const tables =
    project.modules.length === 0
      ? coverageAbsent
      : project.isMultiModule
        ? `${moduleTable}\n\n${filesTable}`
        : filesTable

  return `${heading + overallTable}\n\n${tables}`
}

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
  emoji: Emoji
): string {
  const tableHeader = project.isMultiModule
    ? '|Module|File|Coverage||'
    : '|File|Coverage||'
  const tableStructure = project.isMultiModule
    ? '|:-|:-|:-|:-:|'
    : '|:-|:-|:-:|'
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
        `[${file.name}](${file.url})`,
        file.overall.percentage,
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
    fileName: string,
    overallCoverage: number | null,
    coverageDiff: number | null,
    changedCoverage: number | null,
    isMultiModule: boolean
  ): void {
    const status = getStatus(changedCoverage, minCoverage.changed, emoji)
    let coveragePercentage = `${formatCoverage(overallCoverage)}`
    if (shouldShow(coverageDiff)) {
      coveragePercentage += ` **\`${formatCoverage(coverageDiff)}\`**`
    }
    const row = isMultiModule
      ? `|${moduleName}|${fileName}|${coveragePercentage}|${status}|`
      : `|${fileName}|${coveragePercentage}|${status}|`
    table = `${table}\n${row}`
  }
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
    const filesChangedStatus = getStatus(
      changedLinesPercentage,
      minCoverage.changed,
      emoji
    )
    changedCoverageRow =
      '\n' +
      `|Files changed|${formatCoverage(
        changedLinesPercentage
      )}|${filesChangedStatus}|` +
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
