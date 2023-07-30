"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFilesWithCoverage = exports.getChangedLines = exports.debug = exports.TAG = void 0;
// @ts-nocheck
exports.TAG = {
    SELF: '$',
    SOURCE_FILE: 'sourcefile',
    LINE: 'line',
    COUNTER: 'counter',
    PACKAGE: 'package',
    GROUP: 'group',
};
function debug(obj) {
    return JSON.stringify(obj, ' ', 4);
}
exports.debug = debug;
const pattern = /^@@ -([0-9]*),?\S* \+([0-9]*),?/;
function getChangedLines(patch) {
    const lines = patch.split('\n');
    const groups = getDiffGroups(lines);
    const lineNumbers = new Set();
    groups.forEach(group => {
        const firstLine = group.shift();
        if (firstLine) {
            const diffGroup = firstLine.match(pattern);
            if (diffGroup) {
                let bX = parseInt(diffGroup[2]);
                group.forEach(line => {
                    bX++;
                    if (line.startsWith('+')) {
                        lineNumbers.add(bX - 1);
                    }
                    else if (line.startsWith('-')) {
                        bX--;
                    }
                });
            }
        }
    });
    return [...lineNumbers];
}
exports.getChangedLines = getChangedLines;
function getDiffGroups(lines) {
    const groups = [];
    let group = [];
    lines.forEach(line => {
        if (line.startsWith('@@')) {
            group = [];
            groups.push(group);
        }
        group.push(line);
    });
    return groups;
}
function getFilesWithCoverage(packages) {
    const files = [];
    packages.forEach(item => {
        var _a;
        const packageName = item[exports.TAG.SELF].name;
        const sourceFiles = (_a = item[exports.TAG.SOURCE_FILE]) !== null && _a !== void 0 ? _a : [];
        sourceFiles.forEach(sourceFile => {
            var _a, _b;
            const sourceFileName = sourceFile[exports.TAG.SELF].name;
            const file = {
                name: sourceFileName,
                packageName,
            };
            const counters = (_a = sourceFile[exports.TAG.COUNTER]) !== null && _a !== void 0 ? _a : [];
            counters.forEach(counter => {
                var _a, _b;
                const counterSelf = counter[exports.TAG.SELF];
                const type = counterSelf.type;
                file[type.toLowerCase()] = {
                    missed: (_a = parseInt(counterSelf.missed)) !== null && _a !== void 0 ? _a : 0,
                    covered: (_b = parseInt(counterSelf.covered)) !== null && _b !== void 0 ? _b : 0,
                };
            });
            file.lines = {};
            const lines = (_b = sourceFile[exports.TAG.LINE]) !== null && _b !== void 0 ? _b : [];
            lines.forEach(line => {
                var _a, _b, _c, _d;
                const lineSelf = line[exports.TAG.SELF];
                file.lines[lineSelf.nr] = {
                    instruction: {
                        missed: (_a = parseInt(lineSelf.mi)) !== null && _a !== void 0 ? _a : 0,
                        covered: (_b = parseInt(lineSelf.ci)) !== null && _b !== void 0 ? _b : 0,
                    },
                    branch: {
                        missed: (_c = parseInt(lineSelf.mb)) !== null && _c !== void 0 ? _c : 0,
                        covered: (_d = parseInt(lineSelf.cb)) !== null && _d !== void 0 ? _d : 0,
                    },
                };
            });
            files.push(file);
        });
    });
    return files;
}
exports.getFilesWithCoverage = getFilesWithCoverage;
