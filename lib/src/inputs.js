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
exports.getInputFields = getInputFields;
const core = __importStar(require("@actions/core"));
const processors_1 = require("xml2js/lib/processors");
const validCommentTypes = ['pr_comment', 'summary', 'both'];
function getInputFields() {
    const token = getRequiredField('token');
    if (!token)
        return undefined;
    const pathsString = getRequiredField('paths');
    if (!pathsString)
        return undefined;
    const minCoverageOverall = getFloatField('min-coverage-overall');
    const minCoverageChangedFiles = getFloatField('min-coverage-changed-files');
    const title = getInput('title');
    const updateComment = getBooleanField('update-comment');
    if (updateComment && !title) {
        core.info("'title' not set. 'update-comment' doesn't work without 'title'");
    }
    const skipIfNoChanges = getBooleanField('skip-if-no-changes');
    const passEmoji = getInput('pass-emoji');
    const failEmoji = getInput('fail-emoji');
    const continueOnError = getBooleanField('continue-on-error');
    const debugMode = getBooleanField('debug-mode');
    const commentType = getInput('comment-type');
    if (!isValidCommentType(commentType)) {
        core.setFailed(`'comment-type' ${commentType} is invalid`);
        return undefined;
    }
    const prNumber = Number(getInput('pr-number')) || undefined;
    return {
        token,
        pathsString,
        minCoverage: {
            overall: minCoverageOverall,
            changed: minCoverageChangedFiles,
        },
        title,
        updateComment,
        skipIfNoChanges,
        emoji: { pass: passEmoji, fail: failEmoji },
        continueOnError,
        debugMode,
        commentType,
        prNumber,
    };
}
function getRequiredField(inputField) {
    const input = getInput(inputField);
    if (!input) {
        core.setFailed(`'${inputField}' is missing`);
        return undefined;
    }
    return input;
}
function getFloatField(inputField) {
    return parseFloat(getInput(inputField));
}
function getBooleanField(inputField) {
    return (0, processors_1.parseBooleans)(getInput(inputField));
}
function getInput(inputField) {
    const field = core.getInput(inputField);
    core.info(`${inputField}: ${field}`);
    return field;
}
/* eslint-disable @typescript-eslint/no-explicit-any */
const isValidCommentType = (value) => validCommentTypes.includes(value);
