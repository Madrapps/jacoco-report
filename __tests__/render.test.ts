import {describe, it, expect} from '@jest/globals'
import * as render from '../src/render'
import {PROJECT} from './mocks.test'
import {Project} from '../src/models/project'

describe('Render', function () {
  describe('getTitle', function () {
    it('title is not present', function () {
      const title = render.getTitle(undefined)
      expect(title).toEqual('')
    })

    it('title is empty', function () {
      const title = render.getTitle('')
      expect(title).toEqual('')
    })

    it('title with blank space', function () {
      const title = render.getTitle(' ')
      expect(title).toEqual('')
    })

    it('title does not start with #', function () {
      const title = render.getTitle('Coverage Report')
      expect(title).toEqual('### Coverage Report\n')
    })

    it('title does not start with # with empty space at beginning and end', function () {
      const title = render.getTitle(' Coverage Report ')
      expect(title).toEqual('### Coverage Report\n')
    })

    it('title starts with #', function () {
      const title = render.getTitle('# Coverage Report')
      expect(title).toEqual('# Coverage Report\n')
    })

    it('title with back-ticks', function () {
      const title = render.getTitle('# `Coverage Report`')
      expect(title).toEqual('# `Coverage Report`\n')
    })

    it('title starts with # with empty space at beginning and end', function () {
      const title = render.getTitle(' # Coverage Report ')
      expect(title).toEqual('# Coverage Report\n')
    })
  })

  describe('get PR Comment', function () {
    const emoji = {
      pass: ':green_apple:',
      fail: ':x:',
    }
    describe('no modules', function () {
      const project: Project = {
        ...PROJECT.SINGLE_MODULE,
        modules: [],
        changed: null,
      }
      it('coverage greater than min coverage', function () {
        const comment = render.getPRComment(
          project,
          {
            overall: 30,
            changed: 50,
          },
          '',
          emoji
        )
        expect(comment).toEqual(
          `|Overall Project|35.25%|:green_apple:|
|:-|:-|:-:|

> There is no coverage information present for the changed lines`
        )
      })

      it('coverage lesser than min coverage', function () {
        const comment = render.getPRComment(
          project,
          {
            overall: 70,
            changed: 50,
          },
          '',
          emoji
        )
        expect(comment).toEqual(
          `|Overall Project|35.25%|:x:|
|:-|:-|:-:|

> There is no coverage information present for the changed lines`
        )
      })

      it('with title', function () {
        const comment = render.getPRComment(
          project,
          {
            overall: 70,
            changed: 50,
          },
          'Coverage',
          emoji
        )
        expect(comment).toEqual(
          `### Coverage
|Overall Project|35.25%|:x:|
|:-|:-|:-:|

> There is no coverage information present for the changed lines`
        )
      })
    })

    describe('single module', function () {
      const project = PROJECT.SINGLE_MODULE

      it('coverage greater than min coverage for overall project', function () {
        const comment = render.getPRComment(
          project,
          {
            overall: 30,
            changed: 60,
          },
          '',
          emoji
        )
        expect(comment).toEqual(
          `|Overall Project|35.25% **\`-17.21%\`**|:green_apple:|
|:-|:-|:-:|
|Changed lines|38.24%|:x:|
<br>

|File|Coverage||
|:-|:-|:-:|
|[StringOp.java](https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/main/java/com/madrapps/jacoco/operation/StringOp.java)|100%|:green_apple:|
|[Math.kt](https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/main/kotlin/com/madrapps/jacoco/Math.kt)|42% **\`-42%\`**|:x:|
|[Utility.java](https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/main/java/com/madrapps/jacoco/Utility.java)|18.03%|:green_apple:|`
        )
      })

      it('coverage lesser than min coverage for overall project', function () {
        const comment = render.getPRComment(
          project,
          {
            overall: 50,
            changed: 64,
          },
          '',
          emoji
        )
        expect(comment).toEqual(
          `|Overall Project|35.25% **\`-17.21%\`**|:x:|
|:-|:-|:-:|
|Changed lines|38.24%|:x:|
<br>

|File|Coverage||
|:-|:-|:-:|
|[StringOp.java](https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/main/java/com/madrapps/jacoco/operation/StringOp.java)|100%|:green_apple:|
|[Math.kt](https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/main/kotlin/com/madrapps/jacoco/Math.kt)|42% **\`-42%\`**|:x:|
|[Utility.java](https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/main/java/com/madrapps/jacoco/Utility.java)|18.03%|:green_apple:|`
        )
      })

      it('coverage lesser than min coverage for changed files', function () {
        const comment = render.getPRComment(
          project,
          {
            overall: 30,
            changed: 80,
          },
          '',
          emoji
        )
        expect(comment).toEqual(
          `|Overall Project|35.25% **\`-17.21%\`**|:green_apple:|
|:-|:-|:-:|
|Changed lines|38.24%|:x:|
<br>

|File|Coverage||
|:-|:-|:-:|
|[StringOp.java](https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/main/java/com/madrapps/jacoco/operation/StringOp.java)|100%|:green_apple:|
|[Math.kt](https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/main/kotlin/com/madrapps/jacoco/Math.kt)|42% **\`-42%\`**|:x:|
|[Utility.java](https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/main/java/com/madrapps/jacoco/Utility.java)|18.03%|:green_apple:|`
        )
      })

      it('coverage greater than min coverage for changed files', function () {
        const comment = render.getPRComment(
          project,
          {
            overall: 50,
            changed: 20,
          },
          '',
          emoji
        )
        expect(comment).toEqual(
          `|Overall Project|35.25% **\`-17.21%\`**|:x:|
|:-|:-|:-:|
|Changed lines|38.24%|:green_apple:|
<br>

|File|Coverage||
|:-|:-|:-:|
|[StringOp.java](https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/main/java/com/madrapps/jacoco/operation/StringOp.java)|100%|:green_apple:|
|[Math.kt](https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/main/kotlin/com/madrapps/jacoco/Math.kt)|42% **\`-42%\`**|:green_apple:|
|[Utility.java](https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/main/java/com/madrapps/jacoco/Utility.java)|18.03%|:green_apple:|`
        )
      })

      it('with title', function () {
        const comment = render.getPRComment(
          project,
          {
            overall: 50,
            changed: 20,
          },
          'Coverage',
          emoji
        )
        expect(comment).toEqual(
          `### Coverage
|Overall Project|35.25% **\`-17.21%\`**|:x:|
|:-|:-|:-:|
|Changed lines|38.24%|:green_apple:|
<br>

|File|Coverage||
|:-|:-|:-:|
|[StringOp.java](https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/main/java/com/madrapps/jacoco/operation/StringOp.java)|100%|:green_apple:|
|[Math.kt](https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/main/kotlin/com/madrapps/jacoco/Math.kt)|42% **\`-42%\`**|:green_apple:|
|[Utility.java](https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/main/java/com/madrapps/jacoco/Utility.java)|18.03%|:green_apple:|`
        )
      })
    })

    describe('multi module', function () {
      const project = PROJECT.MULTI_MODULE

      it('coverage greater than min coverage for overall project', function () {
        const comment = render.getPRComment(
          project,
          {
            overall: 20,
            changed: 60,
          },
          '',
          emoji
        )
        expect(comment).toEqual(
          `|Overall Project|20.41% **\`-19.39%\`**|:green_apple:|
|:-|:-|:-:|
|Changed lines|7.32%|:x:|
<br>

|Module|Coverage||
|:-|:-|:-:|
|text|84.62% **\`-15.38%\`**|:green_apple:|
|math|51.35% **\`-27.03%\`**|:x:|
|app|6.85% **\`-17.81%\`**|:x:|

<details>
<summary>Files</summary>

|Module|File|Coverage||
|:-|:-|:-|:-:|
|text|[StringOp.java](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/text/src/main/java/com/madrapps/text/StringOp.java)|84.62% **\`-15.38%\`**|:green_apple:|
|math|[Math.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/math/src/main/java/com/madrapps/math/Math.kt)|59.38% **\`-15.63%\`**|:x:|
||[Statistics.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/math/src/main/java/com/madrapps/math/Statistics.kt)|0%|:x:|
|app|[MainViewModel.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app/src/main/java/com/madrapps/playground/MainViewModel.kt)|35.71% **\`-28.57%\`**|:x:|
||[MainActivity.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app/src/main/java/com/madrapps/playground/MainActivity.kt)|0% **\`-14%\`**|:x:|
||[OnClickEvent.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app/src/main/java/com/madrapps/playground/events/OnClickEvent.kt)|0%|:x:|

</details>`
        )
      })

      it('coverage lesser than min coverage for overall project', function () {
        const comment = render.getPRComment(
          project,
          {
            overall: 50,
            changed: 30,
          },
          '',
          emoji
        )
        expect(comment).toEqual(
          `|Overall Project|20.41% **\`-19.39%\`**|:x:|
|:-|:-|:-:|
|Changed lines|7.32%|:x:|
<br>

|Module|Coverage||
|:-|:-|:-:|
|text|84.62% **\`-15.38%\`**|:green_apple:|
|math|51.35% **\`-27.03%\`**|:x:|
|app|6.85% **\`-17.81%\`**|:x:|

<details>
<summary>Files</summary>

|Module|File|Coverage||
|:-|:-|:-|:-:|
|text|[StringOp.java](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/text/src/main/java/com/madrapps/text/StringOp.java)|84.62% **\`-15.38%\`**|:green_apple:|
|math|[Math.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/math/src/main/java/com/madrapps/math/Math.kt)|59.38% **\`-15.63%\`**|:x:|
||[Statistics.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/math/src/main/java/com/madrapps/math/Statistics.kt)|0%|:x:|
|app|[MainViewModel.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app/src/main/java/com/madrapps/playground/MainViewModel.kt)|35.71% **\`-28.57%\`**|:x:|
||[MainActivity.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app/src/main/java/com/madrapps/playground/MainActivity.kt)|0% **\`-14%\`**|:x:|
||[OnClickEvent.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app/src/main/java/com/madrapps/playground/events/OnClickEvent.kt)|0%|:x:|

</details>`
        )
      })

      it('coverage lesser than min coverage for changed files', function () {
        const comment = render.getPRComment(
          project,
          {
            overall: 20,
            changed: 90,
          },
          '',
          emoji
        )
        expect(comment).toEqual(
          `|Overall Project|20.41% **\`-19.39%\`**|:green_apple:|
|:-|:-|:-:|
|Changed lines|7.32%|:x:|
<br>

|Module|Coverage||
|:-|:-|:-:|
|text|84.62% **\`-15.38%\`**|:x:|
|math|51.35% **\`-27.03%\`**|:x:|
|app|6.85% **\`-17.81%\`**|:x:|

<details>
<summary>Files</summary>

|Module|File|Coverage||
|:-|:-|:-|:-:|
|text|[StringOp.java](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/text/src/main/java/com/madrapps/text/StringOp.java)|84.62% **\`-15.38%\`**|:x:|
|math|[Math.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/math/src/main/java/com/madrapps/math/Math.kt)|59.38% **\`-15.63%\`**|:x:|
||[Statistics.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/math/src/main/java/com/madrapps/math/Statistics.kt)|0%|:x:|
|app|[MainViewModel.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app/src/main/java/com/madrapps/playground/MainViewModel.kt)|35.71% **\`-28.57%\`**|:x:|
||[MainActivity.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app/src/main/java/com/madrapps/playground/MainActivity.kt)|0% **\`-14%\`**|:x:|
||[OnClickEvent.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app/src/main/java/com/madrapps/playground/events/OnClickEvent.kt)|0%|:x:|

</details>`
        )
      })

      it('coverage greater than min coverage for changed files', function () {
        const comment = render.getPRComment(
          project,
          {
            overall: 50,
            changed: 7,
          },
          '',
          emoji
        )
        expect(comment).toEqual(
          `|Overall Project|20.41% **\`-19.39%\`**|:x:|
|:-|:-|:-:|
|Changed lines|7.32%|:green_apple:|
<br>

|Module|Coverage||
|:-|:-|:-:|
|text|84.62% **\`-15.38%\`**|:green_apple:|
|math|51.35% **\`-27.03%\`**|:x:|
|app|6.85% **\`-17.81%\`**|:x:|

<details>
<summary>Files</summary>

|Module|File|Coverage||
|:-|:-|:-|:-:|
|text|[StringOp.java](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/text/src/main/java/com/madrapps/text/StringOp.java)|84.62% **\`-15.38%\`**|:green_apple:|
|math|[Math.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/math/src/main/java/com/madrapps/math/Math.kt)|59.38% **\`-15.63%\`**|:x:|
||[Statistics.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/math/src/main/java/com/madrapps/math/Statistics.kt)|0%|:x:|
|app|[MainViewModel.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app/src/main/java/com/madrapps/playground/MainViewModel.kt)|35.71% **\`-28.57%\`**|:x:|
||[MainActivity.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app/src/main/java/com/madrapps/playground/MainActivity.kt)|0% **\`-14%\`**|:x:|
||[OnClickEvent.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app/src/main/java/com/madrapps/playground/events/OnClickEvent.kt)|0%|:x:|

</details>`
        )
      })

      it('with title', function () {
        const comment = render.getPRComment(
          project,
          {
            overall: 50,
            changed: 90,
          },
          'Coverage',
          emoji
        )
        expect(comment).toEqual(
          `### Coverage
|Overall Project|20.41% **\`-19.39%\`**|:x:|
|:-|:-|:-:|
|Changed lines|7.32%|:x:|
<br>

|Module|Coverage||
|:-|:-|:-:|
|text|84.62% **\`-15.38%\`**|:x:|
|math|51.35% **\`-27.03%\`**|:x:|
|app|6.85% **\`-17.81%\`**|:x:|

<details>
<summary>Files</summary>

|Module|File|Coverage||
|:-|:-|:-|:-:|
|text|[StringOp.java](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/text/src/main/java/com/madrapps/text/StringOp.java)|84.62% **\`-15.38%\`**|:x:|
|math|[Math.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/math/src/main/java/com/madrapps/math/Math.kt)|59.38% **\`-15.63%\`**|:x:|
||[Statistics.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/math/src/main/java/com/madrapps/math/Statistics.kt)|0%|:x:|
|app|[MainViewModel.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app/src/main/java/com/madrapps/playground/MainViewModel.kt)|35.71% **\`-28.57%\`**|:x:|
||[MainActivity.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app/src/main/java/com/madrapps/playground/MainActivity.kt)|0% **\`-14%\`**|:x:|
||[OnClickEvent.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app/src/main/java/com/madrapps/playground/events/OnClickEvent.kt)|0%|:x:|

</details>`
        )
      })
    })

    describe('multi module with show-all-modules', function () {
      const project: Project = {
        ...PROJECT.MULTI_MODULE,
        modules: [
          {
            name: 'text',
            files: [
              {
                name: 'StringOp.java',
                url: 'https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/text/src/main/java/com/madrapps/text/StringOp.java',
                overall: {covered: 11, missed: 2, percentage: 84.62},
                changed: {covered: 3, missed: 2, percentage: 60},
                lines: [],
              },
            ],
            overall: {covered: 11, missed: 2, percentage: 84.62},
            changed: {covered: 3, missed: 2, percentage: 60},
          },
          {
            name: 'math',
            files: [],
            overall: {covered: 19, missed: 18, percentage: 51.35},
            changed: null,
          },
          {
            name: 'app',
            files: [],
            overall: {covered: 10, missed: 136, percentage: 6.85},
            changed: null,
          },
        ],
      }

      it('modules without changed files show overall coverage only', function () {
        const comment = render.getPRComment(
          project,
          {
            overall: 20,
            changed: 60,
          },
          '',
          emoji
        )
        expect(comment).toEqual(
          `|Overall Project|20.41% **\`-19.39%\`**|:green_apple:|
|:-|:-|:-:|
|Changed lines|7.32%|:x:|
<br>

|Module|Coverage||
|:-|:-|:-:|
|text|84.62% **\`-15.38%\`**|:green_apple:|
|math|51.35%|:green_apple:|
|app|6.85%|:green_apple:|

<details>
<summary>Files</summary>

|Module|File|Coverage||
|:-|:-|:-|:-:|
|text|[StringOp.java](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/text/src/main/java/com/madrapps/text/StringOp.java)|84.62% **\`-15.38%\`**|:green_apple:|

</details>`
        )
      })
    })

    describe('module table collapse', function () {
      it('collapses module table when more than 10 modules', function () {
        const modules = Array.from({length: 11}, (_, i) => ({
          name: `module-${i + 1}`,
          files: [],
          overall: {covered: 50, missed: 50, percentage: 50},
          changed: null,
        }))
        const project: Project = {
          modules,
          isMultiModule: true,
          overall: {covered: 550, missed: 550, percentage: 50},
          changed: null,
        }
        const comment = render.getPRComment(
          project,
          {overall: 40, changed: 60},
          '',
          emoji
        )
        expect(comment).toContain('<details>')
        expect(comment).toContain('<summary>Modules (11)</summary>')
        expect(comment).toContain('|module-1|50%|:green_apple:|')
        expect(comment).toContain('|module-11|50%|:green_apple:|')
      })

      it('does not collapse module table when 10 or fewer modules', function () {
        const modules = Array.from({length: 10}, (_, i) => ({
          name: `module-${i + 1}`,
          files: [],
          overall: {covered: 50, missed: 50, percentage: 50},
          changed: null,
        }))
        const project: Project = {
          modules,
          isMultiModule: true,
          overall: {covered: 500, missed: 500, percentage: 50},
          changed: null,
        }
        const comment = render.getPRComment(
          project,
          {overall: 40, changed: 60},
          '',
          emoji
        )
        expect(comment).not.toContain('<summary>Modules')
        expect(comment).toContain('|module-1|50%|:green_apple:|')
        expect(comment).toContain('|module-10|50%|:green_apple:|')
      })
    })
  })
})
