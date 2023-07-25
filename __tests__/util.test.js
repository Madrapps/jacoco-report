const util = require('../src/util')

jest.mock('@actions/core')
jest.mock('@actions/github')

describe('Util', function () {
  describe('getChangedLines', function () {
    it('Fail if paths is not present', async () => {
      const patch =
        '@@ -18,6 +18,10 @@ class Arithmetic : MathOperation {\n         return a / b\n     }\n \n+    override fun difference(a: Int, b: Int): Int {\n+        return subtract(a, b)\n+    }\n+\n     fun modulo(a: Int, b: Int): Int {\n         return a % b\n     }'
      const changedLines = util.getChangedLines(patch)
      expect(changedLines).toEqual([22, 23, 24, 25])
    })
  })
})
