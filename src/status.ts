import {MinCoverage, Project} from './models/project.js'
import {formatCoverage, getCoverageDifference, shouldShow} from './render.js'

export interface CoverageStatus {
  overall: number
  changed: number | null
  difference: number | null
  passed: boolean
}

export function getCoverageStatus(
  project: Project,
  minCoverage: MinCoverage
): CoverageStatus {
  const overall = project.overall?.percentage ?? 100
  const changed = project.changed?.percentage ?? null
  const difference = project.overall
    ? getCoverageDifference(project.overall, project.changed)
    : null
  const passed =
    overall >= minCoverage.overall &&
    (changed === null || changed >= minCoverage.changed)
  return {overall, changed, difference, passed}
}

export function getCheckTitle(status: CoverageStatus): string {
  const title = `Overall ${formatCoverage(status.overall)}`
  return shouldShow(status.difference)
    ? `${title} (${formatCoverage(status.difference)})`
    : title
}
