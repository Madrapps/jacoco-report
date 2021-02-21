function getFileCoverage(report, files) {
    const result = [];
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

module.exports = {
    getFileCoverage,
    getOverallCoverage
};
