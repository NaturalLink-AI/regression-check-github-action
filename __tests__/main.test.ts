/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * To mock dependencies in ESM, you can create fixtures that export mock
 * functions and objects. For example, the core module is mocked in this test,
 * so that the actual '@actions/core' module is not imported.
 */
import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core.js'

// Mocks should be declared before the module being tested is imported.
jest.unstable_mockModule('@actions/core', () => core)

// Mock @actions/github
const mockContext = {
  payload: {
    pull_request: null as { number: number } | null
  },
  repo: {
    owner: 'test-owner',
    repo: 'test-repo'
  },
  sha: 'abc123'
}
jest.unstable_mockModule('@actions/github', () => ({
  context: mockContext
}))

// Mock global fetch
const mockFetch = jest.fn()
global.fetch = mockFetch as typeof fetch

// The module being tested should be imported dynamically. This ensures that the
// mocks are used in place of any actual dependencies.
const { run } = await import('../src/main.js')

describe('main.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockContext.payload.pull_request = null
    // Default: return a valid API key
    core.getInput.mockImplementation((name: string) => {
      if (name === 'api-key') return 'test-api-key'
      return ''
    })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should skip execution when not a pull request', async () => {
    mockContext.payload.pull_request = null

    await run()

    expect(mockFetch).not.toHaveBeenCalled()
    expect(core.setFailed).not.toHaveBeenCalled()
    expect(core.setOutput).toHaveBeenCalledWith('status', 'skipped')
    expect(core.setOutput).toHaveBeenCalledWith('regressions-detected', 'false')
  })

  it('should call NaturalLink API on pull request', async () => {
    mockContext.payload.pull_request = { number: 42 }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'success',
        report_url: 'https://app.naturallink.ai/report/123',
        regressions_detected: false
      })
    })

    await run()

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.naturallink.ai/v1/check',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-api-key'
        },
        body: JSON.stringify({
          repository: { owner: 'test-owner', repo: 'test-repo' },
          pull_request: 42,
          sha: 'abc123'
        })
      }
    )
    expect(core.setOutput).toHaveBeenCalledWith('status', 'success')
    expect(core.setOutput).toHaveBeenCalledWith(
      'report-url',
      'https://app.naturallink.ai/report/123'
    )
    expect(core.setOutput).toHaveBeenCalledWith('regressions-detected', 'false')
    expect(core.setFailed).not.toHaveBeenCalled()
  })

  it('should warn when regressions are detected', async () => {
    mockContext.payload.pull_request = { number: 42 }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'warning',
        report_url: 'https://app.naturallink.ai/report/456',
        regressions_detected: true
      })
    })

    await run()

    expect(core.setOutput).toHaveBeenCalledWith('regressions-detected', 'true')
    expect(core.warning).toHaveBeenCalledWith(
      'Unintended UI regressions detected. Please review the report.'
    )
  })

  it('should handle API errors gracefully', async () => {
    mockContext.payload.pull_request = { number: 42 }

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => 'Unauthorized'
    })

    await run()

    expect(core.setFailed).toHaveBeenCalledWith(
      'API request failed: 401 Unauthorized'
    )
    expect(core.setOutput).toHaveBeenCalledWith('status', 'failure')
  })

  it('should handle network errors gracefully', async () => {
    mockContext.payload.pull_request = { number: 42 }

    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    await run()

    expect(core.setFailed).toHaveBeenCalledWith('Network error')
    expect(core.setOutput).toHaveBeenCalledWith('status', 'failure')
  })

  it('should handle non-Error exceptions gracefully', async () => {
    mockContext.payload.pull_request = { number: 42 }

    mockFetch.mockRejectedValueOnce('String error message')

    await run()

    expect(core.setFailed).toHaveBeenCalledWith('String error message')
  })

  it('should fail when API key is missing', async () => {
    core.getInput.mockImplementation(() => '')
    mockContext.payload.pull_request = { number: 42 }

    await run()

    expect(core.setFailed).toHaveBeenCalledWith('API key is required')
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should mask the API key in logs', async () => {
    mockContext.payload.pull_request = null

    await run()

    expect(core.setSecret).toHaveBeenCalledWith('test-api-key')
  })

  it('should handle response without report URL', async () => {
    mockContext.payload.pull_request = { number: 42 }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'success',
        report_url: '',
        regressions_detected: false
      })
    })

    await run()

    expect(core.setOutput).toHaveBeenCalledWith('status', 'success')
    expect(core.setOutput).toHaveBeenCalledWith('report-url', '')
    expect(core.info).not.toHaveBeenCalledWith(
      expect.stringContaining('View full report')
    )
  })
})
