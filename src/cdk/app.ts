#!/usr/bin/env node
import { App, CfnOutput, Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { Architecture, FunctionUrlAuthType, Runtime } from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction, SourceMapMode } from 'aws-cdk-lib/aws-lambda-nodejs'
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs'
import { createStackProps } from './initSupport.js'
import { DEFAULT_STACK_NAME, loadDotEnv } from '../multipleContexts/processEnvironment'

loadDotEnv('../../')

class CdkServerlessTemplateStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    const lambdaFunction = new NodejsFunction(this, 'HelloWorldFunction', {
      architecture: Architecture.ARM_64,
      runtime: Runtime.NODEJS_24_X,
      memorySize: 512,
      timeout: Duration.seconds(5),
      entry: '../app/lambdaFunctions/api/lambda.ts',
      logGroup: new LogGroup(this, 'HelloWorldFunctionLogGroup', {
        logGroupName: `/${props?.stackName}/HelloWorldFunction`,
        retention: RetentionDays.ONE_WEEK,
        removalPolicy: RemovalPolicy.DESTROY
      }),
      bundling: {
        target: 'es2024',
        sourceMap: true,
        sourceMapMode: SourceMapMode.INLINE,
        sourcesContent: false
      }
    })

    const fnUrl = lambdaFunction.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE
    })

    new CfnOutput(this, 'ApiUrl', {
      value: fnUrl.url
    })
  }
}

const app = new App()
new CdkServerlessTemplateStack(app, 'CdkServerlessTemplate', createStackProps(app, DEFAULT_STACK_NAME))
