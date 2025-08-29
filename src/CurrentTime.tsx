import React, { ReactNode, useEffect, useRef, useState } from 'react'
import { TIME_FORMAT } from './constants'
import { getDisplayTimeBySeconds } from './utils'

interface CurrentTimeProps {
  audio?: HTMLAudioElement
  defaultCurrentTime: ReactNode
  isLeftTime: boolean
  timeFormat: TIME_FORMAT
}

const CurrentTime = ({ audio, defaultCurrentTime, isLeftTime, timeFormat }: CurrentTimeProps): React.ReactNode => {
  const [currentTime, setCurrentTime] = useState<ReactNode>(defaultCurrentTime)
  const hasAddedListenersRef = useRef(false)
  const latestParamsRef = useRef({ isLeftTime, timeFormat, defaultCurrentTime })
  latestParamsRef.current = { isLeftTime, timeFormat, defaultCurrentTime }

  // Effect: attach listeners once per audio element
  useEffect(() => {
    if (!audio) {
      setCurrentTime(defaultCurrentTime)
      return
    }
    const update = () => {
      const { isLeftTime, timeFormat, defaultCurrentTime } = latestParamsRef.current
      setCurrentTime(
        getDisplayTimeBySeconds(
          isLeftTime ? audio.duration - audio.currentTime : audio.currentTime,
          audio.duration,
          timeFormat
        ) || defaultCurrentTime
      )
    }
    if (!hasAddedListenersRef.current) {
      hasAddedListenersRef.current = true
      audio.addEventListener('timeupdate', update)
      audio.addEventListener('loadedmetadata', update)
    }
    // Sync immediately
    update()
    return () => {
      // Clean up only when audio element itself changes/unmounts
      if (hasAddedListenersRef.current) {
        audio.removeEventListener('timeupdate', update)
        audio.removeEventListener('loadedmetadata', update)
        hasAddedListenersRef.current = false
      }
    }
  }, [audio, defaultCurrentTime])

  // Effect: recompute display when formatting-related props change without re-adding listeners
  useEffect(() => {
    if (!audio) return
    setCurrentTime(
      getDisplayTimeBySeconds(
        isLeftTime ? audio.duration - audio.currentTime : audio.currentTime,
        audio.duration,
        timeFormat
      ) || defaultCurrentTime
    )
  }, [isLeftTime, timeFormat, defaultCurrentTime, audio])

  return currentTime
}

export default CurrentTime
