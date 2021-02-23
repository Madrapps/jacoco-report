const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const parser = require('xml2js');
const process = require('./process');
const render = require('./render');

async function action() {
    try {
        const reportPath = core.getInput('path');
        const passPercentage = parseFloat(core.getInput('pass-percentage'));
        const event = github.context.eventName;
        core.info(`Event is ${event}`);

        var base;
        var head;
        var prNumber;
        switch (event) {
            case 'pull_request':
                base = github.context.payload.pull_request.base.sha;
                head = github.context.payload.pull_request.head.sha;
                prNumber = github.context.payload.pull_request.number;
                break
            case 'push':
                base = github.context.payload.before;
                head = github.context.payload.after;
                isPR = false;
                break
            default:
                throw `Only pull requests and pushes are supported, ${github.context.eventName} not supported.`;
        }

        core.info(`base sha: ${base}`);
        core.info(`head sha: ${head}`);

        const client = github.getOctokit(core.getInput("token"));

        const reportJsonAsync = getJsonReport(reportPath);
        const changedFiles = await getChangedFiles(base, head, client);

        const value = await reportJsonAsync;
        const report = value["report"];

        const overallCoverage = process.getOverallCoverage(report);
        core.setOutput("coverage-overall", parseFloat(overallCoverage.toFixed(2)));

        if (prNumber != null) {
            const files = process.getFileCoverage(report, changedFiles);
            await addComment(prNumber, render.getPRComment(overallCoverage, files, passPercentage), client);
        }
    } catch (error) {
        core.setFailed(error);
    }
}

async function getJsonReport(xmlPath) {
    const reportXml = await fs.promises.readFile(xmlPath, "utf-8");
    return await parser.parseStringPromise(reportXml);
}

async function getChangedFiles(base, head, client) {
    const response = await client.repos.compareCommits({
        base,
        head,
        owner: github.context.repo.owner,
        repo: github.context.repo.repo
    });

    var changedFiles = [];
    response.data.files.forEach(file => {
        var changedFile = {
            "filePath": file.filename,
            "url": file.blob_url
        }
        changedFiles.push(changedFile);
    });
    return changedFiles;
}

async function addComment(prNumber, comment, client) {
    await client.issues.createComment({
        issue_number: prNumber,
        body: comment,
        ...github.context.repo
    });
}

module.exports = {
    action
}