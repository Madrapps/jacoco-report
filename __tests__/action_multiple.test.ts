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

describe('Multiple reports', function () {
  let comment
  let output

  const compareCommitsResponse = {
    data: {
      files: [
        {
          filename:
            'app/src/main/java/com/madrapps/playground/MainViewModel.kt',
          blob_url:
            'https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app/src/main/java/com/madrapps/playground/MainViewModel.kt',
          patch: PATCH.MULTI_MODULE.MAIN_VIEW_MODEL,
        },
        {
          filename: 'math/src/main/java/com/madrapps/math/Math.kt',
          blob_url:
            'https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/math/src/main/java/com/madrapps/math/Math.kt',
          patch: PATCH.MULTI_MODULE.MATH,
        },
        {
          filename: 'text/src/main/java/com/madrapps/text/StringOp.java',
          blob_url:
            'https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/text/src/main/java/com/madrapps/text/StringOp.java',
          patch: PATCH.MULTI_MODULE.STRING_OP,
        },
        {
          filename:
            'app/src/main/java/com/madrapps/playground/events/OnClickEvent.kt',
          blob_url:
            'https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app/src/main/java/com/madrapps/playground/events/OnClickEvent.kt',
          patch: PATCH.MULTI_MODULE.ON_CLICK_EVENT,
        },
        {
          filename: 'app/src/main/java/com/madrapps/playground/MainActivity.kt',
          blob_url:
            'https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app/src/main/java/com/madrapps/playground/MainActivity.kt',
          patch: PATCH.MULTI_MODULE.MAIN_ACTIVITY,
        },
      ],
    },
  }

  function getInput(c): string {
    switch (c) {
      case 'paths':
        return './__tests__/__fixtures__/multi_module/appCoverage.xml,./__tests__/__fixtures__/multi_module/mathCoverage.xml,./__tests__/__fixtures__/multi_module/textCoverage.xml'
      case 'token':
        return 'SMPLEHDjasdf876a987'
      case 'comment-type':
        return 'pr_comment'
      case 'min-coverage-overall':
        return 45
      case 'min-coverage-changed-lines':
        return 90
      case 'pass-emoji':
        return ':green_apple:'
      case 'fail-emoji':
        return ':x:'
      case 'coverage-counter-type':
        return 'INSTRUCTION'
      case 'debug-mode':
        return 'false'
    }
  }

  beforeEach(() => {
    comment = jest.fn()
    output = jest.fn()

    mockCore.getInput.mockImplementation(getInput)
    mockCore.setOutput.mockImplementation((...args) => output(...args))
    mockGithub.getOctokit.mockReturnValue({
      rest: {
        repos: {
          compareCommits: jest.fn(() => {
            return compareCommitsResponse
          }),
          listPullRequestsAssociatedWithCommit: jest.fn(() => {
            return {data: []}
          }),
        },
        issues: {
          createComment: comment,
        },
      },
    })
    mockCore.setFailed.mockImplementation(c => {
      fail(c)
    })
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
        .toEqual(`|Overall Project|20.41% **\`-16.84%\`**|:x:|
|:-|:-|:-:|
|Changed lines|8.33%|:x:|
<br>

|Module|Coverage||
|:-|:-|:-:|
|text|84.62% **\`-15.38%\`**|:x:|
|math|51.35% **\`-13.51%\`**|:x:|
|app|6.85% **\`-17.81%\`**|:x:|

<details>
<summary>Files</summary>

|Module|File|Coverage||
|:-|:-|:-|:-:|
|text|[StringOp.java](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/text/src/main/java/com/madrapps/text/StringOp.java)|84.62% **\`-15.38%\`**|:x:|
|math|[Math.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/math/src/main/java/com/madrapps/math/Math.kt)|59.38% **\`-15.63%\`**|:x:|
|app|[MainViewModel.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app/src/main/java/com/madrapps/playground/MainViewModel.kt)|35.71% **\`-28.57%\`**|:x:|
||[MainActivity.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app/src/main/java/com/madrapps/playground/MainActivity.kt)|0% **\`-14%\`**|:x:|
||[OnClickEvent.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app/src/main/java/com/madrapps/playground/events/OnClickEvent.kt)|0%|:x:|

</details>`)
    })

    it('set overall coverage output', async () => {
      initContext(eventName, payload)

      await action.action()

      const out = output.mock.calls[0]
      expect(out).toEqual(['coverage-overall', 20.41])
    })

    it('set changed lines coverage output', async () => {
      initContext(eventName, payload)

      await action.action()

      const out = output.mock.calls[1]
      expect(out).toEqual(['coverage-changed-lines', 8.33])
    })
  })

  describe('Push event', function () {
    const payload = {
      before: 'guasft7asdtf78asfd87as6df7y2u3',
      after: 'aahsdflais76dfa78wrglghjkaghkj',
    }

    it('set overall coverage output', async () => {
      initContext('push', payload)

      await action.action()

      const out = output.mock.calls[0]
      expect(out).toEqual(['coverage-overall', 20.41])
    })

    it('set changed lines coverage output', async () => {
      initContext('push', payload)

      await action.action()

      const out = output.mock.calls[1]
      expect(out).toEqual(['coverage-changed-lines', 8.33])
    })
  })
})

function initContext(eventName, payload): void {
  mockContext.eventName = eventName
  mockContext.payload = payload
  mockContext.repo = 'jacoco-playground'
  mockContext.owner = 'madrapps'
}
