const render = require('../src/render')

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
    const project = {
      modules: [
        {
          name: 'jacoco-playground',
          percentage: 37.37,
          files: [
            {
              name: 'StringOp.java',
              url: 'https://github.com/thsaravana/jacoco-playground/blob/2ec1d3051c8fcdf13931fffe517596c4bd7f71fb/src/main/java/com/madrapps/jacoco/operation/StringOp.java',
              missed: 0,
              covered: 11,
              percentage: 100,
              lines: [],
            },
            {
              name: 'Math.kt',
              url: 'https://github.com/thsaravana/jacoco-playground/blob/2ec1d3051c8fcdf13931fffe517596c4bd7f71fb/src/main/kotlin/com/madrapps/jacoco/Math.kt',
              missed: 12,
              covered: 15,
              percentage: 55.56,
              lines: [],
            },
            {
              name: 'Utility.java',
              url: 'https://github.com/thsaravana/jacoco-playground/blob/2ec1d3051c8fcdf13931fffe517596c4bd7f71fb/src/main/java/com/madrapps/jacoco/Utility.java',
              missed: 50,
              covered: 11,
              percentage: 18.03,
              lines: [
                {
                  number: 3,
                  instruction: { missed: 0, covered: 3 },
                  branch: { missed: 0, covered: 0 },
                },
              ],
            },
          ],
        },
      ],
      isMultiModule: false,
      'coverage-changed-files': 37.37,
    }

    it('coverage greater than min coverage for overall project', function () {
      const comment = render.getPRComment(49.23, project, 30, 60, '', emoji)
      expect(comment).toEqual(
        `|Total Project Coverage|49.23%|:green_apple:|
|:-|:-:|:-:|

|File|Coverage [63.64%]||
|:-|:-:|:-:|
|[StringOp.java](https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/java/com/madrapps/jacoco/operation/StringOp.java)|100%|:green_apple:|
|[Math.kt](https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/kotlin/com/madrapps/jacoco/Math.kt)|46.67% (-0.33%)|:x:|`
      )
    })

    it('coverage lesser than min coverage for overall project', function () {
      const comment = render.getPRComment(49.23, project, 50, 64, '', emoji)
      expect(comment).toEqual(
        `|Total Project Coverage|49.23%|:x:|
|:-|:-:|:-:|

|File|Coverage [63.64%]||
|:-|:-:|:-:|
|[StringOp.java](https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/java/com/madrapps/jacoco/operation/StringOp.java)|100%|:green_apple:|
|[Math.kt](https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/kotlin/com/madrapps/jacoco/Math.kt)|46.67% (-0.33%)|:x:|`
      )
    })

    it('coverage lesser than min coverage for changed files', function () {
      const comment = render.getPRComment(49.23, project, 30, 80, '', emoji)
      expect(comment).toEqual(
        `|Total Project Coverage|49.23%|:green_apple:|
|:-|:-:|:-:|

|File|Coverage [63.64%]||
|:-|:-:|:-:|
|[StringOp.java](https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/java/com/madrapps/jacoco/operation/StringOp.java)|100%|:green_apple:|
|[Math.kt](https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/kotlin/com/madrapps/jacoco/Math.kt)|46.67% (-0.33%)|:x:|`
      )
    })

    it('coverage greater than min coverage for changed files', function () {
      const comment = render.getPRComment(49.23, project, 50, 20, '', emoji)
      expect(comment).toEqual(
        `|Total Project Coverage|49.23%|:x:|
|:-|:-:|:-:|

|File|Coverage [63.64%]||
|:-|:-:|:-:|
|[StringOp.java](https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/java/com/madrapps/jacoco/operation/StringOp.java)|100%|:green_apple:|
|[Math.kt](https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/kotlin/com/madrapps/jacoco/Math.kt)|46.67% (-0.33%)|:green_apple:|`
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

|File|Coverage [63.64%]||
|:-|:-:|:-:|
|[StringOp.java](https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/java/com/madrapps/jacoco/operation/StringOp.java)|100%|:green_apple:|
|[Math.kt](https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/kotlin/com/madrapps/jacoco/Math.kt)|46.67% (-0.33%)|:green_apple:|`
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
              missed: 8,
              name: 'Math.kt',
              percentage: 70.37,
              url: 'https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/math/Math.kt',
              lines: [
                {
                  number: 10,
                  branch: { covered: 0, missed: 0 },
                  instruction: { covered: 4, missed: 8 },
                },
              ],
            },
          ],
        },
        {
          name: 'app',
          percentage: 8.33,
          files: [
            {
              covered: 10,
              missed: 7,
              name: 'MainViewModel.kt',
              percentage: 58.82,
              url: 'https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/playground/MainViewModel.kt',
              lines: [
                {
                  number: 16,
                  branch: { covered: 0, missed: 0 },
                  instruction: { covered: 2, missed: 0 },
                },
                {
                  number: 17,
                  branch: { covered: 1, missed: 2 },
                  instruction: { covered: 1, missed: 0 },
                },
                {
                  number: 18,
                  branch: { covered: 0, missed: 3 },
                  instruction: { covered: 3, missed: 3 },
                },
              ],
            },
            {
              covered: 10,
              missed: 21,
              name: 'StringOp.kt',
              percentage: 32.25,
              url: 'https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/playground/StringOp.kt',
              lines: [
                {
                  number: 16,
                  branch: { covered: 0, missed: 0 },
                  instruction: { covered: 2, missed: 2 },
                },
                {
                  number: 17,
                  branch: { covered: 1, missed: 0 },
                  instruction: { covered: 1, missed: 1 },
                },
                {
                  number: 25,
                  branch: { covered: 1, missed: 3 },
                  instruction: { covered: 1, missed: 1 },
                },
                {
                  number: 26,
                  branch: { covered: 2, missed: 0 },
                  instruction: { covered: 1, missed: 2 },
                },
                {
                  number: 27,
                  branch: { covered: 0, missed: 3 },
                  instruction: { covered: 1, missed: 3 },
                },
              ],
            },
          ],
        },
      ],
      isMultiModule: true,
      'coverage-changed-files': 63.64,
    }

    it('coverage greater than min coverage for overall project', function () {
      const comment = render.getPRComment(49.23, project, 30, 60, '', emoji)
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
|math|[Math.kt](https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/math/Math.kt)|70.37% (-0.3%)|:green_apple:|
|app|[MainViewModel.kt](https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/playground/MainViewModel.kt)|58.82% (-0.18%)|:x:|
||[StringOp.kt](https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/playground/StringOp.kt)|32.25% (-0.29%)|:x:|

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
|math|70.37%|:green_apple:|
|app|8.33%|:x:|

<details>
<summary>Files</summary>

|Module|File|Coverage [63.64%]||
|:-|:-|:-:|:-:|
|math|[Math.kt](https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/math/Math.kt)|70.37% (-0.3%)|:green_apple:|
|app|[MainViewModel.kt](https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/playground/MainViewModel.kt)|58.82% (-0.18%)|:x:|
||[StringOp.kt](https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/playground/StringOp.kt)|32.25% (-0.29%)|:x:|

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
|math|70.37%|:x:|
|app|8.33%|:x:|

<details>
<summary>Files</summary>

|Module|File|Coverage [63.64%]||
|:-|:-|:-:|:-:|
|math|[Math.kt](https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/math/Math.kt)|70.37% (-0.3%)|:x:|
|app|[MainViewModel.kt](https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/playground/MainViewModel.kt)|58.82% (-0.18%)|:x:|
||[StringOp.kt](https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/playground/StringOp.kt)|32.25% (-0.29%)|:x:|

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
|math|70.37%|:green_apple:|
|app|8.33%|:x:|

<details>
<summary>Files</summary>

|Module|File|Coverage [63.64%]||
|:-|:-|:-:|:-:|
|math|[Math.kt](https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/math/Math.kt)|70.37% (-0.3%)|:green_apple:|
|app|[MainViewModel.kt](https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/playground/MainViewModel.kt)|58.82% (-0.18%)|:green_apple:|
||[StringOp.kt](https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/playground/StringOp.kt)|32.25% (-0.29%)|:green_apple:|

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
|math|70.37%|:green_apple:|
|app|8.33%|:x:|

<details>
<summary>Files</summary>

|Module|File|Coverage [63.64%]||
|:-|:-|:-:|:-:|
|math|[Math.kt](https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/math/Math.kt)|70.37% (-0.3%)|:green_apple:|
|app|[MainViewModel.kt](https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/playground/MainViewModel.kt)|58.82% (-0.18%)|:green_apple:|
||[StringOp.kt](https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/playground/StringOp.kt)|32.25% (-0.29%)|:green_apple:|

</details>`
      )
    })
  })
})
