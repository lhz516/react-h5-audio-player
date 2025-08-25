import React from 'react'
import { render, act } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import CurrentTime from './CurrentTime'

// Helper to create a mock HTMLAudioElement-like object
function createMockAudio({ currentTime = 0, duration = 0 } = {}) {
	const listeners = {}
	const audio = {
		currentTime,
		duration,
		addEventListener: vi.fn((event, cb) => {
			listeners[event] = cb
		}),
		removeEventListener: vi.fn((event) => {
			delete listeners[event]
		}),
		// Utility to trigger an event
		dispatch(event) {
			if (listeners[event]) {
				listeners[event]({ target: audio })
			}
		},
	}
	return audio
}

describe('CurrentTime component', () => {
	const defaultDisplay = '00:00'

	it('renders defaultCurrentTime when no audio provided', () => {
		const { container } = render(
			<CurrentTime
				defaultCurrentTime={defaultDisplay}
				isLeftTime={false}
				timeFormat="auto"
			/>
		)
		expect(container.textContent).toBe(defaultDisplay)
	})

	it('displays current playback time (mm:ss) after metadata loaded', () => {
		const audio = createMockAudio({ currentTime: 30, duration: 300 })
		const { container } = render(
			<CurrentTime
				audio={audio}
				defaultCurrentTime={defaultDisplay}
				isLeftTime={false}
				timeFormat="auto"
			/>
		)
		// Simulate browser firing loadedmetadata first
		act(() => {
			audio.dispatch('loadedmetadata')
		})
		expect(container.textContent).toBe('05:00' === '05:00' ? '00:30' : '00:30') // ensure explicit expected
		// Now update currentTime and fire timeupdate
		audio.currentTime = 90
		act(() => {
			audio.dispatch('timeupdate')
		})
		expect(container.textContent).toBe('01:30')
	})

	it('displays remaining (left) time when isLeftTime is true', () => {
		const audio = createMockAudio({ currentTime: 60, duration: 300 }) // remaining 240s => 04:00
		const { container } = render(
			<CurrentTime
				audio={audio}
				defaultCurrentTime={defaultDisplay}
				isLeftTime={true}
				timeFormat="mm:ss"
			/>
		)
		act(() => {
			audio.dispatch('loadedmetadata')
		})
		expect(container.textContent).toBe('04:00')
		// Advance playback
		audio.currentTime = 90 // remaining 210 -> 03:30
		act(() => {
			audio.dispatch('timeupdate')
		})
		expect(container.textContent).toBe('03:30')
	})

	it('formats as hh:mm:ss when auto and total duration >= 3600', () => {
		const audio = createMockAudio({ currentTime: 100, duration: 3700 }) // remaining 3600 -> 1:00:00
		const { container } = render(
			<CurrentTime
				audio={audio}
				defaultCurrentTime={defaultDisplay}
				isLeftTime={true}
				timeFormat="auto"
			/>
		)
		act(() => {
			audio.dispatch('loadedmetadata')
		})
		expect(container.textContent).toBe('1:00:00')
	})

	it('honors explicit hh:mm:ss formatting', () => {
		const audio = createMockAudio({ currentTime: 3661, duration: 5400 }) // 1:01:01
		const { container } = render(
			<CurrentTime
				audio={audio}
				defaultCurrentTime={defaultDisplay}
				isLeftTime={false}
				timeFormat="hh:mm:ss"
			/>
		)
		act(() => {
			audio.dispatch('loadedmetadata')
		})
		expect(container.textContent).toBe('1:01:01')
	})

	it('adds audio event listeners only once across re-renders', () => {
		const audio = createMockAudio({ currentTime: 0, duration: 100 })
		const { rerender } = render(
			<CurrentTime
				audio={audio}
				defaultCurrentTime={defaultDisplay}
				isLeftTime={false}
				timeFormat="auto"
			/>
		)
		// Re-render with different prop that triggers componentDidUpdate
		rerender(
			<CurrentTime
				audio={audio}
				defaultCurrentTime={defaultDisplay}
				isLeftTime={false}
				timeFormat="mm:ss" // change format
			/>
		)
		// Only two listeners (timeupdate & loadedmetadata) should be registered once
		expect(audio.addEventListener).toHaveBeenCalledTimes(2)
		// Fire timeupdate to ensure still functional
		audio.currentTime = 10
		act(() => {
			audio.dispatch('timeupdate')
		})
	})
})

