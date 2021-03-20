function getPRComment(overallCoverage, files, minCoverage) {
    const fileTable = getFileTable(files, minCoverage);
    const overallTable = getOverallTable(overallCoverage, minCoverage);
    return fileTable + `\n\n` + overallTable;
}

function getFileTable(files, minCoverage) {
    if (files.length === 0) {
        return `> There is no coverage information present for the Files changed`;
    }

    const tableHeader = getHeader(getTotalPercentage(files));
    const tableStructure = `|:-|:-:|:-:|`;
    var table = tableHeader + `\n` + tableStructure;
    files.forEach(file => {
        renderFileRow(`[${file.name}](${file.url})`, file.percentage);
    });
    return table;

    function renderFileRow(name, coverage) {
        addRow(getRow(name, coverage));
    }

    function getHeader(coverage) {
        var status = getStatus(coverage, minCoverage);
        return `|File|Coverage [${formatCoverage(coverage)}]|${status}|`;
    }

    function getRow(name, coverage) {
        var status = getStatus(coverage, minCoverage);
        return `|${name}|${formatCoverage(coverage)}|${status}|`;
    }

    function addRow(row) {
        table = table + `\n` + row;
    }
}

function getTotalPercentage(files) {
    var missed = 0;
    var covered = 0;
    files.forEach(file => {
        missed += file.missed;
        covered += file.covered;
    });
    return parseFloat(covered / (covered + missed) * 100);
}

function getOverallTable(coverage, minCoverage) {
    var status = getStatus(coverage, minCoverage);
    const tableHeader = `|Total Project Coverage|${formatCoverage(coverage)}|${status}|`;
    const tableStructure = `|:-|:-:|:-:|`;
    return tableHeader + `\n` + tableStructure;
}

function getStatus(coverage, minCoverage) {
    var status = `:green_apple:`;
    if (coverage < minCoverage) {
        status = `:x:`;
    }
    return status;
}

function formatCoverage(coverage) {
    return `${parseFloat(coverage.toFixed(2))}%`
}

module.exports = {
    getPRComment
};
