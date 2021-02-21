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
            await addComment(prNumber, mdPrComment(report, passPercentage, changedFiles));

            const files = getFileCoverage(report, changedFiles);
            console.log(files);
            const overallCoverage = getOverallCoverage(report);
            console.log(overallCoverage);
            core.setOutput("coverage-overall", overallCoverage);
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

function mdPrComment(report, minCoverage, changedFiles) {
    const fileTable = mdFileCoverage(report, minCoverage, changedFiles);
    const overallCoverage = getOverallCoverage(report);
    const overall = mdOverallCoverage(overallCoverage, minCoverage);
    return fileTable + `\n\n` + overall;
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
                return el.filePath.endsWith(`${packageName}/${sourceFileName}`);
            });
            if (file != null) {
                console.log("File changed");
                table = table + `\n` + mdFileCoverageRow(sourceFile, file.url, minCoverage);
            } else {
                console.log("File not changed");
            }
        });
    });
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

function mdOverallCoverage(coverage, minCoverage) {
    var status = `:green_apple:`;
    if (coverage < minCoverage) {
        status = `:x:`;
    }
    const tableHeader = `|Total Project Coverage|${formatCoverage(coverage)}|${status}|`
    const tableStructure = `|:-|:-:|:-:|`
    return tableHeader + `\n` + tableStructure;
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

function getFileCoverage(report, files) {
    const result = [];
    const packages = report["package"];
    packages.forEach(package => {
        const packageName = package["$"].name;
        const sourceFiles = package.sourcefile;
        sourceFiles.forEach(sourceFile => {
            const sourceFileName = sourceFile["$"].name;
            var file = files.find(function (f) {
                return f.filePath.endsWith(`${packageName}/${sourceFileName}`);
            });
            if (file != null) {
                const fileName = sourceFile["$"].name;
                const counters = sourceFile["counter"];
                const coverage = getCoverage(counters);
                file["name"] = fileName;
                file["coverage"] = coverage;
                result.push(file);
            }
        });
    });
    return result;
}

function getOverallCoverage(report) {
    const counters = report["counter"];
    const coverage = getCoverage(counters);
    return coverage;
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
