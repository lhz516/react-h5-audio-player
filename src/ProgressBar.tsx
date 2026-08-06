import React, { forwardRef, SyntheticEvent, useState, useRef, useEffect, useCallback } from 'react'
import { getPosX, throttle } from './utils'
import { OnSeek } from './index'

// ProgressBar encapsulates all logic related to displaying and interacting with
// the audio playback progress: (1) current position, (2) buffered segments,
// (3) drag & seek interactions (mouse + touch), and (4) accessibility ARIA data.
//
// NOTABLE BEHAVIOR / DESIGN CHOICES:
// - Drag logic is fully managed by adding / removing global window listeners so that
//   seeking continues even if the pointer leaves the bar's bounding box.
// - Time updates are throttled via the provided progressUpdateInterval to limit
//   React re-renders during playback (performance optimization).
// - When an optional async onSeek callback is provided, UI waits (state.waitingForSeekCallback)
//   so that timeupdate events do not fight with the in-flight seek.
// - Download (buffer) progress is animated by toggling a short-lived flag which
//   influences CSS transition durations.
// - Supports externally supplied srcDuration (e.g., for streams where metadata
//   duration might be unknown or unreliable initially). If srcDuration is passed
//   it short-circuits reliance on audio.duration.

interface ProgressBarForwardRefProps {
  audio: HTMLAudioElement
  progressUpdateInterval: number
  showDownloadProgress: boolean
  showFilledProgress: boolean
  srcDuration?: number
  onSeek?: OnSeek
  onChangeCurrentTimeError?: (err: Error) => void
  i18nProgressBar: string
  progressJumpSteps?: {
    backward?: number
    forward?: number
  }
}
interface ProgressBarProps extends ProgressBarForwardRefProps {
  progressBar: React.RefObject<HTMLDivElement>
}

interface DownloadProgress {
  left: string
  width: string
}

interface TimePosInfo {
  currentTime: number
  currentTimePos: string
}

function ProgressBar(props: ProgressBarProps) {
  const {
    audio,
    progressUpdateInterval,
    showDownloadProgress,
    showFilledProgress,
    srcDuration,
    onSeek,
    onChangeCurrentTimeError,
    i18nProgressBar,
    progressBar,
    progressJumpSteps = { backward: 5000, forward: 5000 },
  } = props

  // State hooks
  const [currentTimePos, setCurrentTimePos] = useState('0%')
  const [hasDownloadProgressAnimation, setHasDownloadProgressAnimation] = useState(false)
  const [downloadProgressArr, setDownloadProgressArr] = useState<DownloadProgress[]>([])

  // Ref hooks for instance variables
  const isDraggingProgressRef = useRef(false)
  const waitingForSeekCallbackRef = useRef(false)
  const timeOnMouseMoveRef = useRef(0) // Audio's current time while mouse is down and moving over the progress bar
  const downloadProgressAnimationTimerRef = useRef<number | undefined>(undefined)
  const lastDownloadProgressRef = useRef('')

  const getDuration = useCallback((): number => {
    if (!audio) return 0
    return typeof srcDuration === 'undefined' ? audio.duration || 0 : srcDuration
  }, [audio, srcDuration])

  // Get time info while dragging indicator by mouse or touch
  const getCurrentProgress = useCallback(
    (event: MouseEvent | TouchEvent): TimePosInfo => {
      // A single-file progressive download (non-blob) can have transient states
      // where currentTime is not yet finite. In those cases return zeros to avoid
      // NaN propagation.
      if (!audio) {
        return { currentTime: 0, currentTimePos: '0%' }
      }

      const isSingleFileProgressiveDownload = audio.src.indexOf('blob:') !== 0 && typeof srcDuration === 'undefined'

      if (isSingleFileProgressiveDownload && (!audio.src || !isFinite(audio.currentTime) || !progressBar.current)) {
        return { currentTime: 0, currentTimePos: '0%' }
      }

      const progressBarRect = progressBar.current!.getBoundingClientRect()
      const maxRelativePos = progressBarRect.width
      let relativePos = getPosX(event) - progressBarRect.left

      if (relativePos < 0) {
        relativePos = 0
      } else if (relativePos > maxRelativePos) {
        relativePos = maxRelativePos
      }
      const duration = getDuration()
      const currentTime = (duration * relativePos) / maxRelativePos
      return { currentTime, currentTimePos: `${((relativePos / maxRelativePos) * 100).toFixed(2)}%` }
    },
    [audio, srcDuration, progressBar, getDuration]
  )

  // Create stable event handler references that won't change between renders
  const handleWindowMouseOrTouchMove = useCallback(
    (event: TouchEvent | MouseEvent): void => {
      if (event instanceof MouseEvent) {
        event.preventDefault()
      }
      event.stopPropagation()
      // Prevent Chrome drag selection bug
      const windowSelection: Selection | null = window.getSelection()
      if (windowSelection && windowSelection.type === 'Range') {
        windowSelection.empty()
      }

      // Always calculate progress during move (don't depend on isDraggingProgress state)
      const { currentTime, currentTimePos: newCurrentTimePos } = getCurrentProgress(event)
      timeOnMouseMoveRef.current = currentTime
      setCurrentTimePos(newCurrentTimePos)
    },
    [getCurrentProgress]
  )

  const handleWindowMouseOrTouchUp = useCallback(
    (event: MouseEvent | TouchEvent): void => {
      event.stopPropagation()
      const newTime = timeOnMouseMoveRef.current

      if (!audio) return

      if (onSeek) {
        // When an async onSeek is provided, we don't update audio.currentTime here;
        // instead we delegate timing to the callback so the integrator can control
        // buffering / custom seek logic (e.g., remote media, HLS, etc.). While
        // waiting, we suppress timeupdate-driven UI updates.
        isDraggingProgressRef.current = false
        waitingForSeekCallbackRef.current = true
        onSeek(audio, newTime).then(
          () => (waitingForSeekCallbackRef.current = false),
          (err: unknown) => {
            const message = err instanceof Error ? err.message : String(err)
            throw new Error(message)
          }
        )
      } else {
        const newStateUpdate: { currentTimePos?: string } = {}
        if (audio.readyState === audio.HAVE_NOTHING || audio.readyState === audio.HAVE_METADATA || !isFinite(newTime)) {
          try {
            audio.load()
          } catch (err) {
            newStateUpdate.currentTimePos = '0%'
            isDraggingProgressRef.current = false
            setCurrentTimePos('0%')
            return onChangeCurrentTimeError && onChangeCurrentTimeError(err as Error)
          }
        }

        audio.currentTime = newTime
        isDraggingProgressRef.current = false

        // Update the indicator position to reflect the actual audio time after seek
        const duration = getDuration()
        const actualCurrentTimePos = `${((newTime / duration) * 100 || 0).toFixed(2)}%`
        setCurrentTimePos(actualCurrentTimePos)
      }

      if (event instanceof MouseEvent) {
        window.removeEventListener('mousemove', handleWindowMouseOrTouchMove)
        window.removeEventListener('mouseup', handleWindowMouseOrTouchUp)
      } else {
        window.removeEventListener('touchmove', handleWindowMouseOrTouchMove)
        window.removeEventListener('touchend', handleWindowMouseOrTouchUp)
      }
    },
    [audio, onSeek, onChangeCurrentTimeError, getDuration, handleWindowMouseOrTouchMove]
  )

  const handleContextMenu = useCallback((event: SyntheticEvent): void => {
    event.preventDefault()
  }, [])

  /* Handle mouse down or touch start on progress bar event */
  const handleMouseDownOrTouchStartProgressBar = useCallback(
    (event: React.MouseEvent | React.TouchEvent): void => {
      event.stopPropagation()
      const { currentTime, currentTimePos: newCurrentTimePos } = getCurrentProgress(event.nativeEvent)

      if (isFinite(currentTime)) {
        timeOnMouseMoveRef.current = currentTime
        isDraggingProgressRef.current = true
        setCurrentTimePos(newCurrentTimePos)
        // Attach global listeners so drag remains responsive even if the pointer
        // leaves the progress bar element. Distinguish mouse vs touch for proper events.
        if (event.nativeEvent instanceof MouseEvent) {
          window.addEventListener('mousemove', handleWindowMouseOrTouchMove)
          window.addEventListener('mouseup', handleWindowMouseOrTouchUp)
        } else {
          window.addEventListener('touchmove', handleWindowMouseOrTouchMove)
          window.addEventListener('touchend', handleWindowMouseOrTouchUp)
        }
      }
    },
    [getCurrentProgress, handleWindowMouseOrTouchMove, handleWindowMouseOrTouchUp]
  )

  const handleAudioDownloadProgressUpdate = useCallback(
    (e: Event): void => {
      const audioElement = e.target as HTMLAudioElement
      const duration = getDuration()

      const downloadProgressArray: DownloadProgress[] = []
      for (let i = 0; i < audioElement.buffered.length; i++) {
        const bufferedStart: number = audioElement.buffered.start(i)
        const bufferedEnd: number = audioElement.buffered.end(i)
        downloadProgressArray.push({
          left: `${Math.round((100 / duration) * bufferedStart) || 0}%`,
          width: `${Math.round((100 / duration) * (bufferedEnd - bufferedStart)) || 0}%`,
        })
      }

      // Percentages are rounded, so most `progress` events resolve to the same bar
      // geometry as the previous one; re-rendering for those is pure waste.
      const signature = downloadProgressArray.map(({ left, width }) => `${left}|${width}`).join()
      if (signature === lastDownloadProgressRef.current) return
      lastDownloadProgressRef.current = signature

      clearTimeout(downloadProgressAnimationTimerRef.current)
      // Setting animation flag makes subsequent render use CSS transition for a
      // short burst, creating a smooth buffer-bar update effect.
      setDownloadProgressArr(downloadProgressArray)
      setHasDownloadProgressAnimation(true)
      downloadProgressAnimationTimerRef.current = setTimeout(() => {
        setHasDownloadProgressAnimation(false)
      }, 200) as unknown as number
    },
    [getDuration]
  )

  useEffect(() => {
    if (!audio) return

    const handleAudioTimeUpdate = throttle((e: Event): void => {
      // Avoid updating UI while user is dragging (we show the drag position instead)
      // or while an async seek is pending (prevents jitter / race conditions).
      if (isDraggingProgressRef.current || waitingForSeekCallbackRef.current === true) return

      const audioElement = e.target as HTMLAudioElement
      const { currentTime } = audioElement
      const duration = getDuration()

      setCurrentTimePos(`${((currentTime / duration) * 100 || 0).toFixed(2)}%`)
    }, progressUpdateInterval)

    audio.addEventListener('timeupdate', handleAudioTimeUpdate)
    audio.addEventListener('progress', handleAudioDownloadProgressUpdate)

    return () => {
      audio.removeEventListener('timeupdate', handleAudioTimeUpdate)
      audio.removeEventListener('progress', handleAudioDownloadProgressUpdate)
    }
  }, [audio, progressUpdateInterval, getDuration, handleAudioDownloadProgressUpdate])

  useEffect(() => () => clearTimeout(downloadProgressAnimationTimerRef.current), [])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (!audio) return
    const duration = getDuration()
    if (!isFinite(duration) || duration <= 0) return

    let newTime = audio.currentTime
    const backwardStep = (progressJumpSteps.backward ?? 5000) / 1000
    const forwardStep = (progressJumpSteps.forward ?? 5000) / 1000

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        event.preventDefault()
        event.stopPropagation()
        newTime = Math.max(0, audio.currentTime - backwardStep)
        break
      case 'ArrowRight':
      case 'ArrowUp':
        event.preventDefault()
        event.stopPropagation()
        newTime = Math.min(duration, audio.currentTime + forwardStep)
        break
      case 'Home':
        event.preventDefault()
        event.stopPropagation()
        newTime = 0
        break
      case 'End':
        event.preventDefault()
        event.stopPropagation()
        newTime = duration
        break
      default:
        return
    }

    if (onSeek) {
      waitingForSeekCallbackRef.current = true
      onSeek(audio, newTime).then(
        () => (waitingForSeekCallbackRef.current = false),
        (err: unknown) => {
          waitingForSeekCallbackRef.current = false
          const message = err instanceof Error ? err.message : String(err)
          throw new Error(message)
        }
      )
    } else {
      if (audio.readyState === audio.HAVE_NOTHING || audio.readyState === audio.HAVE_METADATA || !isFinite(newTime)) {
        try {
          audio.load()
        } catch (err) {
          setCurrentTimePos('0%')
          return onChangeCurrentTimeError && onChangeCurrentTimeError(err as Error)
        }
      }
      audio.currentTime = newTime
      const actualCurrentTimePos = `${((newTime / duration) * 100 || 0).toFixed(2)}%`
      setCurrentTimePos(actualCurrentTimePos)
    }
  }

  return (
    <div
      className="rhap_progress-container"
      ref={progressBar}
      aria-label={i18nProgressBar}
      role="slider"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Number(currentTimePos.split('%')[0])}
      tabIndex={0}
      onMouseDown={handleMouseDownOrTouchStartProgressBar}
      onTouchStart={handleMouseDownOrTouchStartProgressBar}
      onContextMenu={handleContextMenu}
      onKeyDown={handleKeyDown}
    >
      <div className={`rhap_progress-bar ${showDownloadProgress ? 'rhap_progress-bar-show-download' : ''}`}>
        <div className="rhap_progress-indicator" style={{ left: currentTimePos }} />
        {showFilledProgress && <div className="rhap_progress-filled" style={{ width: currentTimePos }} />}
        {showDownloadProgress &&
          downloadProgressArr.map(({ left, width }, i) => (
            <div
              key={i}
              className="rhap_download-progress"
              style={{ left, width, transitionDuration: hasDownloadProgressAnimation ? '.2s' : '0s' }}
            />
          ))}
      </div>
    </div>
  )
}

const ProgressBarForwardRef = (
  props: ProgressBarForwardRefProps,
  ref: React.Ref<HTMLDivElement>
): React.ReactElement => <ProgressBar {...props} progressBar={ref as React.RefObject<HTMLDivElement>} />

export default forwardRef(ProgressBarForwardRef)
export { ProgressBar, ProgressBarForwardRef }
