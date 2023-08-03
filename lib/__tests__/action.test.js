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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const action = __importStar(require("../src/action"));
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
jest.mock('@actions/core');
jest.mock('@actions/github');
describe('Input validation', function () {
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
    /* eslint-disable @typescript-eslint/ban-ts-comment */
    // @ts-ignore
    core.getInput = jest.fn(getInput);
    // @ts-ignore
    github.getOctokit = jest.fn(() => {
        return {
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
        };
    });
    // @ts-ignore
    core.setFailed = jest.fn(c => {
        fail(c);
    });
    it('Fail if paths is not present', () => __awaiter(this, void 0, void 0, function* () {
        // @ts-ignore
        core.getInput = jest.fn(c => {
            switch (c) {
                case 'paths':
                    return '';
                default:
                    return getInput(c);
            }
        });
        github.context.eventName = 'pull_request';
        // @ts-ignore
        core.setFailed = jest.fn(c => {
            expect(c).toEqual("'paths' is missing");
        });
        yield action.action();
    }));
    it('Fail if token is not present', () => __awaiter(this, void 0, void 0, function* () {
        // @ts-ignore
        core.getInput = jest.fn(c => {
            switch (c) {
                case 'token':
                    return '';
                default:
                    return getInput(c);
            }
        });
        github.context.eventName = 'pull_request';
        // @ts-ignore
        core.setFailed = jest.fn(c => {
            expect(c).toEqual("'token' is missing");
        });
        yield action.action();
    }));
});
