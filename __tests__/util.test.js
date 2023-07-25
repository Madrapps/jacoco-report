const util = require('../src/util')

jest.mock('@actions/core')
jest.mock('@actions/github')

describe('Util', function () {
  describe('getChangedLines', function () {
    it('multiple consecutive lines', async () => {
      const patch =
        '@@ -18,6 +18,10 @@ class Arithmetic : MathOperation {\n         return a / b\n     }\n \n+    override fun difference(a: Int, b: Int): Int {\n+        return subtract(a, b)\n+    }\n+\n     fun modulo(a: Int, b: Int): Int {\n         return a % b\n     }'
      const changedLines = util.getChangedLines(patch)
      expect(changedLines).toEqual([21, 22, 23, 24])
    })

    it('multiple patch of lines within same group', async () => {
      const patch =
        // eslint-disable-next-line no-template-curly-in-string
        "@@ -23,17 +23,19 @@ jobs:\n \n     - name: Jacoco Report to PR\n       id: jacoco\n-      uses: madrapps/jacoco-report@v1.2\n+      uses: madrapps/jacoco-report@coverage-diff\n       with:\n         paths: |\n-          ${{ github.workspace }}/app/build/reports/jacoco/prodNormalDebugCoverage/prodNormalDebugCoverage.xml,\n-          ${{ github.workspace }}/math/build/reports/jacoco/debugCoverage/debugCoverage.xml,\n-          ${{ github.workspace }}/text/build/reports/jacoco/debugCoverage/debugCoverage.xml\n+          ${{ github.workspace }}/**/build/reports/jacoco/**/prodNormalDebugCoverage.xml,\n+          ${{ github.workspace }}/**/build/reports/jacoco/**/debugCoverage.xml\n         token: ${{ secrets.GITHUB_TOKEN }}\n         min-coverage-overall: 40\n         min-coverage-changed-files: 60\n-        title: Code Coverage\n-        debug-mode: false\n+        title: ':lobster: Coverage Report'\n+        update-comment: true\n+        pass-emoji: ':green_circle:'\n+        fail-emoji: ':red_circle:'\n+        debug-mode: true\n \n     - name: Get the Coverage info\n       run: |"
      const changedLines = util.getChangedLines(patch)
      expect(changedLines).toEqual([26, 29, 30, 34, 35, 36, 37, 38])
    })

    it('single line', async () => {
      const patch =
        // eslint-disable-next-line no-template-curly-in-string
        '@@ -17,7 +17,7 @@ class MainActivity : AppCompatActivity() {\n         val userId = \\"admin\\"\n         val model: MainViewModel by viewModels()\n         Log.d(\\"App\\", \\"Validate = ${model.validate(userId)}\\")\n-        Log.d(\\"App\\", \\"Verify Access = ${model.verifyAccess(userId)}\\")\n+        Log.d(\\"App\\", \\"Verify Access = ${model.verifyAccess1(userId)}\\")\n \n         // Math module\n         val arithmetic = Arithmetic()'
      const changedLines = util.getChangedLines(patch)
      expect(changedLines).toEqual([20])
    })

    it('full new file', async () => {
      const patch =
        // eslint-disable-next-line no-template-curly-in-string
        '@@ -0,0 +1,8 @@\n+package com.madrapps.playground.events\n+\n+class OnClickEvent {\n+\n+    fun onClick() {\n+        // do nothing\n+    }\n+}\n\\\\ No newline at end of file'
      const changedLines = util.getChangedLines(patch)
      expect(changedLines).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    })

    it('different groups', async () => {
      const patch =
        // eslint-disable-next-line no-template-curly-in-string
        '@@ -3,7 +3,7 @@\n /**\n  * String related operation\n  */\n-public class StringOp implements StringOperation {\n+public class StringOp implements IStringOperation {\n \n     @Override\n     public boolean endsWith(String source, String chars) {\n@@ -14,4 +14,9 @@ public boolean endsWith(String source, String chars) {\n     public boolean startsWith(String source, String chars) {\n         return source.startsWith(chars);\n     }\n+\n+    @Override\n+    public boolean replace(String from, String to) {\n+        return false;\n+    }\n }'
      const changedLines = util.getChangedLines(patch)
      expect(changedLines).toEqual([6, 17, 18, 19, 20, 21])
    })
  })
})
