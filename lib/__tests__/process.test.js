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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const process = __importStar(require("../src/process"));
const mocks_test_1 = require("./mocks.test");
const util_1 = require("../src/util");
describe('process', function () {
    describe('get file coverage', function () {
        describe('empty report', function () {
            it('no files changed', async () => {
                const v = getEmptyReports();
                const reports = await v;
                const changedFiles = [];
                const actual = process.getProjectCoverage(reports, changedFiles);
                expect(actual).toEqual({
                    modules: [],
                    isMultiModule: false,
                    'coverage-changed-files': 100,
                    overall: null,
                    changed: null,
                });
            });
            it('one file changed', async () => {
                const reports = await getEmptyReports();
                const changedFiles = mocks_test_1.CHANGED_FILE.SINGLE_MODULE.filter(file => {
                    return file.filePath.endsWith('Math.kt');
                });
                const actual = process.getProjectCoverage(reports, changedFiles);
                expect(actual).toEqual({
                    modules: [],
                    isMultiModule: false,
                    'coverage-changed-files': 100,
                    overall: null,
                    changed: null,
                });
            });
            it('multiple files changed', async () => {
                const reports = await getEmptyReports();
                const changedFiles = mocks_test_1.CHANGED_FILE.SINGLE_MODULE;
                const actual = process.getProjectCoverage(reports, changedFiles);
                expect(actual).toEqual({
                    modules: [],
                    isMultiModule: false,
                    'coverage-changed-files': 100,
                    overall: null,
                    changed: null,
                });
            });
        });
        describe('single report', function () {
            it('no files changed', async () => {
                const v = getSingleReports();
                const reports = await v;
                const changedFiles = [];
                const actual = process.getProjectCoverage(reports, changedFiles);
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
                });
            });
            it('one file changed', async () => {
                const reports = await getSingleReports();
                const changedFiles = mocks_test_1.CHANGED_FILE.SINGLE_MODULE.filter(file => {
                    return file.filePath.endsWith('Math.kt');
                });
                const actual = process.getProjectCoverage(reports, changedFiles);
                expect(actual).toEqual({
                    'coverage-changed-files': 42,
                    isMultiModule: false,
                    modules: [
                        {
                            files: [
                                {
                                    lines: [
                                        {
                                            branch: { covered: 1, missed: 1, percentage: 50 },
                                            instruction: { covered: 3, missed: 0, percentage: 100 },
                                            number: 6,
                                        },
                                        {
                                            branch: { covered: 0, missed: 2, percentage: 0 },
                                            instruction: { covered: 0, missed: 3, percentage: 0 },
                                            number: 13,
                                        },
                                        {
                                            branch: { covered: 0, missed: 0, percentage: 0 },
                                            instruction: { covered: 0, missed: 4, percentage: 0 },
                                            number: 14,
                                        },
                                        {
                                            branch: { covered: 0, missed: 0, percentage: 0 },
                                            instruction: { covered: 0, missed: 4, percentage: 0 },
                                            number: 16,
                                        },
                                        {
                                            branch: { covered: 1, missed: 1, percentage: 50 },
                                            instruction: { covered: 3, missed: 0, percentage: 100 },
                                            number: 26,
                                        },
                                        {
                                            branch: { covered: 0, missed: 0, percentage: 0 },
                                            instruction: { covered: 4, missed: 0, percentage: 100 },
                                            number: 27,
                                        },
                                        {
                                            branch: { covered: 0, missed: 0, percentage: 0 },
                                            instruction: { covered: 0, missed: 4, percentage: 0 },
                                            number: 29,
                                        },
                                        {
                                            branch: { covered: 0, missed: 0, percentage: 0 },
                                            instruction: { covered: 0, missed: 6, percentage: 0 },
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
                });
            });
            it('multiple files changed', async () => {
                const reports = await getSingleReports();
                const changedFiles = mocks_test_1.CHANGED_FILE.SINGLE_MODULE;
                const actual = process.getProjectCoverage(reports, changedFiles);
                expect(actual).toEqual(mocks_test_1.PROJECT.SINGLE_MODULE);
            });
        });
        describe('multiple reports', function () {
            it('no files changed', async () => {
                const reports = await getMultipleReports();
                const changedFiles = [];
                const actual = process.getProjectCoverage(reports, changedFiles);
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
                });
            });
            it('one file changed', async () => {
                const reports = await getMultipleReports();
                const changedFiles = mocks_test_1.CHANGED_FILE.MULTI_MODULE.filter(file => {
                    return file.filePath.endsWith('StringOp.java');
                });
                const actual = process.getProjectCoverage(reports, changedFiles);
                expect(actual).toEqual({
                    'coverage-changed-files': 84.62,
                    isMultiModule: true,
                    modules: [
                        {
                            files: [
                                {
                                    lines: [
                                        {
                                            branch: { covered: 0, missed: 0, percentage: 0 },
                                            instruction: { covered: 3, missed: 0, percentage: 100 },
                                            number: 6,
                                        },
                                        {
                                            branch: { covered: 0, missed: 0, percentage: 0 },
                                            instruction: { covered: 0, missed: 2, percentage: 0 },
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
                });
            });
            it('multiple files changed', async () => {
                const reports = await getMultipleReports();
                const changedFiles = mocks_test_1.CHANGED_FILE.MULTI_MODULE;
                const actual = process.getProjectCoverage(reports, changedFiles);
                expect(actual).toEqual(mocks_test_1.PROJECT.MULTI_MODULE);
            });
        });
        describe('aggregate reports', function () {
            it('no files changed', async () => {
                const reports = await getAggregateReport();
                const changedFiles = [];
                const actual = process.getProjectCoverage(reports, changedFiles);
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
                });
            });
            it('one file changed', async () => {
                const reports = await getAggregateReport();
                const changedFiles = mocks_test_1.CHANGED_FILE.MULTI_MODULE.filter(file => {
                    return file.filePath.endsWith('MainViewModel.kt');
                });
                const actual = process.getProjectCoverage(reports, changedFiles);
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
                });
            });
            it('multiple files changed', async () => {
                const reports = await getAggregateReport();
                const changedFiles = mocks_test_1.CHANGED_FILE.MULTI_MODULE.filter(file => {
                    return (file.filePath.endsWith('MainViewModel.kt') ||
                        file.filePath.endsWith('Math.kt') ||
                        file.filePath.endsWith('OnClickEvent.kt'));
                });
                const actual = process.getProjectCoverage(reports, changedFiles);
                expect(actual).toEqual({
                    'coverage-changed-files': 65.91,
                    isMultiModule: true,
                    modules: [
                        {
                            files: [
                                {
                                    lines: [
                                        {
                                            branch: { covered: 0, missed: 0, percentage: 0 },
                                            instruction: { covered: 0, missed: 5, percentage: 0 },
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
                });
            });
        });
    });
});
async function getAggregateReport() {
    const reportPath = './__tests__/__fixtures__/aggregate-report.xml';
    const report = await getReport(reportPath);
    return [report];
}
async function getMultipleReports() {
    const testFolder = './__tests__/__fixtures__/multi_module';
    return Promise.all(fs_1.default.readdirSync(testFolder).map(async (file) => {
        const reportPath = `${testFolder}/${file}`;
        return await getReport(reportPath);
    }));
}
async function getSingleReports() {
    const reportPath = './__tests__/__fixtures__/report.xml';
    const report = await getReport(reportPath);
    return [report];
}
async function getEmptyReports() {
    const reportPath = './__tests__/__fixtures__/empty-report.xml';
    const report = await getReport(reportPath);
    return [report];
}
async function getReport(path) {
    const reportXml = await fs_1.default.promises.readFile(path, 'utf-8');
    return (0, util_1.parseToReport)(reportXml);
}
