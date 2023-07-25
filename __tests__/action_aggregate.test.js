/* eslint-disable no-template-curly-in-string */
const action = require('../src/action')
const core = require('@actions/core')
const github = require('@actions/github')

const PATCH_MAIN_VIEW_MODEL =
  '@@ -17,7 +17,7 @@ class MainActivity : AppCompatActivity() {\n         val userId = \\"admin\\"\n         val model: MainViewModel by viewModels()\n         Log.d(\\"App\\", \\"Validate = ${model.validate(userId)}\\")\n-        Log.d(\\"App\\", \\"Verify Access = ${model.verifyAccess(userId)}\\")\n+        Log.d(\\"App\\", \\"Verify Access = ${model.verifyAccess1(userId)}\\")\n \n         // Math module\n         val arithmetic = Arithmetic()'
const PATCH_MATH =
  '@@ -18,6 +18,10 @@ class Arithmetic : MathOperation {\n         return a / b\n     }\n \n+    override fun difference(a: Int, b: Int): Int {\n+        return subtract(a, b)\n+    }\n+\n     fun modulo(a: Int, b: Int): Int {\n         return a % b\n     }'

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
          filename: 'src/main/java/com/madrapps/playground/MainViewModel.kt',
          blob_url:
            'https://github.com/thsaravana/jacoco-android-playground/blob/main/app/src/main/java/com/madrapps/playground/MainViewModel.kt',
          patch: PATCH_MAIN_VIEW_MODEL,
        },
        {
          filename: 'src/main/java/com/madrapps/math/Math.kt',
          blob_url:
            'https://github.com/thsaravana/jacoco-android-playground/blob/main/math/src/main/java/com/madrapps/math/Math.kt',
          patch: PATCH_MATH,
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
        .toEqual(`|Total Project Coverage|76.32%|:green_apple:|
|:-|:-:|:-:|

|Module|Coverage||
|:-|:-:|:-:|
|module-2|70.37%|:green_apple:|
|module-3|8.33%|:x:|

<details>
<summary>Files</summary>

|Module|File|Coverage [65.91%]||
|:-|:-|:-:|:-:|
|module-2|[Math.kt](https://github.com/thsaravana/jacoco-android-playground/blob/main/math/src/main/java/com/madrapps/math/Math.kt)|70.37%|:green_apple:|
|module-3|[MainViewModel.kt](https://github.com/thsaravana/jacoco-android-playground/blob/main/app/src/main/java/com/madrapps/playground/MainViewModel.kt)|58.82%|:x:|

</details>`)
    })

    it('updates a previous comment', async () => {
      initContext(eventName, payload)
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
      initContext(eventName, payload)
      core.setOutput = output

      await action.action()

      const out = output.mock.calls[0]
      expect(out).toEqual(['coverage-overall', 76.32])
    })

    it('set changed files coverage output', async () => {
      initContext(eventName, payload)
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
