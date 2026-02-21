import * as core from '@actions/core'
import * as github from '@actions/github'

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    // Get the API key input
    const apiKey = core.getInput('api-key', { required: true })

    if (!apiKey) {
      core.setFailed('API key is required')
      return
    }

    // Mask the API key in logs
    core.setSecret(apiKey)

    if (github.context.payload.pull_request) {
      const prNumber = github.context.payload.pull_request.number
      core.info(`Running regression check for PR #${prNumber}`)

      // Call NaturalLink API to check for regressions
      const response = await fetch('https://api.naturallink.ai/v1/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          repository: github.context.repo,
          pull_request: prNumber,
          sha: github.context.sha
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        core.setFailed(`API request failed: ${response.status} ${errorText}`)
        core.setOutput('status', 'failure')
        core.setOutput('regressions-detected', 'false')
        return
      }

      const result = (await response.json()) as {
        status: string
        report_url: string
        regressions_detected: boolean
      }

      // Set outputs
      core.setOutput('status', result.status)
      core.setOutput('report-url', result.report_url)
      core.setOutput(
        'regressions-detected',
        String(result.regressions_detected)
      )

      // Log results
      core.info(`Regression check complete: ${result.status}`)
      if (result.report_url) {
        core.info(`View full report: ${result.report_url}`)
      }

      if (result.regressions_detected) {
        core.warning(
          'Unintended UI regressions detected. Please review the report.'
        )
      } else {
        core.info('No unintended regressions detected.')
      }
    } else {
      core.info('Not a pull request - skipping regression check')
      core.setOutput('status', 'skipped')
      core.setOutput('regressions-detected', 'false')
    }
  } catch (error) {
    core.setOutput('status', 'failure')
    core.setOutput('regressions-detected', 'false')
    if (error instanceof Error) core.setFailed(error.message)
    else core.setFailed(String(error))
  }
}
