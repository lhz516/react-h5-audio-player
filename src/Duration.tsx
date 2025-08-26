import React, { useState, useEffect, useRef, useCallback, ReactNode } from 'react'
import { TIME_FORMAT } from './constants'
import { getDisplayTimeBySeconds } from './utils'

interface DurationProps {
  audio?: HTMLAudioElement
  defaultDuration: ReactNode
  timeFormat: TIME_FORMAT
}

const Duration: React.FC<DurationProps> = ({ audio, defaultDuration, timeFormat }) => {
  const audioRef = useRef<HTMLAudioElement | undefined>(undefined)
  const hasAddedAudioEventListener = useRef(false)

  const [duration, setDuration] = useState<ReactNode>(() => {
    return audio ? getDisplayTimeBySeconds(audio.duration, audio.duration, timeFormat) : defaultDuration
  })

  const handleAudioDurationChange = useCallback(
    (e: Event): void => {
      const audioTarget = e.target as HTMLAudioElement
      setDuration(getDisplayTimeBySeconds(audioTarget.duration, audioTarget.duration, timeFormat) || defaultDuration)
    },
    [timeFormat, defaultDuration]
  )

  useEffect(() => {
    if (audio && !hasAddedAudioEventListener.current) {
      audioRef.current = audio
      hasAddedAudioEventListener.current = true
      audio.addEventListener('durationchange', handleAudioDurationChange)
      audio.addEventListener('abort', handleAudioDurationChange)
    }

    return () => {
      if (audioRef.current && hasAddedAudioEventListener.current) {
        audioRef.current.removeEventListener('durationchange', handleAudioDurationChange)
        audioRef.current.removeEventListener('abort', handleAudioDurationChange)
      }
    }
  }, [audio, handleAudioDurationChange])

  return duration
}

export default Duration
