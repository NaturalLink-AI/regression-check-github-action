/**
 * Unit tests for src/wait.ts
 */
import { jest } from '@jest/globals'
import { wait } from '../src/wait.js'

describe('wait.ts', () => {
  it('Throws an invalid number', async () => {
    const input = parseInt('foo', 10)

    expect(isNaN(input)).toBe(true)

    await expect(wait(input)).rejects.toThrow('milliseconds is not a number')
  })

  it('Waits with a valid number', async () => {
    jest.useFakeTimers()

    try {
      const promise = wait(500)
      jest.advanceTimersByTime(500)
      await expect(promise).resolves.toBe('done!')
    } finally {
      jest.useRealTimers()
    }
  })
})
