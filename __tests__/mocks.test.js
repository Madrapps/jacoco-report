/* eslint-disable no-template-curly-in-string */
const PATCH = {
  MAIN_VIEW_MODEL:
    '@@ -17,7 +17,7 @@ class MainActivity : AppCompatActivity() {\n         val userId = \\"admin\\"\n         val model: MainViewModel by viewModels()\n         Log.d(\\"App\\", \\"Validate = ${model.validate(userId)}\\")\n-        Log.d(\\"App\\", \\"Verify Access = ${model.verifyAccess(userId)}\\")\n+        Log.d(\\"App\\", \\"Verify Access = ${model.verifyAccess1(userId)}\\")\n \n         // Math module\n         val arithmetic = Arithmetic()',
  STRING_OP:
    "'@@ -3,7 +3,7 @@\n /**\n  * String related operation\n  */\n-public class StringOp implements StringOperation {\n+public class StringOp implements IStringOperation {\n \n     @Override\n     public boolean endsWith(String source, String chars) {\n@@ -14,4 +14,9 @@ public boolean endsWith(String source, String chars) {\n     public boolean startsWith(String source, String chars) {\n         return source.startsWith(chars);\n     }\n+\n+    @Override\n+    public boolean replace(String from, String to) {\n+        return false;\n+    }\n }'",
  COVERAGE:
    "\"@@ -23,17 +23,19 @@ jobs:\n \n     - name: Jacoco Report to PR\n       id: jacoco\n-      uses: madrapps/jacoco-report@v1.2\n+      uses: madrapps/jacoco-report@coverage-diff\n       with:\n         paths: |\n-          ${{ github.workspace }}/app/build/reports/jacoco/prodNormalDebugCoverage/prodNormalDebugCoverage.xml,\n-          ${{ github.workspace }}/math/build/reports/jacoco/debugCoverage/mathCoverage.xml,\n-          ${{ github.workspace }}/text/build/reports/jacoco/debugCoverage/mathCoverage.xml\n+          ${{ github.workspace }}/**/build/reports/jacoco/**/prodNormalDebugCoverage.xml,\n+          ${{ github.workspace }}/**/build/reports/jacoco/**/mathCoverage.xml\n         token: ${{ secrets.GITHUB_TOKEN }}\n         min-coverage-overall: 40\n         min-coverage-changed-files: 60\n-        title: Code Coverage\n-        debug-mode: false\n+        title: ':lobster: Coverage Report'\n+        update-comment: true\n+        pass-emoji: ':green_circle:'\n+        fail-emoji: ':red_circle:'\n+        debug-mode: true\n \n     - name: Get the Coverage info\n       run: |\"",
  MATH: '@@ -18,6 +18,10 @@ class Arithmetic : MathOperation {\n         return a / b\n     }\n \n+    override fun difference(a: Int, b: Int): Int {\n+        return subtract(a, b)\n+    }\n+\n     fun modulo(a: Int, b: Int): Int {\n         return a % b\n     }',
}

const CHANGED_FILE = {
  STRING_OP: {
    filePath: 'src/main/java/com/madrapps/jacoco/operation/StringOp.java',
    url: 'https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/java/com/madrapps/jacoco/operation/StringOp.java',
    lines: [10],
  },
  STRING_OP_TEST: {
    filePath: 'src/test/java/com/madrapps/jacoco/operation/StringOpTest.java',
    url: 'https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/test/java/com/madrapps/jacoco/operation/StringOpTest.java',
    lines: [8, 9, 10],
  },
  MATH: {
    filePath: 'src/main/kotlin/com/madrapps/jacoco/Math.kt',
    url: 'https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/kotlin/com/madrapps/jacoco/Math.kt',
    lines: [17, 18, 19, 20, 21, 22, 23],
  },
  MATH_ANDROID: {
    filePath: 'src/main/java/com/madrapps/math/Math.kt',
    url: 'https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/math/Math.kt',
    lines: [17, 18, 19, 20, 21, 22, 23],
  },
  MATH_TEST: {
    filePath: 'src/test/java/com/madrapps/math/MathTest.kt',
    url: 'https://github.com/thsaravana/jacoco-android-playground/src/test/java/com/madrapps/math/MathTest.kt',
    lines: [8, 9, 10],
  },
  MAIN_VIEW_MODEL: {
    filePath: 'src/main/java/com/madrapps/playground/MainViewModel.kt',
    url: 'https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/playground/MainViewModel.kt',
    lines: [3, 4, 9, 15],
  },
  MULTI_MODULE: [
    {
      filePath: '.github/workflows/coverage.yml',
      url: 'https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/.github%2Fworkflows%2Fcoverage.yml',
      lines: [26, 29, 30, 34, 35, 36, 37, 38],
    },
    {
      filePath: 'app/src/main/java/com/madrapps/playground/MainActivity.kt',
      url: 'https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app%2Fsrc%2Fmain%2Fjava%2Fcom%2Fmadrapps%2Fplayground%2FMainActivity.kt',
      lines: [20],
    },
    {
      filePath: 'app/src/main/java/com/madrapps/playground/MainViewModel.kt',
      url: 'https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app%2Fsrc%2Fmain%2Fjava%2Fcom%2Fmadrapps%2Fplayground%2FMainViewModel.kt',
      lines: [11, 14, 15, 16, 17],
    },
    {
      filePath:
        'app/src/main/java/com/madrapps/playground/events/OnClickEvent.kt',
      url: 'https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app%2Fsrc%2Fmain%2Fjava%2Fcom%2Fmadrapps%2Fplayground%2Fevents%2FOnClickEvent.kt',
      lines: [1, 2, 3, 4, 5, 6, 7, 8],
    },
    {
      filePath: 'math/src/main/java/com/madrapps/math/Math.kt',
      url: 'https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/math%2Fsrc%2Fmain%2Fjava%2Fcom%2Fmadrapps%2Fmath%2FMath.kt',
      lines: [21, 22, 23, 24],
    },
    {
      filePath: 'math/src/main/java/com/madrapps/math/MathOperation.kt',
      url: 'https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/math%2Fsrc%2Fmain%2Fjava%2Fcom%2Fmadrapps%2Fmath%2FMathOperation.kt',
      lines: [8],
    },
    {
      filePath: 'math/src/main/java/com/madrapps/math/Statistics.kt',
      url: 'https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/math%2Fsrc%2Fmain%2Fjava%2Fcom%2Fmadrapps%2Fmath%2FStatistics.kt',
      lines: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    },
    {
      filePath: 'text/src/main/java/com/madrapps/text/IStringOperation.java',
      url: 'https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/text%2Fsrc%2Fmain%2Fjava%2Fcom%2Fmadrapps%2Ftext%2FIStringOperation.java',
      lines: [3, 7, 8],
    },
    {
      filePath: 'text/src/main/java/com/madrapps/text/StringOp.java',
      url: 'https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/text%2Fsrc%2Fmain%2Fjava%2Fcom%2Fmadrapps%2Ftext%2FStringOp.java',
      lines: [6, 17, 18, 19, 20, 21],
    },
  ],
  SINGLE_MODULE: [
    {
      filePath: '.github/workflows/coverage.yml',
      url: 'https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/.github%2Fworkflows%2Fcoverage.yml',
      lines: [13, 16, 32, 34, 38, 39, 40],
    },
    {
      filePath: 'src/main/java/com/madrapps/jacoco/Utility.java',
      url: 'https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src%2Fmain%2Fjava%2Fcom%2Fmadrapps%2Fjacoco%2FUtility.java',
      lines: [3],
    },
    {
      filePath: 'src/main/java/com/madrapps/jacoco/operation/StringOp.java',
      url: 'https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src%2Fmain%2Fjava%2Fcom%2Fmadrapps%2Fjacoco%2Foperation%2FStringOp.java',
      lines: [5, 6, 7, 8, 9, 10, 16],
    },
    {
      filePath: 'src/main/kotlin/com/madrapps/jacoco/Math.kt',
      url: 'https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src%2Fmain%2Fkotlin%2Fcom%2Fmadrapps%2Fjacoco%2FMath.kt',
      lines: [
        6, 7, 8, 13, 14, 15, 16, 17, 21, 26, 27, 28, 29, 30, 34, 42, 43, 44, 45,
        46,
      ],
    },
    {
      filePath: 'src/test/java/com/madrapps/jacoco/UtilityTest.java',
      url: 'https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src%2Ftest%2Fjava%2Fcom%2Fmadrapps%2Fjacoco%2FUtilityTest.java',
      lines: [6, 10, 17],
    },
    {
      filePath: 'src/test/kotlin/com/madrapps/jacoco/MathTest.kt',
      url: 'https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src%2Ftest%2Fkotlin%2Fcom%2Fmadrapps%2Fjacoco%2FMathTest.kt',
      lines: [],
    },
  ],
}

module.exports = {
  PATCH,
  CHANGED_FILE,
}

test.skip('Suppress - Your test suite must contain at least one test.', () => 1)
