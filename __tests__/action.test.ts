/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import {jest, describe, it, expect, beforeEach} from '@jest/globals'
import {createMockCore, createMockContext, createMockGithub} from './helpers'

const mockCore = createMockCore()
const mockContext = createMockContext()
const mockGithub = createMockGithub(mockContext)

jest.unstable_mockModule('@actions/core', () => mockCore)
jest.unstable_mockModule('@actions/github', () => mockGithub)

const action = await import('../src/action')

describe('Input validation', function () {
  const eventName = 'pull_request'
  const payload = {
    pull_request: {
      number: '45',
      base: {
        sha: 'guasft7asdtf78asfd87as6df7y2u3',
      },
      head: {
        sha: 'aahsdflais76dfa78wrglghjkaghkj',
      },
    },
  }

  function getInput(key: string): string | undefined {
    switch (key) {
      case 'paths':
        return './__tests__/__fixtures__/report.xml'
      case 'token':
        return 'SMPLEHDjasdf876a987'
      case 'coverage-counter-type':
        return 'INSTRUCTION'
    }
  }

  const createComment = jest.fn()
  const listComments = jest.fn()
  const updateComment = jest.fn()

  beforeEach(() => {
    mockCore.getInput.mockImplementation(getInput)
    mockGithub.getOctokit.mockReturnValue({
      rest: {
        repos: {
          compareCommits: jest.fn(() => {
            return {
              data: {
                files: [
                  {
                    filename: 'src/main/kotlin/com/madrapps/jacoco/Math.kt',
                    blob_url:
                      'https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/kotlin/com/madrapps/jacoco/Math.kt',
                  },
                  {
                    filename:
                      'src/main/java/com/madrapps/jacoco/operation/StringOp.java',
                    blob_url:
                      'https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/java/com/madrapps/jacoco/operation/StringOp.java',
                  },
                ],
              },
            }
          }),
        },
        issues: {
          createComment,
          listComments,
          updateComment,
        },
      },
    })
    mockCore.setFailed.mockImplementation(c => {
      fail(c)
    })
  })

  it('Fail if paths is not present', async () => {
    mockCore.getInput.mockImplementation(c => {
      switch (c) {
        case 'paths':
          return ''
        default:
          return getInput(c)
      }
    })
    mockContext.eventName = 'pull_request'

    mockCore.setFailed.mockImplementation(c => {
      expect(c).toEqual("'paths' is missing")
    })
    await action.action()
  })

  it('Fail if token is not present', async () => {
    mockCore.getInput.mockImplementation(c => {
      switch (c) {
        case 'token':
          return ''
        default:
          return getInput(c)
      }
    })
    mockContext.eventName = 'pull_request'
    mockCore.setFailed.mockImplementation(c => {
      expect(c).toEqual("'token' is missing")
    })
    await action.action()
  })

  it('Fail if comment-type is invalid', async () => {
    mockCore.getInput.mockImplementation(c => {
      switch (c) {
        case 'comment-type':
          return 'invalid'
        default:
          return getInput(c)
      }
    })
    mockCore.setFailed.mockImplementation(c => {
      expect(c).toEqual("'comment-type' invalid is invalid")
    })
    initContext(eventName, payload)

    await action.action()
  })

  it('Fail if coverage-counter-type is invalid', async () => {
    mockCore.getInput.mockImplementation(c => {
      switch (c) {
        case 'coverage-counter-type':
          return 'INVALID'
        default:
          return getInput(c)
      }
    })
    mockCore.setFailed.mockImplementation(c => {
      expect(c).toEqual(
        "'coverage-counter-type' INVALID is invalid. Valid values: INSTRUCTION, BRANCH, LINE, COMPLEXITY, METHOD"
      )
    })
    initContext(eventName, payload)

    await action.action()
  })

  it('coverage-counter-type is uppercased before validation', async () => {
    mockCore.getInput.mockImplementation(c => {
      switch (c) {
        case 'coverage-counter-type':
          return 'invalid_lower'
        default:
          return getInput(c)
      }
    })
    mockCore.setFailed.mockImplementation(c => {
      expect(c).toEqual(
        "'coverage-counter-type' INVALID_LOWER is invalid. Valid values: INSTRUCTION, BRANCH, LINE, COMPLEXITY, METHOD"
      )
    })
    initContext(eventName, payload)

    await action.action()
  })
})

function initContext(eventName, payload): void {
  mockContext.eventName = eventName
  mockContext.payload = payload
  mockContext.repo = {owner: 'madrapps', repo: 'jacoco-playground'}
}
