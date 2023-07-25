const render = require('../src/render')

describe('get PR Comment', function () {
  describe('no modules', function () {
    const project = {
      modules: [],
      'coverage-changed-files': 100,
    }
    it('coverage greater than min coverage', function () {
      const comment = render.getPRComment(49.23, project, 30, 50)
      expect(comment).toEqual(
        `|Total Project Coverage|49.23%|:green_apple:|
|:-|:-:|:-:|

> There is no coverage information present for the Files changed`
      )
    })

    it('coverage lesser than min coverage', function () {
      const comment = render.getPRComment(49.23, project, 70, 50)
      expect(comment).toEqual(
        `|Total Project Coverage|49.23%|:x:|
|:-|:-:|:-:|

> There is no coverage information present for the Files changed`
      )
    })

    it('with title', function () {
      const comment = render.getPRComment(49.23, project, 70, 50, 'Coverage')
      expect(comment).toEqual(
        `### Coverage
|Total Project Coverage|49.23%|:x:|
|:-|:-:|:-:|

> There is no coverage information present for the Files changed`
      )
    })
  })

  describe('single module', function () {
    const project = {
      modules: [
        {
          name: 'jacoco-playground',
          percentage: 49.23,
          files: [
            {
              filePath:
                'src/main/java/com/madrapps/jacoco/operation/StringOp.java',
              url: 'https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/java/com/madrapps/jacoco/operation/StringOp.java',
              name: 'StringOp.java',
              covered: 7,
              missed: 0,
              percentage: 100,
            },
            {
              covered: 7,
              missed: 8,
              percentage: 46.67,
              filePath: 'src/main/kotlin/com/madrapps/jacoco/Math.kt',
              name: 'Math.kt',
              url: 'https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/kotlin/com/madrapps/jacoco/Math.kt',
            },
          ],
        },
      ],
      isMultiModule: false,
      'coverage-changed-files': 63.64,
    }

    it('coverage greater than min coverage for overall project', function () {
      const comment = render.getPRComment(49.23, project, 30, 60)
      expect(comment).toEqual(
        `|Total Project Coverage|49.23%|:green_apple:|
|:-|:-:|:-:|

|File|Coverage [63.64%]||
|:-|:-:|:-:|
|[StringOp.java](https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/java/com/madrapps/jacoco/operation/StringOp.java)|100%|:green_apple:|
|[Math.kt](https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/kotlin/com/madrapps/jacoco/Math.kt)|46.67%|:x:|`
      )
    })

    it('coverage lesser than min coverage for overall project', function () {
      const comment = render.getPRComment(49.23, project, 50, 64)
      expect(comment).toEqual(
        `|Total Project Coverage|49.23%|:x:|
|:-|:-:|:-:|

|File|Coverage [63.64%]||
|:-|:-:|:-:|
|[StringOp.java](https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/java/com/madrapps/jacoco/operation/StringOp.java)|100%|:green_apple:|
|[Math.kt](https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/kotlin/com/madrapps/jacoco/Math.kt)|46.67%|:x:|`
      )
    })

    it('coverage lesser than min coverage for changed files', function () {
      const comment = render.getPRComment(49.23, project, 30, 80)
      expect(comment).toEqual(
        `|Total Project Coverage|49.23%|:green_apple:|
|:-|:-:|:-:|

|File|Coverage [63.64%]||
|:-|:-:|:-:|
|[StringOp.java](https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/java/com/madrapps/jacoco/operation/StringOp.java)|100%|:green_apple:|
|[Math.kt](https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/kotlin/com/madrapps/jacoco/Math.kt)|46.67%|:x:|`
      )
    })

    it('coverage greater than min coverage for changed files', function () {
      const comment = render.getPRComment(49.23, project, 50, 20)
      expect(comment).toEqual(
        `|Total Project Coverage|49.23%|:x:|
|:-|:-:|:-:|

|File|Coverage [63.64%]||
|:-|:-:|:-:|
|[StringOp.java](https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/java/com/madrapps/jacoco/operation/StringOp.java)|100%|:green_apple:|
|[Math.kt](https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/kotlin/com/madrapps/jacoco/Math.kt)|46.67%|:green_apple:|`
      )
    })

    it('with title', function () {
      const comment = render.getPRComment(49.23, project, 50, 20, 'Coverage')
      expect(comment).toEqual(
        `### Coverage
|Total Project Coverage|49.23%|:x:|
|:-|:-:|:-:|

|File|Coverage [63.64%]||
|:-|:-:|:-:|
|[StringOp.java](https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/java/com/madrapps/jacoco/operation/StringOp.java)|100%|:green_apple:|
|[Math.kt](https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/kotlin/com/madrapps/jacoco/Math.kt)|46.67%|:green_apple:|`
      )
    })
  })

  describe('multi module', function () {
    const project = {
      modules: [
        {
          name: 'math',
          percentage: 70.37,
          files: [
            {
              covered: 19,
              filePath: 'src/main/java/com/madrapps/math/Math.kt',
              missed: 8,
              name: 'Math.kt',
              percentage: 70.37,
              url: 'https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/math/Math.kt',
            },
          ],
        },
        {
          name: 'app',
          percentage: 8.33,
          files: [
            {
              covered: 10,
              filePath:
                'src/main/java/com/madrapps/playground/MainViewModel.kt',
              missed: 7,
              name: 'MainViewModel.kt',
              percentage: 58.82,
              url: 'https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/playground/MainViewModel.kt',
            },
            {
              covered: 10,
              filePath: 'src/main/java/com/madrapps/playground/StringOp.kt',
              missed: 21,
              name: 'StringOp.kt',
              percentage: 32.25,
              url: 'https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/playground/StringOp.kt',
            },
          ],
        },
      ],
      isMultiModule: true,
      'coverage-changed-files': 63.64,
    }

    it('coverage greater than min coverage for overall project', function () {
      const comment = render.getPRComment(49.23, project, 30, 60)
      expect(comment).toEqual(
        `|Total Project Coverage|49.23%|:green_apple:|
|:-|:-:|:-:|

|Module|Coverage||
|:-|:-:|:-:|
|math|70.37%|:green_apple:|
|app|8.33%|:x:|

<details>
<summary>Files</summary>

|Module|File|Coverage [63.64%]||
|:-|:-|:-:|:-:|
|math|[Math.kt](https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/math/Math.kt)|70.37%|:green_apple:|
|app|[MainViewModel.kt](https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/playground/MainViewModel.kt)|58.82%|:x:|
||[StringOp.kt](https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/playground/StringOp.kt)|32.25%|:x:|

</details>`
      )
    })

    it('coverage lesser than min coverage for overall project', function () {
      const comment = render.getPRComment(49.23, project, 50, 64)
      expect(comment).toEqual(
        `|Total Project Coverage|49.23%|:x:|
|:-|:-:|:-:|

|Module|Coverage||
|:-|:-:|:-:|
|math|70.37%|:green_apple:|
|app|8.33%|:x:|

<details>
<summary>Files</summary>

|Module|File|Coverage [63.64%]||
|:-|:-|:-:|:-:|
|math|[Math.kt](https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/math/Math.kt)|70.37%|:green_apple:|
|app|[MainViewModel.kt](https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/playground/MainViewModel.kt)|58.82%|:x:|
||[StringOp.kt](https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/playground/StringOp.kt)|32.25%|:x:|

</details>`
      )
    })

    it('coverage lesser than min coverage for changed files', function () {
      const comment = render.getPRComment(49.23, project, 30, 80)
      expect(comment).toEqual(
        `|Total Project Coverage|49.23%|:green_apple:|
|:-|:-:|:-:|

|Module|Coverage||
|:-|:-:|:-:|
|math|70.37%|:x:|
|app|8.33%|:x:|

<details>
<summary>Files</summary>

|Module|File|Coverage [63.64%]||
|:-|:-|:-:|:-:|
|math|[Math.kt](https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/math/Math.kt)|70.37%|:x:|
|app|[MainViewModel.kt](https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/playground/MainViewModel.kt)|58.82%|:x:|
||[StringOp.kt](https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/playground/StringOp.kt)|32.25%|:x:|

</details>`
      )
    })

    it('coverage greater than min coverage for changed files', function () {
      const comment = render.getPRComment(49.23, project, 50, 20)
      expect(comment).toEqual(
        `|Total Project Coverage|49.23%|:x:|
|:-|:-:|:-:|

|Module|Coverage||
|:-|:-:|:-:|
|math|70.37%|:green_apple:|
|app|8.33%|:x:|

<details>
<summary>Files</summary>

|Module|File|Coverage [63.64%]||
|:-|:-|:-:|:-:|
|math|[Math.kt](https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/math/Math.kt)|70.37%|:green_apple:|
|app|[MainViewModel.kt](https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/playground/MainViewModel.kt)|58.82%|:green_apple:|
||[StringOp.kt](https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/playground/StringOp.kt)|32.25%|:green_apple:|

</details>`
      )
    })

    it('with title', function () {
      const comment = render.getPRComment(49.23, project, 50, 20, 'Coverage')
      expect(comment).toEqual(
        `### Coverage
|Total Project Coverage|49.23%|:x:|
|:-|:-:|:-:|

|Module|Coverage||
|:-|:-:|:-:|
|math|70.37%|:green_apple:|
|app|8.33%|:x:|

<details>
<summary>Files</summary>

|Module|File|Coverage [63.64%]||
|:-|:-|:-:|:-:|
|math|[Math.kt](https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/math/Math.kt)|70.37%|:green_apple:|
|app|[MainViewModel.kt](https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/playground/MainViewModel.kt)|58.82%|:green_apple:|
||[StringOp.kt](https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/playground/StringOp.kt)|32.25%|:green_apple:|

</details>`
      )
    })
  })
})
