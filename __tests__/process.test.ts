// @ts-nocheck
import fs from 'fs'
import parser from 'xml2js'
import * as process from '../src/process'
import {CHANGED_FILE, PROJECT} from './mocks.test'

describe('process', function () {
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
          overall: {
            covered: 43,
            missed: 79,
            percentage: 35.25,
          },
          changed: {
            covered: 0,
            missed: 0,
            percentage: undefined,
          },
        })
      })

      it('one file changed', async () => {
        const reports = await getSingleReport()
        const changedFiles = CHANGED_FILE.SINGLE_MODULE.filter(file => {
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
                  lines: [
                    {
                      branch: {covered: 1, missed: 1},
                      instruction: {covered: 3, missed: 0},
                      number: 6,
                    },
                    {
                      branch: {covered: 0, missed: 2},
                      instruction: {covered: 0, missed: 3},
                      number: 13,
                    },
                    {
                      branch: {covered: 0, missed: 0},
                      instruction: {covered: 0, missed: 4},
                      number: 14,
                    },
                    {
                      branch: {covered: 0, missed: 0},
                      instruction: {covered: 0, missed: 4},
                      number: 16,
                    },
                    {
                      branch: {covered: 1, missed: 1},
                      instruction: {covered: 3, missed: 0},
                      number: 26,
                    },
                    {
                      branch: {covered: 0, missed: 0},
                      instruction: {covered: 4, missed: 0},
                      number: 27,
                    },
                    {
                      branch: {covered: 0, missed: 0},
                      instruction: {covered: 0, missed: 4},
                      number: 29,
                    },
                    {
                      branch: {covered: 0, missed: 0},
                      instruction: {covered: 0, missed: 6},
                      number: 43,
                    },
                  ],
                  name: 'Math.kt',
                  overall: {
                    covered: 21,
                    missed: 29,
                    percentage: 42,
                  },
                  changed: {
                    covered: 10,
                    missed: 21,
                    percentage: 32.26,
                  },
                  url: 'https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/main/kotlin/com/madrapps/jacoco/Math.kt',
                },
              ],
              name: 'jacoco-playground',
              overall: {
                percentage: 35.25,
                covered: 43,
                missed: 79,
              },
              changed: {
                covered: 10,
                missed: 21,
                percentage: 32.26,
              },
            },
          ],
          overall: {
            covered: 43,
            missed: 79,
            percentage: 35.25,
          },
          changed: {
            covered: 10,
            missed: 21,
            percentage: 32.26,
          },
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
          overall: {
            covered: 40,
            missed: 156,
            percentage: 20.41,
          },
          changed: {
            covered: 0,
            missed: 0,
            percentage: undefined,
          },
        })
      })

      it('one file changed', async () => {
        const reports = await getMultipleReports()
        const changedFiles = CHANGED_FILE.MULTI_MODULE.filter(file => {
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
                  lines: [
                    {
                      branch: {covered: 0, missed: 0},
                      instruction: {covered: 3, missed: 0},
                      number: 6,
                    },
                    {
                      branch: {covered: 0, missed: 0},
                      instruction: {covered: 0, missed: 2},
                      number: 20,
                    },
                  ],
                  name: 'StringOp.java',
                  overall: {
                    covered: 11,
                    missed: 2,
                    percentage: 84.62,
                  },
                  changed: {
                    covered: 3,
                    missed: 2,
                    percentage: 60,
                  },
                  url: 'https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/text/src/main/java/com/madrapps/text/StringOp.java',
                },
              ],
              name: 'text',
              overall: {
                percentage: 84.62,
                covered: 11,
                missed: 2,
              },
              changed: {
                covered: 3,
                missed: 2,
                percentage: 60,
              },
            },
          ],
          overall: {
            covered: 40,
            missed: 156,
            percentage: 20.41,
          },
          changed: {
            covered: 3,
            missed: 2,
            percentage: 60,
          },
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
          overall: {
            covered: 28212,
            missed: 8754,
            percentage: 76.32,
          },
          changed: {
            covered: 0,
            missed: 0,
            percentage: undefined,
          },
        })
      })

      it('one file changed', async () => {
        const reports = await getAggregateReport()
        const changedFiles = CHANGED_FILE.MULTI_MODULE.filter(file => {
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
                  overall: {
                    covered: 10,
                    missed: 7,
                    percentage: 58.82,
                  },
                  changed: {
                    covered: 0,
                    missed: 0,
                    percentage: undefined,
                  },
                  lines: [],
                  name: 'MainViewModel.kt',
                  url: 'https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app/src/main/java/com/madrapps/playground/MainViewModel.kt',
                },
              ],
              name: 'module-3',
              overall: {
                percentage: 8.33,
                covered: 10,
                missed: 110,
              },
              changed: {
                covered: 0,
                missed: 0,
                percentage: undefined,
              },
            },
          ],
          overall: {
            covered: 28212,
            missed: 8754,
            percentage: 76.32,
          },
          changed: {
            covered: 0,
            missed: 0,
            percentage: undefined,
          },
        })
      })

      it('multiple files changed', async () => {
        const reports = await getAggregateReport()
        const changedFiles = CHANGED_FILE.MULTI_MODULE.filter(file => {
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
                  lines: [
                    {
                      branch: {covered: 0, missed: 0},
                      instruction: {covered: 0, missed: 5},
                      number: 22,
                    },
                  ],
                  overall: {
                    covered: 19,
                    missed: 8,
                    percentage: 70.37,
                  },
                  changed: {
                    covered: 0,
                    missed: 5,
                    percentage: 0,
                  },
                  name: 'Math.kt',
                  url: 'https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/math/src/main/java/com/madrapps/math/Math.kt',
                },
              ],
              name: 'module-2',
              overall: {
                percentage: 70.37,
                covered: 19,
                missed: 8,
              },
              changed: {
                covered: 0,
                missed: 5,
                percentage: 0,
              },
            },
            {
              files: [
                {
                  overall: {
                    covered: 10,
                    missed: 7,
                    percentage: 58.82,
                  },
                  changed: {
                    covered: 0,
                    missed: 0,
                    percentage: undefined,
                  },
                  name: 'MainViewModel.kt',
                  lines: [],
                  url: 'https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app/src/main/java/com/madrapps/playground/MainViewModel.kt',
                },
              ],
              name: 'module-3',
              overall: {
                percentage: 8.33,
                covered: 10,
                missed: 110,
              },
              changed: {
                covered: 0,
                missed: 0,
                percentage: undefined,
              },
            },
          ],
          overall: {
            covered: 28212,
            missed: 8754,
            percentage: 76.32,
          },
          changed: {
            covered: 0,
            missed: 5,
            percentage: 0,
          },
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
    fs.readdirSync(testFolder).map(async file => {
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
