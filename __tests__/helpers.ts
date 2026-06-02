import {jest} from '@jest/globals'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MockFn = ReturnType<typeof jest.fn<(...args: any[]) => any>>

export interface MockCore {
  getInput: MockFn
  setFailed: MockFn
  setOutput: MockFn
  info: MockFn
  debug: MockFn
  error: MockFn
  warning: MockFn
  summary: {addRaw: MockFn; write: MockFn}
}

export interface MockContext {
  eventName: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: Record<string, any>
  repo: {owner: string; repo: string}
  sha: string
}

export interface MockGithub {
  getOctokit: MockFn
  context: MockContext
}

export function createMockCore(): MockCore {
  return {
    getInput: jest.fn(),
    setFailed: jest.fn(),
    setOutput: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    summary: {
      addRaw: jest.fn().mockReturnThis(),
      write: jest.fn().mockReturnThis(),
    },
  }
}

export function createMockContext(): MockContext {
  return {
    eventName: '',
    payload: {},
    repo: {owner: '', repo: ''},
    sha: '',
  }
}

export function createMockGithub(context: MockContext): MockGithub {
  return {
    getOctokit: jest.fn(),
    context,
  }
}
