const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const parser = require('xml2js');

const client = github.getOctokit(core.getInput("token"));

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
                    const counters = report["counter"]
                    const overallCoverage = getOverallCoverage(counters);
                    if (overallCoverage != null && isPR) {
                        console.log(`Invoked as a result of Pull Request`);
                        const prNumber = github.context.payload.pull_request.number;
                        console.log(`PR Number = `, prNumber);
                        addComment(prNumber, mdOverallCoverage(overallCoverage, passPercentage));
                    }

                    const packages = report["package"];
                    packages.forEach(package => {
                        const packageName = package["$"];
                        const sourceFiles = package.sourcefile;
                        console.log(`Package: ${packageName}`);
                        sourceFiles.forEach(sourceFile => {
                            const fileName = sourceFile["$"];
                            const counters = sourceFile["counter"];
                            const coverage = getOverallCoverage(counters);
                            console.log(`File: ${fileName} : ${coverage.toFixed(2)}%`);
                        });
                    });
                }
            });
        }
    });

} catch (error) {
    core.setFailed(error.message);
}

function getOverallCoverage(counters) {
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

function mdOverallCoverage(coverage, minCoverage) {
    var status = `:green_apple:`;
    if (coverage < minCoverage) {
        status = `:x:`;
    }
    const tableHeader = `|Total Project Coverage|${coverage.toFixed(2)}%|${status}|`
    const tableStructure = `|:-|:-:|:-:|`
    return tableHeader + `\n` + tableStructure;
}

function addComment(prNumber, comment) {
    client.issues.createComment({
        issue_number: prNumber,
        body: comment,
        ...github.context.repo
    });
}
