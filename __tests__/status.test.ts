import {describe, it, expect} from '@jest/globals'
import {getCoverageStatus, getCheckTitle} from '../src/status'
import {Project} from '../src/models/project'

function project(overall: number | null, changed: number | null): Project {
  return {
    modules: [],
    isMultiModule: false,
    overall:
      overall === null ? null : {covered: 0, missed: 0, percentage: overall},
    changed:
      changed === null ? null : {covered: 0, missed: 0, percentage: changed},
  }
}

const MIN = {overall: 80, changed: 70}

describe('getCoverageStatus', function () {
  it('passes when both thresholds are met', function () {
    expect(getCoverageStatus(project(84.62, 75), MIN)).toEqual({
      overall: 84.62,
      changed: 75,
      difference: null,
      passed: true,
    })
  })

  it('fails when overall is below threshold', function () {
    expect(getCoverageStatus(project(20.41, 90), MIN).passed).toBe(false)
  })

  it('fails when changed lines are below threshold', function () {
    expect(getCoverageStatus(project(90, 10), MIN).passed).toBe(false)
  })

  it('passes when changed coverage is absent and overall passes', function () {
    expect(getCoverageStatus(project(90, null), MIN)).toEqual({
      overall: 90,
      changed: null,
      difference: null,
      passed: true,
    })
  })

  it('treats absent overall coverage as 100', function () {
    expect(getCoverageStatus(project(null, null), MIN)).toEqual({
      overall: 100,
      changed: null,
      difference: null,
      passed: true,
    })
  })

  it('computes the coverage drop caused by missed changed lines', function () {
    const withCounts: Project = {
      modules: [],
      isMultiModule: false,
      overall: {covered: 900, missed: 100, percentage: 90},
      changed: {covered: 40, missed: 10, percentage: 80},
    }
    expect(getCoverageStatus(withCounts, MIN).difference).toBe(-1)
  })
})

describe('getCheckTitle', function () {
  it('renders the overall coverage without a status symbol', function () {
    expect(
      getCheckTitle({
        overall: 84.62,
        changed: 75,
        difference: null,
        passed: true,
      })
    ).toBe('Overall 84.62%')
  })

  it('renders the same title format when failing', function () {
    expect(
      getCheckTitle({
        overall: 20.41,
        changed: 5,
        difference: null,
        passed: false,
      })
    ).toBe('Overall 20.41%')
  })

  it('renders whole numbers without decimals', function () {
    expect(
      getCheckTitle({
        overall: 100,
        changed: null,
        difference: null,
        passed: true,
      })
    ).toBe('Overall 100%')
  })

  it('appends the negative delta when coverage dropped', function () {
    expect(
      getCheckTitle({
        overall: 69.09,
        changed: 50,
        difference: -1.07,
        passed: false,
      })
    ).toBe('Overall 69.09% (-1.07%)')
  })

  it('omits a delta that rounds to zero', function () {
    expect(
      getCheckTitle({
        overall: 80.01,
        changed: 99,
        difference: -0.001,
        passed: true,
      })
    ).toBe('Overall 80.01%')
  })
})
