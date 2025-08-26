import React from 'react'
import { render, act } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import Duration from './Duration'

function createMockAudio({ duration = 0 } = {}) {
  const listeners = {}
  const audio = {
    duration,
    addEventListener: vi.fn((event, cb) => {
      listeners[event] = cb
    }),
    removeEventListener: vi.fn((event) => {
      delete listeners[event]
    }),
    dispatch(event) {
      if (listeners[event]) listeners[event]({ target: audio })
    },
  }
  return audio
}

describe('Duration component', () => {
  const defaultDisplay = '00:00'

  it('renders defaultDuration when no audio provided', () => {
    const { container } = render(<Duration defaultDuration={defaultDisplay} timeFormat="auto" />)
    expect(container.textContent).toBe(defaultDisplay)
  })

  it('displays duration (mm:ss) with audio and format auto (< 1h)', () => {
    const audio = createMockAudio({ duration: 305 }) // 5:05
    const { container } = render(<Duration audio={audio} defaultDuration={defaultDisplay} timeFormat="auto" />)
    // Initial render already computes value
    expect(container.textContent).toBe('05:05')
  })

  it('displays duration (hh:mm:ss) when auto and >= 3600', () => {
    const audio = createMockAudio({ duration: 3661 }) // 1:01:01
    const { container } = render(<Duration audio={audio} defaultDuration={defaultDisplay} timeFormat="auto" />)
    expect(container.textContent).toBe('1:01:01')
  })

  it('honors explicit mm:ss', () => {
    const audio = createMockAudio({ duration: 3661 })
    const { container } = render(<Duration audio={audio} defaultDuration={defaultDisplay} timeFormat="mm:ss" />)
    // Even though >= 1h, should truncate to minutes only
    expect(container.textContent).toBe('61:01')
  })

  it('honors explicit hh:mm:ss', () => {
    const audio = createMockAudio({ duration: 59 })
    const { container } = render(<Duration audio={audio} defaultDuration={defaultDisplay} timeFormat="hh:mm:ss" />)
    expect(container.textContent).toBe('0:00:59')
  })

  it('updates on durationchange event', () => {
    const audio = createMockAudio({ duration: 10 })
    const { container } = render(<Duration audio={audio} defaultDuration={defaultDisplay} timeFormat="mm:ss" />)
    expect(container.textContent).toBe('00:10')
    audio.duration = 25
    act(() => {
      audio.dispatch('durationchange')
    })
    expect(container.textContent).toBe('00:25')
  })

  it('falls back to defaultDuration after event when initial formatter returns null (NaN)', () => {
    const audio = createMockAudio({ duration: NaN })
    const { container } = render(<Duration audio={audio} defaultDuration={defaultDisplay} timeFormat="auto" />)
    // Initial state stores null directly (renders empty string)
    expect(container.textContent).toBe('')
    act(() => {
      audio.dispatch('durationchange')
    })
    expect(container.textContent).toBe(defaultDisplay)
  })

  it('adds listeners only once across re-renders', () => {
    const audio = createMockAudio({ duration: 100 })
    const { rerender } = render(<Duration audio={audio} defaultDuration={defaultDisplay} timeFormat="mm:ss" />)
    // Re-render with different timeFormat
    rerender(<Duration audio={audio} defaultDuration={defaultDisplay} timeFormat="hh:mm:ss" />)
    expect(audio.addEventListener).toHaveBeenCalledTimes(2) // durationchange + abort
  })

  it('removes listeners on unmount', () => {
    const audio = createMockAudio({ duration: 50 })
    const { unmount } = render(<Duration audio={audio} defaultDuration={defaultDisplay} timeFormat="mm:ss" />)
    unmount()
    expect(audio.removeEventListener).toHaveBeenCalledTimes(2)
  })
})
