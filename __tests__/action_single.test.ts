/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import * as action from '../src/action'
import * as core from '@actions/core'
import * as github from '@actions/github'
import {PATCH} from './mocks.test'

jest.mock('@actions/core')
jest.mock('@actions/github')

describe('Single report', function () {
  let createComment
  let listComments
  let updateComment
  let output
  const addRaw = jest.fn().mockReturnThis()
  const write = jest.fn().mockReturnThis()

  function getInput(key): string {
    switch (key) {
      case 'paths':
        return './__tests__/__fixtures__/report.xml'
      case 'token':
        return 'SMPLEHDjasdf876a987'
      case 'title':
        return TITLE
      case 'comment-type':
        return 'pr_comment'
      case 'min-coverage-overall':
        return 45
      case 'min-coverage-changed-files':
        return 80
      case 'pass-emoji':
        return ':green_apple:'
      case 'fail-emoji':
        return ':x:'
      case 'debug-mode':
        return 'true'
    }
  }

  beforeEach(() => {
    createComment = jest.fn()
    listComments = jest.fn()
    updateComment = jest.fn()
    output = jest.fn()

    core.getInput = jest.fn(getInput)
    github.getOctokit = jest.fn(() => {
      return {
        rest: {
          repos: {
            compareCommits: jest.fn(() => {
              return compareCommitsResponse
            }),
          },
          issues: {
            createComment,
            listComments,
            updateComment,
          },
        },
      }
    })
    core.setFailed = jest.fn(c => {
      fail(c)
    })
    core.summary.addRaw = addRaw
    core.summary.write = write
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
        {
          filename: 'src/main/java/com/madrapps/jacoco/Utility.java',
          blob_url:
            'https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/main/java/com/madrapps/jacoco/Utility.java',
          patch: PATCH.SINGLE_MODULE.UTILITY,
        },
        {
          filename: 'src/test/java/com/madrapps/jacoco/UtilityTest.java',
          blob_url:
            'https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/test/java/com/madrapps/jacoco/UtilityTest.java',
          patch: PATCH.SINGLE_MODULE.UTILITY_TEST,
        },
        {
          filename: '.github/workflows/coverage.yml',
          blob_url:
            'https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/.github/workflows/coverage.yml',
          patch: PATCH.SINGLE_MODULE.COVERAGE,
        },
      ],
    },
  }

  describe('Pull Request event', function () {
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

    it('publish proper comment', async () => {
      initContext(eventName, payload)
      await action.action()

      expect(createComment.mock.calls[0][0].body).toEqual(PROPER_COMMENT)
    })

    it('set overall coverage output', async () => {
      initContext(eventName, payload)
      core.setOutput = output

      await action.action()

      const out = output.mock.calls[0]
      expect(out).toEqual(['coverage-overall', 35.25])
    })

    it('set changed files coverage output', async () => {
      initContext(eventName, payload)
      core.setOutput = output

      await action.action()

      const out = output.mock.calls[1]
      expect(out).toEqual(['coverage-changed-files', 28.83])
    })

    describe('With update-comment ON', function () {
      function mockInput(key): string {
        switch (key) {
          case 'update-comment':
            return 'true'
          default:
            return getInput(key)
        }
      }

      it('if comment exists, update it', async () => {
        initContext(eventName, payload)
        core.getInput = jest.fn(key => {
          return mockInput(key)
        })

        listComments.mockReturnValue({
          data: [
            {id: 1, body: 'some comment'},
            {id: 2, body: `### ${TITLE}\n to update`},
          ],
        })

        await action.action()

        expect(updateComment.mock.calls[0][0].comment_id).toEqual(2)
        expect(createComment).toHaveBeenCalledTimes(0)
      })

      it('if comment does not exist, create new comment', async () => {
        initContext(eventName, payload)
        core.getInput = jest.fn(key => {
          return mockInput(key)
        })
        listComments.mockReturnValue({
          data: [{id: 1, body: 'some comment'}],
        })

        await action.action()

        expect(createComment.mock.calls[0][0].body).not.toBeNull()
        expect(updateComment).toHaveBeenCalledTimes(0)
      })

      it('if title not set, warn user and create new comment', async () => {
        initContext(eventName, payload)
        core.getInput = jest.fn(c => {
          switch (c) {
            case 'title':
              return ''
            default:
              return mockInput(c)
          }
        })

        listComments.mockReturnValue({
          data: [
            {id: 1, body: 'some comment'},
            {id: 2, body: `### ${TITLE}\n to update`},
          ],
        })

        await action.action()

        expect(core.info).toBeCalledWith(
          "'title' is not set. 'update-comment' does not work without 'title'"
        )
        expect(createComment.mock.calls[0][0].body).not.toBeNull()
        expect(updateComment).toHaveBeenCalledTimes(0)
      })
    })

    describe('Skip if no changes set to true', function () {
      function mockInput(): void {
        core.getInput = jest.fn(c => {
          switch (c) {
            case 'skip-if-no-changes':
              return 'true'
            default:
              return getInput(c)
          }
        })
      }

      it('Add comment when coverage present for changes files', async () => {
        initContext(eventName, payload)
        mockInput()

        await action.action()

        expect(createComment.mock.calls[0][0].body).toEqual(PROPER_COMMENT)
      })

      it("Don't add comment when coverage absent for changes files", async () => {
        initContext(eventName, payload)
        mockInput()
        github.getOctokit = jest.fn(() => {
          return {
            rest: {
              repos: {
                compareCommits: jest.fn(() => {
                  return {
                    data: {
                      files: [
                        {
                          filename: '.github/workflows/coverage.yml',
                          blob_url:
                            'https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/.github/workflows/coverage.yml',
                          patch: PATCH.SINGLE_MODULE.COVERAGE,
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
          }
        })

        await action.action()

        expect(createComment).not.toHaveBeenCalled()
      })
    })

    describe('With custom emoji', function () {
      it('publish proper comment', async () => {
        initContext(eventName, payload)
        core.getInput = jest.fn(key => {
          switch (key) {
            case 'pass-emoji':
              return ':green_circle:'
            case 'fail-emoji':
              return 'red_circle'
            default:
              return getInput(key)
          }
        })

        await action.action()

        expect(createComment.mock.calls[0][0].body).toEqual(`### JaCoCo Report
|Overall Project|35.25% **\`-17.21%\`**|red_circle|
|:-|:-|:-:|
|Files changed|38.24%|red_circle|
<br>

|File|Coverage||
|:-|:-|:-:|
|[Math.kt](https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/main/kotlin/com/madrapps/jacoco/Math.kt)|42% **\`-42%\`**|red_circle|
|[Utility.java](https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/main/java/com/madrapps/jacoco/Utility.java)|18.03%|:green_circle:|`)
      })
    })

    describe('With comment-type present', function () {
      function mockInput(key): string {
        switch (key) {
          case 'comment-type':
            return 'pr_comment'
          default:
            return getInput(key)
        }
      }

      it('when comment-type is summary, add the comment as workflow summary', async () => {
        core.getInput = jest.fn(c => {
          switch (c) {
            case 'comment-type':
              return 'summary'
            default:
              return mockInput(c)
          }
        })
        initContext(eventName, payload)

        await action.action()
        expect(addRaw.mock.calls[0][0]).toEqual(PROPER_COMMENT)
        expect(write).toHaveBeenCalledTimes(1)
        expect(createComment).toHaveBeenCalledTimes(0)
      })

      it('when comment-type is pr_comment, comment added in pr', async () => {
        core.getInput = jest.fn(c => {
          switch (c) {
            case 'comment-type':
              return 'pr_comment'
            default:
              return mockInput(c)
          }
        })
        initContext(eventName, payload)

        await action.action()
        expect(write).toHaveBeenCalledTimes(0)
        expect(createComment.mock.calls[0][0].body).toEqual(PROPER_COMMENT)
      })

      it('when comment-type is both, add the comment in pr and as workflow summary', async () => {
        core.getInput = jest.fn(c => {
          switch (c) {
            case 'comment-type':
              return 'both'
            default:
              return mockInput(c)
          }
        })
        initContext(eventName, payload)

        await action.action()
        expect(createComment.mock.calls[0][0].body).toEqual(PROPER_COMMENT)
        expect(addRaw.mock.calls[0][0]).toEqual(PROPER_COMMENT)
        expect(write).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('Pull Request Target event', function () {
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

    it('set overall coverage output', async () => {
      initContext('pull_request_target', payload)
      core.setOutput = output

      await action.action()

      const out = output.mock.calls[0]
      expect(out).toEqual(['coverage-overall', 35.25])
    })
  })

  describe('Push event', function () {
    const eventName = 'push'
    const payload = {
      before: 'guasft7asdtf78asfd87as6df7y2u3',
      after: 'aahsdflais76dfa78wrglghjkaghkj',
    }

    it('set overall coverage output', async () => {
      initContext('push', payload)
      core.setOutput = output

      await action.action()

      const out = output.mock.calls[0]
      expect(out).toEqual(['coverage-overall', 35.25])
    })

    it('set changed files coverage output', async () => {
      initContext('push', payload)
      core.setOutput = output

      await action.action()

      const out = output.mock.calls[1]
      expect(out).toEqual(['coverage-changed-files', 28.83])
    })

    describe('With comment-type present', function () {
      function mockInput(key): string {
        switch (key) {
          case 'comment-type':
            return 'pr_comment'
          default:
            return getInput(key)
        }
      }

      it('when comment-type is summary, add the comment as workflow summary', async () => {
        core.getInput = jest.fn(c => {
          switch (c) {
            case 'comment-type':
              return 'summary'
            default:
              return mockInput(c)
          }
        })
        initContext(eventName, payload)

        await action.action()
        expect(addRaw.mock.calls[0][0]).toEqual(PROPER_COMMENT)
        expect(write).toHaveBeenCalledTimes(1)
        expect(createComment).toHaveBeenCalledTimes(0)
      })

      it('when comment-type is pr_comment, comment not added', async () => {
        core.getInput = jest.fn(c => {
          switch (c) {
            case 'comment-type':
              return 'pr_comment'
            default:
              return mockInput(c)
          }
        })
        initContext(eventName, payload)

        await action.action()
        expect(write).toHaveBeenCalledTimes(0)
        expect(createComment).toHaveBeenCalledTimes(0)
      })

      it('when comment-type is both, add the comment as workflow summary', async () => {
        core.getInput = jest.fn(c => {
          switch (c) {
            case 'comment-type':
              return 'both'
            default:
              return mockInput(c)
          }
        })
        initContext(eventName, payload)

        await action.action()
        expect(addRaw.mock.calls[0][0]).toEqual(PROPER_COMMENT)
        expect(write).toHaveBeenCalledTimes(1)
        expect(createComment).toHaveBeenCalledTimes(0)
      })
    })
  })

  describe('Other than push or pull_request or pull_request_target event', function () {
    it('Fail by throwing appropriate error', async () => {
      initContext('pr_review', {})
      core.setFailed = jest.fn(c => {
        expect(c).toEqual(
          'Only pull requests and pushes are supported, pr_review not supported.'
        )
      })
      core.setOutput = output

      await action.action()
    })
  })
})

function initContext(eventName, payload): void {
  const context = github.context
  context.eventName = eventName
  context.payload = payload
  context.repo = 'jacoco-playground'
  context.owner = 'madrapps'
}

const TITLE = 'JaCoCo Report'

const PROPER_COMMENT = `### JaCoCo Report
|Overall Project|35.25% **\`-17.21%\`**|:x:|
|:-|:-|:-:|
|Files changed|38.24%|:x:|
<br>

|File|Coverage||
|:-|:-|:-:|
|[Math.kt](https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/main/kotlin/com/madrapps/jacoco/Math.kt)|42% **\`-42%\`**|:x:|
|[Utility.java](https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/main/java/com/madrapps/jacoco/Utility.java)|18.03%|:green_apple:|`
