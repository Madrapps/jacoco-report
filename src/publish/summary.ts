import * as core from '@actions/core'

export async function publishSummary(body: string): Promise<void> {
  await core.summary.addRaw(body, true).write()
}
