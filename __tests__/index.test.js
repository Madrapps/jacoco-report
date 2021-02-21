const { TestScheduler } = require("jest");
const fs = require('fs');
const parser = require('xml2js');

test("Read from Report xml", () => {
    const reportPath = "./__tests__/__fixtures__/report.xml"
    console.log("Something");
    var missed = "asdf";
    fs.readFile(reportPath, "utf8", function (_, data) {
        parser.parseString(data, function (_, value) {
            const counters = value["report"]["counter"]
            const report = counters[0]["$"]["type"];
            expect(report).toBe("INSTRUCTION")

            counters.forEach(counter => {
                const attr = counter["$"]
                if (attr["type"] == "INSTRUCTION") {
                    missed = attr["missed"]
                    const covered = attr["covered"]
                    expect(missed).toBe("4")
                    expect(covered).toBe("7")
                    const coverage = parseFloat(covered) / (parseFloat(missed) + parseFloat(covered)) * 100
                    expect(coverage).toBeCloseTo(63.636, 2)
                }
            });
        });
    });
    console.log("End");
    console.log(missed);
});

test("find file from changed files", () => {
    var changedFile = [
        {
            name: '.github/workflows/coverage.yml',
            url: 'https://github.com/thsaravana/jacoco-playground/blob/7e928205a14b3c5f08be3fa2f2005beecb7738b4/.github/workflows/coverage.yml'
        },
        {
            name: 'src/main/java/com/madrapps/jacoco/Utils.java',
            url: 'https://github.com/thsaravana/jacoco-playground/blob/7e928205a14b3c5f08be3fa2f2005beecb7738b4/src/main/java/com/madrapps/jacoco/Utils.java'
        },
        {
            name: 'src/main/kotlin/com/madrapps/jacoco/Math.kt',
            url: 'https://github.com/thsaravana/jacoco-playground/blob/7e928205a14b3c5f08be3fa2f2005beecb7738b4/src/main/kotlin/com/madrapps/jacoco/Math.kt'
        }
    ]
    const result = getFileCoverage(changedFile);
    console.log(`Result = ${result}`);
    console.log(result);
    console.log(`ChangedFile = ${changedFile}`);
    console.log(changedFile);
});

function getFileCoverage(files) {
    const results = [];
    const sourceFileName = "com/madrapps/jacoco" + "/" + "Math.kt"
    var file = files.find(function (el) {
        return el.name.endsWith(sourceFileName);
    });
    file["fileName"] = "FileName";
    file["coverage"] = 56.89;
    console.log(file);
    results.push(file);
    return results;
}