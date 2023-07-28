const render = require('../src/render')
const { PROJECT } = require('./mocks.test')

describe('get PR Comment', function () {
  const emoji = {
    pass: ':green_apple:',
    fail: ':x:',
  }
  describe('no modules', function () {
    const project = {
      modules: [],
      'coverage-changed-files': 100,
    }
    it('coverage greater than min coverage', function () {
      const comment = render.getPRComment(49.23, project, 30, 50, '', emoji)
      expect(comment).toEqual(
        `|Total Project Coverage|49.23%|:green_apple:|
|:-|:-:|:-:|

> There is no coverage information present for the Files changed`
      )
    })

    it('coverage lesser than min coverage', function () {
      const comment = render.getPRComment(49.23, project, 70, 50, '', emoji)
      expect(comment).toEqual(
        `|Total Project Coverage|49.23%|:x:|
|:-|:-:|:-:|

> There is no coverage information present for the Files changed`
      )
    })

    it('with title', function () {
      const comment = render.getPRComment(
        49.23,
        project,
        70,
        50,
        'Coverage',
        emoji
      )
      expect(comment).toEqual(
        `### Coverage
|Total Project Coverage|49.23%|:x:|
|:-|:-:|:-:|

> There is no coverage information present for the Files changed`
      )
    })
  })

  describe('single module', function () {
    const project = PROJECT.SINGLE_MODULE

    it('coverage greater than min coverage for overall project', function () {
      const comment = render.getPRComment(49.23, project, 30, 60, '', emoji)
      expect(comment).toEqual(
        `|Total Project Coverage|49.23%|:green_apple:|
|:-|:-:|:-:|

|File|Coverage||
|:-|:-|:-:|
|[StringOp.java](https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/main/java/com/madrapps/jacoco/operation/StringOp.java)|100%|:green_apple:|
|[Math.kt](https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/main/kotlin/com/madrapps/jacoco/Math.kt)|42% **\`-0.42%\`**|:x:|
|[Utility.java](https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/main/java/com/madrapps/jacoco/Utility.java)|18.03%|:x:|`
      )
    })

    it('coverage lesser than min coverage for overall project', function () {
      const comment = render.getPRComment(49.23, project, 50, 64, '', emoji)
      expect(comment).toEqual(
        `|Total Project Coverage|49.23%|:x:|
|:-|:-:|:-:|

|File|Coverage||
|:-|:-|:-:|
|[StringOp.java](https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/main/java/com/madrapps/jacoco/operation/StringOp.java)|100%|:green_apple:|
|[Math.kt](https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/main/kotlin/com/madrapps/jacoco/Math.kt)|42% **\`-0.42%\`**|:x:|
|[Utility.java](https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/main/java/com/madrapps/jacoco/Utility.java)|18.03%|:x:|`
      )
    })

    it('coverage lesser than min coverage for changed files', function () {
      const comment = render.getPRComment(49.23, project, 30, 80, '', emoji)
      expect(comment).toEqual(
        `|Total Project Coverage|49.23%|:green_apple:|
|:-|:-:|:-:|

|File|Coverage||
|:-|:-|:-:|
|[StringOp.java](https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/main/java/com/madrapps/jacoco/operation/StringOp.java)|100%|:green_apple:|
|[Math.kt](https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/main/kotlin/com/madrapps/jacoco/Math.kt)|42% **\`-0.42%\`**|:x:|
|[Utility.java](https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/main/java/com/madrapps/jacoco/Utility.java)|18.03%|:x:|`
      )
    })

    it('coverage greater than min coverage for changed files', function () {
      const comment = render.getPRComment(49.23, project, 50, 20, '', emoji)
      expect(comment).toEqual(
        `|Total Project Coverage|49.23%|:x:|
|:-|:-:|:-:|

|File|Coverage||
|:-|:-|:-:|
|[StringOp.java](https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/main/java/com/madrapps/jacoco/operation/StringOp.java)|100%|:green_apple:|
|[Math.kt](https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/main/kotlin/com/madrapps/jacoco/Math.kt)|42% **\`-0.42%\`**|:green_apple:|
|[Utility.java](https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/main/java/com/madrapps/jacoco/Utility.java)|18.03%|:x:|`
      )
    })

    it('with title', function () {
      const comment = render.getPRComment(
        49.23,
        project,
        50,
        20,
        'Coverage',
        emoji
      )
      expect(comment).toEqual(
        `### Coverage
|Total Project Coverage|49.23%|:x:|
|:-|:-:|:-:|

|File|Coverage||
|:-|:-|:-:|
|[StringOp.java](https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/main/java/com/madrapps/jacoco/operation/StringOp.java)|100%|:green_apple:|
|[Math.kt](https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/main/kotlin/com/madrapps/jacoco/Math.kt)|42% **\`-0.42%\`**|:green_apple:|
|[Utility.java](https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/main/java/com/madrapps/jacoco/Utility.java)|18.03%|:x:|`
      )
    })
  })

  describe('multi module', function () {
    const project = PROJECT.MULTI_MODULE

    it('coverage greater than min coverage for overall project', function () {
      const comment = render.getPRComment(49.23, project, 30, 60, '', emoji)
      expect(comment).toEqual(
        `|Total Project Coverage|49.23%|:green_apple:|
|:-|:-:|:-:|

|Module|Coverage||
|:-|:-:|:-:|
|text|84.62% **\`-0.15%\`**|:green_apple:|
|math|51.35% **\`-0.27%\`**|:x:|
|app|6.85% **\`-0.2%\`**|:x:|

<details>
<summary>Files</summary>

|Module|File|Coverage||
|:-|:-|:-|:-:|
|text|[StringOp.java](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/text/src/main/java/com/madrapps/text/StringOp.java)|84.62% **\`-0.15%\`**|:green_apple:|
|math|[Math.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/math/src/main/java/com/madrapps/math/Math.kt)|59.38% **\`-0.16%\`**|:x:|
||[Statistics.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/math/src/main/java/com/madrapps/math/Statistics.kt)|0% **\`-1%\`**|:x:|
|app|[MainViewModel.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app/src/main/java/com/madrapps/playground/MainViewModel.kt)|35.71% **\`-0.29%\`**|:x:|
||[MainActivity.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app/src/main/java/com/madrapps/playground/MainActivity.kt)|0% **\`-0.14%\`**|:x:|
||[OnClickEvent.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app/src/main/java/com/madrapps/playground/events/OnClickEvent.kt)|0% **\`-1%\`**|:x:|

</details>`
      )
    })

    it('coverage lesser than min coverage for overall project', function () {
      const comment = render.getPRComment(49.23, project, 50, 64, '', emoji)
      expect(comment).toEqual(
        `|Total Project Coverage|49.23%|:x:|
|:-|:-:|:-:|

|Module|Coverage||
|:-|:-:|:-:|
|text|84.62% **\`-0.15%\`**|:green_apple:|
|math|51.35% **\`-0.27%\`**|:x:|
|app|6.85% **\`-0.2%\`**|:x:|

<details>
<summary>Files</summary>

|Module|File|Coverage||
|:-|:-|:-|:-:|
|text|[StringOp.java](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/text/src/main/java/com/madrapps/text/StringOp.java)|84.62% **\`-0.15%\`**|:green_apple:|
|math|[Math.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/math/src/main/java/com/madrapps/math/Math.kt)|59.38% **\`-0.16%\`**|:x:|
||[Statistics.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/math/src/main/java/com/madrapps/math/Statistics.kt)|0% **\`-1%\`**|:x:|
|app|[MainViewModel.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app/src/main/java/com/madrapps/playground/MainViewModel.kt)|35.71% **\`-0.29%\`**|:x:|
||[MainActivity.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app/src/main/java/com/madrapps/playground/MainActivity.kt)|0% **\`-0.14%\`**|:x:|
||[OnClickEvent.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app/src/main/java/com/madrapps/playground/events/OnClickEvent.kt)|0% **\`-1%\`**|:x:|

</details>`
      )
    })

    it('coverage lesser than min coverage for changed files', function () {
      const comment = render.getPRComment(49.23, project, 30, 80, '', emoji)
      expect(comment).toEqual(
        `|Total Project Coverage|49.23%|:green_apple:|
|:-|:-:|:-:|

|Module|Coverage||
|:-|:-:|:-:|
|text|84.62% **\`-0.15%\`**|:green_apple:|
|math|51.35% **\`-0.27%\`**|:x:|
|app|6.85% **\`-0.2%\`**|:x:|

<details>
<summary>Files</summary>

|Module|File|Coverage||
|:-|:-|:-|:-:|
|text|[StringOp.java](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/text/src/main/java/com/madrapps/text/StringOp.java)|84.62% **\`-0.15%\`**|:green_apple:|
|math|[Math.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/math/src/main/java/com/madrapps/math/Math.kt)|59.38% **\`-0.16%\`**|:x:|
||[Statistics.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/math/src/main/java/com/madrapps/math/Statistics.kt)|0% **\`-1%\`**|:x:|
|app|[MainViewModel.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app/src/main/java/com/madrapps/playground/MainViewModel.kt)|35.71% **\`-0.29%\`**|:x:|
||[MainActivity.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app/src/main/java/com/madrapps/playground/MainActivity.kt)|0% **\`-0.14%\`**|:x:|
||[OnClickEvent.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app/src/main/java/com/madrapps/playground/events/OnClickEvent.kt)|0% **\`-1%\`**|:x:|

</details>`
      )
    })

    it('coverage greater than min coverage for changed files', function () {
      const comment = render.getPRComment(49.23, project, 50, 20, '', emoji)
      expect(comment).toEqual(
        `|Total Project Coverage|49.23%|:x:|
|:-|:-:|:-:|

|Module|Coverage||
|:-|:-:|:-:|
|text|84.62% **\`-0.15%\`**|:green_apple:|
|math|51.35% **\`-0.27%\`**|:green_apple:|
|app|6.85% **\`-0.2%\`**|:x:|

<details>
<summary>Files</summary>

|Module|File|Coverage||
|:-|:-|:-|:-:|
|text|[StringOp.java](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/text/src/main/java/com/madrapps/text/StringOp.java)|84.62% **\`-0.15%\`**|:green_apple:|
|math|[Math.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/math/src/main/java/com/madrapps/math/Math.kt)|59.38% **\`-0.16%\`**|:green_apple:|
||[Statistics.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/math/src/main/java/com/madrapps/math/Statistics.kt)|0% **\`-1%\`**|:x:|
|app|[MainViewModel.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app/src/main/java/com/madrapps/playground/MainViewModel.kt)|35.71% **\`-0.29%\`**|:green_apple:|
||[MainActivity.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app/src/main/java/com/madrapps/playground/MainActivity.kt)|0% **\`-0.14%\`**|:x:|
||[OnClickEvent.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app/src/main/java/com/madrapps/playground/events/OnClickEvent.kt)|0% **\`-1%\`**|:x:|

</details>`
      )
    })

    it('with title', function () {
      const comment = render.getPRComment(
        49.23,
        project,
        50,
        20,
        'Coverage',
        emoji
      )
      expect(comment).toEqual(
        `### Coverage
|Total Project Coverage|49.23%|:x:|
|:-|:-:|:-:|

|Module|Coverage||
|:-|:-:|:-:|
|text|84.62% **\`-0.15%\`**|:green_apple:|
|math|51.35% **\`-0.27%\`**|:green_apple:|
|app|6.85% **\`-0.2%\`**|:x:|

<details>
<summary>Files</summary>

|Module|File|Coverage||
|:-|:-|:-|:-:|
|text|[StringOp.java](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/text/src/main/java/com/madrapps/text/StringOp.java)|84.62% **\`-0.15%\`**|:green_apple:|
|math|[Math.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/math/src/main/java/com/madrapps/math/Math.kt)|59.38% **\`-0.16%\`**|:green_apple:|
||[Statistics.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/math/src/main/java/com/madrapps/math/Statistics.kt)|0% **\`-1%\`**|:x:|
|app|[MainViewModel.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app/src/main/java/com/madrapps/playground/MainViewModel.kt)|35.71% **\`-0.29%\`**|:green_apple:|
||[MainActivity.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app/src/main/java/com/madrapps/playground/MainActivity.kt)|0% **\`-0.14%\`**|:x:|
||[OnClickEvent.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app/src/main/java/com/madrapps/playground/events/OnClickEvent.kt)|0% **\`-1%\`**|:x:|

</details>`
      )
    })
  })
})
