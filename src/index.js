import React, { Component } from 'react'
import PropTypes from 'prop-types'

const style = {
  audioPlayerWrapper(hidePlayer) {
    return {
      display: hidePlayer ? 'none' : 'block',
    }
  },
  flexWrapper: {
    boxSizing: 'border-box',
    height: '70px',
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    padding: '15px 0',
    backgroundColor: 'white',
    position: 'relative',
    zIndex: '100',
    boxShadow: '0 0 3px 0 rgba(0, 0, 0, 0.2)',
  },
  pause: {
    boxSizing: 'content-box',
    display: 'block',
    width: '14px',
    height: '18px',
    borderLeft: '7px solid white',
    position: 'relative',
    zIndex: '1',
    left: '9px',
    backgroundColor: 'white',
    boxShadow: 'inset 7px 0 0 0 rgb(251, 86, 21)',
  },
  play: {
    boxSizing: 'content-box',
    display: 'block',
    width: '0',
    height: '0',
    borderTop: '10px solid transparent',
    borderBottom: '10px solid transparent',
    borderLeft: '20px solid white',
    position: 'relative',
    zIndex: '1',
    left: '13px',
  },
  togglePlayWrapper: {
    boxSizing: 'border-box',
    flex: '1 0 60px',
    position: 'relative',
  },
  togglePlay: {
    boxSizing: 'border-box',
    position: 'absolute',
    left: '50%',
    marginLeft: '-20px',
    backgroundColor: '#FB5615',
    color: 'white',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    textAlign: 'center',
    paddingTop: '10px',
  },
  progressBarWrapper: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxSizing: 'border-box',
    position: 'relative',
    flex: '10 0 auto',
    alignSelf: 'center',
    padding: '5px 4% 0 0',
  },
  progressBar: {
    boxSizing: 'border-box',
    width: '100%',
    height: '5px',
    left: '0',
    background: '#e4e4e4',
  },
  drag(left) {
    return {
      boxSizing: 'border-box',
      position: 'absolute',
      width: '20px',
      height: '20px',
      left,
      top: '-3px',
      background: 'skyblue',
      opacity: '0.8',
      borderRadius: '50px',
      boxShadow: '#fff 0 0 5px',
      cursor: 'pointer',
    }
  },
  audioInfo: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  time: {},
  volumeControl: {
    zIndex: 20,
    cursor: 'pointer',
    position: 'relative',
    width: 0,
    height: 0,
    borderBottom: '15px solid rgb(228, 228, 228)',
    borderLeft: '45px solid transparent',
  },
  volume(currentVolume) {
    const height = 15
    return {
      zIndex: 19,
      position: 'absolute',
      left: '-45px',
      bottom: '-15px',
      width: 0,
      height: 0,
      borderBottom: `${height * currentVolume}px solid skyblue`,
      borderLeft: `${height * currentVolume * 3}px solid transparent`,
    }
  },
}

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
  }

  state = {
    duration: 0,
    currentTime: 0,
    currentVolume: this.props.volume,
    dragLeft: 0,
    isDragging: false,
    isPlaying: false,
  }

  componentDidMount() {
    // audio player object
    const audio = this.audio
    // progress bar slider object
    const slider = this.slider

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

    // let dragX
    // slider.addEventListener('dragstart', (e) => {
    //   if (!this.audio.src) {
    //     return
    //   }
    //   e.dataTransfer.setData('text', 'slider')
    //   if (e.dataTransfer.setDragImage) {
    //     const crt = slider.cloneNode(true)
    //     e.dataTransfer.setDragImage(crt, 0, 0)
    //   }
    //   this.audio.pause()
    //   document.addEventListener('dragover', (event) => {
    //     event = event || window.event
    //     dragX = event.pageX
    //   })
    //   this.props.onDragStart && this.props.onDragStart(e)
    //   this.setState({ isDragging: true })
    // })

    // slider.addEventListener('touchstart', (e) => {
    //   this.setState({ isDragging: true })
    //   this.props.onDragStart && this.props.onDragStart(e)
    //   setTimeout(() => this.audio.pause(), 0)
    // })
    // slider.addEventListener('drag', (e) => {
    //   if (!this.audio.src) {
    //     return
    //   }
    //   if (dragX) {
    //     let dragLeft = dragX - this.bar.getBoundingClientRect().left
    //     if (dragLeft < 0) {
    //       dragLeft = 0
    //     } else if (dragLeft > this.bar.offsetWidth - 20) {
    //       dragLeft = this.bar.offsetWidth - 21
    //     }
    //     audio.currentTime = (audio.duration * dragLeft) / (this.bar.offsetWidth - 20) || 0
    //     this.updateDisplayTime(dragLeft)
    //     this.props.onDragMove && this.props.onDragMove(e)
    //   }
    // })
    // slider.addEventListener('touchmove', (e) => {
    //   let dragLeft = e.touches[0].clientX - this.bar.getBoundingClientRect().left
    //   if (dragLeft < 0) {
    //     dragLeft = 0
    //   } else if (dragLeft > this.bar.offsetWidth - 20) {
    //     dragLeft = this.bar.offsetWidth - 21
    //   }
    //   audio.currentTime = (audio.duration * dragLeft) / (this.bar.offsetWidth - 20) || 0
    //   this.updateDisplayTime(dragLeft)
    //   this.props.onDragMove && this.props.onDragMove(e)
    // })
    // slider.addEventListener('dragend', (e) => {
    //   if (!this.audio.src) {
    //     return
    //   }
    //   const audio = this.audio
    //   audio.currentTime = (audio.duration * this.state.dragLeft) / (this.bar.offsetWidth - 20) || 0
    //   audio.play()
    //   this.setState({ isDragging: false })
    //   this.props.onDragEnd && this.props.onDragEnd(e)
    // })
    // slider.addEventListener('touchend', (e) => {
    //   this.setState({ isDragging: false })
    //   this.props.onDragEnd && this.props.onDragEnd(e)
    //   setTimeout(() => {
    //     const audio = this.audio
    //     audio.currentTime = (audio.duration * this.state.dragLeft) / (this.bar.offsetWidth - 20)
    //     audio.play()
    //   }, 0)
    // })
  }

  componentWillUnmount() {
    clearInterval(this.intervalId)
  }

  componentDidUpdate(prevProps) {
    const { src } = this.props
    if (src !== prevProps.src) {
      this.audio.play()
    }
  }

  updateDisplayTime = (dragLeft) => {
    const currentTime = this.audio.currentTime
    const duration = this.audio.duration
    const barWidth = this.bar.offsetWidth - 20
    const left = dragLeft || (barWidth * currentTime) / duration || 0
    this.setState({
      currentTime,
      duration,
      barWidth,
      dragLeft: left,
    })
  }

  togglePlay = () => {
    if (this.audio.paused && this.audio.src) {
      this.audio.play()
    } else if (!this.audio.paused) {
      this.audio.pause()
    }
  }

  volumnControlDrag = (e) => {
    if (e.clientX < 0) return
    const relativePos = e.clientX - this.volumeControl.getBoundingClientRect().left
    let currentVolume
    if (relativePos < 0) {
      currentVolume = 0
    } else if (relativePos > 45) {
      currentVolume = 1
    } else {
      currentVolume = relativePos / 45
    }
    e.currentTarget.style.cursor = 'pointer'
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move'
    }
    this.audio.volume = currentVolume
    this.setState({ currentVolume })
  }

  volumnControlDragOver = (e) => {
    e.dataTransfer.dropEffect = 'move'
  }

  volumnControlDragStart = (e) => {
    // e.target.style.cursor = 'pointer'
    e.dataTransfer.setData('text', 'volume')
    e.dataTransfer.effectAllowed = 'move'
    if (e.dataTransfer.setDragImage) {
      const crt = e.target.cloneNode(true)
      e.dataTransfer.setDragImage(crt, 0, 0)
    }
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
    const { className, volume, children, hidePlayer, src, preload, autoPlay, title = src, mute, loop } = this.props
    const { currentTime, currentVolume, duration, isPlaying, dragLeft } = this.state
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
      <div style={style.audioPlayerWrapper(hidePlayer)} className={`react-h5-audio-player ${className}`}>
        <div style={style.flexWrapper} className="flex">
          <audio
            src={src}
            controls={false}
            title={title}
            mute={mute}
            loop={loop}
            volume={volume}
            autoPlay={autoPlay}
            preload={preload}
            ref={(ref) => {
              this.audio = ref
            }}
          >
            {incompatibilityMessage}
          </audio>
          <div className="toggle-play-wrapper" style={style.togglePlayWrapper}>
            <a className="toggle-play-button" onClick={e => this.togglePlay(e)} style={style.togglePlay}>
              {isPlaying ? (
                <i className="pause-icon" style={style.pause} />
              ) : (
                <i className="play-icon" style={style.play} />
              )}
            </a>
          </div>
          <div className="progress-bar-wrapper" style={style.progressBarWrapper}>
            <div
              className="progress-bar"
              ref={(ref) => {
                this.bar = ref
              }}
              style={style.progressBar}
              onMouseDown={this.mouseDownProgressBar}
            />
            {/*TODO: color change for sought part */}
            <div className="sought" />
            <div
              className="indicator"
              draggable="true"
              ref={(ref) => {
                this.slider = ref
              }}
              style={style.drag(dragLeft)}
            />
            <div className="audio-info" style={style.audioInfo}>
              <div className="time" style={style.time}>
                <span className="current-time">
                  {currentTimeMin}:{currentTimeSec}
                </span>
                /
                <span className="total-time">
                  {durationMin}:{durationSec}
                </span>
              </div>
              <div
                ref={(ref) => {
                  this.volumeControl = ref
                }}
                draggable="true"
                onDragStart={this.volumnControlDragStart}
                onDrag={this.volumnControlDrag}
                onDragOver={this.volumnControlDragOver}
                onMouseDown={this.volumnControlDrag}
                className="volume-controls"
                style={style.volumeControl}
              >
                <div className="volumn" style={style.volume(currentVolume)} />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default H5AudioPlayer
