import React, {
  cloneElement,
  isValidElement,
  useRef,
  useEffect,
  useCallback,
  useState,
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
import {
  throttle,
  getMainLayoutClassName,
  getDisplayTimeBySeconds,
  calculateJumpTime,
  calculateJumpVolume,
  getPlayerStateClassName,
  isAudioReadyForTimeManipulation,
  getVolumeIconName,
} from './utils'

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

const defaultI18nAriaLabels: I18nAriaLabels = {
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

const defaultProps: Partial<PlayerProps> = {
  progressJumpSteps: {
    backward: 5_000,
    forward: 5_000,
  },
  progressJumpStep: 5_000,
}

const H5AudioPlayer: React.FC<PlayerProps> = (props) => {
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
    i18nAriaLabels = defaultI18nAriaLabels,
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
    mse,
    autoPlayAfterSrcChange,
    hasDefaultKeyBindings = true,
    progressJumpSteps = defaultProps.progressJumpSteps,
    progressJumpStep = defaultProps.progressJumpStep,
    volumeJumpStep,
    listenInterval = 1000, // Default to 1000ms
    onAbort,
    onCanPlay,
    onCanPlayThrough,
    onEnded,
    onPlaying,
    onSeeking,
    onSeeked,
    onStalled,
    onSuspend,
    onLoadStart,
    onLoadedMetaData,
    onLoadedData,
    onWaiting,
    onEmptied,
    onError,
    onListen,
    onVolumeChange,
    onPause,
    onPlay,
    onPlayError,
  } = props

  const audio = useRef<HTMLAudioElement>(null)
  const progressBar = useRef<HTMLDivElement>(null)
  const container = useRef<HTMLDivElement>(null)

  const lastVolume = useRef<number>(volumeProp ?? 1)
  const [, forceUpdate] = useState({})

  const playAudioPromise = useCallback((): void => {
    if (audio.current?.error) {
      audio.current.load()
    }
    const playPromise = audio.current?.play()
    if (playPromise) {
      playPromise.then(null).catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err)
        onPlayError && onPlayError(new Error(message))
      })
    }
  }, [onPlayError])

  const togglePlay = useCallback(
    (e: React.SyntheticEvent): void => {
      e.stopPropagation()
      const audioEl = audio.current
      if (audioEl && (audioEl.paused || audioEl.ended) && audioEl.src) {
        playAudioPromise()
      } else if (audioEl && !audioEl.paused) {
        audioEl.pause()
      }
    },
    [playAudioPromise]
  )

  const isPlaying = useCallback((): boolean => {
    const audioEl = audio.current
    if (!audioEl) return false
    return !audioEl.paused && !audioEl.ended
  }, [])

  const handlePlay = useCallback(
    (e: Event): void => {
      forceUpdate({})
      onPlay && onPlay(e)
    },
    [onPlay]
  )

  const handlePause = useCallback(
    (e: Event): void => {
      if (!audio.current) return
      forceUpdate({})
      onPause && onPause(e)
    },
    [onPause]
  )

  const handleEnded = useCallback(
    (e: Event): void => {
      if (!audio.current) return
      forceUpdate({})
      onEnded && onEnded(e)
    },
    [onEnded]
  )

  const handleAbort = useCallback(
    (e: Event): void => {
      onAbort && onAbort(e)
    },
    [onAbort]
  )

  const handleClickVolumeButton = useCallback((): void => {
    const audioEl = audio.current
    if (audioEl) {
      if (audioEl.volume > 0) {
        lastVolume.current = audioEl.volume
        audioEl.volume = 0
      } else {
        audioEl.volume = lastVolume.current
      }
    }
  }, [])

  const handleMuteChange = useCallback((): void => {
    // Force re-render equivalent - React will re-render when state changes
  }, [])

  const handleClickLoopButton = useCallback((): void => {
    if (audio.current) {
      audio.current.loop = !audio.current.loop
    }
  }, [])

  const setJumpTime = useCallback(
    (time: number): void => {
      const audioEl = audio.current
      if (!audioEl) return

      const { duration, currentTime: prevTime } = audioEl
      if (!isAudioReadyForTimeManipulation(audioEl.readyState) || !isFinite(duration) || !isFinite(prevTime)) {
        try {
          audioEl.load()
        } catch (err) {
          return onChangeCurrentTimeError && onChangeCurrentTimeError(err as Error)
        }
      }
      const newTime = calculateJumpTime(prevTime, duration, time)
      audioEl.currentTime = newTime
    },
    [onChangeCurrentTimeError]
  )

  const handleClickRewind = useCallback((): void => {
    const jumpStep = progressJumpSteps!.backward || progressJumpStep!
    setJumpTime(-jumpStep)
  }, [progressJumpSteps, progressJumpStep, setJumpTime])

  const handleClickForward = useCallback((): void => {
    const jumpStep = progressJumpSteps!.forward || progressJumpStep!
    setJumpTime(jumpStep)
  }, [progressJumpSteps, progressJumpStep, setJumpTime])

  const setJumpVolume = useCallback((volume: number): void => {
    if (audio.current) {
      const newVolume = calculateJumpVolume(audio.current.volume, volume)
      audio.current.volume = newVolume
    }
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent): void => {
      if (hasDefaultKeyBindings) {
        switch (e.key) {
          case ' ':
            if (e.target === container.current || e.target === progressBar.current) {
              e.preventDefault() // Prevent scrolling page by pressing Space key
              togglePlay(e)
            }
            break
          case 'ArrowLeft':
            handleClickRewind()
            break
          case 'ArrowRight':
            handleClickForward()
            break
          case 'ArrowUp':
            e.preventDefault() // Prevent scrolling page by pressing arrow key
            setJumpVolume(volumeJumpStep!)
            break
          case 'ArrowDown':
            e.preventDefault() // Prevent scrolling page by pressing arrow key
            setJumpVolume(-volumeJumpStep!)
            break
          case 'l':
            handleClickLoopButton()
            break
          case 'm':
            handleClickVolumeButton()
            break
        }
      }
    },
    [
      hasDefaultKeyBindings,
      togglePlay,
      handleClickRewind,
      handleClickForward,
      setJumpVolume,
      volumeJumpStep,
      handleClickLoopButton,
      handleClickVolumeButton,
    ]
  )

  const renderUIModule = useCallback(
    (comp: CustomUIModule, key: Key): ReactElement => {
      switch (comp) {
        case RHAP_UI.CURRENT_TIME:
          return (
            <div key={key} id="rhap_current-time" className="rhap_time rhap_current-time">
              <CurrentTime
                audio={audio.current}
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
                audio={audio.current}
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
              ref={progressBar}
              audio={audio.current}
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
                getDisplayTimeBySeconds(mse.srcDuration, mse.srcDuration, timeFormat)
              ) : (
                <Duration audio={audio.current} defaultDuration={defaultDuration} timeFormat={timeFormat} />
              )}
            </div>
          )
        case RHAP_UI.ADDITIONAL_CONTROLS:
          return (
            <div key={key} className="rhap_additional-controls">
              {renderUIModules(customAdditionalControls)}
            </div>
          )
        case RHAP_UI.MAIN_CONTROLS: {
          const isPlayingState = isPlaying()
          let actionIcon: ReactNode
          if (isPlayingState) {
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
                  onClick={handleClickRewind}
                >
                  {customIcons.rewind ? customIcons.rewind : <Icon icon="mdi:rewind" />}
                </button>
              )}
              <button
                aria-label={isPlayingState ? i18nAriaLabels.pause : i18nAriaLabels.play}
                className="rhap_button-clear rhap_main-controls-button rhap_play-pause-button"
                type="button"
                onClick={togglePlay}
              >
                {actionIcon}
              </button>
              {showJumpControls && (
                <button
                  aria-label={i18nAriaLabels.forward}
                  className="rhap_button-clear rhap_main-controls-button rhap_forward-button"
                  type="button"
                  onClick={handleClickForward}
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
              {renderUIModules(customVolumeControls)}
            </div>
          )
        case RHAP_UI.LOOP: {
          const loop = audio.current ? audio.current.loop : loopProp

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
              onClick={handleClickLoopButton}
            >
              {loopIcon}
            </button>
          )
        }
        case RHAP_UI.VOLUME: {
          const { volume = muted ? 0 : volumeProp } = audio.current || {}

          let volumeIcon: ReactNode
          if (volume > 0) {
            volumeIcon = customIcons.volume ? customIcons.volume : <Icon icon={getVolumeIconName(volume)} />
          } else {
            volumeIcon = customIcons.volumeMute ? customIcons.volumeMute : <Icon icon="mdi:volume-mute" />
          }
          return (
            <div key={key} className="rhap_volume-container">
              <button
                aria-label={volume ? i18nAriaLabels.volume : i18nAriaLabels.volumeMute}
                onClick={handleClickVolumeButton}
                type="button"
                className="rhap_button-clear rhap_volume-button"
              >
                {volumeIcon}
              </button>
              <VolumeBar
                audio={audio.current}
                volume={volume}
                onMuteChange={handleMuteChange}
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
    },
    [
      defaultCurrentTime,
      timeFormat,
      progressUpdateInterval,
      showDownloadProgress,
      showFilledProgress,
      mse,
      onChangeCurrentTimeError,
      i18nAriaLabels,
      defaultDuration,
      customAdditionalControls,
      isPlaying,
      customIcons,
      showSkipControls,
      onClickPrevious,
      onClickNext,
      showJumpControls,
      handleClickRewind,
      handleClickForward,
      togglePlay,
      customVolumeControls,
      loopProp,
      handleClickLoopButton,
      muted,
      volumeProp,
      handleClickVolumeButton,
      handleMuteChange,
      showFilledVolume,
    ]
  )

  const renderUIModules = useCallback(
    (modules: CustomUIModules): Array<ReactElement> => {
      return modules.map((comp, i) => renderUIModule(comp, i))
    },
    [renderUIModule]
  )

  // Set up audio element volume on mount and when muted/volume props change
  useEffect(() => {
    if (audio.current) {
      if (muted) {
        audio.current.volume = 0
      } else {
        audio.current.volume = lastVolume.current
      }
      // Force update when audio element is available
      forceUpdate({})
    }
  }, [muted])

  // Handle src changes
  useEffect(() => {
    if (autoPlayAfterSrcChange && src) {
      playAudioPromise()
    }
  }, [src, autoPlayAfterSrcChange, playAudioPromise])

  // Set up event listeners
  useEffect(() => {
    const audioEl = audio.current
    if (!audioEl) return

    const handleError = (e: Event) => {
      const target = e.target as HTMLAudioElement
      // Calls onEnded when currentTime is the same as duration even if there is an error
      if (target.error && target.currentTime === target.duration) {
        return onEnded && onEnded(e)
      }
      onError && onError(e)
    }

    const handleCanPlay = (e: Event) => {
      onCanPlay && onCanPlay(e)
    }

    const handleCanPlayThrough = (e: Event) => {
      onCanPlayThrough && onCanPlayThrough(e)
    }

    const handlePlaying = (e: Event) => {
      onPlaying && onPlaying(e)
    }

    const handleSeeking = (e: Event) => {
      onSeeking && onSeeking(e)
    }

    const handleSeeked = (e: Event) => {
      onSeeked && onSeeked(e)
    }

    const handleWaiting = (e: Event) => {
      onWaiting && onWaiting(e)
    }

    const handleEmptied = (e: Event) => {
      onEmptied && onEmptied(e)
    }

    const handleStalled = (e: Event) => {
      onStalled && onStalled(e)
    }

    const handleSuspend = (e: Event) => {
      onSuspend && onSuspend(e)
    }

    const handleLoadStart = (e: Event) => {
      onLoadStart && onLoadStart(e)
    }

    const handleLoadedMetaData = (e: Event) => {
      forceUpdate({})
      onLoadedMetaData && onLoadedMetaData(e)
    }

    const handleLoadedData = (e: Event) => {
      forceUpdate({})
      onLoadedData && onLoadedData(e)
    }

    const handleTimeUpdate = throttle((e: Event) => {
      forceUpdate({})
      onListen && onListen(e)
    }, listenInterval)

    const handleVolumeChange = (e: Event) => {
      onVolumeChange && onVolumeChange(e)
    }

    const handleEncrypted = (e: Event) => {
      mse && mse.onEcrypted && mse.onEcrypted(e)
    }

    audioEl.addEventListener('error', handleError)
    audioEl.addEventListener('canplay', handleCanPlay)
    audioEl.addEventListener('canplaythrough', handleCanPlayThrough)
    audioEl.addEventListener('play', handlePlay)
    audioEl.addEventListener('abort', handleAbort)
    audioEl.addEventListener('ended', handleEnded)
    audioEl.addEventListener('playing', handlePlaying)
    audioEl.addEventListener('seeking', handleSeeking)
    audioEl.addEventListener('seeked', handleSeeked)
    audioEl.addEventListener('waiting', handleWaiting)
    audioEl.addEventListener('emptied', handleEmptied)
    audioEl.addEventListener('stalled', handleStalled)
    audioEl.addEventListener('suspend', handleSuspend)
    audioEl.addEventListener('loadstart', handleLoadStart)
    audioEl.addEventListener('loadedmetadata', handleLoadedMetaData)
    audioEl.addEventListener('loadeddata', handleLoadedData)
    audioEl.addEventListener('pause', handlePause)
    audioEl.addEventListener('timeupdate', handleTimeUpdate)
    audioEl.addEventListener('volumechange', handleVolumeChange)
    audioEl.addEventListener('encrypted', handleEncrypted)

    return () => {
      audioEl.removeEventListener('error', handleError)
      audioEl.removeEventListener('canplay', handleCanPlay)
      audioEl.removeEventListener('canplaythrough', handleCanPlayThrough)
      audioEl.removeEventListener('play', handlePlay)
      audioEl.removeEventListener('abort', handleAbort)
      audioEl.removeEventListener('ended', handleEnded)
      audioEl.removeEventListener('playing', handlePlaying)
      audioEl.removeEventListener('seeking', handleSeeking)
      audioEl.removeEventListener('seeked', handleSeeked)
      audioEl.removeEventListener('waiting', handleWaiting)
      audioEl.removeEventListener('emptied', handleEmptied)
      audioEl.removeEventListener('stalled', handleStalled)
      audioEl.removeEventListener('suspend', handleSuspend)
      audioEl.removeEventListener('loadstart', handleLoadStart)
      audioEl.removeEventListener('loadedmetadata', handleLoadedMetaData)
      audioEl.removeEventListener('loadeddata', handleLoadedData)
      audioEl.removeEventListener('pause', handlePause)
      audioEl.removeEventListener('timeupdate', handleTimeUpdate)
      audioEl.removeEventListener('volumechange', handleVolumeChange)
      audioEl.removeEventListener('encrypted', handleEncrypted)
    }
  }, [
    onError,
    onEnded,
    onCanPlay,
    onCanPlayThrough,
    handlePlay,
    handleAbort,
    handleEnded,
    onPlaying,
    onSeeking,
    onSeeked,
    onWaiting,
    onEmptied,
    onStalled,
    onSuspend,
    onLoadStart,
    onLoadedMetaData,
    onLoadedData,
    handlePause,
    onListen,
    listenInterval,
    onVolumeChange,
    mse,
  ])

  const loop = audio.current ? audio.current.loop : loopProp
  const playerClassName = getPlayerStateClassName(loop, isPlaying(), className)

  return (
    /* We want the container to catch bubbled events */
    /* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */
    <div
      role="group"
      /* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */
      tabIndex={0}
      aria-label={i18nAriaLabels.player}
      className={playerClassName}
      onKeyDown={handleKeyDown}
      ref={container}
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
        ref={audio}
      >
        {children}
      </audio>
      {header && <div className="rhap_header">{header}</div>}
      <div className={`rhap_main ${getMainLayoutClassName(layout)}`}>
        <div className="rhap_progress-section">{renderUIModules(customProgressBarSection)}</div>
        <div className="rhap_controls-section">{renderUIModules(customControlsSection)}</div>
      </div>
      {footer && <div className="rhap_footer">{footer}</div>}
    </div>
  )
}

interface H5AudioPlayerComponent extends React.FC<PlayerProps> {
  defaultProps: Partial<PlayerProps>
  defaultI18nAriaLabels: I18nAriaLabels
}

// Add static properties for backward compatibility with tests
const H5AudioPlayerWithStatics = H5AudioPlayer as H5AudioPlayerComponent
H5AudioPlayerWithStatics.defaultProps = defaultProps
H5AudioPlayerWithStatics.defaultI18nAriaLabels = defaultI18nAriaLabels

export default H5AudioPlayerWithStatics
export { RHAP_UI, OnSeek }
