import * as core from '@actions/core'
import * as github from '@actions/github'

type PullRequestActionType =
  | 'opened'
  | 'synchronize'
  | 'reopened'
  | 'closed'
  | 'edited'
  | string
  | undefined

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const token = core.getInput('github-token')
    const octokit = github.getOctokit(token)

    if (github.context.payload.pull_request) {
      const triggerType: PullRequestActionType = github.context.payload.action
      if (triggerType === 'opened') {
        await octokit.rest.issues.createComment({
          owner: github.context.repo.owner,
          repo: github.context.repo.repo,
          issue_number: github.context.payload.pull_request.number,
          body: `👋 Hello from naturallink.ai!`
        })
      }
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
    else core.setFailed(String(error))
  }
}
