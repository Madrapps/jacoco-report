# jacoco-report
[![Tests](https://github.com/Madrapps/jacoco-report/actions/workflows/check.yml/badge.svg)](https://github.com/Madrapps/jacoco-report/actions/workflows/check.yml)

Github action that publishes the JaCoCo report as a comment in the Pull Request

## Usage

### Pre-requisites
Create a workflow `.yml` file in your repositories `.github/workflows` directory. An [example workflow](#example-workflow) is available below. For more information, reference the GitHub Help Documentation for [Creating a workflow file](https://help.github.com/en/articles/configuring-a-workflow#creating-a-workflow-file).

### Inputs

* `path` - [**required**] Path of the generated xml file.
* `token` - [**required**] Github personal token to add commits to Pull Request
* `min-coverage-overall` - [*optional*] The minimum code coverage that is required to pass for changed files
* `min-coverage-changed-files` - [*optional*] The minimum code coverage that is required to pass for changed files

### Outputs

* `coverage-overall` - The overall coverage of the project
* `coverage-changed-files` - The total coverage of all changed files

## License
The scripts and documentation in this project are released under the [MIT License](LICENSE)
