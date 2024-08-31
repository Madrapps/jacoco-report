import * as fs from 'fs'
import {Report} from '../src/models/jacoco-types'
import {parseToReport} from '../src/util'

jest.mock('@actions/core')
jest.mock('@actions/github')

describe('Util', function () {
  describe('parseToReport', () => {
    it('WHEN report is empty THEN return Report with name', async () => {
      const report = await getReport(
        './__tests__/__fixtures__/reports/empty.xml'
      )
      expect(report).toEqual(EMPTY)
    })

    it('WHEN only Counter is present THEN return Report with name and Counter', async () => {
      const report = await getReport(
        './__tests__/__fixtures__/reports/only_counter.xml'
      )
      expect(report).toEqual(ONLY_COUNTER)
    })

    it('WHEN only SessionInfo is present THEN return Report with name and SessionInfo', async () => {
      const report = await getReport(
        './__tests__/__fixtures__/reports/only_session.xml'
      )
      expect(report).toEqual(ONLY_SESSION)
    })

    describe('WHEN only Group is present', () => {
      it('AND is empty THEN return Report with name and empty Group', async () => {
        const report = await getReport(
          './__tests__/__fixtures__/reports/group/empty_group.xml'
        )
        expect(report).toEqual(GROUP_EMPTY)
      })

      it('AND has Counter THEN return Report with name and Group with Counter', async () => {
        const report = await getReport(
          './__tests__/__fixtures__/reports/group/group_with_counter.xml'
        )
        expect(report).toEqual(GROUP_WITH_COUNTER)
      })

      it('AND has Group THEN return Report with Group with Group', async () => {
        const report = await getReport(
          './__tests__/__fixtures__/reports/group/group_with_group.xml'
        )
        expect(report).toEqual(GROUP_WITH_GROUP)
      })

      describe('AND has Package', () => {
        it('THEN return Report with Group with Package', async () => {
          const report = await getReport(
            './__tests__/__fixtures__/reports/group/group_with_package.xml'
          )
          expect(report).toEqual(GROUP_WITH_PACKAGE)
        })

        it('AND is empty THEN return Report with Group with Package', async () => {
          const report = await getReport(
            './__tests__/__fixtures__/reports/group/group_with_empty_package.xml'
          )
          expect(report).toEqual(GROUP_WITH_EMPTY_PACKAGE)
        })
      })
    })

    describe('WHEN only Package is present', () => {
      it('AND is empty THEN return Report with name and empty Package', async () => {
        const report = await getReport(
          './__tests__/__fixtures__/reports/package/empty_package.xml'
        )
        expect(report).toEqual(PACKAGE_EMPTY)
      })

      it('AND has Counter THEN return Report with name and Package with Counter', async () => {
        const report = await getReport(
          './__tests__/__fixtures__/reports/package/package_with_counter.xml'
        )
        expect(report).toEqual(PACKAGE_WITH_COUNTER)
      })

      describe('AND has Class', () => {
        it('AND is empty THEN return Class with properties', async () => {
          const report = await getReport(
            './__tests__/__fixtures__/reports/package/class/empty_class.xml'
          )
          expect(report).toEqual(CLASS_EMPTY)
        })

        it('AND has Counter THEN return Class with Counter', async () => {
          const report = await getReport(
            './__tests__/__fixtures__/reports/package/class/class_with_counter.xml'
          )
          expect(report).toEqual(CLASS_WITH_COUNTER)
        })

        it('AND has Method THEN return Class with Method', async () => {
          const report = await getReport(
            './__tests__/__fixtures__/reports/package/class/only_method.xml'
          )
          expect(report).toEqual(ONLY_METHOD)
        })
      })

      describe('AND has SourceFile', () => {
        it('AND is empty THEN return SourceFile with properties', async () => {
          const report = await getReport(
            './__tests__/__fixtures__/reports/package/sourcefile/empty_sourcefile.xml'
          )
          expect(report).toEqual(SOURCE_FILE_EMPTY)
        })

        it('AND has Counter THEN return SourceFile with Counter', async () => {
          const report = await getReport(
            './__tests__/__fixtures__/reports/package/sourcefile/sourcefile_with_counter.xml'
          )
          expect(report).toEqual(SOURCE_FILE_WITH_COUNTER)
        })

        it('AND has Line THEN return SourceFile with Line', async () => {
          const report = await getReport(
            './__tests__/__fixtures__/reports/package/sourcefile/only_line.xml'
          )
          expect(report).toEqual(ONLY_LINE)
        })
      })
    })
  })
})

async function getReport(path: string): Promise<Report> {
  const reportXml = await fs.promises.readFile(path, 'utf-8')
  return parseToReport(reportXml)
}

const EMPTY: Report = {name: 'Empty Report'}

const ONLY_COUNTER: Report = {
  name: 'Only Counter',
  counter: [{covered: 2, missed: 1, type: 'INSTRUCTION'}],
}

const ONLY_SESSION: Report = {
  name: 'Only Session',
  sessioninfo: [{id: 'session1', dump: 1620003600, start: 1620000000}],
}

const GROUP_EMPTY: Report = {
  name: 'Empty Group',
  group: [{name: 'Group1'}],
}

const GROUP_WITH_COUNTER: Report = {
  name: 'Only Group with Counter',
  group: [
    {
      name: 'Group1',
      counter: [{covered: 2, missed: 1, type: 'INSTRUCTION'}],
    },
  ],
}

const GROUP_WITH_GROUP: Report = {
  name: 'Only Group with Group',
  group: [
    {
      name: 'Group1',
      group: [
        {
          name: 'Group2',
          counter: [{covered: 2, missed: 1, type: 'INSTRUCTION'}],
        },
      ],
    },
  ],
}

const GROUP_WITH_PACKAGE: Report = {
  name: 'Only Group with Package',
  group: [
    {
      name: 'Group1',
      package: [
        {
          name: 'Package1',
          counter: [{covered: 2, missed: 1, type: 'INSTRUCTION'}],
        },
      ],
    },
  ],
}

const GROUP_WITH_EMPTY_PACKAGE: Report = {
  name: 'Only Group with empty Package',
  group: [
    {
      name: 'Group1',
      package: [{name: 'Package1'}],
    },
  ],
}

const PACKAGE_EMPTY: Report = {
  name: 'Empty Package',
  package: [{name: 'com.example.package1'}],
}

const PACKAGE_WITH_COUNTER: Report = {
  name: 'Only Package with Counter',
  package: [
    {
      name: 'com.example.package1',
      counter: [{covered: 2, missed: 1, type: 'INSTRUCTION'}],
    },
  ],
}

const CLASS_EMPTY: Report = {
  name: 'Empty Class',
  package: [
    {
      name: 'com.example.package1',
      class: [
        {name: 'com.example.package1.ExampleClass1'},
        {
          name: 'com.example.package1.ExampleClass2',
          sourcefilename: 'ExampleClass2.kt',
        },
      ],
    },
  ],
}

const CLASS_WITH_COUNTER: Report = {
  name: 'Only Class with Counter',
  package: [
    {
      name: 'com.example.package1',
      class: [
        {
          counter: [{covered: 2, missed: 1, type: 'INSTRUCTION'}],
          name: 'com.example.package1.ExampleClass1',
        },
      ],
    },
  ],
}

const ONLY_METHOD: Report = {
  name: 'Only Method',
  package: [
    {
      name: 'com.example.package1',
      class: [
        {
          name: 'com.example.package1.ExampleClass1',
          method: [
            {desc: '()V', line: NaN, name: 'exampleMethod1'},
            {desc: '()V', line: 3, name: '<init>'},
            {
              name: 'validate',
              desc: '(Ljava/lang/String;)Z',
              counter: [
                {covered: 1, missed: 2, type: 'INSTRUCTION'},
                {covered: 3, missed: 4, type: 'LINE'},
              ],
              line: 8,
            },
          ],
        },
      ],
    },
  ],
}

const SOURCE_FILE_EMPTY: Report = {
  name: 'Empty SourceFile',
  package: [
    {
      name: 'com.example.package1',
      sourcefile: [{name: 'ExampleFile1.java'}],
    },
  ],
}

const SOURCE_FILE_WITH_COUNTER: Report = {
  name: 'Only SourceFile with Counter',
  package: [
    {
      name: 'com.example.package1',
      sourcefile: [
        {
          name: 'ExampleFile1.java',
          counter: [{covered: 2, missed: 1, type: 'INSTRUCTION'}],
        },
      ],
    },
  ],
}

const ONLY_LINE: Report = {
  name: 'Only Line',
  package: [
    {
      name: 'com.example.package1',
      sourcefile: [
        {
          name: 'ExampleFile1.java',
          line: [
            {nr: 10, cb: NaN, ci: NaN, mb: NaN, mi: NaN},
            {nr: 18, mi: 1, cb: NaN, ci: NaN, mb: NaN},
            {nr: 18, mi: 1, ci: 2, cb: NaN, mb: NaN},
            {nr: 18, cb: NaN, mi: 1, ci: 2, mb: 3},
            {nr: 18, mi: 1, ci: 2, mb: 3, cb: 4},
          ],
        },
      ],
    },
  ],
}
