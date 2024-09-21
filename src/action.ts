/* eslint-disable @typescript-eslint/no-explicit-any */
import * as core from '@actions/core'
import * as github from '@actions/github'
import * as fs from 'fs'
import {parseBooleans} from 'xml2js/lib/processors'
import * as glob from '@actions/glob'
import {getProjectCoverage} from './process'
import {getPRComment, getTitle} from './render'
import {debug, getChangedLines, parseToReport} from './util'
import {Project} from './models/project'
import {ChangedFile} from './models/github'
import {Report} from './models/jacoco-types'
import {GitHub} from '@actions/github/lib/utils'

const validCommentTypes = ['pr_comment', 'summary', 'both'] as const

export async function action(): Promise<void> {
  let continueOnError = true
  try {
    const inputs = getInputFields()
    if (!inputs) return

    const {
      pathsString,
      debugMode,
      skipIfNoChanges,
      passEmoji,
      failEmoji,
      minCoverageOverall,
      minCoverageChangedFiles,
      title,
      updateComment,
      commentType,
    } = inputs
    continueOnError = inputs.continueOnError

    const client = github.getOctokit(inputs.token)

    const event = github.context.eventName
    core.info(`Event is ${event}`)
    if (debugMode) core.info(`context: ${debug(github.context)}`)

    const sha = github.context.sha
    let base: string = sha
    let head: string = sha
    let prNumber = inputs.prNumber
    switch (event) {
      case 'pull_request':
      case 'pull_request_target':
        base = github.context.payload.pull_request?.base.sha
        head = github.context.payload.pull_request?.head.sha
        prNumber = prNumber ?? github.context.payload.pull_request?.number
        break
      case 'push':
        base = github.context.payload.before
        head = github.context.payload.after
        prNumber =
          prNumber ?? (await getPrNumberAssociatedWithCommit(client, sha))
        break
      case 'workflow_dispatch':
      case 'schedule':
        prNumber =
          prNumber ?? (await getPrNumberAssociatedWithCommit(client, sha))
        break
      case 'workflow_run':
        const pullRequests =
          github.context.payload?.workflow_run?.pull_requests ?? []
        if (pullRequests.length !== 0) {
          base = pullRequests[0]?.base?.sha
          head = pullRequests[0]?.head?.sha
          prNumber = prNumber ?? pullRequests[0]?.number
        } else {
          prNumber =
            prNumber ?? (await getPrNumberAssociatedWithCommit(client, sha))
        }
        break
      default:
        core.setFailed(
          `The event ${github.context.eventName} is not supported.`
        )
        return
    }

    core.info(`base sha: ${base}`)
    core.info(`head sha: ${head}`)

    const changedFiles = await getChangedFiles(base, head, client, debugMode)
    if (debugMode) core.info(`changedFiles: ${debug(changedFiles)}`)

    const reportPaths = pathsString.split(',')
    if (debugMode) core.info(`reportPaths: ${reportPaths}`)
    const reportsJsonAsync = getJsonReports(reportPaths, debugMode)
    const reports = await reportsJsonAsync

    const project: Project = getProjectCoverage(reports, changedFiles)
    if (debugMode) core.info(`project: ${debug(project)}`)
    core.setOutput(
      'coverage-overall',
      project.overall ? parseFloat(project.overall.percentage.toFixed(2)) : 100
    )
    core.setOutput(
      'coverage-changed-files',
      parseFloat(project['coverage-changed-files'].toFixed(2))
    )

    const skip = skipIfNoChanges && project.modules.length === 0
    if (debugMode) core.info(`skip: ${skip}`)
    if (debugMode) core.info(`prNumber: ${prNumber}`)
    if (!skip) {
      const emoji = {
        pass: passEmoji,
        fail: failEmoji,
      }
      const titleFormatted = getTitle(title)
      const bodyFormatted = getPRComment(
        project,
        {
          overall: minCoverageOverall,
          changed: minCoverageChangedFiles,
        },
        title,
        emoji
      )
      switch (commentType) {
        case 'pr_comment':
          await addPRComment(
            prNumber,
            updateComment,
            titleFormatted,
            bodyFormatted,
            client,
            debugMode
          )
          break
        case 'summary':
          await addWorkflowSummary(bodyFormatted, debugMode)
          break
        case 'both':
          await addPRComment(
            prNumber,
            updateComment,
            titleFormatted,
            bodyFormatted,
            client,
            debugMode
          )
          await addWorkflowSummary(bodyFormatted, debugMode)
          break
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      if (continueOnError) {
        core.error(error)
      } else {
        core.setFailed(error)
      }
    }
  }
}

async function getJsonReports(
  xmlPaths: string[],
  debugMode: boolean
): Promise<Report[]> {
  const globber = await glob.create(xmlPaths.join('\n'))
  const files = await globber.glob()
  if (debugMode) core.info(`Resolved files: ${files}`)

  return Promise.all(
    files.map(async path => {
      const reportXml = await fs.promises.readFile(path.trim(), 'utf-8')
      return await parseToReport(reportXml)
    })
  )
}

async function getChangedFiles(
  baseSha: string,
  headSha: string,
  client: InstanceType<typeof GitHub>,
  debugMode: boolean
): Promise<ChangedFile[]> {
  const response = await client.rest.repos.compareCommits({
    base: baseSha,
    head: headSha,
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
  })

  const changedFiles: ChangedFile[] = []
  const files = response.data.files ?? []
  for (const file of files) {
    if (debugMode) core.info(`file: ${debug(file)}`)
    const changedFile: ChangedFile = {
      filePath: file.filename,
      url: file.blob_url,
      lines: getChangedLines(file.patch),
    }
    changedFiles.push(changedFile)
  }
  return changedFiles
}

async function addPRComment(
  prNumber: number | undefined,
  update: boolean,
  title: string,
  body: string,
  client: InstanceType<typeof GitHub>,
  debugMode: boolean
): Promise<void> {
  if (prNumber === undefined) {
    if (debugMode) core.info('prNumber not present')
    return
  }
  let commentUpdated = false

  if (debugMode) core.info(`update: ${update}`)
  if (debugMode) core.info(`title: ${title}`)
  if (debugMode) core.info(`JaCoCo Comment: ${body}`)
  if (update && title) {
    if (debugMode) core.info('Listing all comments')
    const comments = await client.rest.issues.listComments({
      issue_number: prNumber,
      ...github.context.repo,
    })
    const comment = comments.data.find((it: any) => it.body.startsWith(title))

    if (comment) {
      if (debugMode) {
        core.info(
          `Updating existing comment: id=${comment.id} \n body=${comment.body}`
        )
      }
      await client.rest.issues.updateComment({
        comment_id: comment.id,
        body,
        ...github.context.repo,
      })
      commentUpdated = true
    }
  }

  if (!commentUpdated) {
    if (debugMode) core.info('Creating a new comment')
    await client.rest.issues.createComment({
      issue_number: prNumber,
      body,
      ...github.context.repo,
    })
  }
}

async function addWorkflowSummary(
  body: string,
  debugMode: boolean
): Promise<void> {
  if (debugMode) core.info('Adding workflow summary')
  await core.summary.addRaw(body, true).write()
}

type CommentType = (typeof validCommentTypes)[number]

const isValidCommentType = (value: any): value is CommentType =>
  validCommentTypes.includes(value)

async function getPrNumberAssociatedWithCommit(
  client: InstanceType<typeof GitHub>,
  commitSha: string
): Promise<number | undefined> {
  const response = await client.rest.repos.listPullRequestsAssociatedWithCommit(
    {
      commit_sha: commitSha,
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
    }
  )

  return response.data.length > 0 ? response.data[0].number : undefined
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

interface InputFields {
  token: string
  pathsString: string
  minCoverageOverall: number
  minCoverageChangedFiles: number
  title: string
  updateComment: boolean
  skipIfNoChanges: boolean
  passEmoji: string
  failEmoji: string
  continueOnError: boolean
  debugMode: boolean
  commentType: CommentType
  prNumber: number | undefined
}

function getInputFields(): InputFields | undefined {
  const token = getRequiredField('token')
  if (!token) return undefined

  const pathsString = getRequiredField('paths')
  if (!pathsString) return undefined

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

  const commentType: string = getInput('comment-type')
  if (!isValidCommentType(commentType)) {
    core.setFailed(`'comment-type' ${commentType} is invalid`)
    return undefined
  }

  const prNumber: number | undefined =
    Number(getInput('pr-number')) || undefined

  return {
    token,
    pathsString,
    minCoverageOverall,
    minCoverageChangedFiles,
    title,
    updateComment,
    skipIfNoChanges,
    passEmoji,
    failEmoji,
    continueOnError,
    debugMode,
    commentType,
    prNumber,
  }
}
