# js13kGames bot

![screenshot of pull request comment section](https://raw.githubusercontent.com/Platane/13k-bot/master/doc/assets/banner.png)

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier) [![type: typescript](https://img.shields.io/npm/types/typescript.svg?style=flat-square)](https://github.com/microsoft/TypeScript)

> js13kGames automatic submission validation

In order to automate submission for the [js13kgames.com/](https://js13kgames.com/) challenge, the whole submission process is based on github Pull Request with a bot to check trivial things.

## Table of content

- [Usage](#usage)
  - [Submission](#submission) - [**How to submit**](./doc/how-to-submit.md#how-to-submit)
  - [Internal Workflow](#internal-workflow)
- [Contributing](#contributing)
- [License](#license)

## Usage

### Submission

If you want to submit an entry to the js13kgames.com, have a look at the [How to submit](./doc/how-to-submit.md#how-to-submit)

### Internal Workflow

The section describes the internal implementation.

> ⚠️ Knowledge on this is not required to submit your entry !

#### Technologies

This project is a github app. It leverages octokit/rest to collect information.

Some artefacts are made publicly available throught a aws s3 bucket.

In order to test trivial issues, the game is run headlessly with browserstack.

#### Hook

Unfortunately since the release is on the submitter fork, and not part of the pull request, we cannot not have hook to trigger a check.

Which means we fallback on polling every X minutes.

#### Storage

The app does not rely on database.

However it is able to pull previous work from the pull request comment and avoid doing the work more than once.

#### Flow

- The job start for a pull request (from cron or from manual trigger)

- The bot get the latest release linked to the branch on the PR

- It check if a check run exists for the release (the check run is bound to the release commit sha and the release id). If so, stop here

- Else start the analysis:

  - Get the assets attached to the release

  - Look for a .zip

  - Check the size ( must be < 13k )

  - Unzip it

  - Look for an index.html

  - Upload the content of the zip

  - Run the game in browserstack

  - Look for errors in the console

  - Look for external http call ( which is forbidden )

  - Take a screenshot and determine if the screen is blank ( which probably means something is broken)

- Report the analysis as check run for the release commit

- Report the analysis as comment of the PR

## Contributing

PRs and issues welcome!

Join the [js13kGames.slack.com](http://js13kGames.slack.com) to discuss new features!

### Convention

This project uses typescript and prettier with default config.

Check type consistency with `yarn type` and linting with `yarn lint`

### Testing

Run integration test with `yarn test`

It will run the bot against this [pull requests samples](https://github.com/Platane/js13-entry/pulls).

You will need to have the [env](./.env) configured.

### Deployment

[...]

## License

[MIT](./license)
