/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import {jest, describe, it, expect, beforeEach} from '@jest/globals'
import {createMockCore} from './helpers'

const mockCore = createMockCore()
jest.unstable_mockModule('@actions/core', () => mockCore)

const {parseInputs} = await import('../src/inputs')

const BASE_INPUTS: Record<string, string> = {
  paths: './report.xml',
  token: 'token',
  'min-coverage-overall': '80',
  'min-coverage-changed-lines': '70',
  'comment-type': 'pr_comment',
  'coverage-counter-type': 'INSTRUCTION',
  'continue-on-error': 'true',
  'add-check': 'false',
  'fail-check-below-threshold': 'false',
}

function withInputs(overrides: Record<string, string>): void {
  const inputs = {...BASE_INPUTS, ...overrides}
  mockCore.getInput.mockImplementation(key => inputs[key] ?? '')
}

describe('parseInputs', function () {
  beforeEach(() => {
    mockCore.setFailed.mockReset()
  })

  it('parses valid inputs', function () {
    withInputs({'add-check': 'true', 'fail-check-below-threshold': 'true'})
    const inputs = parseInputs()
    expect(mockCore.setFailed).not.toHaveBeenCalled()
    expect(inputs).toMatchObject({
      reportPaths: ['./report.xml'],
      token: 'token',
      minCoverage: {overall: 80, changed: 70},
      commentType: 'pr_comment',
      coverageCounterType: 'INSTRUCTION',
      addCheck: true,
      failCheckBelowThreshold: true,
    })
  })

  it('accepts comment-type none when add-check is true', function () {
    withInputs({'comment-type': 'none', 'add-check': 'true'})
    const inputs = parseInputs()
    expect(mockCore.setFailed).not.toHaveBeenCalled()
    expect(inputs.commentType).toBe('none')
  })

  it('fails when comment-type is none and add-check is false', function () {
    withInputs({'comment-type': 'none'})
    expect(parseInputs()).toBeUndefined()
    expect(mockCore.setFailed).toHaveBeenCalledWith(
      expect.stringContaining('nothing to publish')
    )
  })

  it('fails when fail-check-below-threshold is set without add-check', function () {
    withInputs({'fail-check-below-threshold': 'true'})
    expect(parseInputs()).toBeUndefined()
    expect(mockCore.setFailed).toHaveBeenCalledWith(
      expect.stringContaining(
        "'fail-check-below-threshold' requires 'add-check'"
      )
    )
  })

  it('fails on invalid comment-type', function () {
    withInputs({'comment-type': 'nowhere'})
    expect(parseInputs()).toBeUndefined()
    expect(mockCore.setFailed).toHaveBeenCalledWith(
      expect.stringContaining("'comment-type' nowhere is invalid")
    )
  })

  it('fails when token is missing', function () {
    withInputs({token: ''})
    expect(parseInputs()).toBeUndefined()
    expect(mockCore.setFailed).toHaveBeenCalledWith("'token' is missing")
  })

  it('fails when paths is missing', function () {
    withInputs({paths: ''})
    expect(parseInputs()).toBeUndefined()
    expect(mockCore.setFailed).toHaveBeenCalledWith("'paths' is missing")
  })

  it('fails on removed min-coverage-changed-files input', function () {
    withInputs({'min-coverage-changed-files': '50'})
    expect(parseInputs()).toBeUndefined()
    expect(mockCore.setFailed).toHaveBeenCalledWith(
      expect.stringContaining(
        "'min-coverage-changed-files' is no longer supported"
      )
    )
  })

  it('fails on invalid coverage-counter-type', function () {
    withInputs({'coverage-counter-type': 'bogus'})
    expect(parseInputs()).toBeUndefined()
    expect(mockCore.setFailed).toHaveBeenCalledWith(
      expect.stringContaining("'coverage-counter-type' BOGUS is invalid")
    )
  })
})
