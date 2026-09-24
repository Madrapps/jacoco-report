/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import {jest, describe, it, expect, beforeEach} from '@jest/globals'
import {createMockCore, createMockContext, createMockGithub} from './helpers'

const mockCore = createMockCore()
const mockContext = createMockContext()
mockContext.repo = {owner: 'acme', repo: 'widgets'}
const mockGithub = createMockGithub(mockContext)

jest.unstable_mockModule('@actions/core', () => mockCore)
jest.unstable_mockModule('@actions/github', () => mockGithub)

const {publishCheck, MissingChecksPermissionError} =
  await import('../src/publish/check')

describe('publishCheck', function () {
  let create
  let client

  beforeEach(() => {
    create = jest.fn().mockResolvedValue({})
    client = {rest: {checks: {create}}}
  })

  it('creates a completed check with title and body', async function () {
    await publishCheck({
      client,
      name: 'Coverage',
      headSha: 'abc123',
      status: {overall: 84.62, changed: 75, difference: null, passed: true},
      body: '|table|',
      failBelowThreshold: false,
      debugMode: false,
    })
    expect(create).toHaveBeenCalledWith({
      owner: 'acme',
      repo: 'widgets',
      name: 'Coverage',
      head_sha: 'abc123',
      status: 'completed',
      conclusion: 'success',
      output: {title: 'Overall 84.62%', summary: '|table|'},
    })
  })

  it('defaults the check name when title is empty', async function () {
    await publishCheck({
      client,
      name: '',
      headSha: 'abc123',
      status: {overall: 100, changed: null, difference: null, passed: true},
      body: '',
      failBelowThreshold: false,
      debugMode: false,
    })
    expect(create.mock.calls[0][0].name).toBe('JaCoCo Report')
  })

  it('succeeds below threshold when fail-check-below-threshold is off', async function () {
    await publishCheck({
      client,
      name: 'Coverage',
      headSha: 'abc123',
      status: {overall: 20.41, changed: 7.32, difference: -2.5, passed: false},
      body: '',
      failBelowThreshold: false,
      debugMode: false,
    })
    const call = create.mock.calls[0][0]
    expect(call.conclusion).toBe('success')
    expect(call.output.title).toBe('Overall 20.41% (-2.5%)')
  })

  it('fails below threshold when fail-check-below-threshold is on', async function () {
    await publishCheck({
      client,
      name: 'Coverage',
      headSha: 'abc123',
      status: {overall: 20.41, changed: 7.32, difference: -2.5, passed: false},
      body: '',
      failBelowThreshold: true,
      debugMode: false,
    })
    expect(create.mock.calls[0][0].conclusion).toBe('failure')
  })

  it('raises MissingChecksPermissionError on 403', async function () {
    create.mockRejectedValue(
      Object.assign(new Error('Forbidden'), {status: 403})
    )
    await expect(
      publishCheck({
        client,
        name: 'Coverage',
        headSha: 'abc123',
        status: {overall: 100, changed: null, difference: null, passed: true},
        body: '',
        failBelowThreshold: false,
        debugMode: false,
      })
    ).rejects.toBeInstanceOf(MissingChecksPermissionError)
  })

  it('rethrows other errors untouched', async function () {
    const error = Object.assign(new Error('Server error'), {status: 500})
    create.mockRejectedValue(error)
    await expect(
      publishCheck({
        client,
        name: 'Coverage',
        headSha: 'abc123',
        status: {overall: 100, changed: null, difference: null, passed: true},
        body: '',
        failBelowThreshold: false,
        debugMode: false,
      })
    ).rejects.toBe(error)
  })
})
