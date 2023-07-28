const fs = require('fs')
const parser = require('xml2js')
const process = require('../src/process')
const { CHANGED_FILE, PROJECT } = require('./mocks.test')

describe('process', function () {
  describe('get overall coverage', function () {
    describe('single report', function () {
      test('get project coverage', async () => {
        const reports = await getSingleReport()
        const coverage = process.getOverallCoverage(reports)
        expect(coverage.project).toBeCloseTo(35.25, 1)
      })
    })

    describe('multiple reports', function () {
      test('get project coverage', async () => {
        const reports = await getMultipleReports()
        const coverage = process.getOverallCoverage(reports)
        expect(coverage.project).toBeCloseTo(20.41, 1)
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
        const changedFiles = CHANGED_FILE.SINGLE_MODULE.filter((file) => {
          return file.filePath.endsWith('Math.kt')
        })
        const actual = process.getProjectCoverage(reports, changedFiles)
        expect(actual).toEqual({
          'coverage-changed-files': 42,
          isMultiModule: false,
          modules: [
            {
              files: [
                {
                  covered: 21,
                  lines: [
                    {
                      branch: { covered: 1, missed: 1 },
                      instruction: { covered: 3, missed: 0 },
                      number: 6,
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
                      instruction: { covered: 0, missed: 6 },
                      number: 43,
                    },
                  ],
                  missed: 29,
                  name: 'Math.kt',
                  percentage: 42,
                  url: 'https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/main/kotlin/com/madrapps/jacoco/Math.kt',
                },
              ],
              name: 'jacoco-playground',
              percentage: 35.25,
            },
          ],
        })
      })

      it('multiple files changed', async () => {
        const reports = await getSingleReport()
        const changedFiles = CHANGED_FILE.SINGLE_MODULE
        const actual = process.getProjectCoverage(reports, changedFiles)
        expect(actual).toEqual(PROJECT.SINGLE_MODULE)
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
        const changedFiles = CHANGED_FILE.MULTI_MODULE.filter((file) => {
          return file.filePath.endsWith('StringOp.java')
        })
        const actual = process.getProjectCoverage(reports, changedFiles)
        expect(actual).toEqual({
          'coverage-changed-files': 84.62,
          isMultiModule: true,
          modules: [
            {
              files: [
                {
                  covered: 11,
                  lines: [
                    {
                      branch: { covered: 0, missed: 0 },
                      instruction: { covered: 3, missed: 0 },
                      number: 6,
                    },
                    {
                      branch: { covered: 0, missed: 0 },
                      instruction: { covered: 0, missed: 2 },
                      number: 20,
                    },
                  ],
                  missed: 2,
                  name: 'StringOp.java',
                  percentage: 84.62,
                  url: 'https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/text/src/main/java/com/madrapps/text/StringOp.java',
                },
              ],
              name: 'text',
              percentage: 84.62,
            },
          ],
        })
      })

      it('multiple files changed', async () => {
        const reports = await getMultipleReports()
        const changedFiles = CHANGED_FILE.MULTI_MODULE
        const actual = process.getProjectCoverage(reports, changedFiles)
        expect(actual).toEqual(PROJECT.MULTI_MODULE)
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
        const changedFiles = CHANGED_FILE.MULTI_MODULE.filter((file) => {
          return file.filePath.endsWith('MainViewModel.kt')
        })
        const actual = process.getProjectCoverage(reports, changedFiles)
        expect(actual).toEqual({
          'coverage-changed-files': 58.82,
          isMultiModule: true,
          modules: [
            {
              files: [
                {
                  covered: 10,
                  lines: [],
                  missed: 7,
                  name: 'MainViewModel.kt',
                  percentage: 58.82,
                  url: 'https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app/src/main/java/com/madrapps/playground/MainViewModel.kt',
                },
              ],
              name: 'module-3',
              percentage: 8.33,
            },
          ],
        })
      })

      it('multiple files changed', async () => {
        const reports = await getAggregateReport()
        const changedFiles = CHANGED_FILE.MULTI_MODULE.filter((file) => {
          return (
            file.filePath.endsWith('MainViewModel.kt') ||
            file.filePath.endsWith('Math.kt') ||
            file.filePath.endsWith('OnClickEvent.kt')
          )
        })
        const actual = process.getProjectCoverage(reports, changedFiles)
        expect(actual).toEqual({
          'coverage-changed-files': 65.91,
          isMultiModule: true,
          modules: [
            {
              files: [
                {
                  covered: 19,
                  lines: [
                    {
                      branch: { covered: 0, missed: 0 },
                      instruction: { covered: 0, missed: 5 },
                      number: 22,
                    },
                  ],
                  missed: 8,
                  name: 'Math.kt',
                  percentage: 70.37,
                  url: 'https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/math/src/main/java/com/madrapps/math/Math.kt',
                },
              ],
              name: 'module-2',
              percentage: 70.37,
            },
            {
              files: [
                {
                  covered: 10,
                  lines: [],
                  missed: 7,
                  name: 'MainViewModel.kt',
                  percentage: 58.82,
                  url: 'https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app/src/main/java/com/madrapps/playground/MainViewModel.kt',
                },
              ],
              name: 'module-3',
              percentage: 8.33,
            },
          ],
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
