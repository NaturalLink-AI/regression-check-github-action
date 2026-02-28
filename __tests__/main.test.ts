/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * To mock dependencies in ESM, you can create fixtures that export mock
 * functions and objects. For example, the core module is mocked in this test,
 * so that the actual '@actions/core' module is not imported.
 */
import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core.js'

jest.unstable_mockModule('@actions/core', () => core)

const mockContext = {
  payload: {
    pull_request: null as { number: number } | null
  },
  repo: {
    owner: 'test-owner',
    repo: 'test-repo'
  },
  ref: 'refs/heads/main',
  sha: 'abc123def456789'
}
jest.unstable_mockModule('@actions/github', () => ({
  context: mockContext
}))

const mockFetch = jest.fn()
global.fetch = mockFetch as typeof fetch

const { run } = await import('../src/main.js')

const TEST_RUN_ID = '550e8400-e29b-41d4-a716-446655440000'
const API_URL = 'https://api.naturallink.ai'

function createSuccessResponse<T>(data: T) {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    text: async () => JSON.stringify(data)
  }
}

function createErrorResponse(
  status: number,
  statusText: string,
  errorMessage?: string
) {
  return {
    ok: false,
    status,
    statusText,
    text: async () =>
      errorMessage ? JSON.stringify({ error: errorMessage }) : statusText
  }
}

describe('main.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockContext.ref = 'refs/heads/main'
    mockContext.sha = 'abc123def456789'
    core.getInput.mockImplementation((name: string) => {
      if (name === 'api-key') return 'test-api-key'
      if (name === 'api-url') return API_URL
      if (name === 'poll-interval') return '0.1'
      if (name === 'timeout') return '5'
      return ''
    })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should trigger run and poll until success', async () => {
    mockFetch
      .mockResolvedValueOnce(
        createSuccessResponse({
          id: TEST_RUN_ID,
          type: 'REGRESSION_CHECK',
          status: 'PENDING'
        })
      )
      .mockResolvedValueOnce(
        createSuccessResponse({
          id: TEST_RUN_ID,
          type: 'REGRESSION_CHECK',
          status: 'IN_PROGRESS'
        })
      )
      .mockResolvedValueOnce(
        createSuccessResponse({
          id: TEST_RUN_ID,
          type: 'REGRESSION_CHECK',
          status: 'SUCCESS'
        })
      )

    await run()

    expect(mockFetch).toHaveBeenCalledWith(`${API_URL}/api/runs/trigger`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'test-api-key'
      },
      body: JSON.stringify({
        type: 'REGRESSION_CHECK',
        repository: 'test-owner/test-repo',
        branch: 'main',
        commitSha: 'abc123def456789'
      })
    })

    expect(mockFetch).toHaveBeenCalledWith(
      `${API_URL}/api/runs/${TEST_RUN_ID}/status`,
      {
        method: 'GET',
        headers: {
          'X-API-Key': 'test-api-key'
        }
      }
    )

    expect(core.setOutput).toHaveBeenCalledWith('run-id', TEST_RUN_ID)
    expect(core.setOutput).toHaveBeenCalledWith('status', 'SUCCESS')
    expect(core.setFailed).not.toHaveBeenCalled()
  })

  it('should handle run failure with ERROR status', async () => {
    mockFetch
      .mockResolvedValueOnce(
        createSuccessResponse({
          id: TEST_RUN_ID,
          type: 'REGRESSION_CHECK',
          status: 'PENDING'
        })
      )
      .mockResolvedValueOnce(
        createSuccessResponse({
          id: TEST_RUN_ID,
          type: 'REGRESSION_CHECK',
          status: 'ERROR'
        })
      )

    await run()

    expect(core.setOutput).toHaveBeenCalledWith('status', 'ERROR')
    expect(core.setFailed).toHaveBeenCalledWith('Regression check failed')
  })

  it('should handle API errors gracefully', async () => {
    mockFetch.mockResolvedValueOnce(
      createErrorResponse(401, 'Unauthorized', 'Invalid API key')
    )

    await run()

    expect(core.setFailed).toHaveBeenCalledWith('HTTP 401: Invalid API key')
    expect(core.setOutput).toHaveBeenCalledWith('status', 'ERROR')
  })

  it('should handle API error responses with plain text', async () => {
    mockFetch.mockResolvedValueOnce(createErrorResponse(404, 'Not Found'))

    await run()

    expect(core.setFailed).toHaveBeenCalledWith('HTTP 404: Not Found')
    expect(core.setOutput).toHaveBeenCalledWith('status', 'ERROR')
  })

  it('should handle network errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    await run()

    expect(core.setFailed).toHaveBeenCalledWith('Network error')
    expect(core.setOutput).toHaveBeenCalledWith('status', 'ERROR')
  })

  it('should handle non-Error exceptions gracefully', async () => {
    mockFetch.mockRejectedValueOnce('String error message')

    await run()

    expect(core.setFailed).toHaveBeenCalledWith('String error message')
  })

  it('should fail when API key is missing', async () => {
    core.getInput.mockImplementation((name: string) => {
      if (name === 'api-url') return API_URL
      return ''
    })

    await run()

    expect(core.setFailed).toHaveBeenCalledWith(
      expect.stringContaining('API key is required')
    )
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should mask the API key in logs', async () => {
    mockFetch
      .mockResolvedValueOnce(
        createSuccessResponse({
          id: TEST_RUN_ID,
          type: 'REGRESSION_CHECK',
          status: 'PENDING'
        })
      )
      .mockResolvedValueOnce(
        createSuccessResponse({
          id: TEST_RUN_ID,
          type: 'REGRESSION_CHECK',
          status: 'SUCCESS'
        })
      )

    await run()

    expect(core.setSecret).toHaveBeenCalledWith('test-api-key')
  })

  it('should extract branch from refs/heads/', async () => {
    mockContext.ref = 'refs/heads/feature/my-branch'

    mockFetch
      .mockResolvedValueOnce(
        createSuccessResponse({
          id: TEST_RUN_ID,
          type: 'REGRESSION_CHECK',
          status: 'PENDING'
        })
      )
      .mockResolvedValueOnce(
        createSuccessResponse({
          id: TEST_RUN_ID,
          type: 'REGRESSION_CHECK',
          status: 'SUCCESS'
        })
      )

    await run()

    expect(mockFetch).toHaveBeenCalledWith(
      `${API_URL}/api/runs/trigger`,
      expect.objectContaining({
        body: expect.stringContaining('"branch":"feature/my-branch"')
      })
    )
  })

  it('should handle PR refs', async () => {
    mockContext.ref = 'refs/pull/42/merge'

    mockFetch
      .mockResolvedValueOnce(
        createSuccessResponse({
          id: TEST_RUN_ID,
          type: 'REGRESSION_CHECK',
          status: 'PENDING'
        })
      )
      .mockResolvedValueOnce(
        createSuccessResponse({
          id: TEST_RUN_ID,
          type: 'REGRESSION_CHECK',
          status: 'SUCCESS'
        })
      )

    await run()

    expect(mockFetch).toHaveBeenCalledWith(
      `${API_URL}/api/runs/trigger`,
      expect.objectContaining({
        body: expect.stringContaining('"branch":"pr-42"')
      })
    )
  })

  it('should timeout if run does not complete', async () => {
    core.getInput.mockImplementation((name: string) => {
      if (name === 'api-key') return 'test-api-key'
      if (name === 'api-url') return API_URL
      if (name === 'poll-interval') return '0.05'
      if (name === 'timeout') return '0.1'
      return ''
    })

    mockFetch
      .mockResolvedValueOnce(
        createSuccessResponse({
          id: TEST_RUN_ID,
          type: 'REGRESSION_CHECK',
          status: 'PENDING'
        })
      )
      .mockResolvedValue(
        createSuccessResponse({
          id: TEST_RUN_ID,
          type: 'REGRESSION_CHECK',
          status: 'IN_PROGRESS'
        })
      )

    await run()

    expect(core.setFailed).toHaveBeenCalledWith(
      expect.stringContaining('timed out')
    )
    expect(core.setOutput).toHaveBeenCalledWith('status', 'ERROR')
  })

  it('should poll through intermediate statuses', async () => {
    mockFetch
      .mockResolvedValueOnce(
        createSuccessResponse({
          id: TEST_RUN_ID,
          type: 'REGRESSION_CHECK',
          status: 'PENDING'
        })
      )
      .mockResolvedValueOnce(
        createSuccessResponse({
          id: TEST_RUN_ID,
          type: 'REGRESSION_CHECK',
          status: 'PENDING'
        })
      )
      .mockResolvedValueOnce(
        createSuccessResponse({
          id: TEST_RUN_ID,
          type: 'REGRESSION_CHECK',
          status: 'DISCOVERING'
        })
      )
      .mockResolvedValueOnce(
        createSuccessResponse({
          id: TEST_RUN_ID,
          type: 'REGRESSION_CHECK',
          status: 'PARSING'
        })
      )
      .mockResolvedValueOnce(
        createSuccessResponse({
          id: TEST_RUN_ID,
          type: 'REGRESSION_CHECK',
          status: 'SUCCESS'
        })
      )

    await run()

    expect(mockFetch).toHaveBeenCalledTimes(5)
    expect(core.setOutput).toHaveBeenCalledWith('status', 'SUCCESS')
    expect(core.setFailed).not.toHaveBeenCalled()
  })
})
