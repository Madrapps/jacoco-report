import * as action from '../src/action'
import * as core from '@actions/core'
import * as github from '@actions/github'

jest.mock('@actions/core')
jest.mock('@actions/github')

describe('Input validation', function () {
  function getInput(key: string): string | undefined {
    switch (key) {
      case 'paths':
        return './__tests__/__fixtures__/report.xml'
      case 'token':
        return 'SMPLEHDjasdf876a987'
    }
  }

  const createComment = jest.fn()
  const listComments = jest.fn()
  const updateComment = jest.fn()

  /* eslint-disable @typescript-eslint/ban-ts-comment */
  // @ts-ignore
  core.getInput = jest.fn(getInput)
  // @ts-ignore
  github.getOctokit = jest.fn(() => {
    return {
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
    }
  })
  // @ts-ignore
  core.setFailed = jest.fn(c => {
    fail(c)
  })

  it('Fail if paths is not present', async () => {
    // @ts-ignore
    core.getInput = jest.fn(c => {
      switch (c) {
        case 'paths':
          return ''
        default:
          return getInput(c)
      }
    })
    github.context.eventName = 'pull_request'

    // @ts-ignore
    core.setFailed = jest.fn(c => {
      expect(c).toEqual("'paths' is missing")
    })
    await action.action()
  })

  it('Fail if token is not present', async () => {
    // @ts-ignore
    core.getInput = jest.fn(c => {
      switch (c) {
        case 'token':
          return ''
        default:
          return getInput(c)
      }
    })
    github.context.eventName = 'pull_request'
    // @ts-ignore
    core.setFailed = jest.fn(c => {
      expect(c).toEqual("'token' is missing")
    })
    await action.action()
  })
})
