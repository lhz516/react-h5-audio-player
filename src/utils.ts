type throttleFunction<T> = (arg: T) => void

export const getPosX = (event: TouchEvent | MouseEvent): number => {
  if (event instanceof MouseEvent) {
    return event.pageX || event.clientX
  } else {
    return event.touches[0].pageX || event.touches[0].clientX
  }
}

const addHeadingZero = (num: number): string => {
  return num > 9 ? num.toString() : `0${num}`
}

export const getDisplayTimeBySeconds = (seconds: number): string => {
  if (!isFinite(seconds)) {
    return '00:00'
  }

  const min = addHeadingZero(Math.floor(seconds / 60))
  const sec = addHeadingZero(Math.floor(seconds % 60))
  return `${min}:${sec}`
}

export function throttle<K>(func: throttleFunction<K>, limit: number): throttleFunction<K> {
  let inThrottle = false
  return function(arg): void {
    if (!inThrottle) {
      func(arg)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}
