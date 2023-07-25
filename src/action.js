const core = require('@actions/core')
const github = require('@actions/github')
const fs = require('fs')
const parser = require('xml2js')
const { parseBooleans } = require('xml2js/lib/processors')
const process = require('./process')
const render = require('./render')
const { debug } = require('./util')
const glob = require('@actions/glob')

async function action() {
  try {
    const token = core.getInput('token')
    if (!token) {
      core.setFailed("'token' is missing")
      return
    }
    const pathsString = core.getInput('paths')
    if (!pathsString) {
      core.setFailed("'paths' is missing")
      return
    }

    const reportPaths = pathsString.split(',')
    const minCoverageOverall = parseFloat(core.getInput('min-coverage-overall'))
    const minCoverageChangedFiles = parseFloat(
      core.getInput('min-coverage-changed-files')
    )
    const title = core.getInput('title')
    const updateComment = parseBooleans(core.getInput('update-comment'))
    if (updateComment) {
      if (!title) {
        core.info(
          "'title' is not set. 'update-comment' does not work without 'title'"
        )
      }
    }
    const debugMode = parseBooleans(core.getInput('debug-mode'))
    const skipIfNoChanges = parseBooleans(core.getInput('skip-if-no-changes'))

    const event = github.context.eventName
    core.info(`Event is ${event}`)

    let base
    let head
    let prNumber
    switch (event) {
      case 'pull_request':
      case 'pull_request_target':
        base = github.context.payload.pull_request.base.sha
        head = github.context.payload.pull_request.head.sha
        prNumber = github.context.payload.pull_request.number
        break
      case 'push':
        base = github.context.payload.before
        head = github.context.payload.after
        break
      default:
        core.setFailed(
          `Only pull requests and pushes are supported, ${github.context.eventName} not supported.`
        )
        return
    }

    core.info(`base sha: ${base}`)
    core.info(`head sha: ${head}`)

    const client = github.getOctokit(token)

    if (debugMode) core.info(`reportPaths: ${reportPaths}`)
    const reportsJsonAsync = getJsonReports(reportPaths, debugMode)
    const changedFiles = await getChangedFiles(base, head, client)
    if (debugMode) core.info(`changedFiles: ${debug(changedFiles)}`)

    const reportsJson = await reportsJsonAsync
    if (debugMode) core.info(`report value: ${debug(reportsJson)}`)
    const reports = reportsJson.map((report) => report['report'])

    // TODO Replace this with the getProjectCoverage itself
    const overallCoverage = process.getOverallCoverage(reports)
    if (debugMode) core.info(`overallCoverage: ${debug(overallCoverage)}`)
    core.setOutput(
      'coverage-overall',
      parseFloat(overallCoverage.project.toFixed(2))
    )

    const project = process.getProjectCoverage(reports, changedFiles)
    if (debugMode) core.info(`project: ${debug(project)}`)
    core.setOutput(
      'coverage-changed-files',
      parseFloat(project['coverage-changed-files'].toFixed(2))
    )

    const skip = skipIfNoChanges && project.modules.length === 0
    if (debugMode) core.info(`skip: ${skip}`)
    if (debugMode) core.info(`prNumber: ${prNumber}`)
    if (prNumber != null && !skip) {
      await addComment(
        prNumber,
        updateComment,
        render.getTitle(title),
        render.getPRComment(
          overallCoverage.project,
          project,
          minCoverageOverall,
          minCoverageChangedFiles,
          title
        ),
        client,
        debugMode
      )
    }
  } catch (error) {
    core.setFailed(error)
  }
}

async function getJsonReports(xmlPaths, debugMode) {
  const globber = await glob.create(xmlPaths.join('\n'))
  const files = await globber.glob()
  if (debugMode) core.info(`Resolved files: ${files}`)

  return Promise.all(
    files.map(async (path) => {
      const reportXml = await fs.promises.readFile(path.trim(), 'utf-8')
      return await parser.parseStringPromise(reportXml)
    })
  )
}

async function getChangedFiles(base, head, client) {
  const response = await client.repos.compareCommits({
    base,
    head,
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
  })

  const changedFiles = []
  response.data.files.forEach((file) => {
    const changedFile = {
      filePath: file.filename,
      url: file.blob_url,
    }
    changedFiles.push(changedFile)
  })
  return changedFiles
}

async function addComment(prNumber, update, title, body, client, debugMode) {
  let commentUpdated = false

  if (debugMode) core.info(`update: ${update}`)
  if (debugMode) core.info(`title: ${title}`)
  if (update && title) {
    const comments = await client.issues.listComments({
      issue_number: prNumber,
      ...github.context.repo,
    })
    const comment = comments.data.find((comment) =>
      comment.body.startsWith(title)
    )

    if (comment) {
      if (debugMode)
        core.info(
          `Updating existing comment: id=${comment.id} \n body=${comment.body}`
        )
      await client.issues.updateComment({
        comment_id: comment.id,
        body,
        ...github.context.repo,
      })
      commentUpdated = true
    }
  }

  if (!commentUpdated) {
    if (debugMode) core.info('Creating a new comment')
    await client.issues.createComment({
      issue_number: prNumber,
      body,
      ...github.context.repo,
    })
  }
}

module.exports = {
  action,
}
