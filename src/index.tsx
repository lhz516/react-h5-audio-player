import React, {
  Component,
  cloneElement,
  isValidElement,
  createRef,
  ReactNode,
  CSSProperties,
  ReactElement,
  Key,
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
import { RHAP_UI, MAIN_LAYOUT, AUDIO_PRELOAD_ATTRIBUTE } from './constants'
import { throttle, getMainLayoutClassName } from './utils'

type CustomUIModule = RHAP_UI | ReactElement
type CustomUIModules = Array<CustomUIModule>

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
  onListen?: (e: Event) => void
  onPause?: (e: Event) => void
  onPlay?: (e: Event) => void
  onClickPrevious?: (e: React.SyntheticEvent) => void
  onClickNext?: (e: React.SyntheticEvent) => void
  onPlayError?: (err: Error) => void
  /**
   * HTML5 Audio tag preload property
   */
  preload?: AUDIO_PRELOAD_ATTRIBUTE
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
  showJumpControls?: boolean
  showSkipControls?: boolean
  showDownloadProgress?: boolean
  showFilledProgress?: boolean
  header?: ReactNode
  footer?: ReactNode
  customIcons?: CustomIcons
  layout?: MAIN_LAYOUT
  customProgressBarSection?: CustomUIModules
  customControlsSection?: CustomUIModules
  customAdditionalControls?: CustomUIModules
  customVolumeControls?: CustomUIModules
  children?: ReactNode
  style?: CSSProperties
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

class H5AudioPlayer extends Component<PlayerProps> {
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
    showJumpControls: true,
    showSkipControls: false,
    showDownloadProgress: true,
    showFilledProgress: true,
    customIcons: {},
    customProgressBarSection: [RHAP_UI.CURRENT_TIME, RHAP_UI.PROGRESS_BAR, RHAP_UI.DURATION],
    customControlsSection: [RHAP_UI.ADDITIONAL_CONTROLS, RHAP_UI.MAIN_CONTROLS, RHAP_UI.VOLUME_CONTROLS],
    customAdditionalControls: [RHAP_UI.LOOP],
    customVolumeControls: [RHAP_UI.VOLUME],
    layout: 'stacked',
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

  isPlaying = (): boolean => {
    const audio = this.audio.current
    if (!audio) return false

    return !audio.paused && !audio.ended
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
    this.audio.current.loop = !this.audio.current.loop
    this.forceUpdate()
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

  handleKeyDown = (e: React.KeyboardEvent): void => {
    switch (e.keyCode) {
      case 32: // Space
        if (e.target === this.container.current || e.target === this.progressBar.current) {
          e.preventDefault() // Prevent scrolling page by pressing Space key
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
        e.preventDefault() // Prevent scrolling page by pressing arrow key
        this.setJumpVolume(this.props.volumeJumpStep)
        break
      case 40: // Down arrow
        e.preventDefault() // Prevent scrolling page by pressing arrow key
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

  renderUIModules = (modules: CustomUIModules): Array<ReactElement> => {
    return modules.map((comp, i) => this.renderUIModule(comp, i))
  }

  renderUIModule = (comp: CustomUIModule, key: Key): ReactElement => {
    const {
      defaultCurrentTime,
      progressUpdateInterval,
      showDownloadProgress,
      showFilledProgress,
      defaultDuration,
      customIcons,
      showSkipControls,
      onClickPrevious,
      onClickNext,
      showJumpControls,
      customAdditionalControls,
      customVolumeControls,
      muted,
      volume: volumeProp,
      loop: loopProp,
    } = this.props

    switch (comp) {
      case RHAP_UI.CURRENT_TIME:
        return (
          <div key={key} id="rhap_current-time" className="rhap_time rhap_current-time">
            <CurrentTime audio={this.audio.current} isLeftTime={false} defaultCurrentTime={defaultCurrentTime} />
          </div>
        )
      case RHAP_UI.CURRENT_LEFT_TIME:
        return (
          <div key={key} id="rhap_current-left-time" className="rhap_time rhap_current-left-time">
            <CurrentTime audio={this.audio.current} isLeftTime={true} defaultCurrentTime={defaultCurrentTime} />
          </div>
        )
      case RHAP_UI.PROGRESS_BAR:
        return (
          <ProgressBar
            key={key}
            ref={this.progressBar}
            audio={this.audio.current}
            progressUpdateInterval={progressUpdateInterval}
            showDownloadProgress={showDownloadProgress}
            showFilledProgress={showFilledProgress}
          />
        )
      case RHAP_UI.DURATION:
        return (
          <div key={key} className="rhap_time rhap_total-time">
            <Duration audio={this.audio.current} defaultDuration={defaultDuration} />
          </div>
        )
      case RHAP_UI.ADDITIONAL_CONTROLS:
        return (
          <div key={key} className="rhap_additional-controls">
            {this.renderUIModules(customAdditionalControls)}
          </div>
        )
      case RHAP_UI.MAIN_CONTROLS: {
        const isPlaying = this.isPlaying()
        let actionIcon: ReactNode
        if (isPlaying) {
          actionIcon = customIcons.pause ? customIcons.pause : <Icon icon={pauseCircle} />
        } else {
          actionIcon = customIcons.play ? customIcons.play : <Icon icon={playCircle} />
        }
        return (
          <div key={key} className="rhap_main-controls">
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
      }
      case RHAP_UI.VOLUME_CONTROLS:
        return (
          <div key={key} className="rhap_volume-controls">
            {this.renderUIModules(customVolumeControls)}
          </div>
        )
      case RHAP_UI.LOOP: {
        const loop = this.audio.current ? this.audio.current.loop : loopProp

        let loopIcon: ReactNode
        if (loop) {
          loopIcon = customIcons.loop ? customIcons.loop : <Icon icon={repeat} />
        } else {
          loopIcon = customIcons.loopOff ? customIcons.loopOff : <Icon icon={repeatOff} />
        }
        return (
          <button
            key={key}
            aria-label={loop ? 'Enable Loop' : 'Disable Loop'}
            className="rhap_button-clear rhap_repeat-button"
            onClick={this.handleClickLoopButton}
          >
            {loopIcon}
          </button>
        )
      }
      case RHAP_UI.VOLUME: {
        const { volume = muted ? 0 : volumeProp } = this.audio.current || {}

        let volumeIcon: ReactNode
        if (volume) {
          volumeIcon = customIcons.volume ? customIcons.volume : <Icon icon={volumeHigh} />
        } else {
          volumeIcon = customIcons.volume ? customIcons.volumeMute : <Icon icon={volumeMute} />
        }
        return (
          <div key={key} className="rhap_volume-container">
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
      }
      default:
        if (!isValidElement(comp)) {
          return null
        }
        return comp.key ? comp : cloneElement(comp as ReactElement, { key })
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
      this.forceUpdate()
      this.props.onPlay && this.props.onPlay(e)
    })

    // When unloading the audio player (switching to another src)
    audio.addEventListener('abort', (e) => {
      const { autoPlayAfterSrcChange } = this.props
      if (autoPlayAfterSrcChange) {
        audio.play()
      } else {
        this.forceUpdate()
      }
      this.props.onAbort && this.props.onAbort(e)
    })

    // When the file has finished playing to the end
    audio.addEventListener('ended', (e) => {
      this.props.onEnded && this.props.onEnded(e)
    })

    // When the user pauses playback
    audio.addEventListener('pause', (e) => {
      if (!this.audio) return
      this.forceUpdate()
      this.props.onPause && this.props.onPause(e)
    })

    audio.addEventListener(
      'timeupdate',
      throttle((e) => {
        this.props.onListen && this.props.onListen(e)
      }, this.props.listenInterval)
    )
  }

  render(): ReactNode {
    const {
      className,
      src,
      loop: loopProp,
      preload,
      autoPlay,
      crossOrigin,
      mediaGroup,
      header,
      footer,
      layout,
      customProgressBarSection,
      customControlsSection,
      children,
      style,
    } = this.props
    const loop = this.audio.current ? this.audio.current.loop : loopProp

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
          loop={loop}
          autoPlay={autoPlay}
          preload={preload}
          crossOrigin={crossOrigin}
          mediaGroup={mediaGroup}
          ref={this.audio}
        >
          {children}
        </audio>
        {header && <div className="rhap_header">{header}</div>}
        <div className={`rhap_main ${getMainLayoutClassName(layout)}`}>
          <div className="rhap_progress-section">{this.renderUIModules(customProgressBarSection)}</div>
          <div className="rhap_controls-section">{this.renderUIModules(customControlsSection)}</div>
        </div>
        {footer && <div className="rhap_footer">{footer}</div>}
      </div>
    )
  }
}

export default H5AudioPlayer
export { RHAP_UI }
