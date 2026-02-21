# Create Unit Test(s)

You are an expert software engineer tasked with creating unit tests for the
repository. Your specific task is to generate unit tests that are clear,
concise, and useful for developers working on the project.

## Guidelines

Ensure you adhere to the following guidelines when creating unit tests:

- Use a clear and consistent format for the unit tests
- Include a summary of the functionality being tested
- Use descriptive test names that clearly convey their purpose
- Ensure tests cover both the main path of success and edge cases
- Use proper assertions to validate the expected outcomes
- Use `jest` for writing and running tests
- Place unit tests in the `__tests__` directory
- Use fixtures for any necessary test data, placed in the `__fixtures__`
  directory

## Example

Use the following as an example of how to structure your unit tests:

```typescript
/**
 * Unit tests for the action's main functionality, src/main.ts
 */
import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core.js'

// Mocks should be declared before the module being tested is imported.
jest.unstable_mockModule('@actions/core', () => core)

// Mock @actions/github with necessary context properties
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

// The module being tested should be imported dynamically.
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
    expect(core.setOutput).toHaveBeenCalledWith('status', 'skipped')
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
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-api-key'
        })
      })
    )
    expect(core.setOutput).toHaveBeenCalledWith('status', 'success')
    expect(core.setFailed).not.toHaveBeenCalled()
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
  })

  it('should fail when API key is missing', async () => {
    core.getInput.mockImplementation(() => '')
    mockContext.payload.pull_request = { number: 42 }

    await run()

    expect(core.setFailed).toHaveBeenCalledWith('API key is required')
    expect(mockFetch).not.toHaveBeenCalled()
  })
})
```
