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
describe('Aggregate report', function () {
    let createComment;
    let listComments;
    let updateComment;
    let output;
    function getInput(key) {
        switch (key) {
            case 'paths':
                return './__tests__/__fixtures__/aggregate-report.xml';
            case 'token':
                return 'SMPLEHDjasdf876a987';
            case 'min-coverage-overall':
                return 45;
            case 'min-coverage-changed-files':
                return 90;
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
                    filename: 'app/src/main/java/com/madrapps/playground/MainViewModel.kt',
                    blob_url: 'https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app/src/main/java/com/madrapps/playground/MainViewModel.kt',
                    patch: mocks_test_1.PATCH.MULTI_MODULE.MAIN_VIEW_MODEL,
                },
                {
                    filename: 'math/src/main/java/com/madrapps/math/Math.kt',
                    blob_url: 'https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/math/src/main/java/com/madrapps/math/Math.kt',
                    patch: mocks_test_1.PATCH.MULTI_MODULE.MATH,
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
            expect(createComment.mock.calls[0][0].body)
                .toEqual(`|Overall Project|76.32% **\`-0.01%\`**|:green_apple:|
|:-|:-|:-:|
|Files changed|0%|:x:|
<br>

|Module|Coverage||
|:-|:-|:-:|
|module-2|70.37% **\`-18.52%\`**|:x:|
|module-3|8.33%|:green_apple:|

<details>
<summary>Files</summary>

|Module|File|Coverage||
|:-|:-|:-|:-:|
|module-2|[Math.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/math/src/main/java/com/madrapps/math/Math.kt)|70.37% **\`-18.52%\`**|:x:|
|module-3|[MainViewModel.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app/src/main/java/com/madrapps/playground/MainViewModel.kt)|58.82%|:green_apple:|

</details>`);
        });
        it('updates a previous comment', async () => {
            initContext(eventName, payload);
            const title = 'JaCoCo Report';
            core.getInput = jest.fn(c => {
                switch (c) {
                    case 'title':
                        return title;
                    case 'update-comment':
                        return 'true';
                    default:
                        return getInput(c);
                }
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
        it('set overall coverage output', async () => {
            initContext(eventName, payload);
            core.setOutput = output;
            await action.action();
            const out = output.mock.calls[0];
            expect(out).toEqual(['coverage-overall', 76.32]);
        });
        it('set changed files coverage output', async () => {
            initContext(eventName, payload);
            core.setOutput = output;
            await action.action();
            const out = output.mock.calls[1];
            expect(out).toEqual(['coverage-changed-files', 65.91]);
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
