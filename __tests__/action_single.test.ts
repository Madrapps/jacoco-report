/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import * as action from '../src/action'
import * as core from '@actions/core'
import * as github from '@actions/github'
import {PATCH} from './mocks.test'
import {getInputFields} from '../src/inputs'

jest.mock('@actions/core')
jest.mock('@actions/github')

jest.mock('../src/inputs', () => ({
  getInputFields: jest.fn(),
}))

const TITLE = 'JaCoCo Report'

const DEFAULT_INPUT_FIELDS = {
  token: 'SMPLEHDjasdf876a987',
  pathsString: './__tests__/__fixtures__/report.xml',
  minCoverage: {
    overall: 45,
    changed: 80,
  },
  title: TITLE,
  updateComment: false,
  skipIfNoChanges: false,
  emoji: {pass: ':green_apple:', fail: ':x:'},
  continueOnError: true,
  debugMode: true,
  commentType: 'pr_comment',
  prNumber: undefined,
}

describe('Single report', function () {
  describe('Pull Request event', function () {
    const eventName = 'pull_request'
    const payload = {
      pull_request: {
        number: '45',
        base: {sha: 'guasft7asdtf78asfd87as6df7y2u3'},
        head: {sha: 'aahsdflais76dfa78wrglghjkaghkj'},
      },
    }

    it('publish proper comment', async () => {
      mock(eventName, payload)
      await action.action()

      expect(createComment.mock.calls[0][0].body).toEqual(PROPER_COMMENT)
    })

    it('set overall coverage output', async () => {
      mock(eventName, payload)
      await action.action()

      const out = output.mock.calls[0]
      expect(out).toEqual(['coverage-overall', 35.25])
    })

    it('set changed files coverage output', async () => {
      mock(eventName, payload)
      await action.action()

      const out = output.mock.calls[1]
      expect(out).toEqual(['coverage-changed-files', 28.83])
    })

    describe('With update-comment ON', function () {
      it('if comment exists, update it', async () => {
        mock(eventName, payload)
        getInputFields.mockReturnValue({
          ...DEFAULT_INPUT_FIELDS,
          updateComment: true,
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
        mock(eventName, payload)
        getInputFields.mockReturnValue({
          ...DEFAULT_INPUT_FIELDS,
          updateComment: true,
        })
        listComments.mockReturnValue({data: [{id: 1, body: 'some comment'}]})

        await action.action()

        expect(createComment.mock.calls[0][0].body).not.toBeNull()
        expect(updateComment).toHaveBeenCalledTimes(0)
      })

      it('if title not set, warn user and create new comment', async () => {
        mock(eventName, payload)
        getInputFields.mockReturnValue({
          ...DEFAULT_INPUT_FIELDS,
          updateComment: true,
          title: '',
        })
        listComments.mockReturnValue({
          data: [
            {id: 1, body: 'some comment'},
            {id: 2, body: `### ${TITLE}\n to update`},
          ],
        })

        await action.action()

        expect(createComment.mock.calls[0][0].body).not.toBeNull()
        expect(updateComment).toHaveBeenCalledTimes(0)
      })
    })

    describe('Skip if no changes set to true', function () {
      it('Add comment when coverage present for changes files', async () => {
        mock(eventName, payload)
        getInputFields.mockReturnValue({
          ...DEFAULT_INPUT_FIELDS,
          skipIfNoChanges: true,
        })

        await action.action()

        expect(createComment.mock.calls[0][0].body).toEqual(PROPER_COMMENT)
      })

      it("Don't add comment when coverage absent for changes files", async () => {
        mock(eventName, payload)
        getInputFields.mockReturnValue({
          ...DEFAULT_INPUT_FIELDS,
          skipIfNoChanges: true,
        })
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
        mock(eventName, payload)
        getInputFields.mockReturnValue({
          ...DEFAULT_INPUT_FIELDS,
          emoji: {pass: ':green_circle:', fail: ':red_circle:'},
        })

        await action.action()

        expect(createComment.mock.calls[0][0].body).toEqual(`### JaCoCo Report
|Overall Project|35.25% **\`-17.21%\`**|:red_circle:|
|:-|:-|:-:|
|Files changed|38.24%|:red_circle:|
<br>

|File|Coverage||
|:-|:-|:-:|
|[Math.kt](https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/main/kotlin/com/madrapps/jacoco/Math.kt)|42% **\`-42%\`**|:red_circle:|
|[Utility.java](https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/main/java/com/madrapps/jacoco/Utility.java)|18.03%|:green_circle:|`)
      })
    })

    describe('With comment-type present', function () {
      it('when comment-type is summary, add the comment as workflow summary', async () => {
        mock(eventName, payload)
        getInputFields.mockReturnValue({
          ...DEFAULT_INPUT_FIELDS,
          commentType: 'summary',
        })

        await action.action()
        expect(addRaw.mock.calls[0][0]).toEqual(PROPER_COMMENT)
        expect(write).toHaveBeenCalledTimes(1)
        expect(createComment).toHaveBeenCalledTimes(0)
      })

      it('when comment-type is pr_comment, comment added in pr', async () => {
        mock(eventName, payload)
        getInputFields.mockReturnValue({
          ...DEFAULT_INPUT_FIELDS,
          commentType: 'pr_comment',
        })

        await action.action()
        expect(write).toHaveBeenCalledTimes(0)
        expect(createComment.mock.calls[0][0].body).toEqual(PROPER_COMMENT)
      })

      it('when comment-type is both, add the comment in pr and as workflow summary', async () => {
        mock(eventName, payload)
        getInputFields.mockReturnValue({
          ...DEFAULT_INPUT_FIELDS,
          commentType: 'both',
        })

        await action.action()
        expect(createComment.mock.calls[0][0].body).toEqual(PROPER_COMMENT)
        expect(addRaw.mock.calls[0][0]).toEqual(PROPER_COMMENT)
        expect(write).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('Pull Request Target event', function () {
    const eventName = 'pull_request_target'
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
      mock(eventName, payload)
      await action.action()

      expect(createComment.mock.calls[0][0].body).toEqual(PROPER_COMMENT)
    })

    it('set overall coverage output', async () => {
      mock(eventName, payload)

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
      mock('push', payload)
      await action.action()

      const out = output.mock.calls[0]
      expect(out).toEqual(['coverage-overall', 35.25])
    })

    it('set changed files coverage output', async () => {
      mock('push', payload)
      await action.action()

      const out = output.mock.calls[1]
      expect(out).toEqual(['coverage-changed-files', 28.83])
    })

    describe('With comment-type present', function () {
      it('when comment-type is summary, add the comment as workflow summary', async () => {
        mock(eventName, payload)
        getInputFields.mockReturnValue({
          ...DEFAULT_INPUT_FIELDS,
          commentType: 'summary',
        })

        await action.action()
        expect(addRaw.mock.calls[0][0]).toEqual(PROPER_COMMENT)
        expect(write).toHaveBeenCalledTimes(1)
        expect(createComment).toHaveBeenCalledTimes(0)
      })

      it('when comment-type is pr_comment, comment not added', async () => {
        mock(eventName, payload)
        getInputFields.mockReturnValue({
          ...DEFAULT_INPUT_FIELDS,
          commentType: 'pr_comment',
        })

        await action.action()
        expect(write).toHaveBeenCalledTimes(0)
        expect(createComment).toHaveBeenCalledTimes(0)
      })

      it('when comment-type is both, add the comment as workflow summary', async () => {
        mock(eventName, payload)
        getInputFields.mockReturnValue({
          ...DEFAULT_INPUT_FIELDS,
          commentType: 'both',
        })

        await action.action()
        expect(addRaw.mock.calls[0][0]).toEqual(PROPER_COMMENT)
        expect(write).toHaveBeenCalledTimes(1)
        expect(createComment).toHaveBeenCalledTimes(0)
      })
    })

    it('when pr-number present, add the comment in pr', async () => {
      mock(eventName, payload)
      getInputFields.mockReturnValue({
        ...DEFAULT_INPUT_FIELDS,
        prNumber: 45,
      })

      await action.action()
      expect(createComment.mock.calls[0][0].body).toEqual(PROPER_COMMENT)
    })

    it('when pr-number not present and associated PR available from commit, add the comment in pr', async () => {
      mock(eventName, payload)
      getInputFields.mockReturnValue({
        ...DEFAULT_INPUT_FIELDS,
        prNumber: undefined,
      })
      github.getOctokit = jest.fn(() => {
        return {
          rest: {
            repos: {
              compareCommits: jest.fn(() => {
                return compareCommitsResponse
              }),
              listPullRequestsAssociatedWithCommit: jest.fn(() => {
                return {data: [{number: 45}]}
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
      expect(createComment.mock.calls[0][0].body).toEqual(PROPER_COMMENT)
    })
  })

  describe('Schedule event', function () {
    const eventName = 'schedule'
    const payload = {}

    it('publish project coverage comment', async () => {
      mock(eventName, payload)
      getInputFields.mockReturnValue({
        ...DEFAULT_INPUT_FIELDS,
        commentType: 'summary',
      })

      await action.action()

      expect(addRaw.mock.calls[0][0]).toEqual(ONLY_PROJECT_COMMENT)
      expect(write).toHaveBeenCalledTimes(1)
    })

    it('set overall coverage output', async () => {
      mock(eventName, payload)

      await action.action()

      const out = output.mock.calls[0]
      expect(out).toEqual(['coverage-overall', 35.25])
    })
  })

  describe('Workflow Dispatch event', function () {
    const eventName = 'workflow_dispatch'
    const payload = {}

    it('publish project coverage comment', async () => {
      mock(eventName, payload)
      getInputFields.mockReturnValue({
        ...DEFAULT_INPUT_FIELDS,
        commentType: 'summary',
      })

      await action.action()

      expect(addRaw.mock.calls[0][0]).toEqual(ONLY_PROJECT_COMMENT)
      expect(write).toHaveBeenCalledTimes(1)
    })

    it('set overall coverage output', async () => {
      mock(eventName, payload)

      await action.action()

      const out = output.mock.calls[0]
      expect(out).toEqual(['coverage-overall', 35.25])
    })
  })

  describe('Workflow Run event', function () {
    const eventName = 'workflow_run'
    const payload = {
      workflow_run: {
        pull_requests: [
          {
            base: {
              sha: 'guasft7asdtf78asfd87as6df7y2u3',
            },
            head: {
              sha: 'aahsdflais76dfa78wrglghjkaghkj',
            },
            number: 45,
          },
        ],
      },
    }

    it('when proper payload present, publish proper comment', async () => {
      mock(eventName, payload)

      await action.action()

      expect(createComment.mock.calls[0][0].body).toEqual(PROPER_COMMENT)
    })

    it('when payload does not have pull_requests, publish project coverage comment', async () => {
      mock(eventName, {})
      getInputFields.mockReturnValue({
        ...DEFAULT_INPUT_FIELDS,
        prNumber: 45,
      })

      await action.action()

      expect(createComment.mock.calls[0][0].body).toEqual(ONLY_PROJECT_COMMENT)
    })

    it('set overall coverage output', async () => {
      mock(eventName, payload)

      await action.action()

      const out = output.mock.calls[0]
      expect(out).toEqual(['coverage-overall', 35.25])
    })
  })

  describe('Unsupported events', function () {
    it('Fail by throwing appropriate error', async () => {
      mock('pr_review', {})
      await action.action()

      expect(core.setFailed).toBeCalledWith(
        'The event pr_review is not supported.'
      )
    })
  })

  const createComment = jest.fn()
  const listComments = jest.fn()
  const updateComment = jest.fn()
  const output = jest.fn()
  const addRaw = jest.fn().mockReturnThis()
  const write = jest.fn().mockReturnThis()

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

  function mock(eventName, payload): void {
    const context = github.context
    context.eventName = eventName
    context.payload = payload
    context.repo = 'jacoco-playground'
    context.owner = 'madrapps'
    context.sha = 'guasft7asdtf78asfd87as6df7y2u3'

    getInputFields.mockReturnValue(DEFAULT_INPUT_FIELDS)

    github.getOctokit = jest.fn(() => {
      return {
        rest: {
          repos: {
            compareCommits: jest.fn(({base, head}) => {
              if (base !== head) {
                return compareCommitsResponse
              } else {
                return {data: {files: []}}
              }
            }),
            listPullRequestsAssociatedWithCommit: jest.fn(() => {
              return {data: []}
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
    core.summary.addRaw = addRaw
    core.summary.write = write

    core.setOutput = output
  }
})

const PROPER_COMMENT = `### JaCoCo Report
|Overall Project|35.25% **\`-17.21%\`**|:x:|
|:-|:-|:-:|
|Files changed|38.24%|:x:|
<br>

|File|Coverage||
|:-|:-|:-:|
|[Math.kt](https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/main/kotlin/com/madrapps/jacoco/Math.kt)|42% **\`-42%\`**|:x:|
|[Utility.java](https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/main/java/com/madrapps/jacoco/Utility.java)|18.03%|:green_apple:|`

const ONLY_PROJECT_COMMENT = `### JaCoCo Report
|Overall Project|35.25%|:x:|
|:-|:-|:-:|

> There is no coverage information present for the Files changed`
