import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Icon } from '@iconify/react'
import playCircle from '@iconify/icons-mdi/play-circle'
import pauseCircle from '@iconify/icons-mdi/pause-circle'
import skipPreviousCircle from '@iconify/icons-mdi/skip-previous-circle'
import skipNextCircle from '@iconify/icons-mdi/skip-next-circle'
import volumeHigh from '@iconify/icons-mdi/volume-high'
import volumeMute from '@iconify/icons-mdi/volume-mute'

import './styles.scss'

const VOLUME_INDICATOR_SIZE = 12

class H5AudioPlayer extends Component {
  static propTypes = {
    /**
     * HTML5 Audio tag autoPlay property
     */
    autoPlay: PropTypes.bool,
    /**
     * Display message when browser doesn't support
     */
    children: PropTypes.element,
    /**
     * custom classNames
     */
    className: PropTypes.string,
    /**
     * Set component `display` to none
     */
    hidePlayer: PropTypes.bool,
    /**
     * The time interval to trigger onListen
     */
    listenInterval: PropTypes.number,
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
    onDragStart: PropTypes.func,
    onDragMove: PropTypes.func,
    onDragEnd: PropTypes.func,
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
  }

  static defaultProps = {
    autoPlay: false,
    hidePlayer: false,
    listenInterval: 1000,
    loop: false,
    muted: false,
    preload: 'auto',
    progressUpdateInterval: 200,
    src: '',
    volume: 1.0,
    className: '',
  }

  state = {
    duration: 0,
    currentTime: 0,
    currentVolume: this.props.volume,
    currentVolumePos: `${this.props.volume * 100}%`,
    dragLeft: 0,
    isDragging: false,
    isDraggingVolume: false,
    isPlaying: false,
  }

  componentDidMount() {
    // audio player object
    const audio = this.audio
    // progress bar slider object
    const slider = this.slider

    this.lastVolume = audio.volume

    this.intervalId = setInterval(() => {
      if (!this.audio.paused && !this.state.isDragging && !!this.audio.duration) {
        this.updateDisplayTime()
      }
    }, this.props.progressUpdateInterval)
    
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

    let dragX
    slider.addEventListener('dragstart', (e) => {
      if (!this.audio.src) {
        return
      }
      e.dataTransfer.setData('text', 'slider')
      if (e.dataTransfer.setDragImage) {
        const crt = slider.cloneNode(true)
        e.dataTransfer.setDragImage(crt, 0, 0)
      }
      this.audio.pause()
      document.addEventListener('dragover', (event) => {
        event = event || window.event
        dragX = event.pageX
      })
      this.props.onDragStart && this.props.onDragStart(e)
      this.setState({ isDragging: true })
    })

    slider.addEventListener('touchstart', (e) => {
      this.setState({ isDragging: true })
      this.props.onDragStart && this.props.onDragStart(e)
      setTimeout(() => this.audio.pause(), 0)
    })
    slider.addEventListener('drag', (e) => {
      if (!this.audio.src) {
        return
      }
      if (dragX) {
        let dragLeft = dragX - this.bar.getBoundingClientRect().left
        if (dragLeft < 0) {
          dragLeft = 0
        } else if (dragLeft > this.bar.offsetWidth - 20) {
          dragLeft = this.bar.offsetWidth - 21
        }
        audio.currentTime = (audio.duration * dragLeft) / (this.bar.offsetWidth - 20) || 0
        this.updateDisplayTime(dragLeft)
        this.props.onDragMove && this.props.onDragMove(e)
      }
    })
    slider.addEventListener('touchmove', (e) => {
      let dragLeft = e.touches[0].clientX - this.bar.getBoundingClientRect().left
      if (dragLeft < 0) {
        dragLeft = 0
      } else if (dragLeft > this.bar.offsetWidth - 20) {
        dragLeft = this.bar.offsetWidth - 21
      }
      audio.currentTime = (audio.duration * dragLeft) / (this.bar.offsetWidth - 20) || 0
      this.updateDisplayTime(dragLeft)
      this.props.onDragMove && this.props.onDragMove(e)
    })
    slider.addEventListener('dragend', (e) => {
      if (!this.audio.src) {
        return
      }
      const audio = this.audio
      audio.currentTime = (audio.duration * this.state.dragLeft) / (this.bar.offsetWidth - 20) || 0
      audio.play()
      this.setState({ isDragging: false })
      this.props.onDragEnd && this.props.onDragEnd(e)
    })
    slider.addEventListener('touchend', (e) => {
      this.setState({ isDragging: false })
      this.props.onDragEnd && this.props.onDragEnd(e)
      setTimeout(() => {
        const audio = this.audio
        audio.currentTime = (audio.duration * this.state.dragLeft) / (this.bar.offsetWidth - 20)
        audio.play()
      }, 0)
    })
  }

  componentWillUnmount() {
    clearInterval(this.intervalId)
  }

  componentDidUpdate(prevProps) {
    const { src, autoPlay } = this.props
    if (src !== prevProps.src && autoPlay) {
      this.audio.play()
    }
  }

  updateDisplayTime = (dragLeft) => {
    const currentTime = this.audio.currentTime
    const duration = this.audio.duration
    const barWidth = this.bar.offsetWidth - 20
    const left = dragLeft || `calc(${currentTime / duration * 100}% - 19px)` || 0
    this.setState({
      currentTime,
      duration,
      barWidth,
      dragLeft: left,
    })
  }

  updateDisplayVolume = (volume) => {
    if (volume === 0) {
      return this.setState({ currentVolume: 0, currentVolumePos: '0%' })
    }
    const volumeBarRect = this.volumeControl.getBoundingClientRect()
    const maxRelativePos = volumeBarRect.width - VOLUME_INDICATOR_SIZE

    this.setState({ currentVolume: volume, currentVolumePos: `${volume * (maxRelativePos / volumeBarRect.width) * 100}%` })
  }

  togglePlay = () => {
    if (this.audio.paused && this.audio.src) {
      this.audio.play()
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
    const { currentVolume, currentVolumePos } = this.getCurrentVolume(event)
    this.audio.volume = currentVolume
    this.setState({ isDraggingVolume: true, currentVolume, currentVolumePos })
    window.addEventListener('mousemove', this.handleWindowMouseMove)
    window.addEventListener('mouseup', this.handleWindowMouseUp)
  }

  handleWindowMouseMove = (event) => {
    event.stopPropagation()
    if (!this.state.isDraggingVolume) return
    const { currentVolume, currentVolumePos } = this.getCurrentVolume(event)
    this.audio.volume = currentVolume
    this.setState({ currentVolume, currentVolumePos })
  }

  handleWindowMouseUp = (event) => {
    event.stopPropagation()
    this.setState((prevState) => {
      if (prevState.isDraggingVolume) {
        return { isDraggingVolume: false }
      }
    })
    window.removeEventListener('mousemove', this.handleWindowMouseMove)
    window.removeEventListener('mouseup', this.handleWindowMouseUp)
  }

  getCurrentVolume = (e) => {
    const volumeBarRect = this.volumeControl.getBoundingClientRect()
    const maxRelativePos = volumeBarRect.width - VOLUME_INDICATOR_SIZE
    const relativePos = e.clientX - volumeBarRect.left
    let currentVolume
    let currentVolumePos

    if (relativePos < 0) {
      currentVolume = 0
      currentVolumePos = '0%'
    } else if (relativePos > maxRelativePos) {
      currentVolume = 1
      currentVolumePos = `${maxRelativePos / volumeBarRect.width * 100}%`
    } else {
      currentVolume = relativePos / volumeBarRect.width
      currentVolumePos = `${(relativePos / volumeBarRect.width) * 100}%`
    }
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move'
    }
    return { currentVolume, currentVolumePos }
  }

  /* Handle mouse click on progress bar event */
  mouseDownProgressBar = (e) => {
    const { audio, bar } = this
    const mousePageX = e.pageX
    if (mousePageX) {
      let dragLeft = mousePageX - bar.getBoundingClientRect().left
      if (dragLeft < 0) {
        dragLeft = 0
      } else if (dragLeft > bar.offsetWidth - 20) {
        dragLeft = bar.offsetWidth - 21
      }
      audio.currentTime = (audio.duration * dragLeft) / (bar.offsetWidth - 20) || 0
      // this.setState({ isDragging: true })
      this.updateDisplayTime(dragLeft)
    }
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

  render() {
    const { className, children, src, preload, autoPlay, title = src, mute, loop } = this.props
    const { currentTime, currentVolume, currentVolumePos, duration, isPlaying, dragLeft } = this.state
    const incompatibilityMessage = children || (
      <p>
        Your browser does not support the <code>audio</code> element.
      </p>
    )

    let currentTimeMin = Math.floor(currentTime / 60)
    let currentTimeSec = Math.floor(currentTime % 60)
    let durationMin = Math.floor(duration / 60)
    let durationSec = Math.floor(duration % 60)
    const addHeadingZero = num => (num > 9 ? num.toString() : `0${num}`)

    currentTimeMin = addHeadingZero(currentTimeMin)
    currentTimeSec = addHeadingZero(currentTimeSec)
    durationMin = addHeadingZero(durationMin)
    durationSec = addHeadingZero(durationSec)

    return (
      <div className={`rhap_container ${className}`}>
        <audio
          src={src}
          controls={false}
          title={title}
          mute={mute}
          loop={loop}
          volume={currentVolume}
          autoPlay={autoPlay}
          preload={preload}
          ref={(ref) => {
            this.audio = ref
          }}
        />
        <div className="rhap_progress-section">
          <div className="rhap_current-time">
            {currentTimeMin}:{currentTimeSec}
          </div>
          <div className="rhap_progress-container">
            <div
              className="rhap_progress-bar"
              ref={(ref) => {
                this.bar = ref
              }}
              onMouseDown={this.mouseDownProgressBar}
            />
            <div
              className="rhap_progress-indicator"
              draggable="true"
              ref={(ref) => {
                this.slider = ref
              }}
              style={{ left: dragLeft }}
            />
          </div>
          <div className="rhap_total-time">
            {durationMin}:{durationSec}
          </div>
        </div>

        <div className="rhap_controls-section">
          <div className="rhap_additional-controls">
            <div className="rhap_repeat"></div>
          </div>
          <div className="rhap_main-controls">
            <button className="rhap_button-clear rhap_main-controls-button rhap_skip-button" onClick={this.togglePlay}>
              <Icon icon={skipPreviousCircle} />
            </button>
            <button className="rhap_button-clear rhap_main-controls-button rhap_play-pause-button" onClick={this.togglePlay}>
              {isPlaying ? (
                <Icon icon={pauseCircle} />
              ) : (
                <Icon icon={playCircle} />
              )}
            </button>
            <button className="rhap_button-clear rhap_main-controls-button rhap_skip-button" onClick={this.togglePlay}>
              <Icon icon={skipNextCircle} />
            </button>
          </div>
          <div className="rhap_volume-controls">
            <div className="rhap_volume-container">
              <button onClick={this.handleClickVolumeButton} className="rhap_button-clear rhap_volume-button">
                <Icon icon={currentVolume ? volumeHigh : volumeMute} />
              </button>
              <div
                ref={(ref) => { this.volumeControl = ref }}
                onMouseDown={this.handleVolumnControlMouseDown}
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
          </div>
        </div>  
      </div>
    )
  }
}

export default H5AudioPlayer
