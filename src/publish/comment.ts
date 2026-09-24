/* eslint-disable @typescript-eslint/no-explicit-any */
import * as core from '@actions/core'
import * as github from '@actions/github'
import {GitHub} from '@actions/github/lib/utils'

export interface PublishCommentParams {
  client: InstanceType<typeof GitHub>
  prNumber: number | undefined
  update: boolean
  title: string
  body: string
  debugMode: boolean
}

export async function publishComment({
  client,
  prNumber,
  update,
  title,
  body,
  debugMode,
}: PublishCommentParams): Promise<void> {
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
      if (debugMode)
        core.info(
          `Updating existing comment: id=${comment.id} \n body=${comment.body}`
        )
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
