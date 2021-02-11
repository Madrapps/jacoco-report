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