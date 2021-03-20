const action = require('../src/action');
const core = require('@actions/core');
const github = require('@actions/github');

jest.mock("@actions/core");
jest.mock("@actions/github");

const compareCommitsResponse = {
    "data": {
        "files": [
            {
                "filename": "src/main/kotlin/com/madrapps/jacoco/Math.kt",
                "blob_url": "https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/kotlin/com/madrapps/jacoco/Math.kt",
            },
            {
                "filename": "src/main/java/com/madrapps/jacoco/operation/StringOp.java",
                "blob_url": "https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/java/com/madrapps/jacoco/operation/StringOp.java",
            }
        ]
    }
};

const comment = jest.fn();
const output = jest.fn();

beforeAll(() => {
    core.getInput = jest.fn(c => {
        switch (c) {
            case 'path':
                return "./__tests__/__fixtures__/report.xml";
            case 'pass-percentage-overall':
                return 45;
            case `pass-percentage-changed-files`:
                return 60;
        }
    });
    github.getOctokit = jest.fn(() => {
        return {
            repos: {
                compareCommits: jest.fn(() => {
                    return compareCommitsResponse
                })
            },
            issues: {
                createComment: comment
            }
        }
    });
    core.setFailed = jest.fn(c => {
        fail(c);
    });
})

describe("Pull Request event", function () {
    const context = {
        "eventName": "pull_request",
        "payload": {
            "pull_request": {
                "number": "45",
                "base": {
                    "sha": "guasft7asdtf78asfd87as6df7y2u3"
                },
                "head": {
                    "sha": "aahsdflais76dfa78wrglghjkaghkj"
                }
            }
        },
        "repo": "jacoco-playground",
        "owner": "madrapps"
    };

    it("publish proper comment", async () => {
        github.context = context

        await action.action();

        expect(comment.mock.calls[0][0].body).toEqual(`|File|Coverage [63.64%]|:green_apple:|
|:-|:-:|:-:|
|[StringOp.java](https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/java/com/madrapps/jacoco/operation/StringOp.java)|100%|:green_apple:|
|[Math.kt](https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/kotlin/com/madrapps/jacoco/Math.kt)|46.67%|:x:|

|Total Project Coverage|49.02%|:green_apple:|
|:-|:-:|:-:|`);
    })

    it("set overall coverage output", async () => {
        github.context = context
        core.setOutput = output;

        await action.action();

        const out = output.mock.calls[0];
        expect(out).toEqual(['coverage-overall', 49.02]);
    })

    it("set changed files coverage output", async () => {
        github.context = context
        core.setOutput = output;

        await action.action();

        const out = output.mock.calls[1];
        expect(out).toEqual(['coverage-changed-files', 63.64]);
    })
});

describe("Push event", function () {
    const context = {
        "eventName": "push",
        "payload": {
            "before": "guasft7asdtf78asfd87as6df7y2u3",
            "after": "aahsdflais76dfa78wrglghjkaghkj"
        },
        "repo": "jacoco-playground",
        "owner": "madrapps"
    }

    it("set overall coverage output", async () => {
        github.context = context
        core.setOutput = output;

        await action.action();

        const out = output.mock.calls[0];
        expect(out).toEqual(['coverage-overall', 49.02]);
    })

    it("set changed files coverage output", async () => {
        github.context = context
        core.setOutput = output;

        await action.action();

        const out = output.mock.calls[1];
        expect(out).toEqual(['coverage-changed-files', 63.64]);
    })
});

describe("Other than push or pull_request event", function () {
    const context = {
        "eventName": "pr_review"
    }

    it("Fail by throwing appropriate error", async () => {
        github.context = context
        core.setFailed = jest.fn(c => {
            expect(c).toEqual("Only pull requests and pushes are supported, pr_review not supported.");
        });
        core.setOutput = output;

        await action.action();
    })
});