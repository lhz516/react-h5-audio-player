import React, { Component } from 'react'
import PropTypes from 'prop-types'
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

class H5AudioPlayer extends Component {
  static propTypes = {
    /**
     * HTML5 Audio tag autoPlay property
     */
    autoPlay: PropTypes.bool,
    /**
     * custom classNames
     */
    className: PropTypes.string,
    /**
     * The time interval to trigger onListen
     */
    listenInterval: PropTypes.number,
    jumpInterval: PropTypes.number,
    loop: PropTypes.bool,
    muted: PropTypes.bool,
    onAbort: PropTypes.func,
    onCanPlay: PropTypes.func,
    onCanPlayThrough: PropTypes.func,
    onEnded: PropTypes.func,
    onError: PropTypes.func,
    onListen: PropTypes.func,
    onPause: PropTypes.func,
    onPlay: PropTypes.func,
    onClickPrevious: PropTypes.func,
    onClickNext: PropTypes.func,
    onPlayError: PropTypes.func,
    /**
     * HTML5 Audio tag preload property
     */
    preload: PropTypes.oneOf(['auto', 'metadata', 'none']),
    /**
     * Pregress indicator refresh interval
     */
    progressUpdateInterval: PropTypes.number,
    /**
     * HTML5 Audio tag src property
     */
    src: PropTypes.string,
    title: PropTypes.string,
    volume: PropTypes.number,
    showLoopControl: PropTypes.bool,
    showVolumeControl: PropTypes.bool,
    showJumpControls: PropTypes.bool,
    showSkipControls: PropTypes.bool,
  }

  static defaultProps = {
    autoPlay: false,
    listenInterval: 1000,
    jumpInterval: 5000,
    loop: false,
    muted: false,
    preload: 'auto',
    progressUpdateInterval: 20,
    src: '',
    volume: 1.0,
    className: '',
    showLoopControl: true,
    showVolumeControl: true,
    showJumpControls: true,
    showSkipControls: false,
    onClickPrevious: null,
    onClickNext: null,
    onPlayError: null,
  }

  static addHeadingZero = num => (num > 9 ? num.toString() : `0${num}`)

  static getPosX = (event, isTouch) => {
    let posX
    if (isTouch) {
      posX = event.touches[0].pageX
    } else {
      posX = event.pageX || event.clientX
    }
    return posX
  }

  state = {
    duration: NaN,
    currentTime: NaN,
    currentTimePos: '0%',
    currentVolume: this.props.muted ? 0 : this.props.volume,
    currentVolumePos: this.props.muted ? '0%' : `${this.props.volume * 100}%`,
    isDraggingProgress: false,
    isDraggingVolume: false,
    isPlaying: false,
    isLoopEnabled: this.props.loop,
  }

  timeOnMouseMove = 0

  updateDisplayTime = (currentTime) => {
    const duration = this.audio.duration
    const left = `${currentTime / duration * 100}%` || 0
    this.setState({
      currentTime,
      duration,
      currentTimePos: left,
    })
  }

  updateDisplayVolume = (volume) => {
    if (volume === 0) {
      return this.setState({ currentVolume: 0, currentVolumePos: '0%' })
    }

    this.setState({ currentVolume: volume, currentVolumePos: `${volume * 100}%` })
  }

  togglePlay = () => {
    if (this.audio.paused && this.audio.src) {
      const audioPromise = this.audio.play()
      audioPromise.then(null)
        .catch((err) => {
          const { onPlayError } = this.props
          onPlayError && onPlayError(new Error(err))
        })
    } else if (!this.audio.paused) {
      this.audio.pause()
    }
  }

  handleClickVolumeButton = () => {
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

  handleVolumnControlMouseDown = (event) => {
    event.stopPropagation()
    const isTouch = event.type.startsWith('touch')
    const { currentVolume, currentVolumePos } = this.getCurrentVolume(event, isTouch)
    this.audio.volume = currentVolume
    this.setState({ isDraggingVolume: true, currentVolume, currentVolumePos })
    if (isTouch) {
      window.addEventListener('touchmove', this.handleWindowMouseOrTouchMove)
      window.addEventListener('touchend', this.handleWindowMouseOrTouchUp)
    } else {
      window.addEventListener('mousemove', this.handleWindowMouseOrTouchMove)
      window.addEventListener('mouseup', this.handleWindowMouseOrTouchUp)
    }
  }

  handleWindowMouseOrTouchMove = (event) => {
    event.stopPropagation()
    // Prevent Chrome drag selection bug
    const windowSelection = window.getSelection()
    if (windowSelection.type === 'Range') {
      windowSelection.empty()
    }
    const isTouch = event.type.startsWith('touch')
    const { isDraggingVolume, isDraggingProgress } = this.state
    if (isDraggingVolume) {
      const { currentVolume, currentVolumePos } = this.getCurrentVolume(event, isTouch)
      this.audio.volume = currentVolume
      this.setState({ currentVolume, currentVolumePos })
    } else if (isDraggingProgress) {
      const { currentTime, currentTimePos } = this.getCurrentProgress(event, isTouch)
      this.timeOnMouseMove = currentTime
      this.setState({ currentTime, currentTimePos })
    }
  }

  handleWindowMouseOrTouchUp = (event) => {
    event.stopPropagation()
    this.setState((prevState) => {
      if (prevState.isDraggingProgress && isFinite(this.timeOnMouseMove)) {
        this.audio.currentTime = this.timeOnMouseMove
      }
      return { isDraggingVolume: false, isDraggingProgress: false }
    })
    const isTouch = event.type.startsWith('touch')
    if (isTouch) {
      window.removeEventListener('touchmove', this.handleWindowMouseOrTouchMove)
      window.removeEventListener('touchend', this.handleWindowMouseOrTouchUp)
    } else {
      window.removeEventListener('mousemove', this.handleWindowMouseOrTouchMove)
      window.removeEventListener('mouseup', this.handleWindowMouseOrTouchUp)
    }
  }

  getCurrentVolume = (event, isTouch) => {
    const volumeBarRect = this.volumeControl.getBoundingClientRect()
    const relativePos = this.constructor.getPosX(event, isTouch) - volumeBarRect.left
    let currentVolume
    let currentVolumePos

    if (relativePos < 0) {
      currentVolume = 0
      currentVolumePos = '0%'
    } else if (relativePos > volumeBarRect.width) {
      currentVolume = 1
      currentVolumePos = `${volumeBarRect.width / volumeBarRect.width * 100}%`
    } else {
      currentVolume = relativePos / volumeBarRect.width
      currentVolumePos = `${(relativePos / volumeBarRect.width) * 100}%`
    }

    return { currentVolume, currentVolumePos }
  }

  /* Handle mouse click on progress bar event */
  handleMouseDownProgressBar = (event) => {
    event.stopPropagation()
    const isTouch = event.type.startsWith('touch')
    const { currentTime, currentTimePos } = this.getCurrentProgress(event, isTouch)

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

  handleClickLoopButton = () => {
    this.setState(prevState => ({ isLoopEnabled: !prevState.isLoopEnabled }))
  }

  handleClickRewind = () => {
    this.setJumpTime(-this.props.jumpInterval)
  }

  handleClickForward = () => {
    this.setJumpTime(this.props.jumpInterval)
  }

  setJumpTime = (time) => {
    const { duration } = this.audio
    if (!isFinite(duration)) return
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
      return { currentTime, currentTimePos: `${currentTime / duration * 100}%` }
    })
  }

  getCurrentProgress = (event, isTouch) => {
    if (!this.audio.src || !isFinite(this.audio.currentTime)) {
      return { currentTime: 0, currentTimePos: '0%' }
    }

    const progressBarRect = this.progressBar.getBoundingClientRect()
    const maxRelativePos = progressBarRect.width
    let relativePos = this.constructor.getPosX(event, isTouch) - progressBarRect.left

    if (relativePos < 0) {
      relativePos = 0
    } else if (relativePos > maxRelativePos) {
      relativePos = maxRelativePos
    }
    const currentTime = (this.audio.duration * relativePos) / maxRelativePos
    return { currentTime, currentTimePos: relativePos }
  }

  getDisplayTimeBySeconds = (seconds) => {
    if (!isFinite(seconds)) {
      return '00:00'
    }

    const addHeadingZero = this.constructor.addHeadingZero
    const min = addHeadingZero(Math.floor(seconds / 60))
    const sec = addHeadingZero(Math.floor(seconds % 60))
    return `${min}:${sec}`
  }

  /**
   * Set an interval to call props.onListen every props.listenInterval time period
   */
  setListenTrack = () => {
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
  clearListenTrack = () => {
    if (this.listenTracker) {
      clearInterval(this.listenTracker)
      this.listenTracker = null
    }
  }

  componentDidMount() {
    // audio player object
    const audio = this.audio

    this.lastVolume = audio.volume

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

  componentDidUpdate(prevProps) {
    const { src, autoPlay } = this.props
    if (src !== prevProps.src && autoPlay) {
      this.audio.play()
    }
  }

  componentWillUnmount() {
    clearInterval(this.intervalId)
  }

  render() {
    const {
      className,
      src,
      preload,
      autoPlay,
      title = src,
      muted,
      showLoopControl,
      showVolumeControl,
      showSkipControls,
      showJumpControls,
      onClickPrevious,
      onClickNext,
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
      <div className={`rhap_container ${className}`}>
        <audio
          src={src}
          controls={false}
          title={title}
          muted={muted}
          loop={isLoopEnabled}
          volume={currentVolume}
          autoPlay={autoPlay}
          preload={preload}
          ref={(ref) => {
            this.audio = ref
          }}
        />
        <div className="rhap_progress-section">
          <div className="rhap_time rhap_current-time">
            {this.getDisplayTimeBySeconds(currentTime)}
          </div>
          <div
            className="rhap_progress-container"
            ref={(ref) => {
              this.progressBar = ref
            }}
            onMouseDown={this.handleMouseDownProgressBar}
            onTouchStart={this.handleMouseDownProgressBar}
          >
            <div className="rhap_progress-bar">
              <div
                className="rhap_progress-indicator"
                style={{ left: currentTimePos }}
              />
            </div>
          </div>
          <div className="rhap_time rhap_total-time">
            {this.getDisplayTimeBySeconds(duration)}
          </div>
        </div>

        <div className="rhap_controls-section">
          <div className="rhap_additional-controls">
            {showLoopControl && (
              <button className="rhap_button-clear rhap_repeat-button" onClick={this.handleClickLoopButton}>
                <Icon icon={isLoopEnabled ? repeat : repeatOff} />
              </button>
            )}
          </div>
          <div className="rhap_main-controls">
            {showSkipControls && (
              <button className="rhap_button-clear rhap_main-controls-button rhap_skip-button" onClick={onClickPrevious}>
                <Icon icon={skipPrevious} />
              </button>
            )}
            {showJumpControls && (
              <button className="rhap_button-clear rhap_main-controls-button rhap_rewind-button" onClick={this.handleClickRewind}>
                <Icon icon={rewind} />
              </button>
            )}
            <button className="rhap_button-clear rhap_main-controls-button rhap_play-pause-button" onClick={this.togglePlay}>
              {isPlaying ? (
                <Icon icon={pauseCircle} />
              ) : (
                <Icon icon={playCircle} />
              )}
            </button>
            {showJumpControls && (
              <button className="rhap_button-clear rhap_main-controls-button rhap_forward-button" onClick={this.handleClickForward}>
                <Icon icon={fastForward} />
              </button>
            )}
            {showSkipControls && (
              <button className="rhap_button-clear rhap_main-controls-button rhap_skip-button" onClick={onClickNext}>
                <Icon icon={skipNext} />
              </button>
            )}
          </div>
          <div className="rhap_volume-controls">
            {showVolumeControl && (
              <div className="rhap_volume-container">
                <button onClick={this.handleClickVolumeButton} className="rhap_button-clear rhap_volume-button">
                  <Icon icon={currentVolume ? volumeHigh : volumeMute} />
                </button>
                <div
                  ref={(ref) => { this.volumeControl = ref }}
                  onMouseDown={this.handleVolumnControlMouseDown}
                  onTouchStart={this.handleVolumnControlMouseDown}
                  className="rhap_volume-bar-area"
                >
                  <div className="rhap_volume-bar">
                    <div
                      className="rhap_volume-indicator"
                      style={{ left: currentVolumePos }}
                    />
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
