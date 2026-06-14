import {describe, it, expect} from '@jest/globals'
import fs from 'fs'
import * as process from '../src/process'
import {ChangedFile} from '../src/models/github'
import {Report} from '../src/models/jacoco-types'
import {parseToReport} from '../src/util'
import {CHANGED_FILE, PROJECT} from './mocks.test'

describe('process', function () {
  describe('get file coverage', function () {
    describe('empty report', function () {
      it('no files changed', async () => {
        const v = getEmptyReports()
        const reports = await v
        const changedFiles: ChangedFile[] = []
        const actual = process.getProjectCoverage(reports, changedFiles)
        expect(actual).toEqual({
          modules: [],
          isMultiModule: false,
          'coverage-changed-files': 100,
          overall: null,
          changed: null,
        })
      })

      it('one file changed', async () => {
        const reports = await getEmptyReports()
        const changedFiles = CHANGED_FILE.SINGLE_MODULE.filter(file => {
          return file.filePath.endsWith('Math.kt')
        })
        const actual = process.getProjectCoverage(reports, changedFiles)
        expect(actual).toEqual({
          modules: [],
          isMultiModule: false,
          'coverage-changed-files': 100,
          overall: null,
          changed: null,
        })
      })

      it('multiple files changed', async () => {
        const reports = await getEmptyReports()
        const changedFiles = CHANGED_FILE.SINGLE_MODULE
        const actual = process.getProjectCoverage(reports, changedFiles)
        expect(actual).toEqual({
          modules: [],
          isMultiModule: false,
          'coverage-changed-files': 100,
          overall: null,
          changed: null,
        })
      })
    })

    describe('single report', function () {
      it('no files changed', async () => {
        const v = getSingleReports()
        const reports = await v
        const changedFiles: ChangedFile[] = []
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
          changed: null,
        })
      })

      it('one file changed', async () => {
        const reports = await getSingleReports()
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
                      branch: {covered: 1, missed: 1, percentage: 50},
                      instruction: {covered: 3, missed: 0, percentage: 100},
                      number: 6,
                    },
                    {
                      branch: {covered: 0, missed: 2, percentage: 0},
                      instruction: {covered: 0, missed: 3, percentage: 0},
                      number: 13,
                    },
                    {
                      branch: {covered: 0, missed: 0, percentage: 0},
                      instruction: {covered: 0, missed: 4, percentage: 0},
                      number: 14,
                    },
                    {
                      branch: {covered: 0, missed: 0, percentage: 0},
                      instruction: {covered: 0, missed: 4, percentage: 0},
                      number: 16,
                    },
                    {
                      branch: {covered: 1, missed: 1, percentage: 50},
                      instruction: {covered: 3, missed: 0, percentage: 100},
                      number: 26,
                    },
                    {
                      branch: {covered: 0, missed: 0, percentage: 0},
                      instruction: {covered: 4, missed: 0, percentage: 100},
                      number: 27,
                    },
                    {
                      branch: {covered: 0, missed: 0, percentage: 0},
                      instruction: {covered: 0, missed: 4, percentage: 0},
                      number: 29,
                    },
                    {
                      branch: {covered: 0, missed: 0, percentage: 0},
                      instruction: {covered: 0, missed: 6, percentage: 0},
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
        const reports = await getSingleReports()
        const changedFiles = CHANGED_FILE.SINGLE_MODULE
        const actual = process.getProjectCoverage(reports, changedFiles)
        expect(actual).toEqual(PROJECT.SINGLE_MODULE)
      })

      it('uses BRANCH counter type', async () => {
        const reports = await getSingleReports()
        const changedFiles = CHANGED_FILE.SINGLE_MODULE.filter(file => {
          return file.filePath.endsWith('Math.kt')
        })
        const actual = process.getProjectCoverage(
          reports,
          changedFiles,
          'BRANCH'
        )
        expect(actual.overall?.percentage).toEqual(33.33)
        expect(actual.modules[0].overall.percentage).toEqual(33.33)
        expect(actual.modules[0].files[0].changed?.percentage).toEqual(33.33)
      })

      it('uses LINE counter type', async () => {
        const reports = await getSingleReports()
        const changedFiles = CHANGED_FILE.SINGLE_MODULE.filter(file => {
          return file.filePath.endsWith('Math.kt')
        })
        const actual = process.getProjectCoverage(reports, changedFiles, 'LINE')
        expect(actual.overall?.percentage).toEqual(44.44)
        expect(actual.modules[0].overall.percentage).toEqual(44.44)
        expect(actual.modules[0].files[0].changed?.percentage).toEqual(37.5)
      })

      it('uses COMPLEXITY counter type', async () => {
        const reports = await getSingleReports()
        const changedFiles = CHANGED_FILE.SINGLE_MODULE.filter(file => {
          return file.filePath.endsWith('Math.kt')
        })
        const actual = process.getProjectCoverage(
          reports,
          changedFiles,
          'COMPLEXITY'
        )
        expect(actual.overall?.percentage).toEqual(40)
        expect(actual.modules[0].overall.percentage).toEqual(40)
        expect(actual.modules[0].files[0].changed?.percentage).toEqual(32.26)
      })

      it('uses METHOD counter type', async () => {
        const reports = await getSingleReports()
        const changedFiles = CHANGED_FILE.SINGLE_MODULE.filter(file => {
          return file.filePath.endsWith('Math.kt')
        })
        const actual = process.getProjectCoverage(
          reports,
          changedFiles,
          'METHOD'
        )
        expect(actual.overall?.percentage).toEqual(45.45)
        expect(actual.modules[0].overall.percentage).toEqual(45.45)
        expect(actual.modules[0].files[0].changed?.percentage).toEqual(32.26)
      })

      it('BRANCH excludes files without branch counters', async () => {
        const reports = await getSingleReports()
        const changedFiles = CHANGED_FILE.SINGLE_MODULE
        const actual = process.getProjectCoverage(
          reports,
          changedFiles,
          'BRANCH'
        )
        expect(actual.modules[0].files.length).toEqual(1)
        expect(actual.modules[0].files[0].name).toEqual('Math.kt')
      })

      it('LINE with multiple files changed', async () => {
        const reports = await getSingleReports()
        const changedFiles = CHANGED_FILE.SINGLE_MODULE
        const actual = process.getProjectCoverage(reports, changedFiles, 'LINE')
        expect(actual.overall?.percentage).toEqual(44.44)
        expect(actual.modules[0].files.length).toEqual(3)
      })
    })

    describe('multiple reports', function () {
      it('no files changed', async () => {
        const reports = await getMultipleReports()
        const changedFiles: ChangedFile[] = []
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
          changed: null,
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
                      branch: {covered: 0, missed: 0, percentage: 0},
                      instruction: {covered: 3, missed: 0, percentage: 100},
                      number: 6,
                    },
                    {
                      branch: {covered: 0, missed: 0, percentage: 0},
                      instruction: {covered: 0, missed: 2, percentage: 0},
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

      it('uses LINE counter type', async () => {
        const reports = await getMultipleReports()
        const changedFiles = CHANGED_FILE.MULTI_MODULE.filter(file => {
          return file.filePath.endsWith('StringOp.java')
        })
        const actual = process.getProjectCoverage(reports, changedFiles, 'LINE')
        expect(actual.overall?.percentage).toEqual(28.57)
        expect(actual.modules[0].overall.percentage).toEqual(75)
        expect(actual.modules[0].files[0].name).toEqual('StringOp.java')
        expect(actual.modules[0].files[0].changed?.percentage).toEqual(50)
      })

      it('BRANCH excludes files without branch counters', async () => {
        const reports = await getMultipleReports()
        const changedFiles = CHANGED_FILE.MULTI_MODULE
        const actual = process.getProjectCoverage(
          reports,
          changedFiles,
          'BRANCH'
        )
        expect(actual.modules.length).toEqual(1)
        expect(actual.modules[0].name).toEqual('app')
        expect(actual.modules[0].files.length).toEqual(1)
        expect(actual.modules[0].files[0].name).toEqual('MainViewModel.kt')
        expect(actual.modules[0].files[0].overall.percentage).toEqual(0)
        expect(actual.modules[0].files[0].changed?.percentage).toEqual(0)
        expect(actual.overall?.percentage).toEqual(0)
      })
    })

    describe('aggregate reports', function () {
      it('no files changed', async () => {
        const reports = await getAggregateReport()
        const changedFiles: ChangedFile[] = []
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
          changed: null,
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
                  changed: null,
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
              changed: null,
            },
          ],
          overall: {
            covered: 28212,
            missed: 8754,
            percentage: 76.32,
          },
          changed: null,
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
                      branch: {covered: 0, missed: 0, percentage: 0},
                      instruction: {covered: 0, missed: 5, percentage: 0},
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
                  changed: null,
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
              changed: null,
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

  describe('module name disambiguation', function () {
    it('disambiguates modules with same name using file path (Gradle)', async () => {
      const reportPath =
        './__tests__/__fixtures__/multi_module/textCoverage.xml'
      const report1 = await getReport(reportPath)
      report1.filePath =
        '/workspace/features/feature1/tests/build/reports/jacoco/debugCoverage.xml'

      const report2 = await getReport(reportPath)
      report2.filePath =
        '/workspace/features/feature2/tests/build/reports/jacoco/debugCoverage.xml'

      report1.name = 'tests'
      report2.name = 'tests'

      const changedFiles = CHANGED_FILE.MULTI_MODULE.filter(file => {
        return file.filePath.endsWith('StringOp.java')
      })
      const actual = process.getProjectCoverage(
        [report1, report2],
        changedFiles
      )
      expect(actual.modules[0].name).toEqual(':feature1:tests')
      expect(actual.modules[1].name).toEqual(':feature2:tests')
    })

    it('disambiguates modules with same name using file path (Maven)', async () => {
      const reportPath =
        './__tests__/__fixtures__/multi_module/textCoverage.xml'
      const report1 = await getReport(reportPath)
      report1.filePath = '/workspace/modules/core/target/site/jacoco/jacoco.xml'

      const report2 = await getReport(reportPath)
      report2.filePath = '/workspace/modules/api/target/site/jacoco/jacoco.xml'

      report1.name = 'app'
      report2.name = 'app'

      const changedFiles = CHANGED_FILE.MULTI_MODULE.filter(file => {
        return file.filePath.endsWith('StringOp.java')
      })
      const actual = process.getProjectCoverage(
        [report1, report2],
        changedFiles
      )
      expect(actual.modules[0].name).toEqual(':core')
      expect(actual.modules[1].name).toEqual(':api')
    })

    it('does not disambiguate when names are unique', async () => {
      const reports = await getMultipleReports()
      const changedFiles = CHANGED_FILE.MULTI_MODULE
      const actual = process.getProjectCoverage(reports, changedFiles)
      const moduleNames = actual.modules.map(m => m.name)
      expect(moduleNames).toContain('text')
      expect(moduleNames).toContain('math')
      expect(moduleNames).toContain('app')
    })

    it('keeps original names when filePath is not available', async () => {
      const reportPath =
        './__tests__/__fixtures__/multi_module/textCoverage.xml'
      const report1 = await getReport(reportPath)
      const report2 = await getReport(reportPath)
      report1.name = 'tests'
      report2.name = 'tests'

      const changedFiles = CHANGED_FILE.MULTI_MODULE.filter(file => {
        return file.filePath.endsWith('StringOp.java')
      })
      const actual = process.getProjectCoverage(
        [report1, report2],
        changedFiles
      )
      expect(actual.modules[0].name).toEqual('tests')
      expect(actual.modules[1].name).toEqual('tests')
    })

    it('keeps original names when paths resolve to same value', async () => {
      const reportPath =
        './__tests__/__fixtures__/multi_module/textCoverage.xml'
      const report1 = await getReport(reportPath)
      report1.filePath = '/workspace/app/build/reports/jacoco/debug.xml'

      const report2 = await getReport(reportPath)
      report2.filePath = '/workspace/app/build/reports/jacoco/release.xml'

      report1.name = 'app'
      report2.name = 'app'

      const changedFiles = CHANGED_FILE.MULTI_MODULE.filter(file => {
        return file.filePath.endsWith('StringOp.java')
      })
      const actual = process.getProjectCoverage(
        [report1, report2],
        changedFiles
      )
      expect(actual.modules[0].name).toEqual('app')
      expect(actual.modules[1].name).toEqual('app')
    })
  })

  describe('getModulePathFromFilePath', function () {
    it('extracts path for Gradle build', () => {
      const result = process.getModulePathFromFilePath(
        '/workspace/features/auth/build/reports/jacoco/debugCoverage.xml'
      )
      expect(result).toEqual('/workspace/features/auth')
    })

    it('extracts path for Maven target/site/jacoco', () => {
      const result = process.getModulePathFromFilePath(
        '/workspace/modules/core/target/site/jacoco/jacoco.xml'
      )
      expect(result).toEqual('/workspace/modules/core')
    })

    it('extracts path for Maven target/jacoco', () => {
      const result = process.getModulePathFromFilePath(
        '/workspace/modules/api/target/jacoco/jacoco.xml'
      )
      expect(result).toEqual('/workspace/modules/api')
    })

    it('handles Windows-style paths', () => {
      const result = process.getModulePathFromFilePath(
        'C:\\workspace\\features\\auth\\build\\reports\\jacoco\\report.xml'
      )
      expect(result).toEqual('C:/workspace/features/auth')
    })

    it('returns null for unrecognized path patterns', () => {
      const result = process.getModulePathFromFilePath(
        '/workspace/reports/coverage.xml'
      )
      expect(result).toBeNull()
    })
  })
})

async function getAggregateReport(): Promise<Report[]> {
  const reportPath = './__tests__/__fixtures__/aggregate-report.xml'
  const report = await getReport(reportPath)
  return [report]
}

async function getMultipleReports(): Promise<Report[]> {
  const testFolder = './__tests__/__fixtures__/multi_module'
  return Promise.all(
    fs.readdirSync(testFolder).map(async file => {
      const reportPath = `${testFolder}/${file}`
      return await getReport(reportPath)
    })
  )
}

async function getSingleReports(): Promise<Report[]> {
  const reportPath = './__tests__/__fixtures__/report.xml'
  const report = await getReport(reportPath)
  return [report]
}

async function getEmptyReports(): Promise<Report[]> {
  const reportPath = './__tests__/__fixtures__/empty-report.xml'
  const report = await getReport(reportPath)
  return [report]
}

async function getReport(path: string): Promise<Report> {
  const reportXml = await fs.promises.readFile(path, 'utf-8')
  return parseToReport(reportXml)
}
