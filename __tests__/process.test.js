const fs = require('fs');
const parser = require('xml2js');
const process = require('../src/process');

test("get overall coverage", async () => {
    const report = await getReport();
    const coverage = process.getOverallCoverage(report);
    expect(coverage).toBeCloseTo(49.01, 1);
})

describe("get file coverage", function () {

    it("no files changed", async () => {
        const report = await getReport();
        const changedFiles = [];
        const actual = process.getFileCoverage(report, changedFiles);
        expect(actual).toEqual([]);
    });

    it("one file changed", async () => {
        const report = await getReport();
        const changedFiles = [
            {
                filePath: "src/main/java/com/madrapps/jacoco/operation/StringOp.java",
                url: "https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/java/com/madrapps/jacoco/operation/StringOp.java"
            }
        ];
        const actual = process.getFileCoverage(report, changedFiles);
        expect(actual).toEqual([
            {
                "filePath": "src/main/java/com/madrapps/jacoco/operation/StringOp.java",
                "url": "https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/java/com/madrapps/jacoco/operation/StringOp.java",
                "name": "StringOp.java",
                "covered": 7,
                "missed": 0,
                "percentage": 100,
            }
        ]);
    });

    it("multiple files changed", async () => {
        const report = await getReport();
        const changedFiles = [
            {
                filePath: "src/main/java/com/madrapps/jacoco/operation/StringOp.java",
                url: "https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/java/com/madrapps/jacoco/operation/StringOp.java"
            },
            {
                filePath: 'src/main/kotlin/com/madrapps/jacoco/Math.kt',
                url: 'https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/kotlin/com/madrapps/jacoco/Math.kt'
            },
            {
                filePath: 'src/test/java/com/madrapps/jacoco/operation/StringOpTest.java',
                url: 'https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/test/java/com/madrapps/jacoco/operation/StringOpTest.java'
            },
        ];
        const actual = process.getFileCoverage(report, changedFiles);
        expect(actual).toEqual([
            {
                "covered": 7,
                "missed": 8,
                "percentage": 46.67,
                "filePath": "src/main/kotlin/com/madrapps/jacoco/Math.kt",
                "name": "Math.kt",
                "url": "https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/kotlin/com/madrapps/jacoco/Math.kt",
            },
            {
                "filePath": "src/main/java/com/madrapps/jacoco/operation/StringOp.java",
                "url": "https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/java/com/madrapps/jacoco/operation/StringOp.java",
                "name": "StringOp.java",
                "covered": 7,
                "missed": 0,
                "percentage": 100,
            },
        ]);
    });
})

async function getReport() {
    const reportPath = "./__tests__/__fixtures__/report.xml";
    const reportXml = await fs.promises.readFile(reportPath, "utf-8");
    const json = await parser.parseStringPromise(reportXml);
    return json["report"];
}
