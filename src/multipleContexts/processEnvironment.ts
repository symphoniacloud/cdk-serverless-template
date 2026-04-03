import { readFileSync } from 'node:fs'
import { parseEnv } from 'node:util'

// This needs to be here, and not in app.ts, because loading app.ts has side effects - i.e. running CDK
//  and we also want to use this from remote test
export const DEFAULT_STACK_NAME = 'coffee-store-cdk'

export function loadDotEnv(pathPrefix?: string) {
  try {
    for (const [key, value] of Object.entries(parseEnv(readFileSync(`${pathPrefix ?? ''}.env`, 'utf-8'))))
      // Existing environment variables take precedence over .env
      if (!(key in process.env)) process.env[key] = value
  } catch {
    // no .env, that's fine
  }
}
