function getPRComment(overallCoverage, files, minCoverage) {
    const fileTable = getFileTable(files, minCoverage);
    const overallTable = getOverallTable(overallCoverage, minCoverage);
    return fileTable + `\n\n` + overallTable;
}

function getFileTable(files, minCoverage) {
    if (files.length === 0) {
        return `> There is no coverage information present for the Files changed`;
    }
    const tableHeader = `|File|Coverage||`;
    const tableStructure = `|:-|:-:|:-:|`;

    var table = tableHeader + `\n` + tableStructure;
    files.forEach(file => {
        const coverage = file.percentage;
        var status = getStatus(coverage, minCoverage);
        table = table + `\n` + `|[${file.name}](${file.url})|${formatCoverage(coverage)}|${status}|`;
    });
    return table;
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
