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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.action = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const fs = __importStar(require("fs"));
const xml2js_1 = __importDefault(require("xml2js"));
const processors_1 = require("xml2js/lib/processors");
const glob = __importStar(require("@actions/glob"));
const process_1 = require("./process");
const render_1 = require("./render");
const util_1 = require("./util");
function action() {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        let continueOnError = true;
        try {
            const token = core.getInput('token');
            if (!token) {
                core.setFailed("'token' is missing");
                return;
            }
            const pathsString = core.getInput('paths');
            if (!pathsString) {
                core.setFailed("'paths' is missing");
                return;
            }
            const reportPaths = pathsString.split(',');
            const minCoverageOverall = parseFloat(core.getInput('min-coverage-overall'));
            const minCoverageChangedFiles = parseFloat(core.getInput('min-coverage-changed-files'));
            const title = core.getInput('title');
            const updateComment = (0, processors_1.parseBooleans)(core.getInput('update-comment'));
            if (updateComment) {
                if (!title) {
                    core.info("'title' is not set. 'update-comment' does not work without 'title'");
                }
            }
            const skipIfNoChanges = (0, processors_1.parseBooleans)(core.getInput('skip-if-no-changes'));
            const passEmoji = core.getInput('pass-emoji');
            const failEmoji = core.getInput('fail-emoji');
            continueOnError = (0, processors_1.parseBooleans)(core.getInput('continue-on-error'));
            const debugMode = (0, processors_1.parseBooleans)(core.getInput('debug-mode'));
            const event = github.context.eventName;
            core.info(`Event is ${event}`);
            if (debugMode) {
                core.info(`passEmoji: ${passEmoji}`);
                core.info(`failEmoji: ${failEmoji}`);
            }
            const client = github.getOctokit(token);
            let base;
            let head;
            let prNumber;
            switch (event) {
                case 'pull_request':
                case 'pull_request_target':
                    base = (_a = github.context.payload.pull_request) === null || _a === void 0 ? void 0 : _a.base.sha;
                    head = (_b = github.context.payload.pull_request) === null || _b === void 0 ? void 0 : _b.head.sha;
                    prNumber = (_c = github.context.payload.pull_request) === null || _c === void 0 ? void 0 : _c.number;
                    break;
                case 'push':
                    base = github.context.payload.before;
                    head = github.context.payload.after;
                    const prs = (yield client.rest.repos.listPullRequestsAssociatedWithCommit({
                        commit_sha: github.context.sha,
                        owner: github.context.repo.owner,
                        repo: github.context.repo.repo,
                    })).data;
                    if (prs.length > 0) {
                        prNumber = prs[0].number;
                    }
                    break;
                default:
                    core.setFailed(`Only pull requests and pushes are supported, ${github.context.eventName} not supported.`);
                    return;
            }
            core.info(`base sha: ${base}`);
            core.info(`head sha: ${head}`);
            if (debugMode)
                core.info(`reportPaths: ${reportPaths}`);
            const reportsJsonAsync = getJsonReports(reportPaths, debugMode);
            const changedFiles = yield getChangedFiles(base, head, client, debugMode);
            if (debugMode)
                core.info(`changedFiles: ${(0, util_1.debug)(changedFiles)}`);
            const reportsJson = yield reportsJsonAsync;
            const reports = reportsJson.map(report => report['report']);
            const project = (0, process_1.getProjectCoverage)(reports, changedFiles);
            if (debugMode)
                core.info(`project: ${(0, util_1.debug)(project)}`);
            core.setOutput('coverage-overall', parseFloat(((_d = project.overall.percentage) !== null && _d !== void 0 ? _d : 0).toFixed(2)));
            core.setOutput('coverage-changed-files', parseFloat(project['coverage-changed-files'].toFixed(2)));
            const skip = skipIfNoChanges && project.modules.length === 0;
            if (debugMode)
                core.info(`skip: ${skip}`);
            if (debugMode)
                core.info(`prNumber: ${prNumber}`);
            if (prNumber != null && !skip) {
                const emoji = {
                    pass: passEmoji,
                    fail: failEmoji,
                };
                yield addComment(prNumber, updateComment, (0, render_1.getTitle)(title), (0, render_1.getPRComment)(project, {
                    overall: minCoverageOverall,
                    changed: minCoverageChangedFiles,
                }, title, emoji), client, debugMode);
            }
        }
        catch (error) {
            if (error instanceof Error) {
                if (continueOnError) {
                    core.error(error);
                }
                else {
                    core.setFailed(error);
                }
            }
        }
    });
}
exports.action = action;
function getJsonReports(xmlPaths, debugMode) {
    return __awaiter(this, void 0, void 0, function* () {
        const globber = yield glob.create(xmlPaths.join('\n'));
        const files = yield globber.glob();
        if (debugMode)
            core.info(`Resolved files: ${files}`);
        return Promise.all(files.map((path) => __awaiter(this, void 0, void 0, function* () {
            const reportXml = yield fs.promises.readFile(path.trim(), 'utf-8');
            return yield xml2js_1.default.parseStringPromise(reportXml);
        })));
    });
}
function getChangedFiles(base, head, client, debugMode) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield client.rest.repos.compareCommits({
            base,
            head,
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
        });
        const changedFiles = [];
        for (const file of response.data.files) {
            if (debugMode)
                core.info(`file: ${(0, util_1.debug)(file)}`);
            const changedFile = {
                filePath: file.filename,
                url: file.blob_url,
                lines: (0, util_1.getChangedLines)(file.patch),
            };
            changedFiles.push(changedFile);
        }
        return changedFiles;
    });
}
function addComment(prNumber, update, title, body, client, debugMode) {
    return __awaiter(this, void 0, void 0, function* () {
        let commentUpdated = false;
        if (debugMode)
            core.info(`update: ${update}`);
        if (debugMode)
            core.info(`title: ${title}`);
        if (debugMode)
            core.info(`JaCoCo Comment: ${body}`);
        if (update && title) {
            if (debugMode)
                core.info('Listing all comments');
            const comments = yield client.rest.issues.listComments(Object.assign({ issue_number: prNumber }, github.context.repo));
            const comment = comments.data.find((it) => it.body.startsWith(title));
            if (comment) {
                if (debugMode)
                    core.info(`Updating existing comment: id=${comment.id} \n body=${comment.body}`);
                yield client.rest.issues.updateComment(Object.assign({ comment_id: comment.id, body }, github.context.repo));
                commentUpdated = true;
            }
        }
        if (!commentUpdated) {
            if (debugMode)
                core.info('Creating a new comment');
            yield client.rest.issues.createComment(Object.assign({ issue_number: prNumber, body }, github.context.repo));
        }
    });
}
