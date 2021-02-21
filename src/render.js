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

module.exports = {
    getPRComment
};
