/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import {jest, describe, it, expect, beforeEach} from '@jest/globals'
import {createMockCore, createMockContext, createMockGithub} from './helpers'
import {PATCH} from './mocks.test'

const mockCore = createMockCore()
const mockContext = createMockContext()
const mockGithub = createMockGithub(mockContext)

jest.unstable_mockModule('@actions/core', () => mockCore)
jest.unstable_mockModule('@actions/github', () => mockGithub)

const action = await import('../src/action')

const HEAD_SHA = 'aahsdflais76dfa78wrglghjkaghkj'

describe('Check run publishing', function () {
  let createCheck
  let createComment
  let inputs

  function getInput(key): string {
    return inputs[key] ?? ''
  }

  beforeEach(() => {
    createCheck = jest.fn().mockResolvedValue({})
    createComment = jest.fn()
    inputs = {
      paths: './__tests__/__fixtures__/report.xml',
      token: 'SMPLEHDjasdf876a987',
      title: 'JaCoCo Report',
      'comment-type': 'none',
      'add-check': 'true',
      'fail-check-below-threshold': 'false',
      'min-coverage-overall': '45',
      'min-coverage-changed-lines': '80',
      'pass-emoji': ':green_apple:',
      'fail-emoji': ':x:',
      'coverage-counter-type': 'INSTRUCTION',
      'continue-on-error': 'true',
      'debug-mode': 'false',
    }

    mockCore.getInput.mockImplementation(getInput)
    mockGithub.getOctokit.mockReturnValue({
      rest: {
        repos: {
          compareCommits: jest.fn(() => compareCommitsResponse),
        },
        issues: {createComment},
        checks: {create: createCheck},
      },
    })
    mockContext.eventName = 'pull_request'
    mockContext.payload = {
      pull_request: {
        number: '45',
        base: {sha: 'guasft7asdtf78asfd87as6df7y2u3'},
        head: {sha: HEAD_SHA},
      },
    }
    mockContext.repo = {owner: 'madrapps', repo: 'jacoco-playground'}
  })

  const compareCommitsResponse = {
    data: {
      files: [
        {
          filename: 'src/main/kotlin/com/madrapps/jacoco/Math.kt',
          blob_url:
            'https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/main/kotlin/com/madrapps/jacoco/Math.kt',
          patch: PATCH.SINGLE_MODULE.MATH,
        },
      ],
    },
  }

  it('publishes a check run and no comment when comment-type is none', async () => {
    await action.action()

    expect(createComment).not.toHaveBeenCalled()
    expect(mockCore.setFailed).not.toHaveBeenCalled()
    expect(createCheck).toHaveBeenCalledTimes(1)
    const call = createCheck.mock.calls[0][0]
    expect(call).toMatchObject({
      owner: 'madrapps',
      repo: 'jacoco-playground',
      name: 'JaCoCo Report',
      head_sha: HEAD_SHA,
      status: 'completed',
      conclusion: 'success',
    })
    expect(call.output.title).toBe('Overall 35.25% (-17.21%)')
    expect(call.output.summary).toEqual(CHECK_BODY)
  })

  it('marks the check as failed when fail-check-below-threshold is on', async () => {
    inputs['fail-check-below-threshold'] = 'true'

    await action.action()

    expect(createCheck.mock.calls[0][0].conclusion).toBe('failure')
  })

  it('publishes both a comment and a check when comment-type is pr_comment', async () => {
    inputs['comment-type'] = 'pr_comment'

    await action.action()

    expect(createComment).toHaveBeenCalledTimes(1)
    expect(createCheck).toHaveBeenCalledTimes(1)
  })

  it('still publishes the check when skip-if-no-changes skips the comment', async () => {
    inputs['comment-type'] = 'pr_comment'
    inputs['skip-if-no-changes'] = 'true'
    mockGithub.getOctokit.mockReturnValue({
      rest: {
        repos: {compareCommits: jest.fn(() => ({data: {files: []}}))},
        issues: {createComment},
        checks: {create: createCheck},
      },
    })

    await action.action()

    expect(createComment).not.toHaveBeenCalled()
    expect(createCheck).toHaveBeenCalledTimes(1)
    const call = createCheck.mock.calls[0][0]
    expect(call.output.title).toBe('Overall 35.25%')
    expect(call.output.summary).toContain(
      'There is no coverage information present for the changed lines'
    )
  })

  it('does not log the token in debug mode', async () => {
    inputs['debug-mode'] = 'true'

    await action.action()

    const logged = mockCore.info.mock.calls.map(call => String(call[0]))
    expect(logged.some(line => line.includes(inputs.token))).toBe(false)
  })

  it('fails the action on 403 even with continue-on-error', async () => {
    createCheck.mockRejectedValue(
      Object.assign(new Error('Resource not accessible'), {status: 403})
    )

    await action.action()

    expect(mockCore.setFailed).toHaveBeenCalledTimes(1)
    expect(mockCore.setFailed.mock.calls[0][0].message).toContain(
      'checks: write'
    )
    expect(mockCore.error).not.toHaveBeenCalled()
  })
})

const CHECK_BODY = `|Overall Project|35.25% **\`-17.21%\`**|:x:|
|:-|:-|:-:|
|Changed lines|32.26%|:x:|
<br>

|File|Coverage||
|:-|:-|:-:|
|[Math.kt](https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/main/kotlin/com/madrapps/jacoco/Math.kt)|42% **\`-42%\`**|:x:|`
