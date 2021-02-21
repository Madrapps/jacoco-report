const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const parser = require('xml2js');
const util = require('util');

const client = github.getOctokit(core.getInput("token"));

action().catch(error => {
    core.setFailed(error.message);
});

async function action() {
    try {
        // `who-to-greet` input defined in action metadata file
        const nameToGreet = core.getInput('who-to-greet');
        const passPercentage = parseFloat(core.getInput('pass-percentage'));
        console.log(`Hello ${nameToGreet}!`);
        const time = (new Date()).toTimeString();
        core.setOutput("time", time);
        // Get the JSON webhook payload for the event that triggered the workflow
        const payload = JSON.stringify(github.context.payload, undefined, 2)
        console.log(`The event payload: ${payload}`);
        const isPR = github.context.payload.pull_request != null

        const reportPath = core.getInput('path');
        console.log(`Path is ${reportPath}`);

        const event = github.context.eventName;
        console.log(`Event = ${event}`);

        var base;
        var head;
        switch (event) {
            case 'pull_request':
                base = github.context.payload.pull_request.base.sha;
                head = github.context.payload.pull_request.head.sha;
                break
            case 'push':
                base = github.context.payload.before
                head = github.context.payload.after
                break
            default:
                core.setFailed(
                    `Only pull requests and pushes are supported, ${context.eventName} not supported.`
                )
        }

        console.log(`Base = ${base}`);
        console.log(`Head = ${head}`);

        const changedFiles = await getChangedFiles(base, head);
        console.log("Changed Files");
        console.log(changedFiles);

        fs.readFile(reportPath, "utf8", function (err, data) {
            if (err) {
                core.setFailed(err.message);
            } else {
                console.log("Report Xml -> ", data);
                parser.parseString(data, function (err, value) {
                    if (err) {
                        core.setFailed(err.message);
                    } else {
                        const report = value["report"];
                        if (isPR) {
                            console.log(`Invoked as a result of Pull Request`);
                            const prNumber = github.context.payload.pull_request.number;
                            console.log(`PR Number = `, prNumber);
                            addComment(prNumber, mdPrComment(report, passPercentage, changedFiles));
                        }
                    }
                });
            }
        });

    } catch (error) {
        core.setFailed(error.message);
    }
}

async function getChangedFiles(base, head) {
    const response = await client.repos.compareCommits({
        base,
        head,
        owner: github.context.repo.owner,
        repo: github.context.repo.repo
    });

    // console.log(response);
    // console.log(util.inspect(response, false, null, true));

    var changedFiles = [];
    response.data.files.forEach(file => {
        var changedFile = {
            "name": file.filename,
            "url": file.blob_url
        }
        changedFiles.push(changedFile);
    });

    return changedFiles;
}

function mdPrComment(report, minCoverage, changedFiles) {
    const fileTable = mdFileCoverage(report, minCoverage, changedFiles);
    const overall = mdOverallCoverage(report, minCoverage);
    return fileTable + `\n\n` + overall;
}

function getCoverage(counters) {
    var coverage;
    counters.forEach(counter => {
        const attr = counter["$"]
        if (attr["type"] == "INSTRUCTION") {
            missed = parseFloat(attr["missed"])
            const covered = parseFloat(attr["covered"])
            coverage = covered / (covered + missed) * 100
        }
    });
    return coverage
}

function mdFileCoverage(report, minCoverage, changedFiles) {
    const tableHeader = `|File|Coverage||`
    const tableStructure = `|:-|:-:|:-:|`

    var table = tableHeader + `\n` + tableStructure;
    const packages = report["package"];
    packages.forEach(package => {
        const packageName = package["$"].name;
        const sourceFiles = package.sourcefile;
        console.log(`Package: ${packageName}`);
        sourceFiles.forEach(sourceFile => {
            const sourceFileName = sourceFile["$"].name;
            var file = changedFiles.find(function (el) {
                return el.name.endsWith(`${packageName}/${sourceFileName}`);
            });
            if (file != null) {
                console.log("File changed");
                table = table + `\n` + mdFileCoverageRow(sourceFile, file.url, minCoverage);
            } else {
                console.log("File not changed");
            }
        });
    });
    console.log(changedFiles);
    return table;
}

function mdFileCoverageRow(sourceFile, url, minCoverage) {
    const fileName = sourceFile["$"].name;
    const counters = sourceFile["counter"];
    const coverage = getCoverage(counters);
    var status = `:green_apple:`;
    if (coverage < minCoverage) {
        status = `:x:`;
    }
    return `|[${fileName}](${url})|${formatCoverage(coverage)}|${status}|`
}

function mdOverallCoverage(report, minCoverage) {
    const counters = report["counter"];
    const coverage = getCoverage(counters);
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

function addComment(prNumber, comment) {
    client.issues.createComment({
        issue_number: prNumber,
        body: comment,
        ...github.context.repo
    });
}
