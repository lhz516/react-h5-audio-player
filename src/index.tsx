import React, {
  Component,
  cloneElement,
  isValidElement,
  createRef,
  ReactNode,
  CSSProperties,
  ReactElement,
} from 'react'
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
import {
  RHAP_UI,
  PROGRESS_BAR_SECTION_UI,
  CONTROLS_SECTION_UI,
  ADDITIONAL_CONTROLS_UI,
  VOLUME_CONTROLS_UI,
} from './constants'

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
  customIcons?: CustomIcons
  layout?: 'stacked' | 'horizontal'
  customProgressBarSection?: Array<PROGRESS_BAR_SECTION_UI | ReactElement>
  customControlsSection?: Array<CONTROLS_SECTION_UI | ReactElement>
  customAdditionalControls?: Array<ADDITIONAL_CONTROLS_UI | ReactElement>
  customVolumeControls?: Array<VOLUME_CONTROLS_UI | ReactElement>
  children?: ReactNode
  style?: CSSProperties
}

interface PlayerState {
  isPlaying: boolean
  isLoopEnabled: boolean
}

interface CustomIcons {
  play?: ReactNode
  pause?: ReactNode
  rewind?: ReactNode
  forward?: ReactNode
  previous?: ReactNode
  next?: ReactNode
  loop?: ReactNode
  loopOff?: ReactNode
  volume?: ReactNode
  volumeMute?: ReactNode
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
    customIcons: {},
    customProgressBarSection: [RHAP_UI.CURRENT_TIME, RHAP_UI.PROGRESS_BAR, RHAP_UI.DURATION],
    customControlsSection: [RHAP_UI.ADDITIONAL_CONTROLS, RHAP_UI.MAIN_CONTROLS, RHAP_UI.VOLUME_CONTROLS],
    customAdditionalControls: [RHAP_UI.LOOP],
    customVolumeControls: [RHAP_UI.VOLUME],
    layout: 'stacked',
  }

  state: PlayerState = {
    isPlaying: false,
    isLoopEnabled: this.props.loop,
  }

  audio = createRef<HTMLAudioElement>()

  progressBar = createRef<HTMLDivElement>()

  container = createRef<HTMLDivElement>()

  lastVolume: number = this.props.volume // To store the volume before clicking mute button

  listenTracker?: number // Determine whether onListen event should be called continuously

  volumeAnimationTimer?: number

  downloadProgressAnimationTimer?: number

  togglePlay = (e: React.SyntheticEvent): void => {
    e.stopPropagation()
    const audio = this.audio.current
    if (audio.paused && audio.src) {
      const audioPromise = audio.play()
      audioPromise.then(null).catch((err) => {
        const { onPlayError } = this.props
        onPlayError && onPlayError(new Error(err))
      })
    } else if (!audio.paused) {
      audio.pause()
    }
  }

  handleClickVolumeButton = (): void => {
    const audio = this.audio.current
    if (audio.volume > 0) {
      this.lastVolume = audio.volume
      audio.volume = 0
    } else {
      audio.volume = this.lastVolume
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
    const audio = this.audio.current
    const { duration, currentTime: prevTime } = audio
    if (!isFinite(duration) || !isFinite(prevTime)) return
    let currentTime = prevTime + time / 1000
    if (currentTime < 0) {
      audio.currentTime = 0
      currentTime = 0
    } else if (currentTime > duration) {
      audio.currentTime = duration
      currentTime = duration
    } else {
      audio.currentTime = currentTime
    }
  }

  setJumpVolume = (volume: number): void => {
    let newVolume = this.audio.current.volume + volume
    if (newVolume < 0) newVolume = 0
    else if (newVolume > 1) newVolume = 1
    this.audio.current.volume = newVolume
  }

  /**
   * Set an interval to call props.onListen every props.listenInterval time period
   */
  setListenTrack = (): void => {
    if (!this.listenTracker) {
      const listenInterval = this.props.listenInterval
      this.listenTracker = setInterval(() => {
        this.props.onListen && this.props.onListen(this.audio.current.currentTime)
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
        e.preventDefault() // Prevent scrolling page by pressing Space key
        if (e.target === this.container.current || e.target === this.progressBar.current) {
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
    const audio = this.audio.current

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
        audio.play()
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

  renderProgressBarSection = (): Array<ReactElement> => {
    const {
      customProgressBarSection,
      defaultCurrentTime,
      progressUpdateInterval,
      showDownloadProgress,
      ShowFilledProgress,
      defaultDuration,
    } = this.props
    return customProgressBarSection.map((comp, i) => {
      switch (comp) {
        case RHAP_UI.CURRENT_TIME:
          return (
            <div key={i} id="rhap_current-time" className="rhap_time rhap_current-time">
              <CurrentTime audio={this.audio.current} defaultCurrentTime={defaultCurrentTime} />
            </div>
          )
        case RHAP_UI.PROGRESS_BAR:
          return (
            <ProgressBar
              key={i}
              ref={this.progressBar}
              audio={this.audio.current}
              progressUpdateInterval={progressUpdateInterval}
              showDownloadProgress={showDownloadProgress}
              ShowFilledProgress={ShowFilledProgress}
            />
          )
        case RHAP_UI.DURATION:
          return (
            <div key={i} className="rhap_time rhap_total-time">
              <Duration audio={this.audio.current} defaultDuration={defaultDuration} />
            </div>
          )
        default:
          if (!isValidElement(comp)) {
            throw new Error('Invalid element in customProgressBarSection. It requires ReactElement, not ReactNode')
          }
          return comp.key ? comp : cloneElement(comp as ReactElement, { key: i })
      }
    })
  }

  renderControlsSection = (): Array<ReactElement> => {
    const {
      customIcons,
      customControlsSection,
      showSkipControls,
      onClickPrevious,
      onClickNext,
      showJumpControls,
    } = this.props
    const { isPlaying } = this.state

    let actionIcon: ReactNode
    if (isPlaying) {
      actionIcon = customIcons.pause ? customIcons.pause : <Icon icon={pauseCircle} />
    } else {
      actionIcon = customIcons.play ? customIcons.play : <Icon icon={playCircle} />
    }

    return customControlsSection.map((comp, i) => {
      switch (comp) {
        case RHAP_UI.ADDITIONAL_CONTROLS:
          return (
            <div key={i} className="rhap_additional-controls">
              {this.renderAdditionalControls()}
            </div>
          )
        case RHAP_UI.MAIN_CONTROLS:
          return (
            <div key={i} className="rhap_main-controls">
              {showSkipControls && (
                <button
                  aria-label="Previous"
                  className="rhap_button-clear rhap_main-controls-button rhap_skip-button"
                  onClick={onClickPrevious}
                >
                  {customIcons.previous ? customIcons.previous : <Icon icon={skipPrevious} />}
                </button>
              )}
              {showJumpControls && (
                <button
                  aria-label="Rewind"
                  className="rhap_button-clear rhap_main-controls-button rhap_rewind-button"
                  onClick={this.handleClickRewind}
                >
                  {customIcons.rewind ? customIcons.rewind : <Icon icon={rewind} />}
                </button>
              )}
              <button
                aria-label={isPlaying ? 'Pause' : 'Play'}
                className="rhap_button-clear rhap_main-controls-button rhap_play-pause-button"
                onClick={this.togglePlay}
              >
                {actionIcon}
              </button>
              {showJumpControls && (
                <button
                  aria-label="Forward"
                  className="rhap_button-clear rhap_main-controls-button rhap_forward-button"
                  onClick={this.handleClickForward}
                >
                  {customIcons.forward ? customIcons.forward : <Icon icon={fastForward} />}
                </button>
              )}
              {showSkipControls && (
                <button
                  aria-label="Skip"
                  className="rhap_button-clear rhap_main-controls-button rhap_skip-button"
                  onClick={onClickNext}
                >
                  {customIcons.next ? customIcons.next : <Icon icon={skipNext} />}
                </button>
              )}
            </div>
          )
        case RHAP_UI.VOLUME_CONTROLS:
          return (
            <div key={i} className="rhap_volume-controls">
              {this.renderVolumeControls()}
            </div>
          )
        default:
          if (!isValidElement(comp)) {
            throw new Error('Invalid element in customControlsSection. It requires ReactElement, not ReactNode')
          }
          return comp.key ? comp : cloneElement(comp as ReactElement, { key: i })
      }
    })
  }

  renderAdditionalControls = (): Array<ReactElement> => {
    const { customAdditionalControls, showLoopControl, customIcons } = this.props
    const { isLoopEnabled } = this.state

    let loopIcon: ReactNode
    if (isLoopEnabled) {
      loopIcon = customIcons.loop ? customIcons.loop : <Icon icon={repeat} />
    } else {
      loopIcon = customIcons.loopOff ? customIcons.loopOff : <Icon icon={repeatOff} />
    }

    return customAdditionalControls.map((comp, i) => {
      switch (comp) {
        case RHAP_UI.LOOP:
          return (
            showLoopControl && (
              <button
                key={i}
                aria-label={isLoopEnabled ? 'Enable Loop' : 'Disable Loop'}
                className="rhap_button-clear rhap_repeat-button"
                onClick={this.handleClickLoopButton}
              >
                {loopIcon}
              </button>
            )
          )
        default:
          if (!isValidElement(comp)) {
            throw new Error('Invalid element in customAdditionalControls. It requires ReactElement, not ReactNode')
          }
          return comp.key ? comp : cloneElement(comp as ReactElement, { key: i })
      }
    })
  }

  renderVolumeControls = (): Array<ReactElement> => {
    const { customVolumeControls, showVolumeControl, customIcons, muted, volume: volumeProp } = this.props

    const { volume = muted ? 0 : volumeProp } = this.audio.current || {}

    let volumeIcon: ReactNode
    if (volume) {
      volumeIcon = customIcons.volume ? customIcons.volume : <Icon icon={volumeHigh} />
    } else {
      volumeIcon = customIcons.volume ? customIcons.volumeMute : <Icon icon={volumeMute} />
    }

    return customVolumeControls.map((comp, i) => {
      switch (comp) {
        case RHAP_UI.VOLUME:
          return (
            showVolumeControl && (
              <div key={i} className="rhap_volume-container">
                <button
                  aria-label={volume ? 'Mute' : 'Unmute'}
                  onClick={this.handleClickVolumeButton}
                  className="rhap_button-clear rhap_volume-button"
                >
                  {volumeIcon}
                </button>
                <VolumeBar audio={this.audio.current} volume={volume} onMuteChange={this.handleMuteChange} />
              </div>
            )
          )
        default:
          if (!isValidElement(comp)) {
            throw new Error('Invalid element in customVolumeControls. It requires ReactElement, not ReactNode')
          }
          return comp.key ? comp : cloneElement(comp as ReactElement, { key: i })
      }
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
      header,
      footer,
      layout,
      children,
      style,
    } = this.props
    const { isLoopEnabled } = this.state

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
        ref={this.container}
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
          ref={this.audio}
        >
          {children}
        </audio>
        {header && <div className="rhap_header">{header}</div>}
        <div className={`rhap_main  ${layout === 'horizontal' ? 'rhap_horizontal' : ''}`}>
          <div className="rhap_progress-section">{this.renderProgressBarSection()}</div>
          <div className="rhap_controls-section">{this.renderControlsSection()}</div>
        </div>
        {footer && <div className="rhap_footer">{footer}</div>}
      </div>
    )
  }
}

export default H5AudioPlayer
export { RHAP_UI }
