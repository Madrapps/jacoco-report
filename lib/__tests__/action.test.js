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
jest.mock('@actions/core');
jest.mock('@actions/github');
describe('Input validation', function () {
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
    function getInput(key) {
        switch (key) {
            case 'paths':
                return './__tests__/__fixtures__/report.xml';
            case 'token':
                return 'SMPLEHDjasdf876a987';
        }
    }
    const createComment = jest.fn();
    const listComments = jest.fn();
    const updateComment = jest.fn();
    core.getInput = jest.fn(getInput);
    github.getOctokit = jest.fn(() => {
        return {
            rest: {
                repos: {
                    compareCommits: jest.fn(() => {
                        return {
                            data: {
                                files: [
                                    {
                                        filename: 'src/main/kotlin/com/madrapps/jacoco/Math.kt',
                                        blob_url: 'https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/kotlin/com/madrapps/jacoco/Math.kt',
                                    },
                                    {
                                        filename: 'src/main/java/com/madrapps/jacoco/operation/StringOp.java',
                                        blob_url: 'https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/java/com/madrapps/jacoco/operation/StringOp.java',
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
    core.setFailed = jest.fn(c => {
        fail(c);
    });
    it('Fail if paths is not present', async () => {
        core.getInput = jest.fn(c => {
            switch (c) {
                case 'paths':
                    return '';
                default:
                    return getInput(c);
            }
        });
        github.context.eventName = 'pull_request';
        core.setFailed = jest.fn(c => {
            expect(c).toEqual("'paths' is missing");
        });
        await action.action();
    });
    it('Fail if token is not present', async () => {
        core.getInput = jest.fn(c => {
            switch (c) {
                case 'token':
                    return '';
                default:
                    return getInput(c);
            }
        });
        github.context.eventName = 'pull_request';
        core.setFailed = jest.fn(c => {
            expect(c).toEqual("'token' is missing");
        });
        await action.action();
    });
    it('Fail if comment-type is invalid', async () => {
        core.getInput = jest.fn(c => {
            switch (c) {
                case 'comment-type':
                    return 'invalid';
                default:
                    return getInput(c);
            }
        });
        core.setFailed = jest.fn(c => {
            expect(c).toEqual("'comment-type' invalid is invalid");
        });
        initContext(eventName, payload);
        await action.action();
    });
});
function initContext(eventName, payload) {
    const context = github.context;
    context.eventName = eventName;
    context.payload = payload;
    context.repo = 'jacoco-playground';
    context.owner = 'madrapps';
}
