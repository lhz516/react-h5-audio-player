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
import ProgressBar from './ProgressBar'
import CurrentTime from './CurrentTime'
import Duration from './Duration'
import VolumeBar from './VolumeBar'
import { RHAP_UI, MAIN_LAYOUT, AUDIO_PRELOAD_ATTRIBUTE, TIME_FORMAT } from './constants'
import { throttle, getMainLayoutClassName, getDisplayTimeBySeconds } from './utils'

type CustomUIModule = RHAP_UI | ReactElement
type CustomUIModules = Array<CustomUIModule>
type OnSeek = (audio: HTMLAudioElement, time: number) => Promise<void>

interface MSEPropsObject {
  onSeek: OnSeek
  onEcrypted?: (e: unknown) => void
  srcDuration: number
}

interface PlayerProps {
  /**
   * HTML5 Audio tag autoPlay property
   */
  autoPlay?: boolean
  /**
   * Whether to play audio after src prop is changed
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
  progressJumpSteps?: {
    backward?: number
    forward?: number
  }
  volumeJumpStep?: number
  loop?: boolean
  muted?: boolean
  crossOrigin?: React.AudioHTMLAttributes<HTMLAudioElement>['crossOrigin']
  mediaGroup?: string
  hasDefaultKeyBindings?: boolean
  onAbort?: (e: Event) => void
  onCanPlay?: (e: Event) => void
  onCanPlayThrough?: (e: Event) => void
  onEnded?: (e: Event) => void
  onPlaying?: (e: Event) => void
  onSeeking?: (e: Event) => void
  onSeeked?: (e: Event) => void
  onStalled?: (e: Event) => void
  onSuspend?: (e: Event) => void
  onLoadStart?: (e: Event) => void
  onLoadedMetaData?: (e: Event) => void
  onLoadedData?: (e: Event) => void
  onWaiting?: (e: Event) => void
  onEmptied?: (e: Event) => void
  onError?: (e: Event) => void
  onListen?: (e: Event) => void
  onVolumeChange?: (e: Event) => void
  onPause?: (e: Event) => void
  onPlay?: (e: Event) => void
  onClickPrevious?: (e: React.SyntheticEvent) => void
  onClickNext?: (e: React.SyntheticEvent) => void
  onPlayError?: (err: Error) => void
  onChangeCurrentTimeError?: (err: Error) => void
  mse?: MSEPropsObject
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
  showFilledVolume?: boolean
  timeFormat?: TIME_FORMAT
  header?: ReactNode
  footer?: ReactNode
  customIcons?: CustomIcons
  layout?: MAIN_LAYOUT
  customProgressBarSection?: CustomUIModules
  customControlsSection?: CustomUIModules
  customAdditionalControls?: CustomUIModules
  customVolumeControls?: CustomUIModules
  i18nAriaLabels?: I18nAriaLabels
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

interface I18nAriaLabels {
  player?: string
  progressControl?: string
  volumeControl?: string
  play?: string
  pause?: string
  rewind?: string
  forward?: string
  previous?: string
  next?: string
  loop?: string
  loopOff?: string
  volume?: string
  volumeMute?: string
}

class H5AudioPlayer extends Component<PlayerProps> {
  static defaultI18nAriaLabels: I18nAriaLabels = {
    player: 'Audio player',
    progressControl: 'Audio progress control',
    volumeControl: 'Volume control',
    play: 'Play',
    pause: 'Pause',
    rewind: 'Rewind',
    forward: 'Forward',
    previous: 'Previous',
    next: 'Skip',
    loop: 'Disable loop',
    loopOff: 'Enable loop',
    volume: 'Mute',
    volumeMute: 'Unmute',
  }

  static defaultProps: Partial<PlayerProps> = {
    progressJumpSteps: {
      backward: 5_000,
      forward: 5_000,
    },
    progressJumpStep: 5_000,
  }

  audio = createRef<HTMLAudioElement>()

  progressBar = createRef<HTMLDivElement>()

  container = createRef<HTMLDivElement>()

  lastVolume: number = this.props.volume ?? 1 // To store the volume before clicking mute button

  listenTracker?: number // Determine whether onListen event should be called continuously

  volumeAnimationTimer?: number

  downloadProgressAnimationTimer?: number

  togglePlay = (e: React.SyntheticEvent): void => {
    e.stopPropagation()
    const audio = this.audio.current
    if ((audio.paused || audio.ended) && audio.src) {
      this.playAudioPromise()
    } else if (!audio.paused) {
      audio.pause()
    }
  }

  /**
   * Safely play audio
   *
   * Reference: https://developers.google.com/web/updates/2017/06/play-request-was-interrupted
   */
  playAudioPromise = (): void => {
    if (this.audio.current.error) {
      this.audio.current.load()
    }
    const playPromise = this.audio.current.play()
    // playPromise is null in IE 11
    if (playPromise) {
      playPromise.then(null).catch((err: unknown) => {
        const { onPlayError } = this.props
        const message = err instanceof Error ? err.message : String(err)
        onPlayError && onPlayError(new Error(message))
      })
    } else {
      // Remove forceUpdate when stop supporting IE 11
      this.forceUpdate()
    }
  }

  isPlaying = (): boolean => {
    const audio = this.audio.current
    if (!audio) return false

    return !audio.paused && !audio.ended
  }

  handlePlay = (e: Event): void => {
    this.forceUpdate()
    this.props.onPlay && this.props.onPlay(e)
  }

  handlePause = (e: Event): void => {
    if (!this.audio) return
    this.forceUpdate()
    this.props.onPause && this.props.onPause(e)
  }

  handleEnded = (e: Event): void => {
    if (!this.audio) return
    // Remove forceUpdate when stop supporting IE 11
    this.forceUpdate()
    this.props.onEnded && this.props.onEnded(e)
  }

  handleAbort = (e: Event): void => {
    this.props.onAbort && this.props.onAbort(e)
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
    const { progressJumpSteps, progressJumpStep } = this.props
    const jumpStep = progressJumpSteps.backward || progressJumpStep
    this.setJumpTime(-jumpStep)
  }

  handleClickForward = (): void => {
    const { progressJumpSteps, progressJumpStep } = this.props
    const jumpStep = progressJumpSteps.forward || progressJumpStep
    this.setJumpTime(jumpStep)
  }

  setJumpTime = (time: number): void => {
    const audio = this.audio.current
    const { duration, currentTime: prevTime } = audio
    if (
      audio.readyState === audio.HAVE_NOTHING ||
      audio.readyState === audio.HAVE_METADATA ||
      !isFinite(duration) ||
      !isFinite(prevTime)
    ) {
      try {
        audio.load()
      } catch (err) {
        return this.props.onChangeCurrentTimeError && this.props.onChangeCurrentTimeError(err as Error)
      }
    }
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
    if (this.props.hasDefaultKeyBindings ?? true) {
      switch (e.key) {
        case ' ':
          if (e.target === this.container.current || e.target === this.progressBar.current) {
            e.preventDefault() // Prevent scrolling page by pressing Space key
            this.togglePlay(e)
          }
          break
        case 'ArrowLeft':
          this.handleClickRewind()
          break
        case 'ArrowRight':
          this.handleClickForward()
          break
        case 'ArrowUp':
          e.preventDefault() // Prevent scrolling page by pressing arrow key
          this.setJumpVolume(this.props.volumeJumpStep)
          break
        case 'ArrowDown':
          e.preventDefault() // Prevent scrolling page by pressing arrow key
          this.setJumpVolume(-this.props.volumeJumpStep)
          break
        case 'l':
          this.handleClickLoopButton()
          break
        case 'm':
          this.handleClickVolumeButton()
          break
      }
    }
  }

  renderUIModules = (modules: CustomUIModules): Array<ReactElement> => {
    return modules.map((comp, i) => this.renderUIModule(comp, i))
  }

  renderUIModule = (comp: CustomUIModule, key: Key): ReactElement => {
    const {
      defaultCurrentTime = '--:--',
      progressUpdateInterval = 20,
      showDownloadProgress = true,
      showFilledProgress = true,
      showFilledVolume = false,
      defaultDuration = '--:--',
      customIcons = {},
      showSkipControls = false,
      onClickPrevious,
      onClickNext,
      onChangeCurrentTimeError,
      showJumpControls = true,
      customAdditionalControls = [RHAP_UI.LOOP],
      customVolumeControls = [RHAP_UI.VOLUME],
      muted = false,
      timeFormat = 'auto',
      volume: volumeProp = 1,
      loop: loopProp = false,
      mse,
      i18nAriaLabels = H5AudioPlayer.defaultI18nAriaLabels,
    } = this.props

    switch (comp) {
      case RHAP_UI.CURRENT_TIME:
        return (
          <div key={key} id="rhap_current-time" className="rhap_time rhap_current-time">
            <CurrentTime
              audio={this.audio.current}
              isLeftTime={false}
              defaultCurrentTime={defaultCurrentTime}
              timeFormat={timeFormat}
            />
          </div>
        )
      case RHAP_UI.CURRENT_LEFT_TIME:
        return (
          <div key={key} id="rhap_current-left-time" className="rhap_time rhap_current-left-time">
            <CurrentTime
              audio={this.audio.current}
              isLeftTime={true}
              defaultCurrentTime={defaultCurrentTime}
              timeFormat={timeFormat}
            />
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
            onSeek={mse && mse.onSeek}
            onChangeCurrentTimeError={onChangeCurrentTimeError}
            srcDuration={mse && mse.srcDuration}
            i18nProgressBar={i18nAriaLabels.progressControl}
          />
        )
      case RHAP_UI.DURATION:
        return (
          <div key={key} className="rhap_time rhap_total-time">
            {mse && mse.srcDuration ? (
              getDisplayTimeBySeconds(mse.srcDuration, mse.srcDuration, this.props.timeFormat)
            ) : (
              <Duration audio={this.audio.current} defaultDuration={defaultDuration} timeFormat={timeFormat} />
            )}
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
          actionIcon = customIcons.pause ? customIcons.pause : <Icon icon="mdi:pause-circle" />
        } else {
          actionIcon = customIcons.play ? customIcons.play : <Icon icon="mdi:play-circle" />
        }
        return (
          <div key={key} className="rhap_main-controls">
            {showSkipControls && (
              <button
                aria-label={i18nAriaLabels.previous}
                className="rhap_button-clear rhap_main-controls-button rhap_skip-button"
                type="button"
                onClick={onClickPrevious}
              >
                {customIcons.previous ? customIcons.previous : <Icon icon="mdi:skip-previous" />}
              </button>
            )}
            {showJumpControls && (
              <button
                aria-label={i18nAriaLabels.rewind}
                className="rhap_button-clear rhap_main-controls-button rhap_rewind-button"
                type="button"
                onClick={this.handleClickRewind}
              >
                {customIcons.rewind ? customIcons.rewind : <Icon icon="mdi:rewind" />}
              </button>
            )}
            <button
              aria-label={isPlaying ? i18nAriaLabels.pause : i18nAriaLabels.play}
              className="rhap_button-clear rhap_main-controls-button rhap_play-pause-button"
              type="button"
              onClick={this.togglePlay}
            >
              {actionIcon}
            </button>
            {showJumpControls && (
              <button
                aria-label={i18nAriaLabels.forward}
                className="rhap_button-clear rhap_main-controls-button rhap_forward-button"
                type="button"
                onClick={this.handleClickForward}
              >
                {customIcons.forward ? customIcons.forward : <Icon icon="mdi:fast-forward" />}
              </button>
            )}
            {showSkipControls && (
              <button
                aria-label={i18nAriaLabels.next}
                className="rhap_button-clear rhap_main-controls-button rhap_skip-button"
                type="button"
                onClick={onClickNext}
              >
                {customIcons.next ? customIcons.next : <Icon icon="mdi:skip-next" />}
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
          loopIcon = customIcons.loop ? customIcons.loop : <Icon icon="mdi:repeat" />
        } else {
          loopIcon = customIcons.loopOff ? customIcons.loopOff : <Icon icon="mdi:repeat-off" />
        }
        return (
          <button
            key={key}
            aria-label={loop ? i18nAriaLabels.loop : i18nAriaLabels.loopOff}
            className="rhap_button-clear rhap_repeat-button"
            type="button"
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
          volumeIcon = customIcons.volume ? customIcons.volume : <Icon icon="mdi:volume-high" />
        } else {
          volumeIcon = customIcons.volume ? customIcons.volumeMute : <Icon icon="mdi:volume-mute" />
        }
        return (
          <div key={key} className="rhap_volume-container">
            <button
              aria-label={volume ? i18nAriaLabels.volume : i18nAriaLabels.volumeMute}
              onClick={this.handleClickVolumeButton}
              type="button"
              className="rhap_button-clear rhap_volume-button"
            >
              {volumeIcon}
            </button>
            <VolumeBar
              audio={this.audio.current}
              volume={volume}
              onMuteChange={this.handleMuteChange}
              showFilledVolume={showFilledVolume}
              i18nVolumeControl={i18nAriaLabels.volumeControl}
            />
          </div>
        )
      }
      default:
        if (!isValidElement(comp)) {
          return null
        }
        return comp.key ? comp : cloneElement(comp, { key })
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
      const target = e.target as HTMLAudioElement
      // Calls onEnded when currentTime is the same as duration even if there is an error
      if (target.error && target.currentTime === target.duration) {
        return this.props.onEnded && this.props.onEnded(e)
      }
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
    audio.addEventListener('play', this.handlePlay)

    // When unloading the audio player (switching to another src)
    audio.addEventListener('abort', this.handleAbort)

    // When the file has finished playing to the end
    audio.addEventListener('ended', this.handleEnded)

    // When the media has enough data to start playing, after the play event, but also when recovering from being
    // stalled, when looping media restarts, and after seeked, if it was playing before seeking.
    audio.addEventListener('playing', (e) => {
      this.props.onPlaying && this.props.onPlaying(e)
    })

    // When a seek operation begins
    audio.addEventListener('seeking', (e) => {
      this.props.onSeeking && this.props.onSeeking(e)
    })

    // when a seek operation completes
    audio.addEventListener('seeked', (e) => {
      this.props.onSeeked && this.props.onSeeked(e)
    })

    // when the requested operation (such as playback) is delayed pending the completion of another operation (such as
    // a seek).
    audio.addEventListener('waiting', (e) => {
      this.props.onWaiting && this.props.onWaiting(e)
    })

    // The media has become empty; for example, this event is sent if the media has already been loaded (or partially
    // loaded), and the load() method is called to reload it.
    audio.addEventListener('emptied', (e) => {
      this.props.onEmptied && this.props.onEmptied(e)
    })

    // when the user agent is trying to fetch media data, but data is unexpectedly not forthcoming
    audio.addEventListener('stalled', (e) => {
      this.props.onStalled && this.props.onStalled(e)
    })

    // when loading of the media is suspended; this may happen either because the download has completed or because it
    // has been paused for any other reason
    audio.addEventListener('suspend', (e) => {
      this.props.onSuspend && this.props.onSuspend(e)
    })

    //  when loading of the media begins
    audio.addEventListener('loadstart', (e) => {
      this.props.onLoadStart && this.props.onLoadStart(e)
    })

    // when media's metadata has finished loading; all attributes now contain as much useful information as they're
    // going to
    audio.addEventListener('loadedmetadata', (e) => {
      this.props.onLoadedMetaData && this.props.onLoadedMetaData(e)
    })

    // when the first frame of the media has finished loading.
    audio.addEventListener('loadeddata', (e) => {
      this.props.onLoadedData && this.props.onLoadedData(e)
    })

    // When the user pauses playback
    audio.addEventListener('pause', this.handlePause)

    audio.addEventListener(
      'timeupdate',
      throttle((e) => {
        this.props.onListen && this.props.onListen(e)
      }, this.props.listenInterval)
    )

    audio.addEventListener('volumechange', (e) => {
      this.props.onVolumeChange && this.props.onVolumeChange(e)
    })

    audio.addEventListener('encrypted', (e) => {
      const { mse } = this.props
      mse && mse.onEcrypted && mse.onEcrypted(e)
    })
  }

  componentDidUpdate(prevProps: PlayerProps): void {
    const { src, autoPlayAfterSrcChange } = this.props
    if (prevProps.src !== src) {
      if (autoPlayAfterSrcChange) {
        this.playAudioPromise()
      } else {
        // Updating pause icon to play icon
        this.forceUpdate()
      }
    }
  }

  render(): ReactNode {
    const {
      className = '',
      src,
      loop: loopProp = false,
      preload = 'auto',
      autoPlay = false,
      crossOrigin,
      mediaGroup,
      header,
      footer,
      layout = 'stacked',
      customProgressBarSection = [RHAP_UI.CURRENT_TIME, RHAP_UI.PROGRESS_BAR, RHAP_UI.DURATION],
      customControlsSection = [RHAP_UI.ADDITIONAL_CONTROLS, RHAP_UI.MAIN_CONTROLS, RHAP_UI.VOLUME_CONTROLS],
      children,
      style,
      i18nAriaLabels = H5AudioPlayer.defaultI18nAriaLabels,
    } = this.props
    const loop = this.audio.current ? this.audio.current.loop : loopProp
    const loopClass = loop ? 'rhap_loop--on' : 'rhap_loop--off'
    const isPlayingClass = this.isPlaying() ? 'rhap_play-status--playing' : 'rhap_play-status--paused'

    return (
      /* We want the container to catch bubbled events */
      /* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */
      <div
        role="group"
        /* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */
        tabIndex={0}
        aria-label={i18nAriaLabels.player}
        className={`rhap_container ${loopClass} ${isPlayingClass} ${className}`}
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
export { RHAP_UI, OnSeek }
