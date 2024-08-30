import {JacocoFile} from './models/jacoco'
import parser from 'xml2js'
import {Package, Report} from './models/jacoco-types.js'

export function debug(obj: object): string {
  return JSON.stringify(obj, null, 4)
}

const pattern = /^@@ -([0-9]*),?\S* \+([0-9]*),?/

export function getChangedLines(patch: string | undefined): number[] {
  const lineNumbers = new Set<number>()
  if (patch) {
    const lines = patch.split('\n')
    const groups = getDiffGroups(lines)
    for (const group of groups) {
      const firstLine = group.shift()
      if (firstLine) {
        const diffGroup = firstLine.match(pattern)
        if (diffGroup) {
          let bX = parseInt(diffGroup[2])

          for (const line of group) {
            bX++

            if (line.startsWith('+')) {
              lineNumbers.add(bX - 1)
            } else if (line.startsWith('-')) {
              bX--
            }
          }
        }
      }
    }
  }
  return [...lineNumbers]
}

function getDiffGroups(lines: string[]): string[][] {
  const groups: string[][] = []

  let group: string[] = []
  for (const line of lines) {
    if (line.startsWith('@@')) {
      group = []
      groups.push(group)
    }
    group.push(line)
  }

  return groups
}

export function getFilesWithCoverage(packages: Package[]): JacocoFile[] {
  const files: JacocoFile[] = []
  for (const item of packages) {
    const packageName: string = item.name
    const sourceFiles = item.sourcefile ?? []
    for (const sourceFile of sourceFiles) {
      const sourceFileName = sourceFile.name
      const file: JacocoFile = {
        name: sourceFileName,
        packageName,
        lines: [],
        counters: [],
      }
      const counters = sourceFile.counter ?? []
      for (const counter of counters) {
        const counterSelf = counter
        const type = counterSelf.type
        file.counters.push({
          name: type.toLowerCase(),
          missed: parseInt(`${counterSelf.missed}`) ?? 0,
          covered: parseInt(`${counterSelf.covered}`) ?? 0,
        })
      }

      const lines = sourceFile.line ?? []
      for (const line of lines) {
        const lineSelf = line
        file.lines.push({
          number: parseInt(`${lineSelf.nr}`) ?? 0,
          instruction: {
            missed: parseInt(`${lineSelf.mi}`) ?? 0,
            covered: parseInt(`${lineSelf.ci}`) ?? 0,
          },
          branch: {
            missed: parseInt(`${lineSelf.mb}`) ?? 0,
            covered: parseInt(`${lineSelf.cb}`) ?? 0,
          },
        })
      }
      files.push(file)
    }
  }
  return files
}

export function notNull<T>(val: T | null | undefined): val is T {
  return val !== null && val !== undefined
}

export async function parseToReport(
  reportXml: string
): Promise<Report> | never {
  const json = await parser.parseStringPromise(reportXml)
  if (json && typeof json === 'object' && 'report' in json) {
    return convertObjToReport(json['report'])
  }
  throw new Error('Invalid report')
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function convertObjToReport(obj: any): Report {
  return {
    name: obj['$'].name,
    sessioninfo: obj.sessioninfo?.map((si: any) => ({
      id: si['$'].id,
      start: Number(si['$'].start),
      dump: Number(si['$'].dump),
    })),
    group: obj.group?.map((grp: any) => ({
      name: grp['$'].name,
      group: grp.group?.map((g: any) => ({
        name: g['$'].name,
        counter: g.counter?.map((c: any) => ({
          type: c['$'].type,
          missed: Number(c['$'].missed),
          covered: Number(c['$'].covered),
        })),
      })),
      package: grp.package?.map((pkg: any) => ({
        name: pkg['$'].name,
        class: pkg.class?.map((cls: any) => ({
          name: cls['$'].name,
          sourcefilename: cls['$'].sourcefilename,
          method: cls.method?.map((m: any) => ({
            name: m['$'].name,
            desc: m['$'].desc,
            line: Number(m['$'].line),
            counter: m.counter?.map((c: any) => ({
              type: c['$'].type,
              missed: Number(c['$'].missed),
              covered: Number(c['$'].covered),
            })),
          })),
          counter: cls.counter?.map((c: any) => ({
            type: c['$'].type,
            missed: Number(c['$'].missed),
            covered: Number(c['$'].covered),
          })),
        })),
        sourcefile: pkg.sourcefile?.map((sf: any) => ({
          name: sf['$'].name,
          line: sf.line?.map((ln: any) => ({
            nr: Number(ln['$'].nr),
            mi: Number(ln['$'].mi),
            ci: Number(ln['$'].ci),
            mb: Number(ln['$'].mb),
            cb: Number(ln['$'].cb),
          })),
          counter: sf.counter?.map((c: any) => ({
            type: c['$'].type,
            missed: Number(c['$'].missed),
            covered: Number(c['$'].covered),
          })),
        })),
        counter: pkg.counter?.map((c: any) => ({
          type: c['$'].type,
          missed: Number(c['$'].missed),
          covered: Number(c['$'].covered),
        })),
      })),
      counter: grp.counter?.map((c: any) => ({
        type: c['$'].type,
        missed: Number(c['$'].missed),
        covered: Number(c['$'].covered),
      })),
    })),
    package: obj.package?.map((pkg: any) => ({
      name: pkg['$'].name,
      class: pkg.class?.map((cls: any) => ({
        name: cls['$'].name,
        sourcefilename: cls['$'].sourcefilename,
        method: cls.method?.map((m: any) => ({
          name: m['$'].name,
          desc: m['$'].desc,
          line: Number(m['$'].line),
          counter: m.counter?.map((c: any) => ({
            type: c['$'].type,
            missed: Number(c['$'].missed),
            covered: Number(c['$'].covered),
          })),
        })),
        counter: cls.counter?.map((c: any) => ({
          type: c['$'].type,
          missed: Number(c['$'].missed),
          covered: Number(c['$'].covered),
        })),
      })),
      sourcefile: pkg.sourcefile?.map((sf: any) => ({
        name: sf['$'].name,
        line: sf.line?.map((ln: any) => ({
          nr: Number(ln['$'].nr),
          mi: Number(ln['$'].mi),
          ci: Number(ln['$'].ci),
          mb: Number(ln['$'].mb),
          cb: Number(ln['$'].cb),
        })),
        counter: sf.counter?.map((c: any) => ({
          type: c['$'].type,
          missed: Number(c['$'].missed),
          covered: Number(c['$'].covered),
        })),
      })),
      counter: pkg.counter?.map((c: any) => ({
        type: c['$'].type,
        missed: Number(c['$'].missed),
        covered: Number(c['$'].covered),
      })),
    })),
    counter: obj.counter?.map((c: any) => ({
      type: c['$'].type,
      missed: Number(c['$'].missed),
      covered: Number(c['$'].covered),
    })),
  }
}
