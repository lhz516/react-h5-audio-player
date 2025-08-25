import React from 'react'
import { render, fireEvent, act } from '@testing-library/react'
import ProgressBarDefault, { ProgressBar as RawProgressBar } from './ProgressBar'

// Helper to create a mock HTMLAudioElement with configurable duration & currentTime
function createMockAudio({ duration = 120, currentTime = 0 } = {}) {
  const listeners = {}
  const bufferedRanges = []
  let audio
  const obj = {
    duration,
    currentTime,
    readyState: 4, // HAVE_ENOUGH_DATA
    src: 'http://example.com/audio.mp3',
    HAVE_NOTHING: 0,
    HAVE_METADATA: 1,
    addEventListener: jest.fn((evt, cb) => {
      listeners[evt] = listeners[evt] || []
      listeners[evt].push(cb)
    }),
    removeEventListener: jest.fn((evt, cb) => {
      listeners[evt] = (listeners[evt] || []).filter((fn) => fn !== cb)
    }),
    dispatch(evt) {
      ;(listeners[evt] || []).forEach((cb) => cb({ target: audio }))
    },
    load: jest.fn(),
    buffered: {
      get length() {
        return bufferedRanges.length
      },
      start: (i) => bufferedRanges[i][0],
      end: (i) => bufferedRanges[i][1],
    },
    _pushBuffered(start, end) {
      bufferedRanges.push([start, end])
    },
  }
  audio = obj
  return obj
}

describe('ProgressBar component', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    // Capture window listeners so we can invoke them deterministically
    captured = { mousemove: [], mouseup: [], touchmove: [], touchend: [] }
    originalAdd = window.addEventListener
    originalRemove = window.removeEventListener
    window.addEventListener = (type, cb, opts) => {
      if (captured[type]) captured[type].push(cb)
      return originalAdd.call(window, type, cb, opts)
    }
    window.removeEventListener = (type, cb, opts) => {
      if (captured[type]) captured[type] = captured[type].filter((fn) => fn !== cb)
      return originalRemove.call(window, type, cb, opts)
    }
  })
  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
    window.addEventListener = originalAdd
    window.removeEventListener = originalRemove
  })

  let captured = {}
  let originalAdd
  let originalRemove

  const baseProps = (overrides = {}) => {
    const audio = createMockAudio()
    return {
      audio,
      progressUpdateInterval: 200,
      showDownloadProgress: true,
      showFilledProgress: true,
      i18nProgressBar: 'Progress',
      ...overrides,
    }
  }

  function renderWithRef(props) {
    const progressRef = React.createRef()
    // Use the underlying class component directly to ensure progressBar ref is wired
    const utils = render(<RawProgressBar {...props} progressBar={progressRef} />)
    return { ...utils, progressRef }
  }

  function mockProgressBarRect(node, { width = 400, left = 0 } = {}) {
    node.getBoundingClientRect = jest.fn(() => ({
      width,
      left,
      right: left + width,
      top: 0,
      bottom: 0,
      height: 10,
      x: left,
      y: 0,
      toJSON: () => {},
    }))
  }

  test('renders with initial ARIA values', () => {
    const { getByRole } = renderWithRef(baseProps())
    const progress = getByRole('progressbar')
    expect(progress).toHaveAttribute('aria-valuemin', '0')
    expect(progress).toHaveAttribute('aria-valuemax', '100')
    expect(progress).toHaveAttribute('aria-valuenow', '0')
  })

  test('timeupdate updates currentTimePos (throttled)', () => {
    const props = baseProps()
    const { getByRole } = renderWithRef(props)
    const progress = getByRole('progressbar')

    // Move currentTime and dispatch multiple timeupdates rapidly
    props.audio.currentTime = 30 // 25%
    act(() => {
      for (let i = 0; i < 5; i++) props.audio.dispatch('timeupdate')
    })

    expect(progress).toHaveAttribute('aria-valuenow', '25')

    // Update currentTime again but within throttle window -> still 25
    props.audio.currentTime = 60
    act(() => { props.audio.dispatch('timeupdate') })

    expect(progress).toHaveAttribute('aria-valuenow', '25')

    // Advance past throttle interval, next dispatch should update
    act(() => { jest.advanceTimersByTime(201) })
    act(() => { props.audio.dispatch('timeupdate') })
    expect(progress).toHaveAttribute('aria-valuenow', '50')
  })

  test('mouse drag sets indicator position and seeks audio on mouseup (no onSeek)', () => {
    const props = baseProps()
    const { getByRole, container } = renderWithRef(props)
    const progress = getByRole('progressbar')
    mockProgressBarRect(progress, { width: 400, left: 100 })

    // mousedown at 100px inside bar (left edge) -> 0%
  act(() => { fireEvent.mouseDown(progress, { clientX: 100 }) })
  act(() => { captured.mousemove.forEach((fn) => fn(new MouseEvent('mousemove', { clientX: 300 }))) })
  act(() => { captured.mouseup.forEach((fn) => fn(new MouseEvent('mouseup', { clientX: 300 }))) })

    expect(props.audio.currentTime).toBeCloseTo(60) // 50% of 120 duration
    const indicator = container.querySelector('.rhap_progress-indicator')
    expect(indicator.style.left).toBe('50.00%')
  })

  test('touch drag uses touch events', () => {
    const props = baseProps()
    const { getByRole } = renderWithRef(props)
    const progress = getByRole('progressbar')
    mockProgressBarRect(progress, { width: 200, left: 0 })

  act(() => { fireEvent.touchStart(progress, { touches: [{ clientX: 0 }] }) })
  act(() => { captured.touchmove.forEach((fn) => fn({ touches: [{ clientX: 150 }], stopPropagation() {}, preventDefault() {} })) })
  act(() => { captured.touchend.forEach((fn) => fn({ changedTouches: [{ clientX: 150 }], touches: [{ clientX: 150 }], stopPropagation() {}, preventDefault() {} })) })

    expect(props.audio.currentTime).toBeCloseTo(90) // 75% of 120
  })

  test('async onSeek prevents immediate currentTime set and waits for promise', async () => {
    const onSeekPromise = Promise.resolve()
    const onSeek = jest.fn().mockImplementation(() => onSeekPromise)
    const props = baseProps({ onSeek })
    const { getByRole } = renderWithRef(props)
    const progress = getByRole('progressbar')
    mockProgressBarRect(progress, { width: 100, left: 0 })

  act(() => { fireEvent.mouseDown(progress, { clientX: 0 }) })
  act(() => { captured.mousemove.forEach((fn) => fn(new MouseEvent('mousemove', { clientX: 50 }))) })
  act(() => { captured.mouseup.forEach((fn) => fn(new MouseEvent('mouseup', { clientX: 50 }))) })

    // audio.currentTime should still be 0 because async handler responsible
    expect(props.audio.currentTime).toBe(0)
    expect(onSeek).toHaveBeenCalledTimes(1)
    expect(onSeek.mock.calls[0][1]).toBeCloseTo(60)
    // Resolve async tasks
  await act(async () => { await onSeekPromise })
  })

  test('progress (buffered) bars rendered and animation flag toggles', () => {
    const props = baseProps()
    props.audio._pushBuffered(0, 30)
    props.audio._pushBuffered(40, 80)
    const { container } = renderWithRef(props)

    // Trigger progress event to populate buffer segments
  act(() => { props.audio.dispatch('progress'); jest.advanceTimersByTime(210) })

    const bufferEls = container.querySelectorAll('.rhap_download-progress')
    expect(bufferEls.length).toBe(2)
    const widths = Array.from(bufferEls).map((el) => el.getAttribute('style'))
    expect(widths[0]).toContain('width: 25%') // 30/120 ~ 25%
    expect(widths[1]).toContain('width: 33%') // (80-40)=40/120 ~ 33%
  })

  test('prevents context menu', () => {
    const props = baseProps()
    const { getByRole } = renderWithRef(props)
    const progress = getByRole('progressbar')
    const evt = new MouseEvent('contextmenu', { bubbles: true, cancelable: true })
    progress.dispatchEvent(evt)
    expect(evt.defaultPrevented).toBe(true)
  })

  test('cleans up listeners on unmount', () => {
    const props = baseProps()
    const { unmount } = renderWithRef(props)
    expect(props.audio.addEventListener).toHaveBeenCalledWith('timeupdate', expect.any(Function))
    unmount()
    expect(props.audio.removeEventListener).toHaveBeenCalledWith('timeupdate', expect.any(Function))
  })

  test('uses srcDuration override when supplied', () => {
    const props = baseProps({ srcDuration: 60 }) // shorter duration
    const { getByRole } = renderWithRef(props)
    const progress = getByRole('progressbar')
    mockProgressBarRect(progress, { width: 100, left: 0 })

  act(() => { fireEvent.mouseDown(progress, { clientX: 0 }) })
  act(() => { captured.mousemove.forEach((fn) => fn(new MouseEvent('mousemove', { clientX: 100 }))) })
  act(() => { captured.mouseup.forEach((fn) => fn(new MouseEvent('mouseup', { clientX: 100 }))) })

    expect(props.audio.currentTime).toBeCloseTo(60) // full overridden duration
  })

  test('clamps drag beyond right edge to 100%', () => {
    const props = baseProps()
    const { getByRole } = renderWithRef(props)
    const progress = getByRole('progressbar')
    mockProgressBarRect(progress, { width: 100, left: 0 })

  act(() => { fireEvent.mouseDown(progress, { clientX: 0 }) })
  act(() => { captured.mousemove.forEach((fn) => fn(new MouseEvent('mousemove', { clientX: 150 }))) })
  act(() => { captured.mouseup.forEach((fn) => fn(new MouseEvent('mouseup', { clientX: 150 }))) })

    expect(props.audio.currentTime).toBeCloseTo(120)
  })

  test('clamps drag before left edge to 0%', () => {
    const props = baseProps()
    const { getByRole } = renderWithRef(props)
    const progress = getByRole('progressbar')
    mockProgressBarRect(progress, { width: 100, left: 50 })

  act(() => { fireEvent.mouseDown(progress, { clientX: 0 }) })
  act(() => { captured.mousemove.forEach((fn) => fn(new MouseEvent('mousemove', { clientX: -20 }))) })
  act(() => { captured.mouseup.forEach((fn) => fn(new MouseEvent('mouseup', { clientX: -20 }))) })

    expect(props.audio.currentTime).toBeCloseTo(0)
  })
})

