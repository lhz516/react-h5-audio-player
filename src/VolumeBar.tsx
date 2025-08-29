import React, { useCallback, useEffect, useRef, useState, SyntheticEvent } from 'react'
import { getPosX } from './utils'

interface VolumeControlsProps {
  audio: HTMLAudioElement | null
  volume: number
  onMuteChange: () => void
  showFilledVolume: boolean
  i18nVolumeControl: string
}

interface VolumePosInfo {
  currentVolume: number
  currentVolumePos: string
}

// Functional version of the legacy class-based VolumeControls component.
// Behavior is intentionally preserved so existing tests & consumers continue to work:
// - Drag logic: global window listeners while dragging (mouse + touch)
// - Programmatic volume changes animate briefly (100ms) unless user is dragging
// - onMuteChange fires only when crossing mute boundary (0 <-> non-zero)
// - lastVolume remembers pre-mute value for restoration
const VolumeControls: React.FC<VolumeControlsProps> = ({
  audio,
  volume,
  onMuteChange,
  showFilledVolume,
  i18nVolumeControl,
}) => {
  const volumeBar = useRef<HTMLDivElement>(null)
  const lastVolumeRef = useRef(volume) // Store last non-zero volume for mute toggle
  const isDraggingRef = useRef(false)
  const volumeAnimationTimerRef = useRef<number | null>(null)

  const [currentVolumePos, setCurrentVolumePos] = useState(
    `${(((lastVolumeRef.current ?? 0) / 1) * 100 || 0).toFixed(2)}%`
  )
  const [hasVolumeAnimation, setHasVolumeAnimation] = useState(false)
  const [isDraggingVolume, setIsDraggingVolume] = useState(false)

  // Keep ref in sync with state for use inside native event listeners
  useEffect(() => {
    isDraggingRef.current = isDraggingVolume
  }, [isDraggingVolume])

  const getCurrentVolume = useCallback(
    (event: TouchEvent | MouseEvent): VolumePosInfo => {
      if (!volumeBar.current || !audio) {
        return { currentVolume: audio ? audio.volume : lastVolumeRef.current ?? 0, currentVolumePos }
      }
      const volumeBarRect = volumeBar.current.getBoundingClientRect()
      const maxRelativePos = volumeBarRect.width
      const relativePos = getPosX(event) - volumeBarRect.left
      let currentVolume: number
      let currentVolumePosStr: string

      if (relativePos < 0) {
        currentVolume = 0
        currentVolumePosStr = '0%'
      } else if (relativePos > volumeBarRect.width) {
        currentVolume = 1
        currentVolumePosStr = '100%'
      } else {
        currentVolume = relativePos / maxRelativePos
        currentVolumePosStr = `${(relativePos / maxRelativePos) * 100}%`
      }

      return { currentVolume, currentVolumePos: currentVolumePosStr }
    },
    [audio, currentVolumePos]
  )

  const handleContextMenu = (event: SyntheticEvent): void => {
    event.preventDefault()
  }

  // Legacy handleClickVolumeButton removed (unused in rendering/tests).

  const handleWindowMouseOrTouchMoveRef = useRef<((e: TouchEvent | MouseEvent) => void) | null>(null)
  const handleWindowMouseOrTouchUpRef = useRef<((e: TouchEvent | MouseEvent) => void) | null>(null)

  const detachWindowListeners = useCallback(() => {
    if (handleWindowMouseOrTouchMoveRef.current) {
      window.removeEventListener('mousemove', handleWindowMouseOrTouchMoveRef.current)
      window.removeEventListener('touchmove', handleWindowMouseOrTouchMoveRef.current)
    }
    if (handleWindowMouseOrTouchUpRef.current) {
      window.removeEventListener('mouseup', handleWindowMouseOrTouchUpRef.current)
      window.removeEventListener('touchend', handleWindowMouseOrTouchUpRef.current)
    }
  }, [])

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

      if (isDraggingRef.current) {
        const { currentVolume, currentVolumePos } = getCurrentVolume(event)
        if (audio) audio.volume = currentVolume
        setCurrentVolumePos(currentVolumePos)
      }
    },
    [audio, getCurrentVolume]
  )

  // Keep refs pointing to latest handlers for add/remove
  useEffect(() => {
    handleWindowMouseOrTouchMoveRef.current = handleWindowMouseOrTouchMove
  }, [handleWindowMouseOrTouchMove])

  const handleWindowMouseOrTouchUp = useCallback(
    (event: MouseEvent | TouchEvent): void => {
      event.stopPropagation()
      setIsDraggingVolume(false)
      detachWindowListeners()
    },
    [detachWindowListeners]
  )

  useEffect(() => {
    handleWindowMouseOrTouchUpRef.current = handleWindowMouseOrTouchUp
  }, [handleWindowMouseOrTouchUp])

  const handleVolumnControlMouseOrTouchDown = (event: React.MouseEvent | React.TouchEvent): void => {
    event.stopPropagation()
    const { currentVolume, currentVolumePos } = getCurrentVolume(event.nativeEvent)
    if (audio) audio.volume = currentVolume
    setIsDraggingVolume(true)
    setCurrentVolumePos(currentVolumePos)

    // Attach listeners depending on input type
    if (event.nativeEvent instanceof MouseEvent) {
      if (handleWindowMouseOrTouchMoveRef.current) {
        window.addEventListener('mousemove', handleWindowMouseOrTouchMoveRef.current)
      }
      if (handleWindowMouseOrTouchUpRef.current) {
        window.addEventListener('mouseup', handleWindowMouseOrTouchUpRef.current)
      }
    } else {
      if (handleWindowMouseOrTouchMoveRef.current) {
        window.addEventListener('touchmove', handleWindowMouseOrTouchMoveRef.current)
      }
      if (handleWindowMouseOrTouchUpRef.current) {
        window.addEventListener('touchend', handleWindowMouseOrTouchUpRef.current)
      }
    }
  }

  const handleAudioVolumeChange = useCallback(
    (e: Event): void => {
      const target = e.target as HTMLAudioElement | null
      const newVolume = target ? target.volume : volume
      // Fire mute change callback only when toggling between muted and unmuted state
      if ((lastVolumeRef.current > 0 && newVolume === 0) || (lastVolumeRef.current === 0 && newVolume > 0)) {
        onMuteChange()
      }
      lastVolumeRef.current = newVolume
      if (isDraggingRef.current) return

      setHasVolumeAnimation(true)
      setCurrentVolumePos(`${((newVolume / 1) * 100 || 0).toFixed(2)}%`)
      if (volumeAnimationTimerRef.current) {
        clearTimeout(volumeAnimationTimerRef.current)
      }
      volumeAnimationTimerRef.current = setTimeout(() => {
        setHasVolumeAnimation(false)
      }, 100) as unknown as number
    },
    [onMuteChange]
  )

  // Manage native audio element listener lifecycle
  useEffect(() => {
    if (!audio) return
    audio.addEventListener('volumechange', handleAudioVolumeChange)
    return () => {
      audio.removeEventListener('volumechange', handleAudioVolumeChange)
    }
  }, [audio, handleAudioVolumeChange])

  // Clean up timers & any stray listeners on unmount
  useEffect(
    () => () => {
      if (volumeAnimationTimerRef.current) clearTimeout(volumeAnimationTimerRef.current)
      detachWindowListeners()
    },
    [detachWindowListeners]
  )

  const currentVolumeVal = audio ? audio.volume : volume

  return (
    <div
      ref={volumeBar}
      onMouseDown={handleVolumnControlMouseOrTouchDown}
      onTouchStart={handleVolumnControlMouseOrTouchDown}
      onContextMenu={handleContextMenu}
      role="progressbar"
      aria-label={i18nVolumeControl}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Number(((currentVolumeVal || 0) * 100).toFixed(0))}
      tabIndex={0}
      className="rhap_volume-bar-area"
    >
      <div className="rhap_volume-bar">
        <div
          className="rhap_volume-indicator"
          style={{ left: currentVolumePos, transitionDuration: hasVolumeAnimation ? '.1s' : '0s' }}
        />
        {showFilledVolume && <div className="rhap_volume-filled" style={{ width: currentVolumePos }} />}
      </div>
    </div>
  )
}

export default VolumeControls
