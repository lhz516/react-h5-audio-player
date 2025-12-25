import { describe, it, expect } from 'vitest'
import {
  getDisplayTimeBySeconds,
  calculateJumpTime,
  calculateJumpVolume,
  getPlayerStateClassName,
  isAudioReadyForTimeManipulation,
} from './utils'

describe('Utils', () => {
  it('should getDisplayTimeBySeconds correctly', () => {
    // timeFormat is auto
    expect(getDisplayTimeBySeconds(NaN, NaN, 'auto')).toBe(null)
    expect(getDisplayTimeBySeconds(0, 0, 'auto')).toBe('00:00')
    expect(getDisplayTimeBySeconds(0, 3600, 'auto')).toBe('0:00:00')
    expect(getDisplayTimeBySeconds(30, 60, 'auto')).toBe('00:30')
    expect(getDisplayTimeBySeconds(60, 300, 'auto')).toBe('01:00')
    expect(getDisplayTimeBySeconds(90, 180, 'auto')).toBe('01:30')
    expect(getDisplayTimeBySeconds(90, 4500, 'auto')).toBe('0:01:30')
    expect(getDisplayTimeBySeconds(1805, 2000, 'auto')).toBe('30:05')
    expect(getDisplayTimeBySeconds(3600, 4500, 'auto')).toBe('1:00:00')
    expect(getDisplayTimeBySeconds(5400, 5800, 'auto')).toBe('1:30:00')

    // timeFormat is mm:ss
    expect(getDisplayTimeBySeconds(NaN, NaN, 'mm:ss')).toBe(null)
    expect(getDisplayTimeBySeconds(0, 0, 'mm:ss')).toBe('00:00')
    expect(getDisplayTimeBySeconds(0, 3600, 'mm:ss')).toBe('00:00')
    expect(getDisplayTimeBySeconds(30, 60, 'mm:ss')).toBe('00:30')
    expect(getDisplayTimeBySeconds(60, 300, 'mm:ss')).toBe('01:00')
    expect(getDisplayTimeBySeconds(90, 180, 'mm:ss')).toBe('01:30')
    expect(getDisplayTimeBySeconds(90, 4500, 'mm:ss')).toBe('01:30')
    expect(getDisplayTimeBySeconds(1805, 2000, 'mm:ss')).toBe('30:05')
    expect(getDisplayTimeBySeconds(3600, 4500, 'mm:ss')).toBe('60:00')
    expect(getDisplayTimeBySeconds(5400, 5800, 'mm:ss')).toBe('90:00')

    // timeFormat is hh:mm:ss
    expect(getDisplayTimeBySeconds(NaN, NaN, 'hh:mm:ss')).toBe(null)
    expect(getDisplayTimeBySeconds(0, 0, 'hh:mm:ss')).toBe('0:00:00')
    expect(getDisplayTimeBySeconds(0, 3600, 'hh:mm:ss')).toBe('0:00:00')
    expect(getDisplayTimeBySeconds(30, 60, 'hh:mm:ss')).toBe('0:00:30')
    expect(getDisplayTimeBySeconds(60, 300, 'hh:mm:ss')).toBe('0:01:00')
    expect(getDisplayTimeBySeconds(90, 180, 'hh:mm:ss')).toBe('0:01:30')
    expect(getDisplayTimeBySeconds(90, 4500, 'hh:mm:ss')).toBe('0:01:30')
    expect(getDisplayTimeBySeconds(1805, 2000, 'hh:mm:ss')).toBe('0:30:05')
    expect(getDisplayTimeBySeconds(3600, 4500, 'hh:mm:ss')).toBe('1:00:00')
    expect(getDisplayTimeBySeconds(5400, 5800, 'hh:mm:ss')).toBe('1:30:00')
  })

  describe('calculateJumpTime', () => {
    it('should calculate correct jump time for forward jumps', () => {
      // Normal forward jump
      expect(calculateJumpTime(30, 120, 5000)).toBe(35) // 30s + 5s = 35s
      expect(calculateJumpTime(0, 60, 10000)).toBe(10) // 0s + 10s = 10s
    })

    it('should calculate correct jump time for backward jumps', () => {
      // Normal backward jump
      expect(calculateJumpTime(30, 120, -5000)).toBe(25) // 30s - 5s = 25s
      expect(calculateJumpTime(10, 60, -15000)).toBe(0) // 10s - 15s = 0s (clamped)
    })

    it('should clamp time to boundaries', () => {
      // Jump beyond duration
      expect(calculateJumpTime(110, 120, 15000)).toBe(120) // Clamped to duration
      // Jump before start
      expect(calculateJumpTime(5, 120, -10000)).toBe(0) // Clamped to 0
    })

    it('should handle edge cases', () => {
      // Invalid duration or current time
      expect(calculateJumpTime(NaN, 120, 5000)).toBe(NaN)
      expect(calculateJumpTime(30, NaN, 5000)).toBe(30)
      expect(calculateJumpTime(Infinity, 120, 5000)).toBe(Infinity)
    })
  })

  describe('calculateJumpVolume', () => {
    it('should calculate correct volume for positive jumps', () => {
      expect(calculateJumpVolume(0.5, 0.2)).toBe(0.7)
      expect(calculateJumpVolume(0.3, 0.1)).toBe(0.4)
    })

    it('should calculate correct volume for negative jumps', () => {
      expect(calculateJumpVolume(0.7, -0.2)).toBeCloseTo(0.5, 5)
      expect(calculateJumpVolume(0.3, -0.1)).toBeCloseTo(0.2, 5)
    })

    it('should clamp volume to valid range', () => {
      // Jump above 1.0
      expect(calculateJumpVolume(0.8, 0.5)).toBe(1.0)
      // Jump below 0.0
      expect(calculateJumpVolume(0.2, -0.5)).toBe(0.0)
    })

    it('should handle boundary values', () => {
      expect(calculateJumpVolume(0, 0.1)).toBe(0.1)
      expect(calculateJumpVolume(1, -0.1)).toBe(0.9)
      expect(calculateJumpVolume(1, 0.1)).toBe(1.0) // Clamped
      expect(calculateJumpVolume(0, -0.1)).toBe(0.0) // Clamped
    })
  })

  describe('getPlayerStateClassName', () => {
    it('should generate correct class names for different states', () => {
      expect(getPlayerStateClassName(true, true, 'custom')).toBe(
        'rhap_container rhap_loop--on rhap_play-status--playing custom'
      )
      expect(getPlayerStateClassName(false, false, 'custom')).toBe(
        'rhap_container rhap_loop--off rhap_play-status--paused custom'
      )
      expect(getPlayerStateClassName(true, false, '')).toBe('rhap_container rhap_loop--on rhap_play-status--paused')
    })

    it('should handle empty custom class name', () => {
      expect(getPlayerStateClassName(false, true)).toBe('rhap_container rhap_loop--off rhap_play-status--playing')
    })

    it('should trim extra spaces', () => {
      expect(getPlayerStateClassName(false, false, '  extra-spaces  ')).toBe(
        'rhap_container rhap_loop--off rhap_play-status--paused extra-spaces'
      )
    })
  })

  describe('isAudioReadyForTimeManipulation', () => {
    it('should return false for states that are not ready', () => {
      expect(isAudioReadyForTimeManipulation(0)).toBe(false) // HAVE_NOTHING
      expect(isAudioReadyForTimeManipulation(1)).toBe(false) // HAVE_METADATA
    })

    it('should return true for states that are ready', () => {
      expect(isAudioReadyForTimeManipulation(2)).toBe(true) // HAVE_CURRENT_DATA
      expect(isAudioReadyForTimeManipulation(3)).toBe(true) // HAVE_FUTURE_DATA
      expect(isAudioReadyForTimeManipulation(4)).toBe(true) // HAVE_ENOUGH_DATA
    })
  })
})
