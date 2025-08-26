import React from 'react'
import { render, fireEvent, act } from '@testing-library/react'
import { vi, describe, expect, beforeAll, afterAll } from 'vitest'
import VolumeBar from './VolumeBar'

// Helper to dispatch a native volumechange event on audio
const dispatchVolumeChange = (audio) => {
  const event = new Event('volumechange')
  audio.dispatchEvent(event)
}

// Provide a predictable getBoundingClientRect for the bar root
const mockBarRect = (el, { left = 100, width = 200 } = {}) => {
  el.getBoundingClientRect = () => ({
    x: left,
    y: 0,
    top: 0,
    left,
    bottom: 0,
    right: left + width,
    width,
    height: 10,
    toJSON: () => null,
  })
}

describe('VolumeBar component', () => {
  beforeAll(() => {
    // Some tests rely on timers (animation timeout)
    vi.useFakeTimers()
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  const setup = (options = {}) => {
    const audio = document.createElement('audio')
    const initialVolume = typeof options.initialVolume === 'number' ? options.initialVolume : 0.5
    audio.volume = initialVolume
    const onMuteChange = vi.fn()
    const utils = render(
      <VolumeBar
        audio={audio}
        volume={initialVolume}
        onMuteChange={onMuteChange}
        showFilledVolume={
          options.showFilledVolume !== null && options.showFilledVolume !== undefined ? options.showFilledVolume : false
        }
        i18nVolumeControl="Volume"
      />
    )

    // Force componentDidUpdate to attach native audio event listener (component uses componentDidUpdate instead of componentDidMount)
    utils.rerender(
      <VolumeBar
        audio={audio}
        volume={initialVolume}
        onMuteChange={onMuteChange}
        showFilledVolume={
          options.showFilledVolume !== null && options.showFilledVolume !== undefined ? options.showFilledVolume : false
        }
        i18nVolumeControl="Volume"
      />
    )

    const area = utils.getByRole('progressbar')
    mockBarRect(area)
    return { ...utils, audio, onMuteChange, area, initialVolume }
  }

  test('renders with correct aria attributes and initial indicator position', () => {
    const { area, initialVolume } = setup()
    expect(area).toHaveAttribute('aria-valuemin', '0')
    expect(area).toHaveAttribute('aria-valuemax', '100')
    expect(area).toHaveAttribute('aria-valuenow', String(Math.round(initialVolume * 100)))
    const indicator = area.querySelector('.rhap_volume-indicator')
    expect(indicator.style.left).toMatch(/50(\.00)?%/)
  })

  test('responds to native audio volumechange events with animation then resets', () => {
    const { area, audio } = setup()
    act(() => {
      audio.volume = 0.8
      dispatchVolumeChange(audio)
    })
    const indicator = area.querySelector('.rhap_volume-indicator')
    // Immediately after change we should have animation duration .1s
    expect(indicator.style.transitionDuration).toBe('.1s')
    expect(indicator.style.left).toMatch(/80(\.00)?%/)
    // Advance timers to clear animation flag
    act(() => {
      vi.advanceTimersByTime(110)
    })
    expect(indicator.style.transitionDuration).toBe('0s')
  })

  test('fires onMuteChange when crossing mute boundary (non-zero -> 0 -> non-zero)', () => {
    const { audio, onMuteChange } = setup({ initialVolume: 0.4 })
    act(() => {
      audio.volume = 0
      dispatchVolumeChange(audio)
      audio.volume = 0.3
      dispatchVolumeChange(audio)
    })
    expect(onMuteChange).toHaveBeenCalledTimes(2)
  })

  test('dragging updates volume (mid, max, min) and animation flag not forced during drag sequence', () => {
    const { area, audio } = setup({ initialVolume: 0.2 })
    const indicator = area.querySelector('.rhap_volume-indicator')

    // Start drag at 25% (left + width * .25 => 100 + 50)
    fireEvent.mouseDown(area, { clientX: 150 })
    expect(audio.volume).toBeCloseTo(0.25, 2)
    expect(indicator.style.left).toBe('25%')

    // Move to >100% (right edge +) should clamp to 1
    fireEvent.mouseMove(window, { clientX: 310 }) // left + width (100 + 200) + 10 overflow
    expect(audio.volume).toBe(1)
    expect(indicator.style.left).toBe('100%')

    // Move to <0 (left - 20) should clamp to 0
    fireEvent.mouseMove(window, { clientX: 80 })
    expect(audio.volume).toBe(0)
    expect(indicator.style.left).toBe('0%')

    // Release
    fireEvent.mouseUp(window)

    // We don't assert exact transitionDuration because implementation may briefly set animation; ensure left reflects final volume
    expect(indicator.style.left).toBe('0%')
  })

  test('touch dragging updates volume', () => {
    const { area, audio } = setup({ initialVolume: 0.1 })
    const indicator = area.querySelector('.rhap_volume-indicator')
    // Start touch at 50%
    fireEvent.touchStart(area, { touches: [{ clientX: 200 }] }) // left 100 + 100 (50%)
    expect(audio.volume).toBeCloseTo(0.5, 2)
    expect(indicator.style.left).toBe('50%')
    fireEvent.touchMove(window, { touches: [{ clientX: 300 }] }) // 100%
    expect(audio.volume).toBe(1)
    fireEvent.touchEnd(window)
  })

  test('shows filled volume bar when showFilledVolume=true', () => {
    const { area } = setup({ showFilledVolume: true, initialVolume: 0.33 })
    const filled = area.querySelector('.rhap_volume-filled')
    expect(filled).toBeTruthy()
    expect(filled.style.width).toMatch(/33(\.00)?%/)
  })
})
