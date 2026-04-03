# CDK Serverless Template

This is a "walking skeleton" AWS Lambda app, using **TypeScript**, [**CDK**](https://aws.amazon.com/cdk/), [**Vitest**](https://vitest.dev), and [**GitHub Actions**](https://github.com/features/actions). It is fully
deployable, includes tests, and has a Github Actions workflow that will perform remote tests on an ephemeral
deployment in AWS.

In other words you can use this repo as a template for making your own TypeScript Lambda-based applications.

## Other CDK templates

This is one of a collection of CDK template projects I have created - others are as follows:

* [CDK bare-bones template for TypeScript](https://github.com/symphoniacloud/cdk-bare-bones) - Base project for any TypeScript app using CDK for deployment to AWS. **Try this first if you are getting started with CDK.**
* [Coffee Store Web Basic](https://github.com/symphoniacloud/coffee-store-web-basic) - Website hosting on AWS with CloudFront and S3
* [Coffee Store Web Full](https://github.com/symphoniacloud/coffee-store-web-full) - A further extension of _Coffee Store Web Basic_ that is a real working demo of a production-ready website project, including TLS certificates, DNS hosting, Github Actions Workflows, multiple CDK environments (prod vs test vs dev)

## How this project works

This example deploys a [CDK _App_](https://docs.aws.amazon.com/cdk/v2/guide/apps.html) that deploys a Lambda Function, together with a [Lambda Function URL](https://docs.aws.amazon.com/lambda/latest/dg/lambda-urls.html) to make it accessible over HTTP.

To build the Lambda function, this example uses the [`NodejsFunction` CDK Construct](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda_nodejs-readme.html) which performs build actions as part of the deploy process. In this configuration the Construct:

* Runs TSC in "noEmit" mode to perform type-checking
* Runs Esbuild to create an optimized artifact for the Lambda function 

### "CDK as build tool"

Using `NodejsFunction` makes CDK a build tool and not just a deployment tool. If you'd like more control over your build process then swap `NodejsFunction` for the standard [CDK `Function` construct](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda.Function.html), 
and add a _build_ phase to your project. To see an example of this, including a wrapper script for ESBuild, see the [earlier version of this project](https://github.com/symphoniacloud/cdk-serverless-template/tree/57a209a28be7eabe468125ea1d5dc0f81433fcd2).

## Prerequisites

Please see the [prerequisites of the cdk-bare-bones](https://github.com/symphoniacloud/cdk-bare-bones#prerequisites) project - all of the prerequisites in that project also apply to this one.

## Usage

After cloning this project to your local machine, run the following to perform local checks on the code:

```shell
$ npm install && npm run local-checks
```

If successful, the end result will look something like this:

```
 ✓ test/local/api.test.ts (2 tests) 2ms
   ✓ lambda function should return expected message when no name passed
   ✓ lambda function should return expected message when name on query string

 Test Files  1 passed (1)
      Tests  2 passed (2)
   Start at  18:55:58
   Duration  245ms (transform 30ms, setup 0ms, collect 28ms, tests 2ms, environment 0ms, prepare 47ms)
```

The unit tests run entirely locally, and execute the code directly, i.e. they do not use local runtime simulators. For
the reasoning behind this choice see [this article that I wrote](https://blog.symphonia.io/posts/2020-08-19_serverless_testing).

Once you've run npm install once in the directory you won't need to again unless you need to update dependencies.

To deploy the application to AWS run the following:

```shell
$ npm run deploy
```

If successful, the end result will look something like this:

```
 ✅  CdkServerlessTemplate (cdk-serverless-template)

✨  Deployment time: 63.31s

Outputs:
CdkServerlessTemplate.ApiUrl = https://2mnu7mnuphryvz5io3dlbprsam0wmxqv.lambda-url.us-east-1.on.aws/
Stack ARN:
arn:aws:cloudformation:us-east-1:397589511426:stack/cdk-serverless-template/a8c8bb20-d852-11ef-afa7-0e0775607411

✨  Total time: 67.13s
```

That `CdkServerlessTemplate.ApiUrl` value is a public URL - access it with your browser and you should see a "Hello World" message.

For other commands, **including how to teardown**, see the [_Usage_ section of the bare-bones project README](https://github.com/symphoniacloud/cdk-bare-bones#usage).

## Working Locally from an IDE

* Install dependencies with `npm install`, or your IDE's Node support.
* Run unit tests by running all tests under _/test/local_.

## Configuring the CloudFormation stack name

By default the stack deployed to CloudFormation is named _cdk-serverless-template_. To change this either:

* Set a `STACK_NAME` variable in a _.env_ file in your project root directory
* Set a `STACK_NAME` environment variable before deploying

E.g.

```shell
$ STACK_NAME=my-cdk-serverless-template npm run deploy
```

Alternatively, change the value of `DEFAULT_STACK_NAME` in [_/src/multipleContexts/processEnvironment.ts_](/src/multipleContexts/processEnvironment.ts) .

If you specify `STACK_NAME` in _.env_ **and** your environment then the environment takes precendence.

## Running remote tests

This project includes a remote test which calls the deployed app in AWS via https and validates the response.

### Running remote tests targeting a stack that has already been deployed

If you want to run the remote tests against a stack that has already been deployed then specify `STACK_NAME` in the same way as you do for deployment, as explained above, either in a _.env_ file
or in your environment. E.g.

```shell
$ STACK_NAME=my-cdk-serverless-template npm run remote-tests
```

If you don't specify `STACK_NAME` then the same default stack name, _cdk-serverless-template_, is used for remote tests (unless you set `STACK_NAME_PREFIX_FOR_REMOTE_TESTS` as explained in the next section.)

If you want to run remote tests via the IDE:

* Use the vitest configuration at _/test/remote/vitest.config.ts_
* Make sure to specify the `STACK_NAME` environment variable either in your environment or _.env_ file

### Running remote tests targeting an ephemeral stack

Alternatively the remote test can run against an _ephemeral_ stack - i.e. a new stack will be deployed as part of
test setup, and then torn down as part of test cleanup. Not surprisingly this method takes longer to run! To use this method specify a `STACK_NAME_PREFIX_FOR_REMOTE_TESTS` variable, either in a _.env_ file in your project root directory, or in your environment. E.g. :

```shell
$ STACK_NAME_PREFIX_FOR_REMOTE_TESTS=my-cdk-serverless-template-test-stack npm run remote-tests
```

If you do so you'll see something like the following:

```
> cdk-serverless-template@2026.1.0 remote-tests
> vitest run --dir test/remote --config test/remote/vitest.config.ts


 RUN  v4.1.2 /Users/mike/src/symphonia/mike/cdk-serverless-template

stdout | test/remote/api-remote.test.ts
Starting cloudformation deployment of stack my-cdk-serverless-template-test-stack-20260403-145310
```

and a little later you will see:

```
Calling cloudformation to delete stack my-cdk-serverless-template-test-stack-20260403-145310

 ✓ test/remote/api-remote.test.ts (1 test) 47349ms
   ✓ API should return 200 exit code and expected content  374ms

 Test Files  1 passed (1)
      Tests  1 passed (1)
   Start at  14:53:10
   Duration  47.50s (transform 20ms, setup 0ms, import 73ms, tests 47.35s, environment 0ms)
```

NB: If you specify **both** `STACK_NAME` and `STACK_NAME_PREFIX_FOR_REMOTE_TESTS` through a combination of your .env file and environment when running remote tests, then `STACK_NAME_PREFIX_FOR_REMOTE_TESTS` takes priority, and therefore an ephemeral stack is used. If
you want to use your fixed stack then remove `STACK_NAME_PREFIX_FOR_REMOTE_TESTS` from your environment.

## Continuous integration automation

### Github Actions Prerequisites

The included Github Actions workflow at [.github/workflows/buildAndTest.yml](.github/workflows/buildAndTest.yml) will
run all tests. For the remote tests a `STACK_NAME_PREFIX_FOR_REMOTE_TESTS` environment variable is specified, and therefore the workflow will deploy an ephemeral stack. This means the Github Actions workflow needs permission to access your AWS account.

For instructions on how to setup these permissions,
see [github-actions-prereqs/README.md](github-actions-prereqs/README.md).

Alternatively if you don't want to setup AWS integration for GitHub Actions change the [workflow definition](.github/workflows/buildAndTest.yml) to just run `local-checks`.

### Usage

The included workflow will either run automatically whenever you push a change to the `main` branch, or when you run
the workflow manually through the web console.

You might choose to update the workflow to also deploy a non-ephemeral version of the app. To do this add running
`npm run deploy` to your workflow - in which case you may also want to specify the `STACK_NAME` env var.

## Questions / Feedback / etc.

If you have questions related to this template please add a Github issue, or drop me a line
at [mike@symphonia.io](mailto:mike@symphonia.io) . I'm also on Mastodon at http://hachyderm.io/@mikebroberts and BlueSky at https://bsky.app/profile/mikebroberts.com .

## Previous Versions

This is an updated version of a demo app I originally put together in 2020 for
[Cloud Coffee Break](https://github.com/symphoniacloud/cloud-coffee-break), a YouTube series I recorded.

This version contains the following changes since the 2020 version, plus several others:

* Uses TypeScript instead of Javascript
* Uses CDK instead of SAM
* Uses Github Actions instead of AWS CodeBuild for automation. Github Actions-to-AWS security uses OIDC, not long-lived
  access tokens.
* Uses a Lambda Function URL instead of API Gateway

## Changelog

### 2026.2

* Switched to ES Modules (ESM)
* Changed stack name logic
* Updated dependencies
* Tightened up metadata files
* Renamed to "cdk-serverless-template" from "coffee-store-cdk"

### 2026.1

* Switch to Node 24 from Node 22
* Update ESBuild bundling target to ES2024
* Update Vitest 4
* Update minor version dependencies
* Replace deprecated logRetention with explicit LogGroup construct
* Update Lambda handler to use correct Lambda Function URL event types
* Update GitHub Actions to latest versions (checkout@v6, setup-node@v6, configure-aws-credentials@v5)
* Add Node.js version requirement to package.json engines field
* Switch to npm ci in GitHub Actions for deterministic builds
* Add .nvmrc file for Node version management
* Mark cdk.context.json as ignored in git

### 2025.1

* Renamed to "coffee-store-cdk" from "coffee-store-v2"
* Switch to Node 22 from 16
* Update package-lock to use latest versions of specified dependencies
* Use TypeScript 5
* Add ESLint and Prettier
* Switch to vitest from jest
* Separate "domain" code from Lambda code (mostly for demonstrating future ES module alternative)
* Introduce a little behavior that uses input event
* Extended tests to test extra behavior
* Moved and renamed some files / directories to fit how I've been working recently
* Add some Lambda configuration:
  * ARM Architecture
  * Specify memory size as 512 MB
  * Specify Timeout as 5 seconds
  * Use CDK Log Retention
* Switched to tsx from ts-node in CDK configuration (mostly for future ES module alternative)
* Removed no-longer used "import 'source-map-support/register'" from CDK
* Cleaned up unused libraries

### 2022.3

* Update project dependency versions
* Move cdk.json to src/cdk directory. This is for a couple of reasons:
  - One fewer file in project root, which I think is A Good Thing
  - Makes it easier to have repos with multiple, separate, CDK apps
* Update lambdaFunction definition for new relative location of app source code 
  - This is necessary because of the previous change - CDK is going to be running in a different directory now
* Move "output" and "requireApproval" CDK settings from package.json to cdk.json
  - I hadn't read the docs enough to know they could be in cdk.json. Oops. This way is cleaner
* Use CDK `build` step to run TSC instead of `preCompilation` in NodejsFunction
  - Getting NodejsFunction to run tsc just for type-checking is problematic, but I had it working in previous version.
I hadn't realized before that the "build" CDK property applied to *all* synth activities, not just "cdk watch", and so putting project-wide type checking in the "build" property, combined with still using NodejsFunction for running esbuild, is a cleaner solution. This allows cleaning up the previous workaround in tsconfig.json

### 2022.2

* Update Node to Node 16 (tooling + runtime)
* Switch to CDK for building, by using [NodejsFunction](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda_nodejs.NodejsFunction.html)
* Standardize project setup vs https://github.com/symphoniacloud/cdk-bare-bones
* Update this README, referring to bare bones project to avoid duplication
* Remove username based stack naming to simplify things a little

### 2022.1

* Uses TypeScript instead of Javascript, plus some opinionated build + package scripting
* Uses CDK instead of SAM
* Uses Github Actions instead of AWS CodeBuild for automation. Github Actions-to-AWS security uses OIDC, not long-lived
  access tokens.
* Uses a Lambda Function URL instead of API Gateway