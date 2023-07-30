"use strict";
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
// @ts-nocheck
const core_1 = __importDefault(require("@actions/core"));
const github_1 = __importDefault(require("@actions/github"));
const fs_1 = __importDefault(require("fs"));
const xml2js_1 = __importDefault(require("xml2js"));
const processors_1 = require("xml2js/lib/processors");
const glob_1 = __importDefault(require("@actions/glob"));
const process_1 = require("./process");
const render_1 = require("./render");
const util_1 = require("./util");
function action() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const token = core_1.default.getInput('token');
            if (!token) {
                core_1.default.setFailed("'token' is missing");
                return;
            }
            const pathsString = core_1.default.getInput('paths');
            if (!pathsString) {
                core_1.default.setFailed("'paths' is missing");
                return;
            }
            const reportPaths = pathsString.split(',');
            const minCoverageOverall = parseFloat(core_1.default.getInput('min-coverage-overall'));
            const minCoverageChangedFiles = parseFloat(core_1.default.getInput('min-coverage-changed-files'));
            const title = core_1.default.getInput('title');
            const updateComment = (0, processors_1.parseBooleans)(core_1.default.getInput('update-comment'));
            if (updateComment) {
                if (!title) {
                    core_1.default.info("'title' is not set. 'update-comment' does not work without 'title'");
                }
            }
            const skipIfNoChanges = (0, processors_1.parseBooleans)(core_1.default.getInput('skip-if-no-changes'));
            const passEmoji = core_1.default.getInput('pass-emoji');
            const failEmoji = core_1.default.getInput('fail-emoji');
            const debugMode = (0, processors_1.parseBooleans)(core_1.default.getInput('debug-mode'));
            const event = github_1.default.context.eventName;
            core_1.default.info(`Event is ${event}`);
            if (debugMode) {
                core_1.default.info(`passEmoji: ${passEmoji}`);
                core_1.default.info(`failEmoji: ${failEmoji}`);
            }
            let base;
            let head;
            let prNumber;
            switch (event) {
                case 'pull_request':
                case 'pull_request_target':
                    base = github_1.default.context.payload.pull_request.base.sha;
                    head = github_1.default.context.payload.pull_request.head.sha;
                    prNumber = github_1.default.context.payload.pull_request.number;
                    break;
                case 'push':
                    base = github_1.default.context.payload.before;
                    head = github_1.default.context.payload.after;
                    break;
                default:
                    core_1.default.setFailed(`Only pull requests and pushes are supported, ${github_1.default.context.eventName} not supported.`);
                    return;
            }
            core_1.default.info(`base sha: ${base}`);
            core_1.default.info(`head sha: ${head}`);
            const client = github_1.default.getOctokit(token);
            if (debugMode)
                core_1.default.info(`reportPaths: ${reportPaths}`);
            const reportsJsonAsync = getJsonReports(reportPaths, debugMode);
            const changedFiles = yield getChangedFiles(base, head, client);
            if (debugMode)
                core_1.default.info(`changedFiles: ${(0, util_1.debug)(changedFiles)}`);
            const reportsJson = yield reportsJsonAsync;
            const reports = reportsJson.map(report => report['report']);
            const project = (0, process_1.getProjectCoverage)(reports, changedFiles);
            if (debugMode)
                core_1.default.info(`project: ${(0, util_1.debug)(project)}`);
            core_1.default.setOutput('coverage-overall', parseFloat(project.overall.percentage.toFixed(2)));
            core_1.default.setOutput('coverage-changed-files', parseFloat(project['coverage-changed-files'].toFixed(2)));
            const skip = skipIfNoChanges && project.modules.length === 0;
            if (debugMode)
                core_1.default.info(`skip: ${skip}`);
            if (debugMode)
                core_1.default.info(`prNumber: ${prNumber}`);
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
            core_1.default.setFailed(error);
        }
    });
}
function getJsonReports(xmlPaths, debugMode) {
    return __awaiter(this, void 0, void 0, function* () {
        const globber = yield glob_1.default.create(xmlPaths.join('\n'));
        const files = yield globber.glob();
        if (debugMode)
            core_1.default.info(`Resolved files: ${files}`);
        return Promise.all(files.map((path) => __awaiter(this, void 0, void 0, function* () {
            const reportXml = yield fs_1.default.promises.readFile(path.trim(), 'utf-8');
            return yield xml2js_1.default.parseStringPromise(reportXml);
        })));
    });
}
function getChangedFiles(base, head, client) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield client.rest.repos.compareCommits({
            base,
            head,
            owner: github_1.default.context.repo.owner,
            repo: github_1.default.context.repo.repo,
        });
        const changedFiles = [];
        response.data.files.forEach(file => {
            const changedFile = {
                filePath: file.filename,
                url: file.blob_url,
                lines: (0, util_1.getChangedLines)(file.patch),
            };
            changedFiles.push(changedFile);
        });
        return changedFiles;
    });
}
function addComment(prNumber, update, title, body, client, debugMode) {
    return __awaiter(this, void 0, void 0, function* () {
        let commentUpdated = false;
        if (debugMode)
            core_1.default.info(`update: ${update}`);
        if (debugMode)
            core_1.default.info(`title: ${title}`);
        if (debugMode)
            core_1.default.info(`JaCoCo Comment: ${body}`);
        if (update && title) {
            if (debugMode)
                core_1.default.info('Listing all comments');
            const comments = yield client.rest.issues.listComments(Object.assign({ issue_number: prNumber }, github_1.default.context.repo));
            const comment = comments.data.find(comment => comment.body.startsWith(title));
            if (comment) {
                if (debugMode)
                    core_1.default.info(`Updating existing comment: id=${comment.id} \n body=${comment.body}`);
                yield client.rest.issues.updateComment(Object.assign({ comment_id: comment.id, body }, github_1.default.context.repo));
                commentUpdated = true;
            }
        }
        if (!commentUpdated) {
            if (debugMode)
                core_1.default.info('Creating a new comment');
            yield client.rest.issues.createComment(Object.assign({ issue_number: prNumber, body }, github_1.default.context.repo));
        }
    });
}
module.exports = {
    action,
};
