"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const util = __importStar(require("../src/util"));
const fs = __importStar(require("fs"));
const util_1 = require("../src/util");
jest.mock('@actions/core');
jest.mock('@actions/github');
describe('Util', function () {
    describe('getChangedLines', function () {
        it('when patch is null', async () => {
            const changedLines = util.getChangedLines(undefined);
            expect(changedLines).toEqual([]);
        });
        it('when patch is invalid', async () => {
            const changedLines = util.getChangedLines('invalid-patch');
            expect(changedLines).toEqual([]);
        });
        it('multiple consecutive lines', async () => {
            const patch = '@@ -18,6 +18,10 @@ class Arithmetic : MathOperation {\n         return a / b\n     }\n \n+    override fun difference(a: Int, b: Int): Int {\n+        return subtract(a, b)\n+    }\n+\n     fun modulo(a: Int, b: Int): Int {\n         return a % b\n     }';
            const changedLines = util.getChangedLines(patch);
            expect(changedLines).toEqual([21, 22, 23, 24]);
        });
        it('multiple patch of lines within same group', async () => {
            const patch = "@@ -23,17 +23,19 @@ jobs:\n \n     - name: Jacoco Report to PR\n       id: jacoco\n-      uses: madrapps/jacoco-report@v1.2\n+      uses: madrapps/jacoco-report@coverage-diff\n       with:\n         paths: |\n-          ${{ github.workspace }}/app/build/reports/jacoco/prodNormalDebugCoverage/prodNormalDebugCoverage.xml,\n-          ${{ github.workspace }}/math/build/reports/jacoco/debugCoverage/mathCoverage.xml,\n-          ${{ github.workspace }}/text/build/reports/jacoco/debugCoverage/mathCoverage.xml\n+          ${{ github.workspace }}/**/build/reports/jacoco/**/prodNormalDebugCoverage.xml,\n+          ${{ github.workspace }}/**/build/reports/jacoco/**/mathCoverage.xml\n         token: ${{ secrets.GITHUB_TOKEN }}\n         min-coverage-overall: 40\n         min-coverage-changed-files: 60\n-        title: Code Coverage\n-        debug-mode: false\n+        title: ':lobster: Coverage Report'\n+        update-comment: true\n+        pass-emoji: ':green_circle:'\n+        fail-emoji: ':red_circle:'\n+        debug-mode: true\n \n     - name: Get the Coverage info\n       run: |";
            const changedLines = util.getChangedLines(patch);
            expect(changedLines).toEqual([26, 29, 30, 34, 35, 36, 37, 38]);
        });
        it('single line', async () => {
            const patch = '@@ -17,7 +17,7 @@ class MainActivity : AppCompatActivity() {\n         val userId = \\"admin\\"\n         val model: MainViewModel by viewModels()\n         Log.d(\\"App\\", \\"Validate = ${model.validate(userId)}\\")\n-        Log.d(\\"App\\", \\"Verify Access = ${model.verifyAccess(userId)}\\")\n+        Log.d(\\"App\\", \\"Verify Access = ${model.verifyAccess1(userId)}\\")\n \n         // Math module\n         val arithmetic = Arithmetic()';
            const changedLines = util.getChangedLines(patch);
            expect(changedLines).toEqual([20]);
        });
        it('full new file', async () => {
            const patch = '@@ -0,0 +1,8 @@\n+package com.madrapps.playground.events\n+\n+class OnClickEvent {\n+\n+    fun onClick() {\n+        // do nothing\n+    }\n+}\n\\\\ No newline at end of file';
            const changedLines = util.getChangedLines(patch);
            expect(changedLines).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
        });
        it('different groups', async () => {
            const patch = '@@ -3,7 +3,7 @@\n /**\n  * String related operation\n  */\n-public class StringOp implements StringOperation {\n+public class StringOp implements IStringOperation {\n \n     @Override\n     public boolean endsWith(String source, String chars) {\n@@ -14,4 +14,9 @@ public boolean endsWith(String source, String chars) {\n     public boolean startsWith(String source, String chars) {\n         return source.startsWith(chars);\n     }\n+\n+    @Override\n+    public boolean replace(String from, String to) {\n+        return false;\n+    }\n }';
            const changedLines = util.getChangedLines(patch);
            expect(changedLines).toEqual([6, 17, 18, 19, 20, 21]);
        });
    });
    describe('getFilesWithCoverage', function () {
        it('should return valid output', async function () {
            const reports = await getSingleReport();
            const packages = reports[0]['package'] ?? [];
            const files = util.getFilesWithCoverage(packages);
            expect(files).toEqual([
                {
                    counters: [
                        { covered: 11, missed: 50, name: 'instruction' },
                        { covered: 3, missed: 8, name: 'line' },
                        { covered: 3, missed: 8, name: 'complexity' },
                        { covered: 3, missed: 8, name: 'method' },
                        { covered: 1, missed: 0, name: 'class' },
                    ],
                    lines: [
                        {
                            branch: { covered: 0, missed: 0 },
                            instruction: { covered: 3, missed: 0 },
                            number: 3,
                        },
                        {
                            branch: { covered: 0, missed: 0 },
                            instruction: { covered: 0, missed: 4 },
                            number: 6,
                        },
                        {
                            branch: { covered: 0, missed: 0 },
                            instruction: { covered: 4, missed: 0 },
                            number: 10,
                        },
                        {
                            branch: { covered: 0, missed: 0 },
                            instruction: { covered: 4, missed: 0 },
                            number: 14,
                        },
                        {
                            branch: { covered: 0, missed: 0 },
                            instruction: { covered: 0, missed: 4 },
                            number: 18,
                        },
                        {
                            branch: { covered: 0, missed: 0 },
                            instruction: { covered: 0, missed: 4 },
                            number: 22,
                        },
                        {
                            branch: { covered: 0, missed: 0 },
                            instruction: { covered: 0, missed: 4 },
                            number: 26,
                        },
                        {
                            branch: { covered: 0, missed: 0 },
                            instruction: { covered: 0, missed: 6 },
                            number: 30,
                        },
                        {
                            branch: { covered: 0, missed: 0 },
                            instruction: { covered: 0, missed: 8 },
                            number: 34,
                        },
                        {
                            branch: { covered: 0, missed: 0 },
                            instruction: { covered: 0, missed: 10 },
                            number: 38,
                        },
                        {
                            branch: { covered: 0, missed: 0 },
                            instruction: { covered: 0, missed: 10 },
                            number: 42,
                        },
                    ],
                    name: 'Utility.java',
                    packageName: 'com/madrapps/jacoco',
                },
                {
                    counters: [
                        { covered: 21, missed: 29, name: 'instruction' },
                        { covered: 2, missed: 4, name: 'branch' },
                        { covered: 6, missed: 7, name: 'line' },
                        { covered: 4, missed: 7, name: 'complexity' },
                        { covered: 4, missed: 4, name: 'method' },
                        { covered: 1, missed: 0, name: 'class' },
                    ],
                    lines: [
                        {
                            branch: { covered: 0, missed: 0 },
                            instruction: { covered: 3, missed: 0 },
                            number: 3,
                        },
                        {
                            branch: { covered: 1, missed: 1 },
                            instruction: { covered: 3, missed: 0 },
                            number: 6,
                        },
                        {
                            branch: { covered: 0, missed: 0 },
                            instruction: { covered: 4, missed: 0 },
                            number: 9,
                        },
                        {
                            branch: { covered: 0, missed: 2 },
                            instruction: { covered: 0, missed: 3 },
                            number: 13,
                        },
                        {
                            branch: { covered: 0, missed: 0 },
                            instruction: { covered: 0, missed: 4 },
                            number: 14,
                        },
                        {
                            branch: { covered: 0, missed: 0 },
                            instruction: { covered: 0, missed: 4 },
                            number: 16,
                        },
                        {
                            branch: { covered: 0, missed: 0 },
                            instruction: { covered: 4, missed: 0 },
                            number: 22,
                        },
                        {
                            branch: { covered: 1, missed: 1 },
                            instruction: { covered: 3, missed: 0 },
                            number: 26,
                        },
                        {
                            branch: { covered: 0, missed: 0 },
                            instruction: { covered: 4, missed: 0 },
                            number: 27,
                        },
                        {
                            branch: { covered: 0, missed: 0 },
                            instruction: { covered: 0, missed: 4 },
                            number: 29,
                        },
                        {
                            branch: { covered: 0, missed: 0 },
                            instruction: { covered: 0, missed: 4 },
                            number: 35,
                        },
                        {
                            branch: { covered: 0, missed: 0 },
                            instruction: { covered: 0, missed: 4 },
                            number: 39,
                        },
                        {
                            branch: { covered: 0, missed: 0 },
                            instruction: { covered: 0, missed: 6 },
                            number: 43,
                        },
                    ],
                    name: 'Math.kt',
                    packageName: 'com/madrapps/jacoco',
                },
                {
                    counters: [
                        { covered: 11, missed: 0, name: 'instruction' },
                        { covered: 3, missed: 0, name: 'line' },
                        { covered: 3, missed: 0, name: 'complexity' },
                        { covered: 3, missed: 0, name: 'method' },
                        { covered: 1, missed: 0, name: 'class' },
                    ],
                    lines: [
                        {
                            branch: { covered: 0, missed: 0 },
                            instruction: { covered: 3, missed: 0 },
                            number: 3,
                        },
                        {
                            branch: { covered: 0, missed: 0 },
                            instruction: { covered: 4, missed: 0 },
                            number: 12,
                        },
                        {
                            branch: { covered: 0, missed: 0 },
                            instruction: { covered: 4, missed: 0 },
                            number: 17,
                        },
                    ],
                    name: 'StringOp.java',
                    packageName: 'com/madrapps/jacoco/operation',
                },
            ]);
        });
    });
});
async function getSingleReport() {
    const reportPath = './__tests__/__fixtures__/report.xml';
    const report = await getReport(reportPath);
    return [report];
}
async function getReport(path) {
    const reportXml = await fs.promises.readFile(path, 'utf-8');
    return (0, util_1.parseToReport)(reportXml);
}
