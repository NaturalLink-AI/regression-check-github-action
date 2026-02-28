import * as core from '@actions/core'
import * as github from '@actions/github'

type RunType = 'REGRESSION_CHECK' | 'GRAPH_GENERATION'

type RunStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'DISCOVERING'
  | 'PARSING'
  | 'SUCCESS'
  | 'ERROR'

interface TriggerRunRequest {
  type: RunType
  repository: string
  branch: string
  commitSha?: string
}

interface RunResponse {
  id: string
  type: RunType
  status: RunStatus
}

interface ErrorResponse {
  error: string
}

const TERMINAL_STATUSES: RunStatus[] = ['SUCCESS', 'ERROR']

const STATUS_MESSAGES: Record<RunStatus, string> = {
  PENDING: '⏳ Waiting in queue...',
  IN_PROGRESS: '🔄 Analyzing your code...',
  DISCOVERING: '🔍 Scanning repository...',
  PARSING: '📝 Understanding code structure...',
  SUCCESS: '✅ Analysis complete!',
  ERROR: '❌ Analysis encountered an issue'
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getBranchFromRef(ref: string): string {
  if (ref.startsWith('refs/heads/')) {
    return ref.replace('refs/heads/', '')
  }
  if (ref.startsWith('refs/pull/')) {
    const prNumber = ref.split('/')[2]
    return `pr-${prNumber}`
  }
  return ref
}

async function triggerRun(
  apiUrl: string,
  apiKey: string,
  request: TriggerRunRequest
): Promise<RunResponse> {
  const url = `${apiUrl}/api/runs/trigger`

  core.debug(`Triggering run at ${url}`)
  core.debug(`Request: ${JSON.stringify(request)}`)

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey
    },
    body: JSON.stringify(request)
  })

  const responseText = await response.text()
  core.debug(`Response status: ${response.status}`)
  core.debug(`Response body: ${responseText}`)

  if (!response.ok) {
    let errorMessage = `${response.status} ${response.statusText}`
    try {
      const errorBody = JSON.parse(responseText) as ErrorResponse
      if (errorBody.error) {
        errorMessage = errorBody.error
      }
    } catch {
      if (responseText) {
        errorMessage = responseText
      }
    }
    throw new Error(`Failed to trigger run: ${errorMessage}`)
  }

  return JSON.parse(responseText) as RunResponse
}

async function getRunStatus(
  apiUrl: string,
  apiKey: string,
  runId: string
): Promise<RunResponse> {
  const url = `${apiUrl}/api/runs/${runId}/status`

  core.debug(`Fetching run status from ${url}`)

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-API-Key': apiKey
    }
  })

  const responseText = await response.text()
  core.debug(`Response status: ${response.status}`)
  core.debug(`Response body: ${responseText}`)

  if (!response.ok) {
    let errorMessage = `${response.status} ${response.statusText}`
    try {
      const errorBody = JSON.parse(responseText) as ErrorResponse
      if (errorBody.error) {
        errorMessage = errorBody.error
      }
    } catch {
      if (responseText) {
        errorMessage = responseText
      }
    }
    throw new Error(`Failed to get run status: ${errorMessage}`)
  }

  return JSON.parse(responseText) as RunResponse
}

async function pollForCompletion(
  apiUrl: string,
  apiKey: string,
  runId: string,
  pollIntervalSeconds: number,
  timeoutSeconds: number
): Promise<RunResponse> {
  const startTime = Date.now()
  const timeoutMs = timeoutSeconds * 1000
  const pollIntervalMs = pollIntervalSeconds * 1000

  let lastStatus: RunStatus | null = null
  let pollCount = 0

  while (true) {
    pollCount++
    const elapsedMs = Date.now() - startTime

    if (elapsedMs >= timeoutMs) {
      throw new Error(
        `The analysis timed out after ${Math.round(timeoutSeconds / 60)} minutes. Please try again or contact support.`
      )
    }

    const runStatus = await getRunStatus(apiUrl, apiKey, runId)

    if (runStatus.status !== lastStatus) {
      core.info(STATUS_MESSAGES[runStatus.status])
      lastStatus = runStatus.status
    }

    core.debug(
      `Poll #${pollCount}: ${runStatus.status} (elapsed: ${Math.round(elapsedMs / 1000)}s)`
    )

    if (TERMINAL_STATUSES.includes(runStatus.status)) {
      return runStatus
    }

    await sleep(pollIntervalMs)
  }
}

export async function run(): Promise<void> {
  try {
    const apiKey = core.getInput('api-key', { required: true })
    const apiUrl = core.getInput('api-url') || 'https://api.naturallink.ai'
    const pollInterval = parseInt(core.getInput('poll-interval') || '5', 10)
    const timeout = parseInt(core.getInput('timeout') || '300', 10)

    if (!apiKey) {
      core.setFailed(
        'API key is required. Get yours at https://dashboard.naturallink.ai'
      )
      return
    }

    core.setSecret(apiKey)

    const { owner, repo } = github.context.repo
    const repository = `${owner}/${repo}`
    const ref = github.context.ref
    const sha = github.context.sha

    const branch = getBranchFromRef(ref)

    core.info('')
    core.info('🔬 NaturalLink Regression Check')
    core.info('────────────────────────────────────────')
    core.info(`   ${repository} @ ${branch}`)
    core.info(`   Commit: ${sha.substring(0, 7)}`)
    core.info('')

    const triggerRequest: TriggerRunRequest = {
      type: 'REGRESSION_CHECK',
      repository,
      branch,
      commitSha: sha
    }

    core.info('🚀 Starting regression analysis...')
    core.info('')

    const triggerResponse = await triggerRun(apiUrl, apiKey, triggerRequest)

    core.debug(`Internal run ID: ${triggerResponse.id}`)
    core.setOutput('run-id', triggerResponse.id)

    const finalStatus = await pollForCompletion(
      apiUrl,
      apiKey,
      triggerResponse.id,
      pollInterval,
      timeout
    )

    core.info('')
    core.info('────────────────────────────────────────')

    core.setOutput('status', finalStatus.status)

    if (finalStatus.status === 'SUCCESS') {
      core.info('')
      core.info('✅ No regressions detected')
      core.info('')
      core.info('   Your changes look good! No unintended')
      core.info('   side effects were found.')
      core.info('')
    } else if (finalStatus.status === 'ERROR') {
      core.info('')
      core.info('❌ Check failed')
      core.info('')
      core.info('   The regression check could not complete.')
      core.info('   Please check the logs above for details.')
      core.info('')
      core.setFailed('Regression check failed')
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)

    core.info('')
    core.info('────────────────────────────────────────')
    core.info('')
    core.info('❌ Something went wrong')
    core.info('')

    if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
      core.info('   Your API key appears to be invalid.')
      core.info('   Please check your NATURALLINK_API_KEY secret.')
      core.info('')
      core.info('   Get a new key at: https://dashboard.naturallink.ai')
    } else if (errorMessage.includes('timed out')) {
      core.info('   The analysis took too long to complete.')
      core.info('   This can happen with very large repositories.')
      core.info('')
      core.info('   Try increasing the timeout or contact support.')
    } else if (
      errorMessage.includes('Network') ||
      errorMessage.includes('fetch')
    ) {
      core.info('   Could not connect to NaturalLink servers.')
      core.info('   Please check your network connection.')
    } else {
      core.info(`   ${errorMessage}`)
    }

    core.info('')
    core.info('   Need help? contact@naturallink.ai')
    core.info('')

    core.setOutput('status', 'ERROR')
    core.setOutput('error-message', errorMessage)
    core.setFailed(errorMessage)
  }
}
