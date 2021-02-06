const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');

try {
    // `who-to-greet` input defined in action metadata file
    const nameToGreet = core.getInput('who-to-greet');
    console.log(`Hello ${nameToGreet}!`);
    const time = (new Date()).toTimeString();
    core.setOutput("time", time);
    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(github.context.payload, undefined, 2)
    console.log(`The event payload: ${payload}`);

    const reportPath = core.getInput('path');
    console.log(`Path is ${reportPath}`);

    fs.readFile(reportPath, "utf8", function (err, data) {
        if (err) {
            core.setFailed(err.message);
        } else {
            console.log("Report Xml -> ", data);
        }
    });

} catch (error) {
    core.setFailed(error.message);
}