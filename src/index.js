const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const parser = require('xml2js');
const process = require('./process');

const client = github.getOctokit(core.getInput("token"));

action().catch(error => {
    core.setFailed(error.message);
});

async function action() {
    try {
        const passPercentage = parseFloat(core.getInput('pass-percentage'));
        console.log(`Pass percentage = ${passPercentage}`);

        const reportPath = core.getInput('path');
        console.log(`Path = ${reportPath}`);

        const event = github.context.eventName;
        console.log(`Event = ${event}`);

        var base;
        var head;
        var isPR;
        switch (event) {
            case 'pull_request':
                base = github.context.payload.pull_request.base.sha;
                head = github.context.payload.pull_request.head.sha;
                isPR = true;
                break
            case 'push':
                base = github.context.payload.before;
                head = github.context.payload.after;
                isPR = false;
                break
            default:
                core.setFailed(`Only pull requests and pushes are supported, ${context.eventName} not supported.`);
        }

        console.log(`Base = ${base}`);
        console.log(`Head = ${head}`);

        const reportJsonAsync = getJsonReport(reportPath);
        const changedFiles = await getChangedFiles(base, head);
        console.log(changedFiles);

        const value = await reportJsonAsync;
        console.log("Report JSON -> ", value);

        const report = value["report"];
        if (isPR) {
            console.log(`Invoked as a result of Pull Request`);
            const prNumber = github.context.payload.pull_request.number;
            console.log(`PR Number = `, prNumber);

            const files = process.getFileCoverage(report, changedFiles);
            console.log(files);
            const overallCoverage = process.getOverallCoverage(report);
            console.log(overallCoverage);
            core.setOutput("coverage-overall", parseFloat(overallCoverage.toFixed(2)));

            await addComment(prNumber, getPRComment(overallCoverage, files, passPercentage));
        }

    } catch (error) {
        core.setFailed(error.message);
    }
}

async function getJsonReport(xmlPath) {
    const reportXml = await fs.promises.readFile(xmlPath, "utf-8");
    const reportJson = await parser.parseStringPromise(reportXml);
    return reportJson;
}

async function getChangedFiles(base, head) {
    const response = await client.repos.compareCommits({
        base,
        head,
        owner: github.context.repo.owner,
        repo: github.context.repo.repo
    });

    // console.log(util.inspect(response, false, null, true));

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

function getPRComment(overallCoverage, files, minCoverage) {
    const fileTable = getFileTable(files, minCoverage);
    const overallTable = getOverallTable(overallCoverage, minCoverage);
    return fileTable + `\n\n` + overallTable;
}

function getFileTable(files, minCoverage) {
    const tableHeader = `|File|Coverage||`
    const tableStructure = `|:-|:-:|:-:|`

    var table = tableHeader + `\n` + tableStructure;
    files.forEach(file => {
        const coverage = file.coverage;
        var status = `:green_apple:`;
        if (coverage < minCoverage) {
            status = `:x:`;
        }
        table = table + `\n` + `|[${file.name}](${file.url})|${formatCoverage(coverage)}|${status}|`
    });
    return table;
}

function getOverallTable(coverage, minCoverage) {
    var status = `:green_apple:`;
    if (coverage < minCoverage) {
        status = `:x:`;
    }
    const tableHeader = `|Total Project Coverage|${formatCoverage(coverage)}|${status}|`
    const tableStructure = `|:-|:-:|:-:|`
    return tableHeader + `\n` + tableStructure;
}

function formatCoverage(coverage) {
    return `${parseFloat(coverage.toFixed(2))}%`
}

async function addComment(prNumber, comment) {
    await client.issues.createComment({
        issue_number: prNumber,
        body: comment,
        ...github.context.repo
    });
}
