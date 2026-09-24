import * as core from '@actions/core'
import * as github from '@actions/github'
import {GitHub} from '@actions/github/lib/utils'
import {CoverageStatus, getCheckTitle} from '../status.js'

export const DEFAULT_CHECK_NAME = 'JaCoCo Report'

export class MissingChecksPermissionError extends Error {
  constructor() {
    super(
      "'add-check' requires the 'checks: write' permission. Add `checks: write` to the job permissions."
    )
    this.name = 'MissingChecksPermissionError'
  }
}

export interface PublishCheckParams {
  client: InstanceType<typeof GitHub>
  name: string
  headSha: string
  status: CoverageStatus
  body: string
  failBelowThreshold: boolean
  debugMode: boolean
}

export async function publishCheck({
  client,
  name,
  headSha,
  status,
  body,
  failBelowThreshold,
  debugMode,
}: PublishCheckParams): Promise<void> {
  const checkName = name.trim() || DEFAULT_CHECK_NAME
  const conclusion =
    failBelowThreshold && !status.passed ? 'failure' : 'success'
  const title = getCheckTitle(status)
  if (debugMode)
    core.info(
      `check: name=${checkName} title=${title} conclusion=${conclusion}`
    )

  try {
    await client.rest.checks.create({
      ...github.context.repo,
      name: checkName,
      head_sha: headSha,
      status: 'completed',
      conclusion,
      output: {title, summary: body},
    })
  } catch (error) {
    if (isForbidden(error)) throw new MissingChecksPermissionError()
    throw error
  }
}

function isForbidden(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as {status?: number}).status === 403
  )
}
