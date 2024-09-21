/* eslint-disable @typescript-eslint/no-explicit-any */
import * as core from '@actions/core'
import * as github from '@actions/github'
import * as fs from 'fs'
import * as glob from '@actions/glob'
import {getProjectCoverage} from './process'
import {getPRComment, getTitle} from './render'
import {debug, getChangedLines, parseToReport} from './util'
import {Project} from './models/project'
import {ChangedFile, Sha} from './models/github'
import {Report} from './models/jacoco-types'
import {GitHub} from '@actions/github/lib/utils'
import {getInputFields} from './inputs'

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

    const client: InstanceType<typeof GitHub> = github.getOctokit(inputs.token)
    if (debugMode) core.info(`context: ${debug(github.context)}`)

    const sha = await getSha(client, inputs.prNumber, debugMode)
    if (!sha) return
    const {baseSha, headSha, prNumber} = sha

    const reports = await getReports(pathsString, debugMode)
    const changedFiles = await getChangedFiles(
      baseSha,
      headSha,
      client,
      debugMode
    )

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
    if (!skip) {
      const emoji = {pass: passEmoji, fail: failEmoji}
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

async function getReports(
  pathsString: string,
  debugMode: boolean
): Promise<Report[]> {
  const reportPaths = pathsString.split(',')
  if (debugMode) core.info(`reportPaths: ${reportPaths}`)
  const reportsJsonAsync = getJsonReports(reportPaths, debugMode)
  const reports = await reportsJsonAsync
  if (debugMode) {
    core.info(`reports: ${reports.map(report => report.name)}`)
  }
  return reports
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
  if (debugMode) core.info(`changedFiles: ${debug(changedFiles)}`)
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

async function getPrNumberForCommit(
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

async function getSha(
  client: InstanceType<typeof GitHub>,
  prNum: number | undefined,
  debugMode: boolean
): Promise<Sha | undefined> {
  const context = github.context
  const payload = context.payload
  const event = context.eventName
  if (debugMode) core.info(`Event is ${event}`)

  const sha = context.sha
  let baseSha: string | undefined = sha
  let headSha: string | undefined = sha
  let prNumber = prNum

  switch (event) {
    case 'pull_request':
    case 'pull_request_target':
      baseSha = payload.pull_request?.base.sha
      headSha = payload.pull_request?.head.sha
      prNumber = prNumber ?? payload.pull_request?.number
      break
    case 'push':
      baseSha = payload.before
      headSha = payload.after
      prNumber = prNumber ?? (await getPrNumberForCommit(client, sha))
      break
    case 'workflow_run':
      const pullRequests = payload?.workflow_run?.pull_requests ?? []
      if (pullRequests.length !== 0) {
        baseSha = pullRequests[0]?.base?.sha
        headSha = pullRequests[0]?.head?.sha
        prNumber = prNumber ?? pullRequests[0]?.number
      } else {
        prNumber = prNumber ?? (await getPrNumberForCommit(client, sha))
      }
      break
    case 'workflow_dispatch':
    case 'schedule':
      prNumber = prNumber ?? (await getPrNumberForCommit(client, sha))
      break
    default:
      core.setFailed(`The event ${context.eventName} is not supported.`)
      return undefined
  }

  if (debugMode) core.info(`base sha: ${baseSha}`)
  if (debugMode) core.info(`head sha: ${headSha}`)
  if (debugMode) core.info(`prNumber: ${prNumber}`)

  return {baseSha: baseSha ?? sha, headSha: headSha ?? sha, prNumber}
}
