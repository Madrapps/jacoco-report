const fs = require('fs')
const parser = require('xml2js')
const process = require('../src/process')

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
        expect(actual).toEqual([])
      })

      it('one file changed', async () => {
        const reports = await getSingleReport()
        const changedFiles = [
          {
            filePath:
              'src/main/java/com/madrapps/jacoco/operation/StringOp.java',
            url: 'https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/java/com/madrapps/jacoco/operation/StringOp.java',
          },
        ]
        const actual = process.getProjectCoverage(reports, changedFiles)
        expect(actual).toEqual([
          {
            name: 'jacoco-playground',
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
            ],
            percentage: 49.02,
          },
        ])
      })

      it('multiple files changed', async () => {
        const reports = await getSingleReport()
        const changedFiles = [
          {
            filePath:
              'src/main/java/com/madrapps/jacoco/operation/StringOp.java',
            url: 'https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/java/com/madrapps/jacoco/operation/StringOp.java',
          },
          {
            filePath: 'src/main/kotlin/com/madrapps/jacoco/Math.kt',
            url: 'https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/kotlin/com/madrapps/jacoco/Math.kt',
          },
          {
            filePath:
              'src/test/java/com/madrapps/jacoco/operation/StringOpTest.java',
            url: 'https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/test/java/com/madrapps/jacoco/operation/StringOpTest.java',
          },
        ]
        const actual = process.getProjectCoverage(reports, changedFiles)
        expect(actual).toEqual([
          {
            name: 'jacoco-playground',
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
            percentage: 49.02,
          },
        ])
      })
    })

    describe('multiple reports', function () {
      it('no files changed', async () => {
        const reports = await getMultipleReports()
        const changedFiles = []
        const actual = process.getProjectCoverage(reports, changedFiles)
        expect(actual).toEqual([])
      })

      it('one file changed', async () => {
        const reports = await getMultipleReports()
        const changedFiles = [
          {
            filePath: 'src/main/java/com/madrapps/playground/MainViewModel.kt',
            url: 'https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/playground/MainViewModel.kt',
          },
        ]
        const actual = process.getProjectCoverage(reports, changedFiles)
        expect(actual).toEqual([
          {
            name: 'app',
            files: [
              {
                filePath:
                  'src/main/java/com/madrapps/playground/MainViewModel.kt',
                url: 'https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/playground/MainViewModel.kt',
                name: 'MainViewModel.kt',
                covered: 10,
                missed: 7,
                percentage: 58.82,
              },
            ],
            percentage: 8.33,
          },
        ])
      })

      it('multiple files changed', async () => {
        const reports = await getMultipleReports()
        const changedFiles = [
          {
            filePath: 'src/main/java/com/madrapps/playground/MainViewModel.kt',
            url: 'https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/playground/MainViewModel.kt',
          },
          {
            filePath: 'src/main/java/com/madrapps/math/Math.kt',
            url: 'https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/math/Math.kt',
          },
          {
            filePath: 'src/test/java/com/madrapps/math/MathTest.kt',
            url: 'https://github.com/thsaravana/jacoco-android-playground/src/test/java/com/madrapps/math/MathTest.kt',
          },
        ]
        const actual = process.getProjectCoverage(reports, changedFiles)
        expect(actual).toEqual([
          {
            name: 'math',
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
            percentage: 70.37,
          },
          {
            name: 'app',
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
            ],
            percentage: 8.33,
          },
        ])
      })
    })

    describe('aggregate reports', function () {
      it('no files changed', async () => {
        const reports = await getAggregateReport()
        const changedFiles = []
        const actual = process.getProjectCoverage(reports, changedFiles)
        expect(actual).toEqual([])
      })

      it('one file changed', async () => {
        const reports = await getAggregateReport()
        const changedFiles = [
          {
            filePath: 'src/main/java/com/madrapps/playground/MainViewModel.kt',
            url: 'https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/playground/MainViewModel.kt',
          },
        ]
        const actual = process.getProjectCoverage(reports, changedFiles)
        expect(actual).toEqual([
          {
            name: 'module-3',
            files: [
              {
                filePath:
                  'src/main/java/com/madrapps/playground/MainViewModel.kt',
                url: 'https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/playground/MainViewModel.kt',
                name: 'MainViewModel.kt',
                covered: 10,
                missed: 7,
                percentage: 58.82,
              },
            ],
            percentage: 8.33,
          },
        ])
      })

      it('multiple files changed', async () => {
        const reports = await getAggregateReport()
        const changedFiles = [
          {
            filePath: 'src/main/java/com/madrapps/playground/MainViewModel.kt',
            url: 'https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/playground/MainViewModel.kt',
          },
          {
            filePath: 'src/main/java/com/madrapps/math/Math.kt',
            url: 'https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/math/Math.kt',
          },
          {
            filePath: 'src/test/java/com/madrapps/math/MathTest.kt',
            url: 'https://github.com/thsaravana/jacoco-android-playground/src/test/java/com/madrapps/math/MathTest.kt',
          },
        ]
        const actual = process.getProjectCoverage(reports, changedFiles)
        expect(actual).toEqual([
          {
            name: 'module-2',
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
            percentage: 70.37,
          },
          {
            name: 'module-3',
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
            ],
            percentage: 8.33,
          },
        ])
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
