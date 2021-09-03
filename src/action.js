const core = require("@actions/core");
const github = require("@actions/github");
const fs = require("fs");
const parser = require("xml2js");
const { parseBooleans } = require("xml2js/lib/processors");
const process = require("./process");
const render = require("./render");

async function action() {
  try {
    const pathsString = core.getInput("paths");
    const reportPaths = pathsString.split(",");
    const minCoverageOverall = parseFloat(
      core.getInput("min-coverage-overall")
    );
    const minCoverageChangedFiles = parseFloat(
      core.getInput("min-coverage-changed-files")
    );
    const debugMode = parseBooleans(core.getInput("debug-mode"));
    const event = github.context.eventName;
    core.info(`Event is ${event}`);

    var base;
    var head;
    var prNumber;
    switch (event) {
      case "pull_request":
        base = github.context.payload.pull_request.base.sha;
        head = github.context.payload.pull_request.head.sha;
        prNumber = github.context.payload.pull_request.number;
        break;
      case "push":
        base = github.context.payload.before;
        head = github.context.payload.after;
        isPR = false;
        break;
      default:
        throw `Only pull requests and pushes are supported, ${github.context.eventName} not supported.`;
    }

    core.info(`base sha: ${base}`);
    core.info(`head sha: ${head}`);

    const client = github.getOctokit(core.getInput("token"));

    if (debugMode) core.info(`reportPaths: ${reportPaths}`);
    const reportsJsonAsync = getJsonReports(reportPaths);
    const changedFiles = await getChangedFiles(base, head, client);
    if (debugMode) core.info(`changedFiles: ${debug(changedFiles)}`);

    const reportsJson = await reportsJsonAsync;
    if (debugMode) core.info(`report value: ${debug(reportsJson)}`);
    const reports = reportsJson.map((report) => report["report"]);

    const overallCoverage = process.getOverallCoverage(reports);
    if (debugMode) core.info(`overallCoverage: ${overallCoverage}`);
    core.setOutput(
      "coverage-overall",
      parseFloat(overallCoverage.project.toFixed(2))
    );

    const filesCoverage = process.getFileCoverage(reports, changedFiles);
    if (debugMode) core.info(`filesCoverage: ${debug(filesCoverage)}`);
    core.setOutput(
      "coverage-changed-files",
      parseFloat(filesCoverage.percentage.toFixed(2))
    );

    if (prNumber != null) {
      await addComment(
        prNumber,
        render.getPRComment(
          overallCoverage.project,
          filesCoverage,
          minCoverageOverall,
          minCoverageChangedFiles
        ),
        client
      );
    }
  } catch (error) {
    core.setFailed(error);
  }
}

function debug(obj) {
  return JSON.stringify(obj, " ", 4);
}

async function getJsonReports(xmlPaths) {
  return Promise.all(
    xmlPaths.map(async (xmlPath) => {
      const reportXml = await fs.promises.readFile(xmlPath.trim(), "utf-8");
      return await parser.parseStringPromise(reportXml);
    })
  );
}

async function getChangedFiles(base, head, client) {
  const response = await client.repos.compareCommits({
    base,
    head,
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
  });

  var changedFiles = [];
  response.data.files.forEach((file) => {
    var changedFile = {
      filePath: file.filename,
      url: file.blob_url,
    };
    changedFiles.push(changedFile);
  });
  return changedFiles;
}

async function addComment(prNumber, comment, client) {
  await client.issues.createComment({
    issue_number: prNumber,
    body: comment,
    ...github.context.repo,
  });
}

module.exports = {
  action,
};
