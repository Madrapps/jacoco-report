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
const inputs_1 = require("../src/inputs");
const core = __importStar(require("@actions/core"));
jest.mock('@actions/core');
describe('getInputFields', function () {
    describe('WHEN token is missing', function () {
        const input = jest.fn(c => {
            switch (c) {
                case 'token':
                    return '';
            }
        });
        it('THEN return undefined', function () {
            core.getInput = input;
            const result = (0, inputs_1.getInputFields)();
            expect(result).toBeUndefined();
        });
        it('THEN setFailed is called', function () {
            core.getInput = input;
            (0, inputs_1.getInputFields)();
            expect(core.setFailed).toBeCalledWith("'token' is missing");
        });
    });
    describe('WHEN paths is missing', function () {
        const input = jest.fn(c => {
            switch (c) {
                case 'token':
                    return 'token';
                case 'paths':
                    return '';
            }
        });
        it('THEN return undefined', function () {
            core.getInput = input;
            const result = (0, inputs_1.getInputFields)();
            expect(result).toBeUndefined();
        });
        it('THEN setFailed is called', function () {
            core.getInput = input;
            (0, inputs_1.getInputFields)();
            expect(core.setFailed).toBeCalledWith("'paths' is missing");
        });
    });
    describe('WHEN comment-type is invalid', function () {
        const input = jest.fn(c => {
            switch (c) {
                case 'token':
                    return 'token';
                case 'paths':
                    return './__tests__/__fixtures__/report.xml';
                case 'comment-type':
                    return 'some-invalid-type';
            }
        });
        it('THEN return undefined', function () {
            core.getInput = input;
            const result = (0, inputs_1.getInputFields)();
            expect(result).toBeUndefined();
        });
        it('THEN setFailed is called', function () {
            core.getInput = input;
            (0, inputs_1.getInputFields)();
            expect(core.setFailed).toBeCalledWith("'comment-type' some-invalid-type is invalid");
        });
    });
    it('WHEN all inputs are present THEN return proper input fields', function () {
        core.getInput = jest.fn(c => {
            switch (c) {
                case 'token':
                    return 'SMPLEHDjasdf876a987';
                case 'paths':
                    return './__tests__/__fixtures__/report.xml';
                case 'min-coverage-overall':
                    return '80';
                case 'min-coverage-changed-files':
                    return '70';
                case 'title':
                    return 'title';
                case 'update-comment':
                    return 'true';
                case 'skip-if-no-changes':
                    return 'true';
                case 'pass-emoji':
                    return 'pass-emoji';
                case 'fail-emoji':
                    return 'fail-emoji';
                case 'continue-on-error':
                    return 'true';
                case 'debug-mode':
                    return 'true';
                case 'comment-type':
                    return 'pr_comment';
                case 'pr-number':
                    return '45';
            }
        });
        const result = (0, inputs_1.getInputFields)();
        expect(result).toEqual({
            commentType: 'pr_comment',
            continueOnError: true,
            debugMode: true,
            emoji: {
                pass: 'pass-emoji',
                fail: 'fail-emoji',
            },
            minCoverage: {
                changed: 70,
                overall: 80,
            },
            pathsString: './__tests__/__fixtures__/report.xml',
            prNumber: 45,
            skipIfNoChanges: true,
            title: 'title',
            token: 'SMPLEHDjasdf876a987',
            updateComment: true,
        });
    });
    it('WHEN min-coverage-overall is present THEN return proper value', function () {
        core.getInput = jest.fn(c => {
            switch (c) {
                case 'min-coverage-overall':
                    return '80';
                default:
                    return getRequiredInputs(c);
            }
        });
        const result = (0, inputs_1.getInputFields)();
        expect(result.minCoverage.overall).toBe(80);
    });
    it('WHEN min-coverage-changed-files is present THEN return proper value', function () {
        core.getInput = jest.fn(c => {
            switch (c) {
                case 'min-coverage-changed-files':
                    return '70';
                default:
                    return getRequiredInputs(c);
            }
        });
        const result = (0, inputs_1.getInputFields)();
        expect(result.minCoverage.changed).toBe(70);
    });
    it('WHEN title is present THEN return proper value', function () {
        core.getInput = jest.fn(c => {
            switch (c) {
                case 'title':
                    return '`:lobster:` Coverage Info';
                default:
                    return getRequiredInputs(c);
            }
        });
        const result = (0, inputs_1.getInputFields)();
        expect(result.title).toBe('`:lobster:` Coverage Info');
    });
    describe('WHEN update-comment is present', function () {
        it('AND it is false THEN return proper value', function () {
            core.getInput = jest.fn(c => {
                switch (c) {
                    case 'update-comment':
                        return 'false';
                    default:
                        return getRequiredInputs(c);
                }
            });
            const result = (0, inputs_1.getInputFields)();
            expect(result.updateComment).toBe(false);
        });
        describe('AND it is true', function () {
            it('AND title is not present THEN set info', function () {
                core.getInput = jest.fn(c => {
                    switch (c) {
                        case 'update-comment':
                            return 'true';
                        case 'title':
                            return '';
                        default:
                            return getRequiredInputs(c);
                    }
                });
                const result = (0, inputs_1.getInputFields)();
                expect(result.updateComment).toBe(true);
                expect(core.info).toBeCalledWith("'title' not set. 'update-comment' doesn't work without 'title'");
            });
            it('AND title is present THEN return proper value', function () {
                core.getInput = jest.fn(c => {
                    switch (c) {
                        case 'update-comment':
                            return 'true';
                        case 'title':
                            return 'title';
                        default:
                            return getRequiredInputs(c);
                    }
                });
                const result = (0, inputs_1.getInputFields)();
                expect(result.updateComment).toBe(true);
            });
        });
    });
    describe('WHEN skip-if-no-changes is present', function () {
        it('AND it is false THEN return proper value', function () {
            core.getInput = jest.fn(c => {
                switch (c) {
                    case 'skip-if-no-changes':
                        return 'false';
                    default:
                        return getRequiredInputs(c);
                }
            });
            const result = (0, inputs_1.getInputFields)();
            expect(result.skipIfNoChanges).toBe(false);
        });
        it('AND it is true THEN return proper value', function () {
            core.getInput = jest.fn(c => {
                switch (c) {
                    case 'skip-if-no-changes':
                        return 'true';
                    default:
                        return getRequiredInputs(c);
                }
            });
            const result = (0, inputs_1.getInputFields)();
            expect(result.skipIfNoChanges).toBe(true);
        });
    });
    it('WHEN pass-emoji is present THEN return proper value', function () {
        core.getInput = jest.fn(c => {
            switch (c) {
                case 'pass-emoji':
                    return 'pass-emoji';
                default:
                    return getRequiredInputs(c);
            }
        });
        const result = (0, inputs_1.getInputFields)();
        expect(result.emoji.pass).toBe('pass-emoji');
    });
    it('WHEN fail-emoji is present THEN return proper value', function () {
        core.getInput = jest.fn(c => {
            switch (c) {
                case 'fail-emoji':
                    return 'fail-emoji';
                default:
                    return getRequiredInputs(c);
            }
        });
        const result = (0, inputs_1.getInputFields)();
        expect(result.emoji.fail).toBe('fail-emoji');
    });
    describe('WHEN continue-on-error is present', function () {
        it('AND it is false THEN return proper value', function () {
            core.getInput = jest.fn(c => {
                switch (c) {
                    case 'continue-on-error':
                        return 'false';
                    default:
                        return getRequiredInputs(c);
                }
            });
            const result = (0, inputs_1.getInputFields)();
            expect(result.continueOnError).toBe(false);
        });
        it('AND it is true THEN return proper value', function () {
            core.getInput = jest.fn(c => {
                switch (c) {
                    case 'continue-on-error':
                        return 'true';
                    default:
                        return getRequiredInputs(c);
                }
            });
            const result = (0, inputs_1.getInputFields)();
            expect(result.continueOnError).toBe(true);
        });
    });
    describe('WHEN debug-mode is present', function () {
        it('AND it is false THEN return proper value', function () {
            core.getInput = jest.fn(c => {
                switch (c) {
                    case 'debug-mode':
                        return 'false';
                    default:
                        return getRequiredInputs(c);
                }
            });
            const result = (0, inputs_1.getInputFields)();
            expect(result.debugMode).toBe(false);
        });
        it('AND it is true THEN return proper value', function () {
            core.getInput = jest.fn(c => {
                switch (c) {
                    case 'debug-mode':
                        return 'true';
                    default:
                        return getRequiredInputs(c);
                }
            });
            const result = (0, inputs_1.getInputFields)();
            expect(result.debugMode).toBe(true);
        });
    });
    it('WHEN pr-number is present THEN return proper value', function () {
        core.getInput = jest.fn(c => {
            switch (c) {
                case 'pr-number':
                    return '45';
                default:
                    return getRequiredInputs(c);
            }
        });
        const result = (0, inputs_1.getInputFields)();
        expect(result.prNumber).toBe(45);
    });
});
function getRequiredInputs(key) {
    switch (key) {
        case 'paths':
            return './__tests__/__fixtures__/report.xml';
        case 'token':
            return 'SMPLEHDjasdf876a987';
        case 'comment-type':
            return 'pr_comment';
    }
}
