const { TestScheduler } = require("jest");
const fs = require('fs');
const parser = require('xml2js');

test("Read from Report xml", () => {
    const reportPath = "./__tests__/__fixtures__/report.xml"

    fs.readFile(reportPath, "utf8", function (_, data) {
        parser.parseString(data, function (_, value) {
            const report = value["report"]["counter"][0]["$"]["type"];
            expect(report).toBe("INSTRUCTION")
        });
    });
});