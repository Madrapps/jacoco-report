const fs = require('fs')
const parser = require('xml2js')
const process = require('../src/process')
const { CHANGED_FILE } = require('./mocks.test')

describe('process', function () {
  describe('get overall coverage', function () {
    describe('single report', function () {
      test('get project coverage', async () => {
        const reports = await getSingleReport()
        const coverage = process.getOverallCoverage(reports)
        expect(coverage.project).toBeCloseTo(49.01, 1)
      })
    })

    describe('multiple reports', function () {
      test('get project coverage', async () => {
        const reports = await getMultipleReports()
        const coverage = process.getOverallCoverage(reports)
        expect(coverage.project).toBeCloseTo(25.32, 1)
      })
    })
  })

  describe('get file coverage', function () {
    describe('single report', function () {
      it('no files changed', async () => {
        const v = getSingleReport()
        const reports = await v
        const changedFiles = []
        const actual = process.getProjectCoverage(reports, changedFiles)
        expect(actual).toEqual({
          modules: [],
          isMultiModule: false,
          'coverage-changed-files': 100,
        })
      })

      it('one file changed', async () => {
        const reports = await getSingleReport()
        const changedFiles = [CHANGED_FILE.STRING_OP]
        const actual = process.getProjectCoverage(reports, changedFiles)
        expect(actual).toEqual({
          modules: [
            {
              name: 'jacoco-playground',
              files: [
                {
                  url: 'https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/java/com/madrapps/jacoco/operation/StringOp.java',
                  name: 'StringOp.java',
                  covered: 7,
                  missed: 0,
                  percentage: 100,
                  lines: [
                    {
                      number: 10,
                      branch: { covered: 0, missed: 0 },
                      instruction: { covered: 4, missed: 0 },
                    },
                  ],
                },
              ],
              percentage: 49.02,
            },
          ],
          isMultiModule: false,
          'coverage-changed-files': 100,
        })
      })

      it('multiple files changed', async () => {
        const reports = await getSingleReport()
        const changedFiles = [
          CHANGED_FILE.STRING_OP,
          CHANGED_FILE.MATH,
          CHANGED_FILE.STRING_OP_TEST,
        ]
        const actual = process.getProjectCoverage(reports, changedFiles)
        expect(actual).toEqual({
          modules: [
            {
              name: 'jacoco-playground',
              files: [
                {
                  url: 'https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/java/com/madrapps/jacoco/operation/StringOp.java',
                  name: 'StringOp.java',
                  covered: 7,
                  missed: 0,
                  percentage: 100,
                  lines: [
                    {
                      number: 10,
                      branch: { covered: 0, missed: 0 },
                      instruction: { covered: 4, missed: 0 },
                    },
                  ],
                },
                {
                  covered: 7,
                  missed: 8,
                  percentage: 46.67,
                  name: 'Math.kt',
                  url: 'https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/kotlin/com/madrapps/jacoco/Math.kt',
                  lines: [
                    {
                      number: 18,
                      branch: { covered: 0, missed: 0 },
                      instruction: { covered: 4, missed: 0 },
                    },
                    {
                      number: 22,
                      branch: { covered: 0, missed: 0 },
                      instruction: { covered: 0, missed: 5 },
                    },
                  ],
                },
              ],
              percentage: 49.02,
            },
          ],
          isMultiModule: false,
          'coverage-changed-files': 63.64,
        })
      })
    })

    describe('multiple reports', function () {
      it('no files changed', async () => {
        const reports = await getMultipleReports()
        const changedFiles = []
        const actual = process.getProjectCoverage(reports, changedFiles)
        expect(actual).toEqual({
          modules: [],
          isMultiModule: true,
          'coverage-changed-files': 100,
        })
      })

      it('one file changed', async () => {
        const reports = await getMultipleReports()
        const changedFiles = [CHANGED_FILE.MAIN_VIEW_MODEL]
        const actual = process.getProjectCoverage(reports, changedFiles)
        expect(actual).toEqual({
          modules: [
            {
              files: [
                {
                  covered: 10,
                  missed: 7,
                  name: 'MainViewModel.kt',
                  percentage: 58.82,
                  url: 'https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/playground/MainViewModel.kt',
                  lines: [],
                },
              ],
              name: 'app',
              percentage: 8.33,
            },
          ],
          isMultiModule: true,
          'coverage-changed-files': 58.82,
        })
      })

      it('multiple files changed', async () => {
        const reports = await getMultipleReports()
        const changedFiles = CHANGED_FILE.MULTI_MODULE
        const actual = process.getProjectCoverage(reports, changedFiles)
        expect(actual).toEqual({
          modules: [
            {
              files: [
                {
                  covered: 19,
                  missed: 8,
                  name: 'Math.kt',
                  percentage: 70.37,
                  url: 'https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/math/Math.kt',
                  lines: [
                    {
                      number: 18,
                      branch: { covered: 0, missed: 0 },
                      instruction: { covered: 4, missed: 0 },
                    },
                    {
                      number: 22,
                      branch: { covered: 0, missed: 0 },
                      instruction: { covered: 0, missed: 5 },
                    },
                  ],
                },
              ],
              name: 'math',
              percentage: 70.37,
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
                  lines: [],
                },
              ],
            },
          ],
          isMultiModule: true,
          'coverage-changed-files': 65.91,
        })
      })
    })

    describe('aggregate reports', function () {
      it('no files changed', async () => {
        const reports = await getAggregateReport()
        const changedFiles = []
        const actual = process.getProjectCoverage(reports, changedFiles)
        expect(actual).toEqual({
          modules: [],
          isMultiModule: true,
          'coverage-changed-files': 100,
        })
      })

      it('one file changed', async () => {
        const reports = await getAggregateReport()
        const changedFiles = [CHANGED_FILE.MAIN_VIEW_MODEL]
        const actual = process.getProjectCoverage(reports, changedFiles)
        expect(actual).toEqual({
          modules: [
            {
              files: [
                {
                  covered: 10,
                  missed: 7,
                  name: 'MainViewModel.kt',
                  percentage: 58.82,
                  url: 'https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/playground/MainViewModel.kt',
                  lines: [],
                },
              ],
              name: 'module-3',
              percentage: 8.33,
            },
          ],
          isMultiModule: true,
          'coverage-changed-files': 58.82,
        })
      })

      it('multiple files changed', async () => {
        const reports = await getAggregateReport()
        const changedFiles = [
          CHANGED_FILE.MAIN_VIEW_MODEL,
          CHANGED_FILE.MATH_ANDROID,
          CHANGED_FILE.MATH_TEST,
        ]
        const actual = process.getProjectCoverage(reports, changedFiles)
        expect(actual).toEqual({
          modules: [
            {
              files: [
                {
                  covered: 19,
                  missed: 8,
                  name: 'Math.kt',
                  percentage: 70.37,
                  url: 'https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/math/Math.kt',
                  lines: [
                    {
                      number: 18,
                      branch: { covered: 0, missed: 0 },
                      instruction: { covered: 4, missed: 0 },
                    },
                    {
                      number: 22,
                      branch: { covered: 0, missed: 0 },
                      instruction: { covered: 0, missed: 5 },
                    },
                  ],
                },
              ],
              name: 'module-2',
              percentage: 70.37,
            },
            {
              files: [
                {
                  covered: 10,
                  missed: 7,
                  name: 'MainViewModel.kt',
                  percentage: 58.82,
                  url: 'https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/playground/MainViewModel.kt',
                  lines: [],
                },
              ],
              name: 'module-3',
              percentage: 8.33,
            },
          ],
          isMultiModule: true,
          'coverage-changed-files': 65.91,
        })
      })
    })
  })
})

async function getAggregateReport() {
  const reportPath = './__tests__/__fixtures__/aggregate-report.xml'
  const report = await getReport(reportPath)
  return [report]
}

async function getMultipleReports() {
  const testFolder = './__tests__/__fixtures__/multi_module'
  return Promise.all(
    fs.readdirSync(testFolder).map(async (file) => {
      const reportPath = testFolder + '/' + file
      return await getReport(reportPath)
    })
  )
}

async function getSingleReport() {
  const reportPath = './__tests__/__fixtures__/report.xml'
  const report = await getReport(reportPath)
  return [report]
}

async function getReport(path) {
  const reportXml = await fs.promises.readFile(path, 'utf-8')
  const json = await parser.parseStringPromise(reportXml)
  return json['report']
}
