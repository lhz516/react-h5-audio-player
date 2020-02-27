import React, { Component, ReactNode, ReactInstance } from 'react'
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
import ProgressBar from './ProgressBar'
import CurrentTime from './CurrentTime'
import Duration from './Duration'
import VolumeBar from './VolumeBar'

interface PlayerProps {
  /**
   * HTML5 Audio tag autoPlay property
   */
  autoPlay?: boolean
  /**
   * Whether to play music after src prop is changed
   */
  autoPlayAfterSrcChange?: boolean
  /**
   * custom classNames
   */
  className?: string
  /**
   * The time interval to trigger onListen
   */
  listenInterval?: number
  progressJumpStep?: number
  volumeJumpStep?: number
  loop?: boolean
  muted?: boolean
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
  preload?: 'auto' | 'metadata' | 'none'
  /**
   * Pregress indicator refresh interval
   */
  progressUpdateInterval?: number
  /**
   * HTML5 Audio tag src property
   */
  src?: string
  defaultCurrentTime?: ReactNode
  defaultDuration?: ReactNode
  volume?: number
  showLoopControl?: boolean
  showVolumeControl?: boolean
  showJumpControls?: boolean
  showSkipControls?: boolean
  showDownloadProgress?: boolean
  ShowFilledProgress?: boolean
  header?: ReactNode
  footer?: ReactNode
  children?: ReactNode
  style?: React.CSSProperties
}

interface PlayerState {
  isPlaying: boolean
  isLoopEnabled: boolean
}

class H5AudioPlayer extends Component<PlayerProps, PlayerState> {
  static defaultProps: PlayerProps = {
    autoPlay: false,
    autoPlayAfterSrcChange: true,
    listenInterval: 1000,
    progressJumpStep: 5000,
    volumeJumpStep: 0.1,
    loop: false,
    muted: false,
    preload: 'auto',
    progressUpdateInterval: 20,
    defaultCurrentTime: '--:--',
    defaultDuration: '--:--',
    volume: 1,
    className: '',
    showLoopControl: true,
    showVolumeControl: true,
    showJumpControls: true,
    showSkipControls: false,
    showDownloadProgress: true,
    ShowFilledProgress: true,
  }

  state: PlayerState

  audio: HTMLAudioElement

  volumeControl?: HTMLDivElement

  progressBarInstance?: ProgressBar

  container?: HTMLDivElement

  lastVolume: number // To store the volume before clicking mute button

  listenTracker?: number // Determine whether onListen event should be called continuously

  volumeAnimationTimer?: number

  downloadProgressAnimationTimer?: number

  constructor(props: PlayerProps) {
    super(props)
    const { volume } = props
    this.state = {
      isPlaying: false,
      isLoopEnabled: this.props.loop,
    }

    this.lastVolume = volume
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
    if (this.audio.volume > 0) {
      this.lastVolume = this.audio.volume
      this.audio.volume = 0
    } else {
      this.audio.volume = this.lastVolume
    }
  }

  handleMuteChange = (): void => {
    this.forceUpdate()
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
    const { duration, currentTime: prevTime } = this.audio
    if (!isFinite(duration) || !isFinite(prevTime)) return
    let currentTime = prevTime + time / 1000
    if (currentTime < 0) {
      this.audio.currentTime = 0
      currentTime = 0
    } else if (currentTime > duration) {
      this.audio.currentTime = duration
      currentTime = duration
    } else {
      this.audio.currentTime = currentTime
    }
  }

  setJumpVolume = (volume: number): void => {
    let newVolume = this.audio.volume + volume
    if (newVolume < 0) newVolume = 0
    else if (newVolume > 1) newVolume = 1
    this.audio.volume = newVolume
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
        if (e.target === this.container || e.target === this.progressBarInstance.progressBarEl) {
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
    // force update to pass this.audio to child components
    this.forceUpdate()
    // audio player object
    const audio = this.audio

    if (this.props.muted) {
      audio.volume = 0
    } else {
      audio.volume = this.lastVolume
    }

    audio.addEventListener('error', (e) => {
      this.props.onError && this.props.onError(e)
    })

    // When enough of the file has downloaded to start playing
    audio.addEventListener('canplay', (e) => {
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

  render(): ReactNode {
    const {
      className,
      src,
      preload,
      autoPlay,
      crossOrigin,
      mediaGroup,
      showLoopControl,
      showSkipControls,
      showJumpControls,
      showVolumeControl,
      onClickPrevious,
      onClickNext,
      showDownloadProgress,
      ShowFilledProgress,
      volume: volumeProp,
      defaultCurrentTime,
      defaultDuration,
      muted,
      progressUpdateInterval,
      header,
      footer,
      children,
      style,
    } = this.props
    const { isPlaying, isLoopEnabled } = this.state
    const { volume = muted ? 0 : volumeProp } = this.audio || {}

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
        {header && <div className="rhap_header">{header}</div>}
        <div className="rhap_progress-section">
          <div id="rhap_current-time" className="rhap_time rhap_current-time">
            <CurrentTime audio={this.audio} defaultCurrentTime={defaultCurrentTime} />
          </div>
          <ProgressBar
            ref={(node: ReactInstance): void => {
              this.progressBarInstance = node as ProgressBar
            }}
            audio={this.audio}
            progressUpdateInterval={progressUpdateInterval}
            showDownloadProgress={showDownloadProgress}
            ShowFilledProgress={ShowFilledProgress}
          />
          <div className="rhap_time rhap_total-time">
            <Duration audio={this.audio} defaultDuration={defaultDuration} />
          </div>
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
                  aria-label={volume ? 'Mute' : 'Unmute'}
                  onClick={this.handleClickVolumeButton}
                  className="rhap_button-clear rhap_volume-button"
                >
                  <Icon icon={volume ? volumeHigh : volumeMute} />
                </button>
                <VolumeBar audio={this.audio} volume={volume} onMuteChange={this.handleMuteChange} />
              </div>
            )}
          </div>
        </div>
        {footer && <div className="rhap_footer">{footer}</div>}
      </div>
    )
  }
}

export default H5AudioPlayer
