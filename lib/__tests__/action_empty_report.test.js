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
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
const action = __importStar(require("../src/action"));
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const mocks_test_1 = require("./mocks.test");
jest.mock('@actions/core');
jest.mock('@actions/github');
describe('Single Empty report', function () {
    let createComment;
    let listComments;
    let updateComment;
    let output;
    function getInput(key) {
        switch (key) {
            case 'paths':
                return './__tests__/__fixtures__/empty-report.xml';
            case 'token':
                return 'SMPLEHDjasdf876a987';
            case 'comment-type':
                return 'pr_comment';
            case 'min-coverage-overall':
                return 45;
            case 'min-coverage-changed-files':
                return 80;
            case 'pass-emoji':
                return ':green_apple:';
            case 'fail-emoji':
                return ':x:';
            case 'debug-mode':
                return 'true';
        }
    }
    beforeEach(() => {
        createComment = jest.fn();
        listComments = jest.fn();
        updateComment = jest.fn();
        output = jest.fn();
        core.getInput = jest.fn(getInput);
        github.getOctokit = jest.fn(() => {
            return {
                rest: {
                    repos: {
                        compareCommits: jest.fn(() => {
                            return compareCommitsResponse;
                        }),
                        listPullRequestsAssociatedWithCommit: jest.fn(() => {
                            return { data: [] };
                        }),
                    },
                    issues: {
                        createComment,
                        listComments,
                        updateComment,
                    },
                },
            };
        });
        core.setFailed = jest.fn(c => {
            fail(c);
        });
    });
    const compareCommitsResponse = {
        data: {
            files: [
                {
                    filename: 'src/main/kotlin/com/madrapps/jacoco/Math.kt',
                    blob_url: 'https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/main/kotlin/com/madrapps/jacoco/Math.kt',
                    patch: mocks_test_1.PATCH.SINGLE_MODULE.MATH,
                },
                {
                    filename: 'src/main/java/com/madrapps/jacoco/Utility.java',
                    blob_url: 'https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/main/java/com/madrapps/jacoco/Utility.java',
                    patch: mocks_test_1.PATCH.SINGLE_MODULE.UTILITY,
                },
                {
                    filename: 'src/test/java/com/madrapps/jacoco/UtilityTest.java',
                    blob_url: 'https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/src/test/java/com/madrapps/jacoco/UtilityTest.java',
                    patch: mocks_test_1.PATCH.SINGLE_MODULE.UTILITY_TEST,
                },
                {
                    filename: '.github/workflows/coverage.yml',
                    blob_url: 'https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/.github/workflows/coverage.yml',
                    patch: mocks_test_1.PATCH.SINGLE_MODULE.COVERAGE,
                },
            ],
        },
    };
    describe('Pull Request event', function () {
        const eventName = 'pull_request';
        const payload = {
            pull_request: {
                number: '45',
                base: {
                    sha: 'guasft7asdtf78asfd87as6df7y2u3',
                },
                head: {
                    sha: 'aahsdflais76dfa78wrglghjkaghkj',
                },
            },
        };
        it('publish proper comment', async () => {
            initContext(eventName, payload);
            await action.action();
            expect(createComment.mock.calls[0][0].body).toEqual(PROPER_COMMENT);
        });
        it('set overall coverage output', async () => {
            initContext(eventName, payload);
            core.setOutput = output;
            await action.action();
            const out = output.mock.calls[0];
            expect(out).toEqual(['coverage-overall', 100]);
        });
        it('set changed files coverage output', async () => {
            initContext(eventName, payload);
            core.setOutput = output;
            await action.action();
            const out = output.mock.calls[1];
            expect(out).toEqual(['coverage-changed-files', 100]);
        });
        describe('With update-comment ON', function () {
            const title = 'JaCoCo Report';
            function mockInput(key) {
                switch (key) {
                    case 'title':
                        return title;
                    case 'update-comment':
                        return 'true';
                    default:
                        return getInput(key);
                }
            }
            it('if comment exists, update it', async () => {
                initContext(eventName, payload);
                core.getInput = jest.fn(key => {
                    return mockInput(key);
                });
                listComments.mockReturnValue({
                    data: [
                        { id: 1, body: 'some comment' },
                        { id: 2, body: `### ${title}\n to update` },
                    ],
                });
                await action.action();
                expect(updateComment.mock.calls[0][0].comment_id).toEqual(2);
                expect(createComment).toHaveBeenCalledTimes(0);
            });
            it('if comment does not exist, create new comment', async () => {
                initContext(eventName, payload);
                core.getInput = jest.fn(key => {
                    return mockInput(key);
                });
                listComments.mockReturnValue({
                    data: [{ id: 1, body: 'some comment' }],
                });
                await action.action();
                expect(createComment.mock.calls[0][0].body).not.toBeNull();
                expect(updateComment).toHaveBeenCalledTimes(0);
            });
            it('if title not set, warn user and create new comment', async () => {
                initContext(eventName, payload);
                core.getInput = jest.fn(c => {
                    switch (c) {
                        case 'title':
                            return '';
                        default:
                            return mockInput(c);
                    }
                });
                listComments.mockReturnValue({
                    data: [
                        { id: 1, body: 'some comment' },
                        { id: 2, body: `### ${title}\n to update` },
                    ],
                });
                await action.action();
                expect(core.info).toBeCalledWith("'title' not set. 'update-comment' doesn't work without 'title'");
                expect(createComment.mock.calls[0][0].body).not.toBeNull();
                expect(updateComment).toHaveBeenCalledTimes(0);
            });
        });
        describe('Skip if no changes set to true', function () {
            function mockInput() {
                core.getInput = jest.fn(c => {
                    switch (c) {
                        case 'skip-if-no-changes':
                            return 'true';
                        default:
                            return getInput(c);
                    }
                });
            }
            it("Don't add comment when report is empty", async () => {
                initContext(eventName, payload);
                mockInput();
                await action.action();
                expect(createComment).not.toHaveBeenCalled();
            });
            it("Don't add comment when coverage absent for changes files", async () => {
                initContext(eventName, payload);
                mockInput();
                github.getOctokit = jest.fn(() => {
                    return {
                        rest: {
                            repos: {
                                compareCommits: jest.fn(() => {
                                    return {
                                        data: {
                                            files: [
                                                {
                                                    filename: '.github/workflows/coverage.yml',
                                                    blob_url: 'https://github.com/thsaravana/jacoco-playground/blob/14a554976c0e5909d8e69bc8cce72958c49a7dc5/.github/workflows/coverage.yml',
                                                    patch: mocks_test_1.PATCH.SINGLE_MODULE.COVERAGE,
                                                },
                                            ],
                                        },
                                    };
                                }),
                            },
                            issues: {
                                createComment,
                                listComments,
                                updateComment,
                            },
                        },
                    };
                });
                await action.action();
                expect(createComment).not.toHaveBeenCalled();
            });
        });
        describe('With custom emoji', function () {
            it('publish proper comment', async () => {
                initContext(eventName, payload);
                core.getInput = jest.fn(key => {
                    switch (key) {
                        case 'pass-emoji':
                            return ':green_circle:';
                        case 'fail-emoji':
                            return 'red_circle';
                        default:
                            return getInput(key);
                    }
                });
                await action.action();
                expect(createComment.mock.calls[0][0].body).toEqual(`> There is no coverage information present for the Files changed`);
            });
        });
    });
    describe('Pull Request Target event', function () {
        const payload = {
            pull_request: {
                number: '45',
                base: {
                    sha: 'guasft7asdtf78asfd87as6df7y2u3',
                },
                head: {
                    sha: 'aahsdflais76dfa78wrglghjkaghkj',
                },
            },
        };
        it('set overall coverage output', async () => {
            initContext('pull_request_target', payload);
            core.setOutput = output;
            await action.action();
            const out = output.mock.calls[0];
            expect(out).toEqual(['coverage-overall', 100]);
        });
    });
    describe('Push event', function () {
        const payload = {
            before: 'guasft7asdtf78asfd87as6df7y2u3',
            after: 'aahsdflais76dfa78wrglghjkaghkj',
        };
        it('set overall coverage output', async () => {
            initContext('push', payload);
            core.setOutput = output;
            await action.action();
            const out = output.mock.calls[0];
            expect(out).toEqual(['coverage-overall', 100]);
        });
        it('set changed files coverage output', async () => {
            initContext('push', payload);
            core.setOutput = output;
            await action.action();
            const out = output.mock.calls[1];
            expect(out).toEqual(['coverage-changed-files', 100]);
        });
    });
    describe('Other than push or pull_request or pull_request_target event', function () {
        it('Fail by throwing appropriate error', async () => {
            initContext('pr_review', {});
            core.setFailed = jest.fn(c => {
                expect(c).toEqual('The event pr_review is not supported.');
            });
            core.setOutput = output;
            await action.action();
        });
    });
});
function initContext(eventName, payload) {
    const context = github.context;
    context.eventName = eventName;
    context.payload = payload;
    context.repo = 'jacoco-playground';
    context.owner = 'madrapps';
}
const PROPER_COMMENT = `> There is no coverage information present for the Files changed`;
