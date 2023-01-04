# run

[![GitHub version](https://badge.fury.io/gh/subfuzion%2Frun.svg)](https://badge.fury.io/gh/subfuzion%2Frun)
[![npm version](https://badge.fury.io/js/@subfuzion%2Frun.svg)](https://badge.fury.io/js/@subfuzion%2Frun)

A lightweight utility for Node.js developers that simplifies creating,
deploying, and monitoring serverless [Cloud Run] apps on [Google Cloud].

> This is not an official Google project.

`run` is not a replacement for everything that you can do with the [gcloud] CLI.
In fact, the current version requires that you also install `gcloud` because it
wraps some of `gcloud`'s functionality.

However, `run` provides a simple and streamlined experience using just a few
commands and a configuration file (which it generates).

To create and deploy an application, you run the following commands:

```text
run login
run new
run deploy
```

You will be prompted for options that will be saved to a configuration file and
used for deploying subsequent app revisions.

To contrast this against the equivalent `gcloud` experience, see this blog
post:<br>
[Getting started with the Google Cloud CLI interactive shell for serverless JavaScript developers](https://dev.to/subfuzion/getting-started-with-the-google-cloud-cli-interactive-shell-for-serverless-developers-45l)


## Prerequisites

- [Node.js] 18+
- [Google Cloud] account (see steps #1 and #2 [here](https://dev.to/subfuzion/getting-started-with-the-google-cloud-cli-interactive-shell-for-serverless-developers-45l#stuff-you-need-to-do-once))
- [gcloud]

For `gcloud`, you only need to install it. You can ignore all other
instructions. Once installed, run the following command:

```text
gcloud components install beta
```

## Usage

You can use `run` from the command line by using `npx` or by installing it
globally with `npm`.

```text
npx @subfuzion/run
```

Or

```text
npm i -g @subfuzion/run
```

If using `npx`, you might want to create a shell alias:

```text
alias run="npx @subfuzion/run@latest"
```

### Login / logout

```text
run login
run logout
```

The current version of `run` wraps auth functionality from `gcloud` and
implements other functionality using the [Node.js Cloud Client Library]. When
you execute `run login`, you will be prompted for authorization in the browser
twice: the first time for running wrapped interactive `gcloud` CLI commands and
the second time for obtaining credentials for use with the client library.

### Create a new app

```text
run create
```

You will be prompted for a name and project template to use.


### Deploy an app

```text
run deploy
```

On first deployment, you will be prompted for a service name to use to identify
the deployed app, a globally unique name to identify the Google Cloud project,
and a region to deploy the service to.

These settings are saved to a configuration file (`run.yaml`) in the working
directory.


## Install run as a package dependency


After setting up your configuration and testing it, you should install `run` as
a package `devDependency` to your `package.json` file with the following
command:

```text
npm install --save-dev @subfuzion/run
```

Then you can add package.json `run` scripts.

```json
  "scripts": {
    "deploy": "run deploy",
  },
```

## Contributing changes.

Entirely new samples and bug fixes are welcome, either as pull requests or as
GitHub issues.

See [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute.

## Licensing

Code in this repository is licensed under the Apache 2.0. See [LICENSE](LICENSE).


<!-- reference links -->

[Cloud Functions]: https://cloud.google.com/functions
[Cloud Run]: https://cloud.google.com/run
[Clu]: https://tron.fandom.com/wiki/Clu
[Google Cloud]: https://cloud.google.com/
[console]: https://console.cloud.google.com
[gcloud]: https://cloud.google.com/cli
[Getting started with the Google Cloud CLI interactive shell for serverless JavaScript developers]:
https://dev.to/subfuzion/getting-started-with-the-google-cloud-cli-interactive-shell-for-serverless-developers-45l
[Node.js]: https://nodejs.org/en/
[Node.js Cloud Client Library]: https://cloud.google.com/nodejs/docs/reference
