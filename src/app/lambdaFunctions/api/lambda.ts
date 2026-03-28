import { generateMessage } from '../../domain/messageGenerator.js'
import { LambdaFunctionURLEvent, LambdaFunctionURLResult } from 'aws-lambda/trigger/lambda-function-url'

export async function handler(event: LambdaFunctionURLEvent): Promise<LambdaFunctionURLResult> {
  console.log('API Lambda was called')
  const name = event.queryStringParameters?.['name']

  return {
    statusCode: 200,
    body: generateMessage(name)
  }
}
