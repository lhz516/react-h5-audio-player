import { MAIN_LAYOUT, TIME_FORMAT } from './constants'

type throttleFunction<T> = (arg: T) => void

export const getMainLayoutClassName = (layout: MAIN_LAYOUT): string => {
  switch (layout) {
    case 'stacked':
      return 'rhap_stacked'
    case 'stacked-reverse':
      return 'rhap_stacked-reverse'
    case 'horizontal':
      return 'rhap_horizontal'
    case 'horizontal-reverse':
      return 'rhap_horizontal-reverse'
    default:
      return 'rhap_stacked'
  }
}

/**
 * Calculate the new time after a jump operation
 * @param currentTime - Current time in seconds
 * @param duration - Total duration in seconds
 * @param jumpTime - Jump time in milliseconds (can be negative for backward jumps)
 * @returns New time in seconds, clamped between 0 and duration
 */
export const calculateJumpTime = (currentTime: number, duration: number, jumpTime: number): number => {
  if (!isFinite(duration) || !isFinite(currentTime)) {
    return currentTime
  }

  const newTime = currentTime + jumpTime / 1000
  if (newTime < 0) {
    return 0
  } else if (newTime > duration) {
    return duration
  }
  return newTime
}

/**
 * Calculate the new volume after a jump operation
 * @param currentVolume - Current volume (0-1)
 * @param jumpVolume - Volume jump amount (can be negative)
 * @returns New volume clamped between 0 and 1
 */
export const calculateJumpVolume = (currentVolume: number, jumpVolume: number): number => {
  const newVolume = currentVolume + jumpVolume
  if (newVolume < 0) {
    return 0
  } else if (newVolume > 1) {
    return 1
  }
  return newVolume
}

/**
 * Get CSS class names for player state
 * @param isLooping - Whether the player is in loop mode
 * @param isPlaying - Whether the player is currently playing
 * @param customClassName - Additional custom class name
 * @returns Combined CSS class names
 */
export const getPlayerStateClassName = (
  isLooping: boolean,
  isPlaying: boolean,
  customClassName: string = ''
): string => {
  const loopClass = isLooping ? 'rhap_loop--on' : 'rhap_loop--off'
  const playingClass = isPlaying ? 'rhap_play-status--playing' : 'rhap_play-status--paused'
  const trimmedCustom = customClassName.trim()
  return `rhap_container ${loopClass} ${playingClass}${trimmedCustom ? ` ${trimmedCustom}` : ''}`.trim()
}

/**
 * Check if audio is ready for time manipulation
 * @param readyState - HTMLAudioElement readyState value
 * @returns True if audio is ready for time operations
 */
export const isAudioReadyForTimeManipulation = (readyState: number): boolean => {
  // readyState constants: HAVE_NOTHING = 0, HAVE_METADATA = 1, HAVE_CURRENT_DATA = 2, HAVE_FUTURE_DATA = 3, HAVE_ENOUGH_DATA = 4
  return readyState > 1 // Greater than HAVE_METADATA
}

export const getPosX = (event: TouchEvent | MouseEvent): number => {
  if (event instanceof MouseEvent) {
    return event.clientX
  } else {
    return event.touches[0].clientX
  }
}

const addHeadingZero = (num: number): string => {
  return num > 9 ? num.toString() : `0${num}`
}

export const getDisplayTimeBySeconds = (seconds: number, totalSeconds: number, timeFormat: TIME_FORMAT): string => {
  if (!isFinite(seconds)) {
    return null
  }

  const min = Math.floor(seconds / 60)
  const minStr = addHeadingZero(min)
  const secStr = addHeadingZero(Math.floor(seconds % 60))
  const minStrForHour = addHeadingZero(Math.floor(min % 60))
  const hourStr = Math.floor(min / 60)

  const mmSs = `${minStr}:${secStr}`
  const hhMmSs = `${hourStr}:${minStrForHour}:${secStr}`

  if (timeFormat === 'auto') {
    if (totalSeconds >= 3600) {
      return hhMmSs
    } else {
      return mmSs
    }
  } else if (timeFormat === 'mm:ss') {
    return mmSs
  } else if (timeFormat === 'hh:mm:ss') {
    return hhMmSs
  }
}

export function throttle<K>(func: throttleFunction<K>, limit: number): throttleFunction<K> {
  let inThrottle = false
  return (arg) => {
    if (!inThrottle) {
      func(arg)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}
