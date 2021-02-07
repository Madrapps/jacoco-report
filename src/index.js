const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const parser = require('xml2js');

try {
    // `who-to-greet` input defined in action metadata file
    const nameToGreet = core.getInput('who-to-greet');
    console.log(`Hello ${nameToGreet}!`);
    const time = (new Date()).toTimeString();
    core.setOutput("time", time);
    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(github.context.payload, undefined, 2)
    console.log(`The event payload: ${payload}`);
    const isPR = github.context.payload.pull_request != null

    if (isPR) {
        console.log(`Invoked as a result of Pull Request`);
        const prNumber = github.context.payload.pull_request.number
        console.log(`PR Number = `, prNumber);
    }

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
                    console.log("Report Json -> ", value);
                }
            });
        }
    });

} catch (error) {
    core.setFailed(error.message);
}