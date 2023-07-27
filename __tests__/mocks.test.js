/* eslint-disable no-template-curly-in-string */
const PATCH = {
  MAIN_VIEW_MODEL:
    '@@ -17,7 +17,7 @@ class MainActivity : AppCompatActivity() {\n         val userId = \\"admin\\"\n         val model: MainViewModel by viewModels()\n         Log.d(\\"App\\", \\"Validate = ${model.validate(userId)}\\")\n-        Log.d(\\"App\\", \\"Verify Access = ${model.verifyAccess(userId)}\\")\n+        Log.d(\\"App\\", \\"Verify Access = ${model.verifyAccess1(userId)}\\")\n \n         // Math module\n         val arithmetic = Arithmetic()',
  STRING_OP:
    "'@@ -3,7 +3,7 @@\n /**\n  * String related operation\n  */\n-public class StringOp implements StringOperation {\n+public class StringOp implements IStringOperation {\n \n     @Override\n     public boolean endsWith(String source, String chars) {\n@@ -14,4 +14,9 @@ public boolean endsWith(String source, String chars) {\n     public boolean startsWith(String source, String chars) {\n         return source.startsWith(chars);\n     }\n+\n+    @Override\n+    public boolean replace(String from, String to) {\n+        return false;\n+    }\n }'",
  COVERAGE:
    "\"@@ -23,17 +23,19 @@ jobs:\n \n     - name: Jacoco Report to PR\n       id: jacoco\n-      uses: madrapps/jacoco-report@v1.2\n+      uses: madrapps/jacoco-report@coverage-diff\n       with:\n         paths: |\n-          ${{ github.workspace }}/app/build/reports/jacoco/prodNormalDebugCoverage/prodNormalDebugCoverage.xml,\n-          ${{ github.workspace }}/math/build/reports/jacoco/debugCoverage/debugCoverage.xml,\n-          ${{ github.workspace }}/text/build/reports/jacoco/debugCoverage/debugCoverage.xml\n+          ${{ github.workspace }}/**/build/reports/jacoco/**/prodNormalDebugCoverage.xml,\n+          ${{ github.workspace }}/**/build/reports/jacoco/**/debugCoverage.xml\n         token: ${{ secrets.GITHUB_TOKEN }}\n         min-coverage-overall: 40\n         min-coverage-changed-files: 60\n-        title: Code Coverage\n-        debug-mode: false\n+        title: ':lobster: Coverage Report'\n+        update-comment: true\n+        pass-emoji: ':green_circle:'\n+        fail-emoji: ':red_circle:'\n+        debug-mode: true\n \n     - name: Get the Coverage info\n       run: |\"",
  MATH: '@@ -18,6 +18,10 @@ class Arithmetic : MathOperation {\n         return a / b\n     }\n \n+    override fun difference(a: Int, b: Int): Int {\n+        return subtract(a, b)\n+    }\n+\n     fun modulo(a: Int, b: Int): Int {\n         return a % b\n     }',
}

module.exports = {
  PATCH,
}

test.skip('Suppress - Your test suite must contain at least one test.', () => 1)
