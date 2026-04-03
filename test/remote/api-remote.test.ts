import { promisify } from 'node:util'
import { afterAll, beforeAll, expect, test } from 'vitest'
import {
  CloudFormationClient,
  DeleteStackCommand,
  DescribeStacksCommand
} from '@aws-sdk/client-cloudformation'
import { exec } from 'node:child_process'
import { get } from 'node:https'

import { DEFAULT_STACK_NAME, loadDotEnv } from '../../src/multipleContexts/processEnvironment'

let isUsingEphemeralStack: boolean
let stackName: string
let apiUrl: string

beforeAll(async () => {
  loadDotEnv()
  const environmentStackName = process.env['STACK_NAME']
  const environmentStackNamePrefix = process.env['STACK_NAME_PREFIX_FOR_REMOTE_TESTS']

  if (environmentStackName && environmentStackNamePrefix) {
    console.log(
      '*** Both STACK_NAME and STACK_NAME_PREFIX_FOR_REMOTE_TESTS are set in environment - STACK_NAME_PREFIX_FOR_REMOTE_TESTS takes priority ***'
    )
    console.log(
      '*** To run remote tests against STACK_NAME then remove STACK_NAME_PREFIX_FOR_REMOTE_TESTS from environment ***'
    )
  }

  if (environmentStackNamePrefix === undefined) {
    isUsingEphemeralStack = false
    stackName = environmentStackName ?? DEFAULT_STACK_NAME
  } else {
    isUsingEphemeralStack = true
    stackName = generateEphemeralStackName(environmentStackNamePrefix)
  }

  if (isUsingEphemeralStack) {
    console.log(`Starting cloudformation deployment of stack ${stackName}`)
    const { stdout } = await promisify(exec)(`STACK_NAME=${stackName} npm run deploy`)
    console.log(stdout)
  } else {
    console.log(`Using existing stack ${stackName} as application target`)
  }

  const cloudformationStacks = await new CloudFormationClient({}).send(
    new DescribeStacksCommand({ StackName: stackName })
  )

  // @ts-expect-error - find() may return undefined but we expect the output to always be present
  apiUrl = cloudformationStacks.Stacks[0].Outputs.find((output) => output.OutputKey === 'ApiUrl').OutputValue

  console.log(`Using Coffee Store API at [${apiUrl}]`)
})

function generateEphemeralStackName(prefix: string): string {
  const now = new Date(),
    year = now.getFullYear(),
    month = twoCharacter(now.getMonth() + 1),
    day = twoCharacter(now.getDate()),
    hours = twoCharacter(now.getHours()),
    minutes = twoCharacter(now.getMinutes()),
    seconds = twoCharacter(now.getSeconds())
  return `${prefix}-${year}${month}${day}-${hours}${minutes}${seconds}`
}

function twoCharacter(number: number) {
  return number < 10 ? `0${number}` : `${number}`
}

afterAll(async () => {
  if (isUsingEphemeralStack) {
    console.log(`Calling cloudformation to delete stack ${stackName}`)
    await new CloudFormationClient({}).send(new DeleteStackCommand({ StackName: stackName }))
  } else {
    console.log(`Leaving stack ${stackName} as deployed`)
  }
})

test('API should return 200 exit code and expected content', async () => {
  expect(apiUrl).toBeDefined()

  const result = await getWithBody(`${apiUrl}?name=bob`)

  expect(result.statusCode).toBe(200)
  expect(result.body).toBe('Hello, bob!')
})

function getWithBody(url: string): Promise<{
  statusCode?: number
  body: string | undefined
}> {
  return new Promise((resolve, reject) => {
    get(url, (response) => {
      let body = ''
      response.on('data', (chunk) => (body += chunk))
      response.on('end', () => resolve({ ...response, ...{ body: body } }))
    }).on('error', reject)
  })
}
