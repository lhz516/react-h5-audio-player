import React, {
  cloneElement,
  isValidElement,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  useState,
  ReactNode,
  CSSProperties,
  ReactElement,
  Key,
} from 'react'
import Icon, { IconName } from './icons'
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

const DEFAULT_I18N_ARIA_LABELS: I18nAriaLabels = {
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

const DEFAULT_PROGRESS_JUMP_STEPS = {
  backward: 5_000,
  forward: 5_000,
}
const DEFAULT_VOLUME_JUMP_STEP = 0.1
const DEFAULT_CUSTOM_ICONS: CustomIcons = {}
const DEFAULT_PROGRESS_BAR_SECTION: CustomUIModules = [RHAP_UI.CURRENT_TIME, RHAP_UI.PROGRESS_BAR, RHAP_UI.DURATION]
const DEFAULT_CONTROLS_SECTION: CustomUIModules = [
  RHAP_UI.ADDITIONAL_CONTROLS,
  RHAP_UI.MAIN_CONTROLS,
  RHAP_UI.VOLUME_CONTROLS,
]
const DEFAULT_ADDITIONAL_CONTROLS: CustomUIModules = [RHAP_UI.LOOP]
const DEFAULT_VOLUME_CONTROLS: CustomUIModules = [RHAP_UI.VOLUME]

const DEFAULT_ICON_NAMES: Record<keyof CustomIcons, IconName> = {
  play: 'play-circle',
  pause: 'pause-circle',
  rewind: 'rewind',
  forward: 'fast-forward',
  previous: 'skip-previous',
  next: 'skip-next',
  loop: 'repeat',
  loopOff: 'repeat-off',
  volume: 'volume-high',
  volumeMute: 'volume-mute',
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
    customProgressBarSection = DEFAULT_PROGRESS_BAR_SECTION,
    customControlsSection = DEFAULT_CONTROLS_SECTION,
    children,
    style,
    i18nAriaLabels: i18nAriaLabelsProp,
    defaultCurrentTime = '--:--',
    progressUpdateInterval = 20,
    showDownloadProgress = true,
    showFilledProgress = true,
    showFilledVolume = false,
    defaultDuration = '--:--',
    customIcons = DEFAULT_CUSTOM_ICONS,
    showSkipControls = false,
    onClickPrevious,
    onClickNext,
    onChangeCurrentTimeError,
    showJumpControls = true,
    customAdditionalControls = DEFAULT_ADDITIONAL_CONTROLS,
    customVolumeControls = DEFAULT_VOLUME_CONTROLS,
    muted = false,
    timeFormat = 'auto',
    volume: volumeProp = 1,
    mse,
    autoPlayAfterSrcChange,
    hasDefaultKeyBindings = true,
    progressJumpSteps: progressJumpStepsProp,
    volumeJumpStep = DEFAULT_VOLUME_JUMP_STEP,
    listenInterval = 1000, // Default to 1000ms
    onPlayError,
  } = props

  // Both props are partial overrides, so they are merged key by key rather than replaced.
  const i18nAriaLabels = useMemo(() => ({ ...DEFAULT_I18N_ARIA_LABELS, ...i18nAriaLabelsProp }), [i18nAriaLabelsProp])
  const progressJumpSteps = useMemo(
    () => ({
      backward: progressJumpStepsProp?.backward ?? DEFAULT_PROGRESS_JUMP_STEPS.backward,
      forward: progressJumpStepsProp?.forward ?? DEFAULT_PROGRESS_JUMP_STEPS.forward,
    }),
    [progressJumpStepsProp]
  )

  const audio = useRef<HTMLAudioElement>(null)
  const progressBar = useRef<HTMLDivElement>(null)
  const container = useRef<HTMLDivElement>(null)

  const lastVolume = useRef<number>(volumeProp ?? 1)
  const [, forceUpdate] = useState({})

  // Consumers routinely pass inline callbacks; reading them from a ref keeps the audio
  // listeners (and the listenInterval throttle) attached instead of being torn down and
  // recreated on every render.
  const latestProps = useRef(props)
  latestProps.current = props

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

  const handleClickVolumeButton = useCallback((): void => {
    const audioEl = audio.current
    if (audioEl) {
      if (audioEl.volume > 0) {
        lastVolume.current = audioEl.volume
        audioEl.volume = 0
      } else {
        audioEl.volume = lastVolume.current
      }
      forceUpdate({})
    }
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
    setJumpTime(-progressJumpSteps.backward)
  }, [progressJumpSteps, setJumpTime])

  const handleClickForward = useCallback((): void => {
    setJumpTime(progressJumpSteps.forward)
  }, [progressJumpSteps, setJumpTime])

  const setJumpVolume = useCallback((volume: number): void => {
    const el = audio.current
    const volumeStep = Number(volume)
    const currentVolume = el?.volume

    if (!el || !Number.isFinite(volumeStep) || !Number.isFinite(currentVolume)) {
      return
    }

    el.volume = calculateJumpVolume(currentVolume, volumeStep)
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
            setJumpVolume(volumeJumpStep)
            break
          case 'ArrowDown':
            e.preventDefault() // Prevent scrolling page by pressing arrow key
            setJumpVolume(-volumeJumpStep)
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

  const renderIcon = useCallback(
    (name: keyof CustomIcons): ReactNode => customIcons[name] || <Icon name={DEFAULT_ICON_NAMES[name]} />,
    [customIcons]
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
          return (
            <div key={key} className="rhap_main-controls">
              {showSkipControls && (
                <button
                  aria-label={i18nAriaLabels.previous}
                  className="rhap_button-clear rhap_main-controls-button rhap_skip-button"
                  type="button"
                  onClick={onClickPrevious}
                >
                  {renderIcon('previous')}
                </button>
              )}
              {showJumpControls && (
                <button
                  aria-label={i18nAriaLabels.rewind}
                  className="rhap_button-clear rhap_main-controls-button rhap_rewind-button"
                  type="button"
                  onClick={handleClickRewind}
                >
                  {renderIcon('rewind')}
                </button>
              )}
              <button
                aria-label={isPlayingState ? i18nAriaLabels.pause : i18nAriaLabels.play}
                className="rhap_button-clear rhap_main-controls-button rhap_play-pause-button"
                type="button"
                onClick={togglePlay}
              >
                {renderIcon(isPlayingState ? 'pause' : 'play')}
              </button>
              {showJumpControls && (
                <button
                  aria-label={i18nAriaLabels.forward}
                  className="rhap_button-clear rhap_main-controls-button rhap_forward-button"
                  type="button"
                  onClick={handleClickForward}
                >
                  {renderIcon('forward')}
                </button>
              )}
              {showSkipControls && (
                <button
                  aria-label={i18nAriaLabels.next}
                  className="rhap_button-clear rhap_main-controls-button rhap_skip-button"
                  type="button"
                  onClick={onClickNext}
                >
                  {renderIcon('next')}
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

          return (
            <button
              key={key}
              aria-label={loop ? i18nAriaLabels.loop : i18nAriaLabels.loopOff}
              className="rhap_button-clear rhap_repeat-button"
              type="button"
              onClick={handleClickLoopButton}
            >
              {renderIcon(loop ? 'loop' : 'loopOff')}
            </button>
          )
        }
        case RHAP_UI.VOLUME: {
          const { volume = muted ? 0 : volumeProp } = audio.current || {}

          return (
            <div key={key} className="rhap_volume-container">
              <button
                aria-label={volume ? i18nAriaLabels.volume : i18nAriaLabels.volumeMute}
                onClick={handleClickVolumeButton}
                type="button"
                className="rhap_button-clear rhap_volume-button"
              >
                {renderIcon(volume > 0 ? 'volume' : 'volumeMute')}
              </button>
              <VolumeBar
                audio={audio.current}
                volume={volume}
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
      renderIcon,
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
      showFilledVolume,
    ]
  )

  const renderUIModules = useCallback(
    (modules: CustomUIModules): Array<ReactElement> => {
      return modules
        .map((comp, index) => renderUIModule(comp, comp?.toString() || `module-${index}`))
        .filter((el) => el !== null)
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

    const cleanups: Array<() => void> = []
    const on = (
      event: string,
      getHandler: (p: PlayerProps) => ((e: Event) => void) | undefined,
      rerender = false
    ): void => {
      const listener = (e: Event): void => {
        if (rerender) forceUpdate({})
        getHandler(latestProps.current)?.(e)
      }
      audioEl.addEventListener(event, listener)
      cleanups.push(() => audioEl.removeEventListener(event, listener))
    }

    on('canplay', (p) => p.onCanPlay)
    on('canplaythrough', (p) => p.onCanPlayThrough)
    on('playing', (p) => p.onPlaying)
    on('seeking', (p) => p.onSeeking)
    on('seeked', (p) => p.onSeeked)
    on('waiting', (p) => p.onWaiting)
    on('emptied', (p) => p.onEmptied)
    on('stalled', (p) => p.onStalled)
    on('suspend', (p) => p.onSuspend)
    on('loadstart', (p) => p.onLoadStart)
    on('abort', (p) => p.onAbort)
    on('encrypted', (p) => p.mse?.onEcrypted)
    on('loadedmetadata', (p) => p.onLoadedMetaData, true)
    on('loadeddata', (p) => p.onLoadedData, true)
    on('play', (p) => p.onPlay, true)
    on('pause', (p) => p.onPause, true)
    on('ended', (p) => p.onEnded, true)
    on('volumechange', (p) => p.onVolumeChange, true)
    on('error', (p) => (e) => {
      const target = e.target as HTMLAudioElement
      // Calls onEnded when currentTime is the same as duration even if there is an error
      if (target.error && target.currentTime === target.duration) {
        p.onEnded?.(e)
        return
      }
      p.onError?.(e)
    })

    const handleTimeUpdate = throttle((e: Event) => {
      forceUpdate({})
      latestProps.current.onListen?.(e)
    }, listenInterval)
    audioEl.addEventListener('timeupdate', handleTimeUpdate)
    cleanups.push(() => audioEl.removeEventListener('timeupdate', handleTimeUpdate))

    return () => cleanups.forEach((off) => off())
  }, [listenInterval])

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

export default H5AudioPlayer
export { RHAP_UI, OnSeek }
