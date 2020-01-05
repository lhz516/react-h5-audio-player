import React, { Component } from 'react'
import { Icon } from '@iconify/react'
import playCircle from '@iconify/icons-mdi/play-circle'
import pauseCircle from '@iconify/icons-mdi/pause-circle'
import skipPrevious from '@iconify/icons-mdi/skip-previous'
import skipNext from '@iconify/icons-mdi/skip-next'
import fastForward from '@iconify/icons-mdi/fast-forward'
import rewind from '@iconify/icons-mdi/rewind'
import volumeHigh from '@iconify/icons-mdi/volume-high'
import volumeMute from '@iconify/icons-mdi/volume-mute'
import repeat from '@iconify/icons-mdi/repeat'
import repeatOff from '@iconify/icons-mdi/repeat-off'

interface PlayerProps {
  /**
   * HTML5 Audio tag autoPlay property
   */
  autoPlay: boolean
  /**
   * Whether to play music after src prop is changed
   */
  autoPlayAfterSrcChange: boolean
  /**
   * custom classNames
   */
  className?: string
  /**
   * The time interval to trigger onListen
   */
  listenInterval: number
  progressJumpStep: number
  volumeJumpStep: number
  loop: boolean
  muted: boolean
  crossOrigin?: string
  mediaGroup?: string
  onAbort?: (e: Event) => void
  onCanPlay?: (e: Event) => void
  onCanPlayThrough?: (e: Event) => void
  onEnded?: (e: Event) => void
  onError?: (e: Event) => void
  onListen?: (currentTime: number) => void
  onPause?: (e: Event) => void
  onPlay?: (e: Event) => void
  onClickPrevious?: (e: React.SyntheticEvent) => void
  onClickNext?: (e: React.SyntheticEvent) => void
  onPlayError?: (err: Error) => void
  /**
   * HTML5 Audio tag preload property
   */
  preload: 'auto' | 'metadata' | 'none'
  /**
   * Pregress indicator refresh interval
   */
  progressUpdateInterval: number
  /**
   * HTML5 Audio tag src property
   */
  src?: string
  volume: number
  showLoopControl: boolean
  showVolumeControl: boolean
  showJumpControls: boolean
  showSkipControls: boolean
  children?: React.ReactNode
  style?: React.CSSProperties
}

interface PlayerState {
  duration: number
  currentTime: number
  currentTimePos: string
  currentVolume: number
  currentVolumePos: string
  isDraggingProgress: boolean
  isDraggingVolume: boolean
  isPlaying: boolean
  isLoopEnabled: boolean
}

interface TimePosInfo {
  currentTime: number
  currentTimePos: string
}

interface VolumePosInfo {
  currentVolume: number
  currentVolumePos: string
}

class H5AudioPlayer extends Component<PlayerProps, PlayerState> {
  static defaultProps = {
    autoPlay: false,
    autoPlayAfterSrcChange: true,
    listenInterval: 1000,
    progressJumpStep: 5000,
    volumeJumpStep: 0.1,
    loop: false,
    muted: false,
    preload: 'auto',
    progressUpdateInterval: 20,
    volume: 1.0,
    className: '',
    showLoopControl: true,
    showVolumeControl: true,
    showJumpControls: true,
    showSkipControls: false,
  }

  static addHeadingZero = (num: number): string => (num > 9 ? num.toString() : `0${num}`)

  static getPosX = (event: TouchEvent | MouseEvent): number => {
    let posX = 0
    if (event instanceof TouchEvent) {
      posX = event.touches[0].pageX
    } else if (event instanceof MouseEvent) {
      posX = event.pageX || event.clientX
    }

    return posX
  }

  state: PlayerState

  audio?: HTMLAudioElement

  volumeControl?: HTMLElement

  progressBar?: HTMLElement

  container?: HTMLElement

  lastVolume: number // To store the volume before clicking mute button

  timeOnMouseMove: number // Audio's current time while mouse is down and moving over the progress bar

  listenTracker?: number // Determine whether onListen event should be called continuously

  intervalId?: number // For progress bar and display time update interval

  constructor(props: PlayerProps) {
    super(props)
    const { volume, muted } = props
    this.state = {
      duration: NaN,
      currentTime: 0,
      currentTimePos: '0%',
      currentVolume: muted ? 0 : volume,
      currentVolumePos: muted ? '0%' : `${volume * 100}%`,
      isDraggingProgress: false,
      isDraggingVolume: false,
      isPlaying: false,
      isLoopEnabled: this.props.loop,
    }
    this.lastVolume = volume
    this.timeOnMouseMove = 0
  }

  updateDisplayTime = (currentTime: number): void => {
    const duration: number = this.audio.duration
    this.setState({
      currentTime,
      duration: this.audio.duration,
      currentTimePos: `${((currentTime / duration) * 100 || 0).toFixed(2)}%`,
    })
  }

  updateDisplayVolume = (volume: number): void => {
    this.setState({ currentVolume: volume, currentVolumePos: `${(volume * 100).toFixed(0)}%` })
  }

  togglePlay = (e: React.SyntheticEvent): void => {
    e.stopPropagation()
    if (this.audio.paused && this.audio.src) {
      const audioPromise = this.audio.play()
      audioPromise.then(null).catch((err) => {
        const { onPlayError } = this.props
        onPlayError && onPlayError(new Error(err))
      })
    } else if (!this.audio.paused) {
      this.audio.pause()
    }
  }

  handleClickVolumeButton = (): void => {
    const { currentVolume } = this.state
    if (currentVolume > 0) {
      this.lastVolume = this.audio.volume
      this.audio.volume = 0
      this.updateDisplayVolume(0)
    } else {
      this.audio.volume = this.lastVolume
      this.updateDisplayVolume(this.lastVolume)
    }
  }

  handleVolumnControlMouseDown = (event: React.MouseEvent | React.TouchEvent): void => {
    event.stopPropagation()
    const { currentVolume, currentVolumePos } = this.getCurrentVolume(event.nativeEvent)
    this.audio.volume = currentVolume
    this.setState({ isDraggingVolume: true, currentVolume, currentVolumePos })

    if (event.nativeEvent instanceof TouchEvent) {
      window.addEventListener('touchmove', this.handleWindowMouseOrTouchMove)
      window.addEventListener('touchend', this.handleWindowMouseOrTouchUp)
    } else if (event.nativeEvent instanceof MouseEvent) {
      window.addEventListener('mousemove', this.handleWindowMouseOrTouchMove)
      window.addEventListener('mouseup', this.handleWindowMouseOrTouchUp)
    }
  }

  handleWindowMouseOrTouchMove = (event: TouchEvent | MouseEvent): void => {
    event.stopPropagation()
    // Prevent Chrome drag selection bug
    const windowSelection: Selection | null = window.getSelection()
    if (windowSelection && windowSelection.type === 'Range') {
      windowSelection.empty()
    }

    const { isDraggingVolume, isDraggingProgress } = this.state
    if (isDraggingVolume) {
      const { currentVolume, currentVolumePos } = this.getCurrentVolume(event)
      this.audio.volume = currentVolume
      this.setState({ currentVolume, currentVolumePos })
    } else if (isDraggingProgress) {
      const { currentTime, currentTimePos } = this.getCurrentProgress(event)
      this.timeOnMouseMove = currentTime
      this.setState({ currentTime, currentTimePos })
    }
  }

  handleWindowMouseOrTouchUp = (event: MouseEvent | TouchEvent): void => {
    event.stopPropagation()
    this.setState((prevState) => {
      if (prevState.isDraggingProgress && isFinite(this.timeOnMouseMove)) {
        this.audio.currentTime = this.timeOnMouseMove
      }
      return { isDraggingVolume: false, isDraggingProgress: false }
    })

    if (event instanceof TouchEvent) {
      window.removeEventListener('touchmove', this.handleWindowMouseOrTouchMove)
      window.removeEventListener('touchend', this.handleWindowMouseOrTouchUp)
    } else {
      window.removeEventListener('mousemove', this.handleWindowMouseOrTouchMove)
      window.removeEventListener('mouseup', this.handleWindowMouseOrTouchUp)
    }
  }

  getCurrentVolume = (event: TouchEvent | MouseEvent): VolumePosInfo => {
    if (!this.volumeControl) {
      return {
        currentVolume: this.state.currentVolume,
        currentVolumePos: this.state.currentVolumePos,
      }
    }
    const volumeBarRect = this.volumeControl.getBoundingClientRect()
    const relativePos = H5AudioPlayer.getPosX(event) - volumeBarRect.left
    let currentVolume
    let currentVolumePos

    if (relativePos < 0) {
      currentVolume = 0
      currentVolumePos = '0%'
    } else if (relativePos > volumeBarRect.width) {
      currentVolume = 1
      currentVolumePos = `${(volumeBarRect.width / volumeBarRect.width) * 100}%`
    } else {
      currentVolume = relativePos / volumeBarRect.width
      currentVolumePos = `${(relativePos / volumeBarRect.width) * 100}%`
    }

    return { currentVolume, currentVolumePos }
  }

  /* Handle mouse click on progress bar event */
  handleMouseDownProgressBar = (event: React.MouseEvent | React.TouchEvent): void => {
    event.stopPropagation()
    const isTouch = event.type.startsWith('touch')
    const { currentTime, currentTimePos } = this.getCurrentProgress(event.nativeEvent)

    if (isFinite(currentTime)) {
      this.timeOnMouseMove = currentTime
      this.setState({ isDraggingProgress: true, currentTime, currentTimePos })
      if (isTouch) {
        window.addEventListener('touchmove', this.handleWindowMouseOrTouchMove)
        window.addEventListener('touchend', this.handleWindowMouseOrTouchUp)
      } else {
        window.addEventListener('mousemove', this.handleWindowMouseOrTouchMove)
        window.addEventListener('mouseup', this.handleWindowMouseOrTouchUp)
      }
    }
  }

  handleClickLoopButton = (): void => {
    this.setState((prevState) => ({ isLoopEnabled: !prevState.isLoopEnabled }))
  }

  handleClickRewind = (): void => {
    this.setJumpTime(-this.props.progressJumpStep)
  }

  handleClickForward = (): void => {
    this.setJumpTime(this.props.progressJumpStep)
  }

  setJumpTime = (time: number): void => {
    const { duration, currentTime } = this.audio
    if (!isFinite(duration) || !isFinite(currentTime)) return
    this.setState((prevState) => {
      let currentTime = prevState.currentTime + time / 1000
      if (currentTime < 0) {
        this.audio.currentTime = 0
        currentTime = 0
      } else if (currentTime > duration) {
        this.audio.currentTime = duration
        currentTime = duration
      } else {
        this.audio.currentTime = currentTime
      }
      return { currentTime, currentTimePos: `${(currentTime / duration) * 100}%` }
    })
  }

  setJumpVolume = (volume: number): void => {
    let newVolume = this.audio.volume + volume
    if (newVolume < 0) newVolume = 0
    else if (newVolume > 1) newVolume = 1
    this.audio.volume = newVolume
    this.updateDisplayVolume(newVolume)
  }

  getCurrentProgress = (event: MouseEvent | TouchEvent): TimePosInfo => {
    if (!this.audio.src || !isFinite(this.audio.currentTime) || !this.progressBar) {
      return { currentTime: 0, currentTimePos: '0%' }
    }

    const progressBarRect = this.progressBar.getBoundingClientRect()
    const maxRelativePos = progressBarRect.width
    let relativePos = H5AudioPlayer.getPosX(event) - progressBarRect.left

    if (relativePos < 0) {
      relativePos = 0
    } else if (relativePos > maxRelativePos) {
      relativePos = maxRelativePos
    }
    const currentTime = (this.audio.duration * relativePos) / maxRelativePos
    return { currentTime, currentTimePos: `${((relativePos / maxRelativePos) * 100).toFixed(2)}%` }
  }

  getDisplayTimeBySeconds = (seconds: number): string => {
    if (!isFinite(seconds)) {
      return '00:00'
    }

    const addHeadingZero = H5AudioPlayer.addHeadingZero
    const min = addHeadingZero(Math.floor(seconds / 60))
    const sec = addHeadingZero(Math.floor(seconds % 60))
    return `${min}:${sec}`
  }

  /**
   * Set an interval to call props.onListen every props.listenInterval time period
   */
  setListenTrack = (): void => {
    if (!this.listenTracker) {
      const listenInterval = this.props.listenInterval
      this.listenTracker = setInterval(() => {
        this.props.onListen && this.props.onListen(this.audio.currentTime)
      }, listenInterval)
    }
  }

  /**
   * Clear the onListen interval
   */
  clearListenTrack = (): void => {
    if (this.listenTracker) {
      clearInterval(this.listenTracker)
      delete this.listenTracker
    }
  }

  handleKeyDown = (e: React.KeyboardEvent): void => {
    switch (e.keyCode) {
      case 32: // Space
        if (e.target === this.container || e.target === this.progressBar) {
          this.togglePlay(e)
        }
        break
      case 37: // Left arrow
        this.handleClickRewind()
        break
      case 39: // Right arrow
        this.handleClickForward()
        break
      case 38: // Up arrow
        this.setJumpVolume(this.props.volumeJumpStep)
        break
      case 40: // Down arrow
        this.setJumpVolume(-this.props.volumeJumpStep)
        break
      case 76: // L = Loop
        this.handleClickLoopButton()
        break
      case 77: // M = Mute
        this.handleClickVolumeButton()
        break
    }
  }

  componentDidMount(): void {
    // audio player object
    this.audio = this.audio || document.createElement('audio')
    const audio = this.audio

    audio.volume = this.lastVolume

    this.intervalId = setInterval(() => {
      if (!this.audio.paused && !this.state.isDraggingProgress && !!this.audio.duration) {
        this.updateDisplayTime(this.audio.currentTime)
      }
    }, this.props.progressUpdateInterval)

    audio.addEventListener('error', (e) => {
      this.props.onError && this.props.onError(e)
    })

    // When enough of the file has downloaded to start playing
    audio.addEventListener('canplay', (e) => {
      if (isFinite(this.audio.duration)) {
        this.setState({ duration: this.audio.duration })
      }
      this.props.onCanPlay && this.props.onCanPlay(e)
    })

    // When enough of the file has downloaded to play the entire file
    audio.addEventListener('canplaythrough', (e) => {
      this.props.onCanPlayThrough && this.props.onCanPlayThrough(e)
    })

    // When audio play starts
    audio.addEventListener('play', (e) => {
      this.setState({ isPlaying: true })
      this.setListenTrack()
      this.props.onPlay && this.props.onPlay(e)
    })

    // When unloading the audio player (switching to another src)
    audio.addEventListener('abort', (e) => {
      this.clearListenTrack()
      const { autoPlayAfterSrcChange } = this.props
      if (autoPlayAfterSrcChange) {
        this.audio.play()
      } else {
        this.setState({
          isPlaying: false,
          currentTime: 0,
          currentTimePos: '0%',
        })
      }
      this.props.onAbort && this.props.onAbort(e)
    })

    // When the file has finished playing to the end
    audio.addEventListener('ended', (e) => {
      this.clearListenTrack()
      this.props.onEnded && this.props.onEnded(e)
    })

    // When the user pauses playback
    audio.addEventListener('pause', (e) => {
      this.clearListenTrack()
      if (!this.audio) return
      this.setState({ isPlaying: false })
      this.props.onPause && this.props.onPause(e)
    })
  }

  componentWillUnmount(): void {
    clearInterval(this.intervalId)
  }

  render(): React.ReactNode {
    const {
      className,
      src,
      preload,
      autoPlay,
      muted,
      crossOrigin,
      mediaGroup,
      showLoopControl,
      showVolumeControl,
      showSkipControls,
      showJumpControls,
      onClickPrevious,
      onClickNext,
      children,
      style,
    } = this.props
    const {
      currentTime,
      currentTimePos,
      currentVolume,
      currentVolumePos,
      duration,
      isPlaying,
      isLoopEnabled,
    } = this.state

    return (
      /* We want the container to catch bubbled events */
      /* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */
      <div
        role="group"
        /* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */
        tabIndex={0}
        aria-label="Audio Player"
        className={`rhap_container ${className}`}
        onKeyDown={this.handleKeyDown}
        ref={(ref: HTMLDivElement): void => {
          this.container = ref
        }}
        style={style}
      >
        {/* User can pass <track> through children */}
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <audio
          src={src}
          controls={false}
          muted={muted}
          loop={isLoopEnabled}
          autoPlay={autoPlay}
          preload={preload}
          crossOrigin={crossOrigin}
          mediaGroup={mediaGroup}
          ref={(ref: HTMLAudioElement): void => {
            this.audio = ref
          }}
        >
          {children}
        </audio>
        <div className="rhap_progress-section">
          <div id="rhap_current-time" className="rhap_time rhap_current-time">
            {this.getDisplayTimeBySeconds(currentTime)}
          </div>
          <div
            className="rhap_progress-container"
            ref={(ref: HTMLDivElement): void => {
              this.progressBar = ref
            }}
            aria-label="Audio Progress Control"
            aria-describedby="rhap_current-time"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Number(currentTimePos.split('%')[0])}
            tabIndex={0}
            onMouseDown={this.handleMouseDownProgressBar}
            onTouchStart={this.handleMouseDownProgressBar}
          >
            <div className="rhap_progress-bar">
              <div className="rhap_progress-indicator" style={{ left: currentTimePos }} />
            </div>
          </div>
          <div className="rhap_time rhap_total-time">{this.getDisplayTimeBySeconds(duration)}</div>
        </div>

        <div className="rhap_controls-section">
          <div className="rhap_additional-controls">
            {showLoopControl && (
              <button
                aria-label={isLoopEnabled ? 'Enable Loop' : 'Disable Loop'}
                className="rhap_button-clear rhap_repeat-button"
                onClick={this.handleClickLoopButton}
              >
                <Icon icon={isLoopEnabled ? repeat : repeatOff} />
              </button>
            )}
          </div>
          <div className="rhap_main-controls">
            {showSkipControls && (
              <button
                aria-label="Previous"
                className="rhap_button-clear rhap_main-controls-button rhap_skip-button"
                onClick={onClickPrevious}
              >
                <Icon icon={skipPrevious} />
              </button>
            )}
            {showJumpControls && (
              <button
                aria-label="Rewind"
                className="rhap_button-clear rhap_main-controls-button rhap_rewind-button"
                onClick={this.handleClickRewind}
              >
                <Icon icon={rewind} />
              </button>
            )}
            <button
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="rhap_button-clear rhap_main-controls-button rhap_play-pause-button"
              onClick={this.togglePlay}
            >
              {isPlaying ? <Icon icon={pauseCircle} /> : <Icon icon={playCircle} />}
            </button>
            {showJumpControls && (
              <button
                aria-label="Forward"
                className="rhap_button-clear rhap_main-controls-button rhap_forward-button"
                onClick={this.handleClickForward}
              >
                <Icon icon={fastForward} />
              </button>
            )}
            {showSkipControls && (
              <button
                aria-label="Skip"
                className="rhap_button-clear rhap_main-controls-button rhap_skip-button"
                onClick={onClickNext}
              >
                <Icon icon={skipNext} />
              </button>
            )}
          </div>
          <div className="rhap_volume-controls">
            {showVolumeControl && (
              <div className="rhap_volume-container">
                <button
                  aria-label={currentVolume ? 'Mute' : 'Unmute'}
                  onClick={this.handleClickVolumeButton}
                  className="rhap_button-clear rhap_volume-button"
                >
                  <Icon icon={currentVolume ? volumeHigh : volumeMute} />
                </button>
                <div
                  ref={(ref: HTMLDivElement): void => {
                    this.volumeControl = ref
                  }}
                  onMouseDown={this.handleVolumnControlMouseDown}
                  onTouchStart={this.handleVolumnControlMouseDown}
                  role="progressbar"
                  aria-label="volume Control"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Number((currentVolume * 100).toFixed(0))}
                  tabIndex={0}
                  className="rhap_volume-bar-area"
                >
                  <div className="rhap_volume-bar">
                    <div className="rhap_volume-indicator" style={{ left: currentVolumePos }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
}

export default H5AudioPlayer
