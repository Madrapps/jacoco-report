const action = require("../src/action");
const core = require("@actions/core");
const github = require("@actions/github");

jest.mock("@actions/core");
jest.mock("@actions/github");

describe("Multiple reports", function () {
  const comment = jest.fn();
  const output = jest.fn();

  const compareCommitsResponse = {
    data: {
      files: [
        {
          filename: "src/main/java/com/madrapps/playground/MainViewModel.kt",
          blob_url:
            "https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/playground/MainViewModel.kt",
        },
        {
          filename: "src/main/java/com/madrapps/math/Math.kt",
          blob_url:
            "https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/math/Math.kt",
        },
      ],
    },
  };

  core.getInput = jest.fn((c) => {
    switch (c) {
      case "paths":
        return "./__tests__/__fixtures__/multi_module/appCoverage.xml,./__tests__/__fixtures__/multi_module/mathCoverage.xml,./__tests__/__fixtures__/multi_module/textCoverage.xml";
      case "min-coverage-overall":
        return 45;
      case `min-coverage-changed-files`:
        return 60;
    }
  });
  github.getOctokit = jest.fn(() => {
    return {
      repos: {
        compareCommits: jest.fn(() => {
          return compareCommitsResponse;
        }),
      },
      issues: {
        createComment: comment,
      },
    };
  });
  core.setFailed = jest.fn((c) => {
    fail(c);
  });

  describe("Pull Request event", function () {
    const context = {
      eventName: "pull_request",
      payload: {
        pull_request: {
          number: "45",
          base: {
            sha: "guasft7asdtf78asfd87as6df7y2u3",
          },
          head: {
            sha: "aahsdflais76dfa78wrglghjkaghkj",
          },
        },
      },
      repo: "jacoco-android-playground",
      owner: "madrapps",
    };

    it("publish proper comment", async () => {
      github.context = context;

      await action.action();

      expect(comment.mock.calls[0][0].body)
        .toEqual(`|File|Coverage [65.91%]|:green_apple:|
|:-|:-:|:-:|
|[Math.kt](https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/math/Math.kt)|70.37%|:green_apple:|
|[MainViewModel.kt](https://github.com/thsaravana/jacoco-android-playground/src/main/java/com/madrapps/playground/MainViewModel.kt)|58.82%|:x:|

|Total Project Coverage|25.32%|:x:|
|:-|:-:|:-:|`);
    });

    it("set overall coverage output", async () => {
      github.context = context;
      core.setOutput = output;

      await action.action();

      const out = output.mock.calls[0];
      expect(out).toEqual(["coverage-overall", 25.32]);
    });

    it("set changed files coverage output", async () => {
      github.context = context;
      core.setOutput = output;

      await action.action();

      const out = output.mock.calls[1];
      expect(out).toEqual(["coverage-changed-files", 65.91]);
    });
  });

  describe("Push event", function () {
    const context = {
      eventName: "push",
      payload: {
        before: "guasft7asdtf78asfd87as6df7y2u3",
        after: "aahsdflais76dfa78wrglghjkaghkj",
      },
      repo: "jacoco-playground",
      owner: "madrapps",
    };

    it("set overall coverage output", async () => {
      github.context = context;
      core.setOutput = output;

      await action.action();

      const out = output.mock.calls[0];
      expect(out).toEqual(["coverage-overall", 25.32]);
    });

    it("set changed files coverage output", async () => {
      github.context = context;
      core.setOutput = output;

      await action.action();

      const out = output.mock.calls[1];
      expect(out).toEqual(["coverage-changed-files", 65.91]);
    });
  });

  describe("Other than push or pull_request event", function () {
    const context = {
      eventName: "pr_review",
    };

    it("Fail by throwing appropriate error", async () => {
      github.context = context;
      core.setFailed = jest.fn((c) => {
        expect(c).toEqual(
          "Only pull requests and pushes are supported, pr_review not supported."
        );
      });
      core.setOutput = output;

      await action.action();
    });
  });
});
