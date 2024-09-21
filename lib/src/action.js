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
exports.action = action;
/* eslint-disable @typescript-eslint/no-explicit-any */
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const fs = __importStar(require("fs"));
const glob = __importStar(require("@actions/glob"));
const process_1 = require("./process");
const render_1 = require("./render");
const util_1 = require("./util");
const inputs_1 = require("./inputs");
async function action() {
    let continueOnError = true;
    try {
        const inputs = (0, inputs_1.getInputFields)();
        if (!inputs)
            return;
        const { pathsString, debugMode, skipIfNoChanges, minCoverage, emoji, title, updateComment, commentType, } = inputs;
        continueOnError = inputs.continueOnError;
        const client = github.getOctokit(inputs.token);
        if (debugMode)
            core.info(`context: ${(0, util_1.debug)(github.context)}`);
        const sha = await getSha(client, inputs.prNumber, debugMode);
        if (!sha)
            return;
        const { baseSha, headSha, prNumber } = sha;
        const reports = await getReports(pathsString, debugMode);
        const changedFiles = await getChangedFiles(baseSha, headSha, client, debugMode);
        const project = (0, process_1.getProjectCoverage)(reports, changedFiles);
        if (debugMode)
            core.info(`project: ${(0, util_1.debug)(project)}`);
        core.setOutput('coverage-overall', project.overall ? parseFloat(project.overall.percentage.toFixed(2)) : 100);
        core.setOutput('coverage-changed-files', parseFloat(project['coverage-changed-files'].toFixed(2)));
        const skip = skipIfNoChanges && project.modules.length === 0;
        if (debugMode)
            core.info(`skip: ${skip}`);
        if (!skip) {
            const titleFormatted = (0, render_1.getTitle)(title);
            const bodyFormatted = (0, render_1.getPRComment)(project, {
                overall: minCoverage.overall,
                changed: minCoverage.changed,
            }, title, emoji);
            switch (commentType) {
                case 'pr_comment':
                    await addPRComment(prNumber, updateComment, titleFormatted, bodyFormatted, client, debugMode);
                    break;
                case 'summary':
                    await addWorkflowSummary(bodyFormatted, debugMode);
                    break;
                case 'both':
                    await addPRComment(prNumber, updateComment, titleFormatted, bodyFormatted, client, debugMode);
                    await addWorkflowSummary(bodyFormatted, debugMode);
                    break;
            }
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
}
async function getJsonReports(xmlPaths, debugMode) {
    const globber = await glob.create(xmlPaths.join('\n'));
    const files = await globber.glob();
    if (debugMode)
        core.info(`Resolved files: ${files}`);
    return Promise.all(files.map(async (path) => {
        const reportXml = await fs.promises.readFile(path.trim(), 'utf-8');
        return await (0, util_1.parseToReport)(reportXml);
    }));
}
async function getReports(pathsString, debugMode) {
    const reportPaths = pathsString.split(',');
    if (debugMode)
        core.info(`reportPaths: ${reportPaths}`);
    const reportsJsonAsync = getJsonReports(reportPaths, debugMode);
    const reports = await reportsJsonAsync;
    if (debugMode) {
        core.info(`reports: ${reports.map(report => report.name)}`);
    }
    return reports;
}
async function getChangedFiles(baseSha, headSha, client, debugMode) {
    const response = await client.rest.repos.compareCommits({
        base: baseSha,
        head: headSha,
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
    });
    const changedFiles = [];
    const files = response.data.files ?? [];
    for (const file of files) {
        if (debugMode)
            core.info(`file: ${(0, util_1.debug)(file)}`);
        const changedFile = {
            filePath: file.filename,
            url: file.blob_url,
            lines: (0, util_1.getChangedLines)(file.patch),
        };
        changedFiles.push(changedFile);
    }
    if (debugMode)
        core.info(`changedFiles: ${(0, util_1.debug)(changedFiles)}`);
    return changedFiles;
}
async function addPRComment(prNumber, update, title, body, client, debugMode) {
    if (prNumber === undefined) {
        if (debugMode)
            core.info('prNumber not present');
        return;
    }
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
        const comments = await client.rest.issues.listComments({
            issue_number: prNumber,
            ...github.context.repo,
        });
        const comment = comments.data.find((it) => it.body.startsWith(title));
        if (comment) {
            if (debugMode) {
                core.info(`Updating existing comment: id=${comment.id} \n body=${comment.body}`);
            }
            await client.rest.issues.updateComment({
                comment_id: comment.id,
                body,
                ...github.context.repo,
            });
            commentUpdated = true;
        }
    }
    if (!commentUpdated) {
        if (debugMode)
            core.info('Creating a new comment');
        await client.rest.issues.createComment({
            issue_number: prNumber,
            body,
            ...github.context.repo,
        });
    }
}
async function addWorkflowSummary(body, debugMode) {
    if (debugMode)
        core.info('Adding workflow summary');
    await core.summary.addRaw(body, true).write();
}
async function getPrNumberForCommit(client, commitSha) {
    const response = await client.rest.repos.listPullRequestsAssociatedWithCommit({
        commit_sha: commitSha,
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
    });
    return response.data.length > 0 ? response.data[0].number : undefined;
}
async function getSha(client, prNum, debugMode) {
    const context = github.context;
    const payload = context.payload;
    const event = context.eventName;
    if (debugMode)
        core.info(`Event is ${event}`);
    const sha = context.sha;
    let baseSha = sha;
    let headSha = sha;
    let prNumber = prNum;
    switch (event) {
        case 'pull_request':
        case 'pull_request_target':
            baseSha = payload.pull_request?.base.sha;
            headSha = payload.pull_request?.head.sha;
            prNumber = prNumber ?? payload.pull_request?.number;
            break;
        case 'push':
            baseSha = payload.before;
            headSha = payload.after;
            prNumber = prNumber ?? (await getPrNumberForCommit(client, sha));
            break;
        case 'workflow_run':
            const pullRequests = payload?.workflow_run?.pull_requests ?? [];
            if (pullRequests.length !== 0) {
                baseSha = pullRequests[0]?.base?.sha;
                headSha = pullRequests[0]?.head?.sha;
                prNumber = prNumber ?? pullRequests[0]?.number;
            }
            else {
                prNumber = prNumber ?? (await getPrNumberForCommit(client, sha));
            }
            break;
        case 'workflow_dispatch':
        case 'schedule':
            prNumber = prNumber ?? (await getPrNumberForCommit(client, sha));
            break;
        default:
            core.setFailed(`The event ${context.eventName} is not supported.`);
            return undefined;
    }
    if (debugMode)
        core.info(`base sha: ${baseSha}`);
    if (debugMode)
        core.info(`head sha: ${headSha}`);
    if (debugMode)
        core.info(`prNumber: ${prNumber}`);
    return { baseSha: baseSha ?? sha, headSha: headSha ?? sha, prNumber };
}
