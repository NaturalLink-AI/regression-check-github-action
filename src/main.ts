import * as core from '@actions/core'
import * as github from '@actions/github'

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    if (github.context.payload.pull_request) {
      const headResponse = await fetch('https://naturallink.ai', {
        method: 'HEAD'
      })
      const responseHeaders: Record<string, string> = Object.fromEntries(
        headResponse.headers.entries()
      )
      core.info(
        `HEAD https://naturallink.ai -> ${headResponse.status} ${headResponse.statusText}`
      )
      core.info(`Response headers: ${JSON.stringify(responseHeaders)}`)
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
    else core.setFailed(String(error))
  }
}
