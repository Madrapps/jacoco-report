/* eslint-disable no-template-curly-in-string */
const action = require('../src/action')
const core = require('@actions/core')
const github = require('@actions/github')
const { PATCH } = require('./mocks.test')

jest.mock('@actions/core')
jest.mock('@actions/github')

describe('Multiple reports', function () {
  const comment = jest.fn()
  const output = jest.fn()

  const compareCommitsResponse = {
    data: {
      files: [
        {
          filename: 'src/main/java/com/madrapps/playground/MainViewModel.kt',
          blob_url:
            'https://github.com/thsaravana/jacoco-android-playground/blob/main/app/src/main/java/com/madrapps/playground/MainViewModel.kt',
          patch: PATCH.MAIN_VIEW_MODEL,
        },
        {
          filename: 'src/main/java/com/madrapps/math/Math.kt',
          blob_url:
            'https://github.com/thsaravana/jacoco-android-playground/blob/main/math/src/main/java/com/madrapps/math/Math.kt',
          patch: PATCH.MATH,
        },
      ],
    },
  }

  core.getInput = jest.fn((c) => {
    switch (c) {
      case 'paths':
        return './__tests__/__fixtures__/multi_module/appCoverage.xml,./__tests__/__fixtures__/multi_module/mathCoverage.xml,./__tests__/__fixtures__/multi_module/textCoverage.xml'
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
        return 'false'
    }
  })
  github.getOctokit = jest.fn(() => {
    return {
      repos: {
        compareCommits: jest.fn(() => {
          return compareCommitsResponse
        }),
      },
      issues: {
        createComment: comment,
      },
    }
  })
  core.setFailed = jest.fn((c) => {
    fail(c)
  })

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

      expect(comment.mock.calls[0][0].body)
        .toEqual(`|Total Project Coverage|25.32%|:x:|
|:-|:-:|:-:|

|Module|Coverage||
|:-|:-:|:-:|
|math|70.37%|:green_apple:|
|app|8.33%|:x:|

<details>
<summary>Files</summary>

|Module|File|Coverage [65.91%]||
|:-|:-|:-:|:-:|
|math|[Math.kt](https://github.com/thsaravana/jacoco-android-playground/blob/main/math/src/main/java/com/madrapps/math/Math.kt)|70.37%|:green_apple:|
|app|[MainViewModel.kt](https://github.com/thsaravana/jacoco-android-playground/blob/main/app/src/main/java/com/madrapps/playground/MainViewModel.kt)|58.82%|:x:|

</details>`)
    })

    it('set overall coverage output', async () => {
      initContext(eventName, payload)
      core.setOutput = output

      await action.action()

      const out = output.mock.calls[0]
      expect(out).toEqual(['coverage-overall', 25.32])
    })

    it('set changed files coverage output', async () => {
      initContext(eventName, payload)
      core.setOutput = output

      await action.action()

      const out = output.mock.calls[1]
      expect(out).toEqual(['coverage-changed-files', 65.91])
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
      expect(out).toEqual(['coverage-overall', 25.32])
    })

    it('set changed files coverage output', async () => {
      initContext('push', payload)
      core.setOutput = output

      await action.action()

      const out = output.mock.calls[1]
      expect(out).toEqual(['coverage-changed-files', 65.91])
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
