import React, { Component, createRef, SyntheticEvent } from 'react'
import { getPosX } from './utils'

interface VolumeControlsProps {
  audio: HTMLAudioElement
  volume: number
  onMuteChange: () => void
  showFilledVolume: boolean
  i18nVolumeControl: string
}

interface VolumeControlsState {
  currentVolumePos: string
  hasVolumeAnimation: boolean
  isDraggingVolume: boolean
}

interface VolumePosInfo {
  currentVolume: number
  currentVolumePos: string
}

class VolumeControls extends Component<VolumeControlsProps, VolumeControlsState> {
  audio?: HTMLAudioElement

  hasAddedAudioEventListener = false

  volumeBar = createRef<HTMLDivElement>()

  volumeAnimationTimer = 0

  // Keep track of the last non-muted volume so we can restore it when user toggles mute
  lastVolume = this.props.volume // To store the volume before clicking mute button

  state: VolumeControlsState = {
    currentVolumePos: `${((this.lastVolume / 1) * 100 || 0).toFixed(2)}%`,
    hasVolumeAnimation: false,
    isDraggingVolume: false,
  }

  // Calculate (prospective) volume based on the pointer position.
  // This method is shared by mouse & touch flows so we pass the native event directly.
  // It returns both the numeric volume (0~1) and a percentage string used for inline styles.
  getCurrentVolume = (event: TouchEvent | MouseEvent): VolumePosInfo => {
    const { audio } = this.props
    if (!this.volumeBar.current) {
      return {
        currentVolume: audio.volume,
        currentVolumePos: this.state.currentVolumePos,
      }
    }
    const volumeBarRect = this.volumeBar.current.getBoundingClientRect()
    const maxRelativePos = volumeBarRect.width
    const relativePos = getPosX(event) - volumeBarRect.left
    let currentVolume
    let currentVolumePos

    if (relativePos < 0) {
      currentVolume = 0
      currentVolumePos = '0%'
    } else if (relativePos > volumeBarRect.width) {
      currentVolume = 1
      currentVolumePos = '100%'
    } else {
      currentVolume = relativePos / maxRelativePos
      currentVolumePos = `${(relativePos / maxRelativePos) * 100}%`
    }

    return { currentVolume, currentVolumePos }
  }

  handleContextMenu = (event: SyntheticEvent): void => {
    event.preventDefault()
  }

  handleClickVolumeButton = (): void => {
    const { audio } = this.props
    if (audio.volume > 0) {
      this.lastVolume = audio.volume
      audio.volume = 0
    } else {
      audio.volume = this.lastVolume
    }
  }

  handleVolumnControlMouseOrTouchDown = (event: React.MouseEvent | React.TouchEvent): void => {
    event.stopPropagation()
    const { audio } = this.props
    const { currentVolume, currentVolumePos } = this.getCurrentVolume(event.nativeEvent)
    audio.volume = currentVolume
    this.setState({ isDraggingVolume: true, currentVolumePos })

    // Subscribe to move / up events on window so dragging continues even if pointer leaves the bar
    if (event.nativeEvent instanceof MouseEvent) {
      window.addEventListener('mousemove', this.handleWindowMouseOrTouchMove)
      window.addEventListener('mouseup', this.handleWindowMouseOrTouchUp)
    } else {
      window.addEventListener('touchmove', this.handleWindowMouseOrTouchMove)
      window.addEventListener('touchend', this.handleWindowMouseOrTouchUp)
    }
  }

  handleWindowMouseOrTouchMove = (event: TouchEvent | MouseEvent): void => {
    if (event instanceof MouseEvent) {
      event.preventDefault()
    }
    event.stopPropagation()
    const { audio } = this.props
    // Prevent Chrome drag selection bug (text selection while dragging)
    const windowSelection: Selection | null = window.getSelection()
    if (windowSelection && windowSelection.type === 'Range') {
      windowSelection.empty()
    }

    const { isDraggingVolume } = this.state
    if (isDraggingVolume) {
      const { currentVolume, currentVolumePos } = this.getCurrentVolume(event)
      audio.volume = currentVolume
      this.setState({ currentVolumePos })
    }
  }

  handleWindowMouseOrTouchUp = (event: MouseEvent | TouchEvent): void => {
    event.stopPropagation()
    this.setState({ isDraggingVolume: false })

    if (event instanceof MouseEvent) {
      window.removeEventListener('mousemove', this.handleWindowMouseOrTouchMove)
      window.removeEventListener('mouseup', this.handleWindowMouseOrTouchUp)
    } else {
      window.removeEventListener('touchmove', this.handleWindowMouseOrTouchMove)
      window.removeEventListener('touchend', this.handleWindowMouseOrTouchUp)
    }
  }

  handleAudioVolumeChange = (e: Event): void => {
    const { isDraggingVolume } = this.state
    const { volume } = e.target as HTMLAudioElement
    // Fire mute change callback only when toggling between muted and unmuted state
    if ((this.lastVolume > 0 && volume === 0) || (this.lastVolume === 0 && volume > 0)) {
      this.props.onMuteChange()
    }
    this.lastVolume = volume
    if (isDraggingVolume) return
    // When not dragging, we animate the indicator briefly to make programmatic changes smooth
    this.setState({
      hasVolumeAnimation: true,
      currentVolumePos: `${((volume / 1) * 100 || 0).toFixed(2)}%`,
    })
    clearTimeout(this.volumeAnimationTimer)
    // Remove the animation flag shortly after so subsequent rapid updates don't queue transitions
    this.volumeAnimationTimer = setTimeout(() => {
      this.setState({ hasVolumeAnimation: false })
    }, 100)
  }

  componentDidUpdate(): void {
    const { audio } = this.props
    if (audio && !this.hasAddedAudioEventListener) {
      this.audio = audio
      this.hasAddedAudioEventListener = true
      // Attach a single native listener once the <audio> element becomes available
      audio.addEventListener('volumechange', this.handleAudioVolumeChange)
    }
  }

  componentWillUnmount(): void {
    if (this.audio && this.hasAddedAudioEventListener) {
      // Clean up native listener to avoid memory leaks when component unmounts
      this.audio.removeEventListener('volumechange', this.handleAudioVolumeChange)
    }

    clearTimeout(this.volumeAnimationTimer)
  }

  render(): React.ReactNode {
    const { audio, showFilledVolume, i18nVolumeControl } = this.props
    const { currentVolumePos, hasVolumeAnimation } = this.state

    const { volume } = audio || {}
    return (
      <div
        ref={this.volumeBar}
        onMouseDown={this.handleVolumnControlMouseOrTouchDown}
        onTouchStart={this.handleVolumnControlMouseOrTouchDown}
        onContextMenu={this.handleContextMenu}
        role="progressbar"
        aria-label={i18nVolumeControl}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Number((volume * 100).toFixed(0))}
        tabIndex={0}
        className="rhap_volume-bar-area"
      >
        <div className="rhap_volume-bar">
          <div
            className="rhap_volume-indicator"
            // We only animate when hasVolumeAnimation is true (usually non-drag volume changes)
            style={{ left: currentVolumePos, transitionDuration: hasVolumeAnimation ? '.1s' : '0s' }}
          />
          {showFilledVolume && <div className="rhap_volume-filled" style={{ width: currentVolumePos }} />}
        </div>
      </div>
    )
  }
}

export default VolumeControls
