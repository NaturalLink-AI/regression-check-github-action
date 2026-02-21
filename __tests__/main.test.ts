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
    pull_request: null
  }
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
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should skip execution when not a pull request', async () => {
    mockContext.payload.pull_request = null

    await run()

    expect(mockFetch).not.toHaveBeenCalled()
    expect(core.setFailed).not.toHaveBeenCalled()
  })

  it('should make HEAD request to naturallink.ai on pull request', async () => {
    mockContext.payload.pull_request = { number: 1 } as never

    const mockHeaders = new Headers({ 'content-type': 'text/html' })
    mockFetch.mockResolvedValueOnce({
      status: 200,
      statusText: 'OK',
      headers: mockHeaders
    })

    await run()

    expect(mockFetch).toHaveBeenCalledWith('https://naturallink.ai', {
      method: 'HEAD'
    })
    expect(core.info).toHaveBeenCalled()
    expect(core.setFailed).not.toHaveBeenCalled()
  })

  it('should handle fetch errors gracefully', async () => {
    mockContext.payload.pull_request = { number: 1 } as never

    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    await run()

    expect(core.setFailed).toHaveBeenCalledWith('Network error')
  })
})
