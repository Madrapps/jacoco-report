/* eslint-disable no-template-curly-in-string */
const PATCH = {
  SINGLE_MODULE: {
    COVERAGE:
      "@@ -10,10 +10,10 @@ jobs:\n     runs-on: ubuntu-latest\n     steps:\n     - uses: actions/checkout@v2\n-    - name: Set up JDK 1.8\n+    - name: Set up JDK 17\n       uses: actions/setup-java@v1\n       with:\n-        java-version: 1.8\n+        java-version: 17\n \n     - name: Grant execute permission for gradlew\n       run: chmod +x gradlew\n@@ -29,13 +29,15 @@ jobs:\n \n     - name: Jacoco Report to PR\n       id: jacoco\n-      uses: madrapps/jacoco-report@v1.1\n+      uses: madrapps/jacoco-report@coverage-diff\n       with:\n-        path: ${{ github.workspace }}/build/reports/jacoco/testCoverage/testCoverage.xml\n+        paths: ${{ github.workspace }}/build/reports/jacoco/**/testCoverage.xml\n         token: ${{ secrets.GITHUB_TOKEN }}\n         min-coverage-overall: 40\n         min-coverage-changed-files: 60\n-        debug-mode: false\n+        update-comment: true\n+        title: '`Coverage Report`'\n+        debug-mode: true\n \n     - name: Get the Coverage info\n       run: | ",
    UTILITY:
      '@@ -1,6 +1,6 @@\n package com.madrapps.jacoco;\n \n-public class Utils {\n+public class Utility {\n \n     public int multiply(int a, int b) {\n         return a * b; ',
    STRING_OP:
      '@@ -2,11 +2,18 @@\n \n public class StringOp {\n \n+    /**\n+     * Adding some java doc\n+     * @param source\n+     * @param chars\n+     * @return\n+     */\n     public boolean endsWith(String source, String chars) {\n         return source.endsWith(chars);\n     }\n \n     public boolean startsWith(String source, String chars) {\n+        // Just adding some sample comment\n         return source.startsWith(chars);\n     }\n } ',
    MATH: '@@ -3,26 +3,43 @@ package com.madrapps.jacoco\n class Arithmetic {\n \n     fun add(a: Int, b: Int): Int {\n+        if (a < b) {\n+            // Do nothing\n+        }\n         return a + b\n     }\n \n     fun subtract(a: Int, b: Int): Int {\n-        return a - b\n+        if (a > b) {\n+            return a - b\n+        } else {\n+            return a - b\n+        }\n     }\n \n     fun multiply(a: Int, b: Int): Int {\n+        // Some comment here\n         return a * b\n     }\n \n     fun divide(a: Int, b: Int): Int {\n-        return a / b\n+        if (a > b) {\n+            return a / b\n+        } else {\n+            return a / b\n+        }\n     }\n \n     fun modulo(a: Int, b: Int): Int {\n+        // Some comment for non-covered method\n         return a % b\n     }\n \n     fun area(a: Int, b: Int): Int {\n         return a * b\n     }\n-}\n\\ No newline at end of file\n+\n+    fun volume(a: Int, b: Int, c: Int): Int {\n+        return a * b * c\n+    }\n+}',
    UTILITY_TEST:
      '@@ -3,25 +3,18 @@\n import org.junit.jupiter.api.Assertions;\n import org.junit.jupiter.api.Test;\n \n-public class UtilsTest {\n+public class UtilityTest {\n \n     @Test\n     public void testAdd() {\n-        final Utils utils = new Utils();\n+        final Utility utils = new Utility();\n         int actual = utils.add(2, 3);\n         Assertions.assertEquals(5, actual);\n     }\n \n-    @Test\n-    public void testSubtract() {\n-        final Utils utils = new Utils();\n-        int actual = utils.subtract(8, 3);\n-        Assertions.assertEquals(5, actual);\n-    }\n-\n     @Test\n     public void testSquare() {\n-        final Utils utils = new Utils();\n+        final Utility utils = new Utility();\n         int actual = utils.square(3);\n         Assertions.assertEquals(9, actual);\n     } ',
    MATH_TEST:
      '@@ -12,13 +12,6 @@ class MathTest {\n         Assertions.assertEquals(7, actual)\n     }\n \n-    @Test\n-    fun testSubtract() {\n-        val math = Arithmetic()\n-        val actual = math.subtract(8, 4)\n-        Assertions.assertEquals(4, actual)\n-    }\n-\n     @Test\n     fun testMultiply() {\n         val math = Arithmetic() ',
  },
  MULTI_MODULE: {
    COVERAGE:
      "@@ -23,17 +23,19 @@ jobs:\n \n     - name: Jacoco Report to PR\n       id: jacoco\n-      uses: madrapps/jacoco-report@v1.2\n+      uses: madrapps/jacoco-report@coverage-diff\n       with:\n         paths: |\n-          ${{ github.workspace }}/app/build/reports/jacoco/prodNormalDebugCoverage/prodNormalDebugCoverage.xml,\n-          ${{ github.workspace }}/math/build/reports/jacoco/debugCoverage/debugCoverage.xml,\n-          ${{ github.workspace }}/text/build/reports/jacoco/debugCoverage/debugCoverage.xml\n+          ${{ github.workspace }}/**/build/reports/jacoco/**/prodNormalDebugCoverage.xml,\n+          ${{ github.workspace }}/**/build/reports/jacoco/**/debugCoverage.xml\n         token: ${{ secrets.GITHUB_TOKEN }}\n         min-coverage-overall: 40\n         min-coverage-changed-files: 60\n-        title: Code Coverage\n-        debug-mode: false\n+        title: ':lobster: Coverage Report'\n+        update-comment: true\n+        pass-emoji: ':green_circle:'\n+        fail-emoji: ':red_circle:'\n+        debug-mode: true\n \n     - name: Get the Coverage info\n       run: | ",
    MAIN_ACTIVITY:
      '@@ -17,7 +17,7 @@ class MainActivity : AppCompatActivity() {\n         val userId = "admin"\n         val model: MainViewModel by viewModels()\n         Log.d("App", "Validate = ${model.validate(userId)}")\n-        Log.d("App", "Verify Access = ${model.verifyAccess(userId)}")\n+        Log.d("App", "Verify Access = ${model.verifyAccess1(userId)}")\n \n         // Math module\n         val arithmetic = Arithmetic() ',
    MAIN_VIEW_MODEL:
      '@@ -8,7 +8,11 @@ class MainViewModel : ViewModel() {\n         return userId == "admin"\n     }\n \n-    fun verifyAccess(userId: String): Boolean {\n+    fun verifyAccess1(userId: String): Boolean {\n         return userId == "super-admin"\n     }\n+\n+    fun verifyPassword(password: String): Boolean {\n+        return password.isNotBlank()\n+    }\n } ',
    ON_CLICK_EVENT:
      '@@ -0,0 +1,8 @@\n+package com.madrapps.playground.events\n+\n+class OnClickEvent {\n+\n+    fun onClick() {\n+        // do nothing\n+    }\n+}\n\\ No newline at end of file ',
    MATH: '@@ -18,6 +18,10 @@ class Arithmetic : MathOperation {\n         return a / b\n     }\n \n+    override fun difference(a: Int, b: Int): Int {\n+        return subtract(a, b)\n+    }\n+\n     fun modulo(a: Int, b: Int): Int {\n         return a % b\n     } ',
    MATH_OPERATION:
      '@@ -5,6 +5,7 @@ interface MathOperation {\n     fun subtract(a: Int, b: Int): Int\n     fun multiply(a: Int, b: Int): Int\n     fun divide(a: Int, b: Int): Int\n+    fun difference(a: Int, b: Int): Int\n \n     interface MathOp {\n  ',
    STATISTICS:
      '@@ -0,0 +1,10 @@\n+@file:Suppress("unused")\n+\n+package com.madrapps.math\n+\n+class Statistics {\n+\n+    fun rateOfFlow(): Double {\n+        return 0.1\n+    }\n+} ',
    ISTRING_OPERATION:
      '@@ -1,7 +1,9 @@\n package com.madrapps.text;\n \n-public interface StringOperation {\n+public interface IStringOperation {\n     boolean endsWith(String source, String chars);\n \n     boolean startsWith(String source, String chars);\n+\n+    boolean replace(String from, String to);\n } \n',
    STRING_OP:
      '@@ -3,7 +3,7 @@\n /**\n  * String related operation\n  */\n-public class StringOp implements StringOperation {\n+public class StringOp implements IStringOperation {\n \n     @Override\n     public boolean endsWith(String source, String chars) {\n@@ -14,4 +14,9 @@ public boolean endsWith(String source, String chars) {\n     public boolean startsWith(String source, String chars) {\n         return source.startsWith(chars);\n     }\n+\n+    @Override\n+    public boolean replace(String from, String to) {\n+        return false;\n+    }\n } \n',
  },
}

const CHANGED_FILE = {
  MULTI_MODULE: [
    {
      filePath: '.github/workflows/coverage.yml',
      url: 'https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/.github/workflows/coverage.yml',
      lines: [26, 29, 30, 34, 35, 36, 37, 38],
    },
    {
      filePath: 'app/src/main/java/com/madrapps/playground/MainActivity.kt',
      url: 'https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app/src/main/java/com/madrapps/playground/MainActivity.kt',
      lines: [20],
    },
    {
      filePath: 'app/src/main/java/com/madrapps/playground/MainViewModel.kt',
      url: 'https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app/src/main/java/com/madrapps/playground/MainViewModel.kt',
      lines: [11, 14, 15, 16, 17],
    },
    {
      filePath:
        'app/src/main/java/com/madrapps/playground/events/OnClickEvent.kt',
      url: 'https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app/src/main/java/com/madrapps/playground/events/OnClickEvent.kt',
      lines: [1, 2, 3, 4, 5, 6, 7, 8],
    },
    {
      filePath: 'math/src/main/java/com/madrapps/math/Math.kt',
      url: 'https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/math/src/main/java/com/madrapps/math/Math.kt',
      lines: [21, 22, 23, 24],
    },
    {
      filePath: 'math/src/main/java/com/madrapps/math/MathOperation.kt',
      url: 'https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/math/src/main/java/com/madrapps/math/MathOperation.kt',
      lines: [8],
    },
    {
      filePath: 'math/src/main/java/com/madrapps/math/Statistics.kt',
      url: 'https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/math/src/main/java/com/madrapps/math/Statistics.kt',
      lines: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    },
    {
      filePath: 'text/src/main/java/com/madrapps/text/IStringOperation.java',
      url: 'https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/text/src/main/java/com/madrapps/text/IStringOperation.java',
      lines: [3, 7, 8],
    },
    {
      filePath: 'text/src/main/java/com/madrapps/text/StringOp.java',
      url: 'https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/text/src/main/java/com/madrapps/text/StringOp.java',
      lines: [6, 17, 18, 19, 20, 21],
    },
  ],
  SINGLE_MODULE: [
    {
      filePath: '.github/workflows/coverage.yml',
      url: 'https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/.github/workflows/coverage.yml',
      lines: [13, 16, 32, 34, 38, 39, 40],
    },
    {
      filePath: 'src/main/java/com/madrapps/jacoco/Utility.java',
      url: 'https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/main/java/com/madrapps/jacoco/Utility.java',
      lines: [3],
    },
    {
      filePath: 'src/main/java/com/madrapps/jacoco/operation/StringOp.java',
      url: 'https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/main/java/com/madrapps/jacoco/operation/StringOp.java',
      lines: [5, 6, 7, 8, 9, 10, 16],
    },
    {
      filePath: 'src/main/kotlin/com/madrapps/jacoco/Math.kt',
      url: 'https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/main/kotlin/com/madrapps/jacoco/Math.kt',
      lines: [
        6, 7, 8, 13, 14, 15, 16, 17, 21, 26, 27, 28, 29, 30, 34, 42, 43, 44, 45,
        46,
      ],
    },
    {
      filePath: 'src/test/java/com/madrapps/jacoco/UtilityTest.java',
      url: 'https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/test/java/com/madrapps/jacoco/UtilityTest.java',
      lines: [6, 10, 17],
    },
    {
      filePath: 'src/test/kotlin/com/madrapps/jacoco/MathTest.kt',
      url: 'https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/test/kotlin/com/madrapps/jacoco/MathTest.kt',
      lines: [],
    },
  ],
}

const PROJECT = {
  SINGLE_MODULE: {
    modules: [
      {
        name: 'jacoco-playground',
        percentage: 35.25,
        files: [
          {
            name: 'StringOp.java',
            url: 'https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/main/java/com/madrapps/jacoco/operation/StringOp.java',
            missed: 0,
            covered: 11,
            percentage: 100,
            lines: [],
          },
          {
            name: 'Math.kt',
            url: 'https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/main/kotlin/com/madrapps/jacoco/Math.kt',
            missed: 29,
            covered: 21,
            percentage: 42,
            lines: [
              {
                number: 6,
                instruction: { missed: 0, covered: 3 },
                branch: { missed: 1, covered: 1 },
              },
              {
                number: 13,
                instruction: { missed: 3, covered: 0 },
                branch: { missed: 2, covered: 0 },
              },
              {
                number: 14,
                instruction: { missed: 4, covered: 0 },
                branch: { missed: 0, covered: 0 },
              },
              {
                number: 16,
                instruction: { missed: 4, covered: 0 },
                branch: { missed: 0, covered: 0 },
              },
              {
                number: 26,
                instruction: { missed: 0, covered: 3 },
                branch: { missed: 1, covered: 1 },
              },
              {
                number: 27,
                instruction: { missed: 0, covered: 4 },
                branch: { missed: 0, covered: 0 },
              },
              {
                number: 29,
                instruction: { missed: 4, covered: 0 },
                branch: { missed: 0, covered: 0 },
              },
              {
                number: 43,
                instruction: { missed: 6, covered: 0 },
                branch: { missed: 0, covered: 0 },
              },
            ],
          },
          {
            name: 'Utility.java',
            url: 'https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/main/java/com/madrapps/jacoco/Utility.java',
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
        covered: 43,
        missed: 79,
      },
    ],
    isMultiModule: false,
    'coverage-changed-files': 35.25,
    overall: {
      covered: 43,
      missed: 79,
      percentage: 35.25,
    },
  },
  MULTI_MODULE: {
    modules: [
      {
        name: 'text',
        percentage: 84.62,
        covered: 11,
        missed: 2,
        files: [
          {
            name: 'StringOp.java',
            url: 'https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/text/src/main/java/com/madrapps/text/StringOp.java',
            missed: 2,
            covered: 11,
            percentage: 84.62,
            lines: [
              {
                number: 6,
                instruction: { missed: 0, covered: 3 },
                branch: { missed: 0, covered: 0 },
              },
              {
                number: 20,
                instruction: { missed: 2, covered: 0 },
                branch: { missed: 0, covered: 0 },
              },
            ],
          },
        ],
      },
      {
        name: 'math',
        percentage: 51.35,
        covered: 19,
        missed: 18,
        files: [
          {
            name: 'Math.kt',
            url: 'https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/math/src/main/java/com/madrapps/math/Math.kt',
            missed: 13,
            covered: 19,
            percentage: 59.38,
            lines: [
              {
                number: 22,
                instruction: { missed: 5, covered: 0 },
                branch: { missed: 0, covered: 0 },
              },
            ],
          },
          {
            name: 'Statistics.kt',
            url: 'https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/math/src/main/java/com/madrapps/math/Statistics.kt',
            missed: 5,
            covered: 0,
            percentage: 0,
            lines: [
              {
                number: 5,
                instruction: { missed: 3, covered: 0 },
                branch: { missed: 0, covered: 0 },
              },
              {
                number: 8,
                instruction: { missed: 2, covered: 0 },
                branch: { missed: 0, covered: 0 },
              },
            ],
          },
        ],
      },
      {
        name: 'app',
        percentage: 6.85,
        covered: 10,
        missed: 136,
        files: [
          {
            name: 'MainViewModel.kt',
            url: 'https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app/src/main/java/com/madrapps/playground/MainViewModel.kt',
            missed: 18,
            covered: 10,
            percentage: 35.71,
            lines: [
              {
                number: 16,
                instruction: { missed: 8, covered: 0 },
                branch: { missed: 2, covered: 0 },
              },
            ],
          },
          {
            name: 'MainActivity.kt',
            url: 'https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app/src/main/java/com/madrapps/playground/MainActivity.kt',
            missed: 100,
            covered: 0,
            percentage: 0,
            lines: [
              {
                number: 20,
                instruction: { missed: 14, covered: 0 },
                branch: { missed: 0, covered: 0 },
              },
            ],
          },
          {
            name: 'OnClickEvent.kt',
            url: 'https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app/src/main/java/com/madrapps/playground/events/OnClickEvent.kt',
            missed: 4,
            covered: 0,
            percentage: 0,
            lines: [
              {
                number: 3,
                instruction: { missed: 3, covered: 0 },
                branch: { missed: 0, covered: 0 },
              },
              {
                number: 7,
                instruction: { missed: 1, covered: 0 },
                branch: { missed: 0, covered: 0 },
              },
            ],
          },
        ],
      },
    ],
    isMultiModule: true,
    'coverage-changed-files': 21.98,
    overall: {
      covered: 40,
      missed: 156,
      percentage: 20.41,
    },
  },
}

module.exports = {
  PATCH,
  CHANGED_FILE,
  PROJECT,
}

it('Empty test', function () {
  // To Suppress - Your test suite must contain at least one test.
})
