function getFileCoverage(reports, files) {
  const packages = reports.map((report) => report["package"]);
  return getFileCoverageFromPackages([].concat(...packages), files);
}

function getFileCoverageFromPackages(packages, files) {
  const result = {};
  const resultFiles = [];
  packages.forEach((item) => {
    const packageName = item["$"].name;
    const sourceFiles = item.sourcefile;
    sourceFiles.forEach((sourceFile) => {
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
    resultFiles.sort((a, b) => b.percentage - a.percentage);
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
  files.forEach((file) => {
    missed += file.missed;
    covered += file.covered;
  });
  return parseFloat(((covered / (covered + missed)) * 100).toFixed(2));
}

function getOverallCoverage(reports) {
  const coverage = {};
  const modules = [];
  reports.forEach((report) => {
    const moduleName = report["$"].name;
    const moduleCoverage = getModuleCoverage(report);
    modules.push({
      module: moduleName,
      coverage: moduleCoverage,
    });
  });
  coverage.project = getProjectCoverage(reports);
  coverage.modules = modules;
  return coverage;
}

function getModuleCoverage(report) {
  const counters = report["counter"];
  const coverage = getDetailedCoverage(counters, "INSTRUCTION");
  return coverage.percentage;
}

function getProjectCoverage(reports) {
  const coverages = reports.map((report) =>
    getDetailedCoverage(report["counter"], "INSTRUCTION")
  );
  const covered = coverages.reduce(
    (acc, coverage) => acc + coverage.covered,
    0
  );
  const missed = coverages.reduce((acc, coverage) => acc + coverage.missed, 0);
  return parseFloat(((covered / (covered + missed)) * 100).toFixed(2));
}

function getDetailedCoverage(counters, type) {
  const coverage = {};
  counters.forEach((counter) => {
    const attr = counter["$"];
    if (attr["type"] == type) {
      const missed = parseFloat(attr["missed"]);
      const covered = parseFloat(attr["covered"]);
      coverage.missed = missed;
      coverage.covered = covered;
      coverage.percentage = parseFloat(
        ((covered / (covered + missed)) * 100).toFixed(2)
      );
    }
  });
  return coverage;
}

module.exports = {
  getFileCoverage,
  getOverallCoverage,
};
