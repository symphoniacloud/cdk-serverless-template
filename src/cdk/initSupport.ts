import { App, Environment, StackProps } from 'aws-cdk-lib'

type StackPropsWithAccountRegionAndStackName =
  | Required<Pick<StackProps, 'env' | 'stackName'>>
  | Omit<StackProps, 'env' | 'stackName'>

/**
 * Generates stack properties based on a default stack name and current AWS environment
 * @param app The CDK app instance
 * @param defaultStackName Will be used as stackName, unless a stackName property is specified in the app context
 * @return valid StackProps, with env and stackName specified
 */
export function createStackProps(
  app: App,
  defaultStackName: string
): StackPropsWithAccountRegionAndStackName {
  return { env: calcEnvironment(), stackName: calcStackName(app, defaultStackName) }
}

/**
 * @param app The CDK app instance
 * @param defaultStackName default stack name
 * @return defaultStackName, unless stackName is specified in app context or STACK_NAME env var, in which case that is returned instead
 */
export function calcStackName(app: App, defaultStackName: string) {
  return app.node.tryGetContext('stackName') || process.env.STACK_NAME || defaultStackName
}

/**
 * @return An Environment with both account and region set according to the current AWS environment (see https://docs.aws.amazon.com/cdk/v2/guide/environments.html)
 */
export function calcEnvironment(): Required<Environment> {
  const account = process.env.CDK_DEFAULT_ACCOUNT
  const region = process.env.CDK_DEFAULT_REGION

  if (account && region) return { account, region }

  throw new Error('Unable to read CDK_DEFAULT_ACCOUNT or CDK_DEFAULT_REGION')
}
