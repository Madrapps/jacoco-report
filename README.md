# jacoco-report

[![Tests](https://github.com/Madrapps/jacoco-report/actions/workflows/check.yml/badge.svg)](https://github.com/Madrapps/jacoco-report/actions/workflows/check.yml)

A Github action that publishes the JaCoCo report as a comment in the Pull Request with customizable pass percentage for
modified modules, files and the overall project. You can view the coverage of just the changed files in your pull request.

## Usage

### Pre-requisites

Create a workflow `.yml` file in your repositories `.github/workflows` directory.
An [example workflow](#example-workflow) is available below. For more information, reference the GitHub Help
Documentation
for [Creating a workflow file](https://help.github.com/en/articles/configuring-a-workflow#creating-a-workflow-file).

### Inputs

- `paths` - [**required**] Comma separated paths of the generated jacoco xml files (supports wildcard glob pattern)
- `token` - [**required**] Github personal token to add comments to Pull Request
- `min-coverage-overall` - [*optional* {default: 80%}] The minimum code coverage that is required to pass for overall project
- `min-coverage-changed-files` - [*optional* {default: 80%}] The minimum code coverage that is required to pass for changed files
- `update-comment` - [*optional* {default: false}] If true, updates the previous coverage report comment instead of creating new one.
  Requires `title` to work properly
- `title` - [*optional*] Title for the Pull Request comment
- `skip-if-no-changes` - [*optional* {default: false}] If true, comment won't be added if there is no coverage information present for
  the files changed
- `pass-emoji` - [*optional* {default: :green_apple:}] Emoji to use for pass status shown when 'coverage >= min coverage' (should be a Github supported emoji).
- `fail-emoji` - [*optional* {default: :x:}] Emoji to use for fail status shown when 'coverage < min coverage' (should be a Github supported emoji).
- `continue-on-error` - [*optional* {default: true}] If true, then do not fail the action on error, but log a warning
- `debug-mode` - [*optional* {default: false}] If true, run the action in debug mode and get debug logs printed in console

### Outputs

- `coverage-overall` - The overall coverage of the project
- `coverage-changed-files` - The total coverage of all changed files

### Example Workflow

```yaml
name: Measure coverage

on:
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
    steps:
      - uses: actions/checkout@v2
      - name: Set up JDK 1.8
        uses: actions/setup-java@v1
        with:
          java-version: 1.8
      - name: Run Coverage
        run: |
          chmod +x gradlew
          ./gradlew testCoverage

      - name: Add coverage to PR
        id: jacoco
        uses: madrapps/jacoco-report@v1.6.1
        with:
          paths: |
            ${{ github.workspace }}/**/build/reports/jacoco/prodNormalDebugCoverage/prodNormalDebugCoverage.xml,
            ${{ github.workspace }}/**/build/reports/jacoco/**/debugCoverage.xml
          token: ${{ secrets.GITHUB_TOKEN }}
          min-coverage-overall: 40
          min-coverage-changed-files: 60
```

<br>
<img src="/preview/single-module-screenshot.png" alt="single module screenshot" title="single module screenshot" width="700" />
<br>
<img src="/preview/multi-module-screenshot.png" alt="multi-module screenshot" title="multi-module screenshot" width="700" />

### Example Project

For a working project refer to [jacoco-playgound](https://github.com/thsaravana/jacoco-playground). Check out the PR's
in the project to get an idea on how the report is shown on a pull request comment.
For multi module gradle project,
refer [jacoco-android-playground](https://github.com/thsaravana/jacoco-android-playground)

## Example Cases

1. If you want to fail your workflow when the minimum coverage is not met

   > You can write an additional step that uses
   > the Outputs for the jacoco-report action and fail the workflow.
   > Refer [sample pull request](https://github.com/thsaravana/jacoco-playground/pull/16) and
   > its [workflow](https://github.com/thsaravana/jacoco-playground/blob/pr-failure-on-threshold/.github/workflows/coverage.yml)

   ```yaml
   - name: Fail PR if overall coverage is less than 80%
     if: ${{ steps.jacoco.outputs.coverage-overall < 80.0 }}
     uses: actions/github-script@v6
     with:
       script: |
         core.setFailed('Overall coverage is less than 80%!')
   ```

2. If you don't want to add the coverage comment everytime you push a commit to a pull request, but update the existing
   coverage comment instead

   > Set the `update-comment` input to true and also set a `title` input.
   > Refer [sample pull request](https://github.com/thsaravana/jacoco-playground/pull/15) and
   > its [workflow](https://github.com/thsaravana/jacoco-playground/blob/update-comment/.github/workflows/coverage.yml)

   ```yaml
   - name: Jacoco Report to PR
     id: jacoco
     uses: madrapps/jacoco-report@v1.6.1
     with:
       paths: ${{ github.workspace }}/build/reports/jacoco/testCoverage/testCoverage.xml
       token: ${{ secrets.GITHUB_TOKEN }}
       min-coverage-overall: 40
       min-coverage-changed-files: 60
       title: Code Coverage
       update-comment: true
   ```

3. If you have a multi-module project like `android`, with multiple modules each with its own jacoco report

   > Set the `paths` input with wildcard glob pattern (as shown in the Example workflow). This will pick all the files
   > matching the pattern. Ensure your pattern matches only one report per module, since for the same module, you could
   > have `debugCoverage.xml` and `releaseCoverage.xml`.
   > Refer [sample pull request](https://github.com/thsaravana/jacoco-android-playground/pull/9) and
   > its [workflow](https://github.com/thsaravana/jacoco-android-playground/blob/testing-multi-module-support/.github/workflows/coverage.yml)

   ```yaml
   - name: Jacoco Report to PR
     id: jacoco
     uses: madrapps/jacoco-report@v1.6.1
     with:
       paths: |
         ${{ github.workspace }}/**/build/reports/jacoco/**/prodNormalDebugCoverage.xml,
         ${{ github.workspace }}/**/build/reports/jacoco/**/debugCoverage.xml
       token: ${{ secrets.GITHUB_TOKEN }}
       min-coverage-overall: 40
       min-coverage-changed-files: 60
   ```

4. When you need to customize the pass/fail emojis or the style of title in the comment

   > Set the `pass-emoji` and `fail-emoji` to a valid emoji supported in Github. You can add `#` to choose the style of
   > title from H1 to H6. If you don't choose, the default is H3.
   > Refer [sample pull request](https://github.com/thsaravana/jacoco-android-playground/pull/10) and
   > its [workflow](https://github.com/thsaravana/jacoco-android-playground/blob/testing-custom-emoji-support/.github/workflows/coverage.yml)

   ```yaml
   - name: Jacoco Report to PR
     id: jacoco
     uses: madrapps/jacoco-report@v1.6.1
     with:
       paths: ${{ github.workspace }}/build/reports/jacoco/testCoverage/testCoverage.xml
       token: ${{ secrets.GITHUB_TOKEN }}
       min-coverage-overall: 40
       min-coverage-changed-files: 60
       title: '# :lobster: Coverage Report'
       pass-emoji: ':green_circle:'
       fail-emoji: ':red_circle:'
   ```

## Troubleshooting

1. If the PR is created by bots like _dependabot_, then the GITHUB_TOKEN won't have sufficient access to write the
   coverage comment. So add the appropriate permission to your job (as shown in the Example workflow). More information
   [here](https://github.com/Madrapps/jacoco-report/issues/24).

## Contributing

We welcome contributions, and if you're interested, have a look at the [CONTRIBUTING](CONTRIBUTING.md) document.

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE)
