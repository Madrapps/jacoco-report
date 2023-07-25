const action = require('../src/action')
const core = require('@actions/core')
const github = require('@actions/github')

jest.mock('@actions/core')
jest.mock('@actions/github')

describe('Single report', function () {
  let createComment
  let listComments
  let updateComment
  let output

  function getInput(key) {
    switch (key) {
      case 'paths':
        return './__tests__/__fixtures__/report.xml'
      case 'token':
        return 'SMPLEHDjasdf876a987'
      case 'min-coverage-overall':
        return 45
      case 'min-coverage-changed-files':
        return 60
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
      }
    })
    core.setFailed = jest.fn((c) => {
      fail(c)
    })
  })

  const compareCommitsResponse = {
    data: {
      files: [
        {
          filename: 'src/main/kotlin/com/madrapps/jacoco/Math.kt',
          blob_url:
            'https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/kotlin/com/madrapps/jacoco/Math.kt',
        },
        {
          filename: 'src/main/java/com/madrapps/jacoco/operation/StringOp.java',
          blob_url:
            'https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/java/com/madrapps/jacoco/operation/StringOp.java',
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

      expect(createComment.mock.calls[0][0].body)
        .toEqual(`|Total Project Coverage|49.02%|:green_apple:|
|:-|:-:|:-:|

|File|Coverage [63.64%]||
|:-|:-:|:-:|
|[StringOp.java](https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/java/com/madrapps/jacoco/operation/StringOp.java)|100%|:green_apple:|
|[Math.kt](https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/kotlin/com/madrapps/jacoco/Math.kt)|46.67%|:x:|`)
    })

    it('set overall coverage output', async () => {
      initContext(eventName, payload)
      core.setOutput = output

      await action.action()

      const out = output.mock.calls[0]
      expect(out).toEqual(['coverage-overall', 49.02])
    })

    it('set changed files coverage output', async () => {
      initContext(eventName, payload)
      core.setOutput = output

      await action.action()

      const out = output.mock.calls[1]
      expect(out).toEqual(['coverage-changed-files', 63.64])
    })

    describe('With update-comment ON', function () {
      const title = 'JaCoCo Report'
      function mockInput(key) {
        switch (key) {
          case 'title':
            return title
          case 'update-comment':
            return 'true'
          default:
            return getInput(key)
        }
      }

      it('if comment exists, update it', async () => {
        initContext(eventName, payload)
        core.getInput = jest.fn((key) => {
          return mockInput(key)
        })

        listComments.mockReturnValue({
          data: [
            { id: 1, body: 'some comment' },
            { id: 2, body: `### ${title}\n to update` },
          ],
        })

        await action.action()

        expect(updateComment.mock.calls[0][0].comment_id).toEqual(2)
        expect(createComment).toHaveBeenCalledTimes(0)
      })

      it('if comment does not exist, create new comment', async () => {
        initContext(eventName, payload)
        core.getInput = jest.fn((key) => {
          return mockInput(key)
        })
        listComments.mockReturnValue({
          data: [{ id: 1, body: 'some comment' }],
        })

        await action.action()

        expect(createComment.mock.calls[0][0].body).not.toBeNull()
        expect(updateComment).toHaveBeenCalledTimes(0)
      })

      it('if title not set, warn user and create new comment', async () => {
        initContext(eventName, payload)
        core.getInput = jest.fn((c) => {
          switch (c) {
            case 'title':
              return ''
            default:
              return mockInput(c)
          }
        })

        listComments.mockReturnValue({
          data: [
            { id: 1, body: 'some comment' },
            { id: 2, body: `### ${title}\n to update` },
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
      function mockInput() {
        core.getInput = jest.fn((c) => {
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

        expect(createComment.mock.calls[0][0].body)
          .toEqual(`|Total Project Coverage|49.02%|:green_apple:|
|:-|:-:|:-:|

|File|Coverage [63.64%]||
|:-|:-:|:-:|
|[StringOp.java](https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/java/com/madrapps/jacoco/operation/StringOp.java)|100%|:green_apple:|
|[Math.kt](https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/kotlin/com/madrapps/jacoco/Math.kt)|46.67%|:x:|`)
      })

      it("Don't add comment when coverage absent for changes files", async () => {
        initContext(eventName, payload)
        mockInput()
        const compareCommitsResponse = {
          data: {
            files: [
              {
                filename: 'src/main/kotlin/com/madrapps/jacoco/asset.yml',
                blob_url:
                  'https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/kotlin/com/madrapps/jacoco/asset.yml',
              },
            ],
          },
        }
        github.getOctokit = jest.fn(() => {
          return {
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
          }
        })

        await action.action()

        expect(createComment).not.toHaveBeenCalled()
      })
    })

    describe('With custom emoji', function () {
      it('publish proper comment', async () => {
        initContext(eventName, payload)
        core.getInput = jest.fn((key) => {
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

        expect(createComment.mock.calls[0][0].body)
          .toEqual(`|Total Project Coverage|49.02%|:green_circle:|
|:-|:-:|:-:|

|File|Coverage [63.64%]||
|:-|:-:|:-:|
|[StringOp.java](https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/java/com/madrapps/jacoco/operation/StringOp.java)|100%|:green_circle:|
|[Math.kt](https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/kotlin/com/madrapps/jacoco/Math.kt)|46.67%|red_circle|`)
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
      expect(out).toEqual(['coverage-overall', 49.02])
    })
  })

  describe('Push event', function () {
    const payload = {
      before: 'guasft7asdtf78asfd87as6df7y2u3',
      after: 'aahsdflais76dfa78wrglghjkaghkj',
    }

    it('set overall coverage output', async () => {
      initContext('push', payload)
      core.setOutput = output

      await action.action()

      const out = output.mock.calls[0]
      expect(out).toEqual(['coverage-overall', 49.02])
    })

    it('set changed files coverage output', async () => {
      initContext('push', payload)
      core.setOutput = output

      await action.action()

      const out = output.mock.calls[1]
      expect(out).toEqual(['coverage-changed-files', 63.64])
    })
  })

  describe('Other than push or pull_request or pull_request_target event', function () {
    it('Fail by throwing appropriate error', async () => {
      initContext('pr_review', {})
      core.setFailed = jest.fn((c) => {
        expect(c).toEqual(
          'Only pull requests and pushes are supported, pr_review not supported.'
        )
      })
      core.setOutput = output

      await action.action()
    })
  })
})

function initContext(eventName, payload) {
  const context = github.context
  context.eventName = eventName
  context.payload = payload
  context.repo = 'jacoco-playground'
  context.owner = 'madrapps'
}
