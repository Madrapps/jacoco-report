function getFileCoverage(report, files) {
    const result = {};
    const resultFiles = [];
    const packages = report["package"];
    packages.forEach(item => {
        const packageName = item["$"].name;
        const sourceFiles = item.sourcefile;
        sourceFiles.forEach(sourceFile => {
            const sourceFileName = sourceFile["$"].name;
            var file = files.find(function (f) {
                return f.filePath.endsWith(`${packageName}/${sourceFileName}`);
            });
            if (file != null) {
                const fileName = sourceFile["$"].name;
                const counters = sourceFile["counter"];
                if (counters != null && counters.length != 0) {
                    const coverage = getDetailedCoverage(counters, "INSTRUCTION");
                    file["name"] = fileName;
                    file["missed"] = coverage.missed;
                    file["covered"] = coverage.covered;
                    file["percentage"] = coverage.percentage;
                    resultFiles.push(file);
                }
            }
        });
        resultFiles.sort((a, b) => b.percentage - a.percentage)
    });
    result.files = resultFiles;
    if (resultFiles.length != 0) {
        result.percentage = getTotalPercentage(resultFiles);
    } else {
        result.percentage = 100;
    }
    return result;
}

function getTotalPercentage(files) {
    var missed = 0;
    var covered = 0;
    files.forEach(file => {
        missed += file.missed;
        covered += file.covered;
    });
    return parseFloat((covered / (covered + missed) * 100).toFixed(2));
}

function getOverallCoverage(report) {
    const counters = report["counter"];
    const coverage = getDetailedCoverage(counters, "INSTRUCTION");
    return coverage.percentage;
}

function getDetailedCoverage(counters, type) {
    const coverage = {};
    counters.forEach(counter => {
        const attr = counter["$"];
        if (attr["type"] == type) {
            const missed = parseFloat(attr["missed"]);
            const covered = parseFloat(attr["covered"]);
            coverage.missed = missed;
            coverage.covered = covered;
            coverage.percentage = parseFloat((covered / (covered + missed) * 100).toFixed(2));
        }
    });
    return coverage
}

module.exports = {
    getFileCoverage,
    getOverallCoverage
};
