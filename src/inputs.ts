import * as core from '@actions/core'
import {parseBooleans} from 'xml2js/lib/processors'
import {Emoji, MinCoverage} from './models/project.js'
import {
  CoverageCounterType,
  VALID_COVERAGE_COUNTER_TYPES,
} from './models/jacoco-types.js'

export const VALID_COMMENT_TYPES = [
  'pr_comment',
  'summary',
  'both',
  'none',
] as const

export type CommentType = (typeof VALID_COMMENT_TYPES)[number]

export interface Inputs {
  token: string
  reportPaths: string[]
  minCoverage: MinCoverage
  title: string
  updateComment: boolean
  commentType: CommentType
  prNumber: string
  headSha: string
  baseSha: string
  skipIfNoChanges: boolean
  showAllModules: boolean
  showMissingLines: boolean
  emoji: Emoji
  continueOnError: boolean
  debugMode: boolean
  coverageCounterType: CoverageCounterType
  addCheck: boolean
  failCheckBelowThreshold: boolean
}

const isValidCommentType = (value: string): value is CommentType =>
  (VALID_COMMENT_TYPES as readonly string[]).includes(value)

/**
 * Reads and validates all action inputs. On a validation error the failure is
 * reported through core.setFailed and undefined is returned.
 */
export function parseInputs(): Inputs | undefined {
  const token = core.getInput('token')
  if (!token) {
    core.setFailed("'token' is missing")
    return undefined
  }
  const pathsString = core.getInput('paths')
  if (!pathsString) {
    core.setFailed("'paths' is missing")
    return undefined
  }
  if (core.getInput('min-coverage-changed-files')) {
    core.setFailed(
      "'min-coverage-changed-files' is no longer supported. Please use 'min-coverage-changed-lines' instead."
    )
    return undefined
  }

  const coverageCounterType = core
    .getInput('coverage-counter-type')
    .toUpperCase() as CoverageCounterType
  if (!VALID_COVERAGE_COUNTER_TYPES.includes(coverageCounterType)) {
    core.setFailed(
      `'coverage-counter-type' ${coverageCounterType} is invalid. Valid values: ${VALID_COVERAGE_COUNTER_TYPES.join(', ')}`
    )
    return undefined
  }

  const commentType = core.getInput('comment-type')
  if (!isValidCommentType(commentType)) {
    core.setFailed(
      `'comment-type' ${commentType} is invalid. Valid values: ${VALID_COMMENT_TYPES.join(', ')}`
    )
    return undefined
  }

  const addCheck = parseBooleans(core.getInput('add-check'))
  const failCheckBelowThreshold = parseBooleans(
    core.getInput('fail-check-below-threshold')
  )
  if (failCheckBelowThreshold && !addCheck) {
    core.setFailed(
      "'fail-check-below-threshold' requires 'add-check' to be true"
    )
    return undefined
  }
  if (commentType === 'none' && !addCheck) {
    core.setFailed(
      "'comment-type' is none and 'add-check' is false: nothing to publish"
    )
    return undefined
  }

  const title = core.getInput('title')
  const updateComment = parseBooleans(core.getInput('update-comment'))
  if (updateComment && !title) {
    core.info(
      "'title' is not set. 'update-comment' does not work without 'title'"
    )
  }

  return {
    token,
    reportPaths: pathsString.split(','),
    minCoverage: {
      overall: parseFloat(core.getInput('min-coverage-overall')),
      changed: parseFloat(core.getInput('min-coverage-changed-lines')),
    },
    title,
    updateComment,
    commentType,
    prNumber: core.getInput('pr-number'),
    headSha: core.getInput('head-sha'),
    baseSha: core.getInput('base-sha'),
    skipIfNoChanges: parseBooleans(core.getInput('skip-if-no-changes')),
    showAllModules: parseBooleans(core.getInput('show-all-modules')),
    showMissingLines: parseBooleans(core.getInput('show-missing-lines')),
    emoji: {
      pass: core.getInput('pass-emoji'),
      fail: core.getInput('fail-emoji'),
    },
    continueOnError: parseBooleans(core.getInput('continue-on-error')),
    debugMode: parseBooleans(core.getInput('debug-mode')),
    coverageCounterType,
    addCheck,
    failCheckBelowThreshold,
  }
}
