import * as core from '@actions/core'
import {parseBooleans} from 'xml2js/lib/processors'
import {Emoji, MinCoverage} from './models/project'

const validCommentTypes = ['pr_comment', 'summary', 'both'] as const

export function getInputFields(): InputFields | undefined {
  const token = getRequiredField('token')
  if (!token) return undefined

  const pathsString = getRequiredField('paths')
  if (!pathsString) return undefined

  const commentType: string = getInput('comment-type')
  if (!isValidCommentType(commentType)) {
    core.setFailed(`'comment-type' ${commentType} is invalid`)
    return undefined
  }

  const minCoverageOverall = getFloatField('min-coverage-overall')
  const minCoverageChangedFiles = getFloatField('min-coverage-changed-files')

  const title = getInput('title')
  const updateComment = getBooleanField('update-comment')
  if (updateComment && !title) {
    core.info("'title' not set. 'update-comment' doesn't work without 'title'")
  }
  const skipIfNoChanges = getBooleanField('skip-if-no-changes')
  const passEmoji = getInput('pass-emoji')
  const failEmoji = getInput('fail-emoji')

  const continueOnError = getBooleanField('continue-on-error')
  const debugMode = getBooleanField('debug-mode')

  const prNumber: number | undefined =
    Number(getInput('pr-number')) || undefined

  return {
    token,
    pathsString,
    minCoverage: {
      overall: minCoverageOverall,
      changed: minCoverageChangedFiles,
    },
    title,
    updateComment,
    skipIfNoChanges,
    emoji: {pass: passEmoji, fail: failEmoji},
    continueOnError,
    debugMode,
    commentType,
    prNumber,
  }
}

function getRequiredField(inputField: string): string | undefined {
  const input = getInput(inputField)
  if (!input) {
    core.setFailed(`'${inputField}' is missing`)
    return undefined
  }
  return input
}

function getFloatField(inputField: string): number {
  return parseFloat(getInput(inputField))
}

function getBooleanField(inputField: string): boolean {
  return parseBooleans(getInput(inputField))
}

function getInput(inputField: string): string {
  const field = core.getInput(inputField)
  core.info(`${inputField}: ${field}`)
  return field
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const isValidCommentType = (value: any): value is CommentType =>
  validCommentTypes.includes(value)

type CommentType = (typeof validCommentTypes)[number]

interface InputFields {
  token: string
  pathsString: string
  minCoverage: MinCoverage
  title: string
  updateComment: boolean
  skipIfNoChanges: boolean
  emoji: Emoji
  continueOnError: boolean
  debugMode: boolean
  commentType: CommentType
  prNumber: number | undefined
}
