const action = require('../src/action')
const core = require('@actions/core')
const github = require('@actions/github')

jest.mock('@actions/core')
jest.mock('@actions/github')

describe('Aggregate report', function () {
  let createComment
  let listComments
  let updateComment
  let output

  function getInput(key) {
    switch (key) {
      case 'paths':
        return './__tests__/__fixtures__/aggregate-report.xml'
      case 'token':
        return 'SMPLEHDjasdf876a987'
      case 'min-coverage-overall':
        return 45
      case 'min-coverage-changed-files':
        return 60
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
          createComment: createComment,
          listComments: listComments,
          updateComment: updateComment,
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
          filename: 'src/main/java/com/madrapps/playground/MainViewModel.kt',
          blob_url:
            'https://github.com/thsaravana/jacoco-android-playground/blob/main/app/src/main/java/com/madrapps/playground/MainViewModel.kt',
        },
        {
          filename: 'src/main/java/com/madrapps/math/Math.kt',
          blob_url:
            'https://github.com/thsaravana/jacoco-android-playground/blob/main/math/src/main/java/com/madrapps/math/Math.kt',
        },
      ],
    },
  }

  describe('Pull Request event', function () {
    const context = {
      eventName: 'pull_request',
      payload: {
        pull_request: {
          number: '45',
          base: {
            sha: 'guasft7asdtf78asfd87as6df7y2u3',
          },
          head: {
            sha: 'aahsdflais76dfa78wrglghjkaghkj',
          },
        },
      },
      repo: 'jacoco-android-playground',
      owner: 'madrapps',
    }

    it('publish proper comment', async () => {
      github.context = context

      await action.action()

      expect(createComment.mock.calls[0][0].body)
        .toEqual(`|File|Coverage [65.91%]|:green_apple:|
|:-|:-:|:-:|
|[Math.kt](https://github.com/thsaravana/jacoco-android-playground/blob/main/math/src/main/java/com/madrapps/math/Math.kt)|70.37%|:green_apple:|
|[MainViewModel.kt](https://github.com/thsaravana/jacoco-android-playground/blob/main/app/src/main/java/com/madrapps/playground/MainViewModel.kt)|58.82%|:x:|

|Total Project Coverage|76.32%|:green_apple:|
|:-|:-:|:-:|`)
    })

    it('updates a previous comment', async () => {
      github.context = context

      const title = 'JaCoCo Report'
      core.getInput = jest.fn((c) => {
        switch (c) {
          case 'title':
            return title
          case 'update-comment':
            return 'true'
          default:
            return getInput(c)
        }
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

    it('set overall coverage output', async () => {
      github.context = context
      core.setOutput = output

      await action.action()

      const out = output.mock.calls[0]
      expect(out).toEqual(['coverage-overall', 76.32])
    })

    it('set changed files coverage output', async () => {
      github.context = context
      core.setOutput = output

      await action.action()

      const out = output.mock.calls[1]
      expect(out).toEqual(['coverage-changed-files', 65.91])
    })
  })

  describe('Pull Request Target event', function () {
    const context = {
      eventName: 'pull_request_target',
      payload: {
        pull_request: {
          number: '45',
          base: {
            sha: 'guasft7asdtf78asfd87as6df7y2u3',
          },
          head: {
            sha: 'aahsdflais76dfa78wrglghjkaghkj',
          },
        },
      },
      repo: 'jacoco-playground',
      owner: 'madrapps',
    }

    it('set overall coverage output', async () => {
      github.context = context
      core.setOutput = output

      await action.action()

      const out = output.mock.calls[0]
      expect(out).toEqual(['coverage-overall', 76.32])
    })
  })

  describe('Push event', function () {
    const context = {
      eventName: 'push',
      payload: {
        before: 'guasft7asdtf78asfd87as6df7y2u3',
        after: 'aahsdflais76dfa78wrglghjkaghkj',
      },
      repo: 'jacoco-playground',
      owner: 'madrapps',
    }

    it('set overall coverage output', async () => {
      github.context = context
      core.setOutput = output

      await action.action()

      const out = output.mock.calls[0]
      expect(out).toEqual(['coverage-overall', 76.32])
    })

    it('set changed files coverage output', async () => {
      github.context = context
      core.setOutput = output

      await action.action()

      const out = output.mock.calls[1]
      expect(out).toEqual(['coverage-changed-files', 65.91])
    })
  })

  describe('Other than push or pull_request or pull_request_target event', function () {
    const context = {
      eventName: 'pr_review',
    }

    it('Fail by throwing appropriate error', async () => {
      github.context = context
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
