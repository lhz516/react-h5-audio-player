import React from 'react';

const style = {
  audioPlayerWrapper(hidePlayer) {
    return {
      display: hidePlayer ? 'none' : 'block'
    };
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
    boxShadow: '0 0 3px 0 rgba(0, 0, 0, 0.2)'
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
    boxShadow: 'inset 7px 0 0 0 rgb(251, 86, 21)'
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
    paddingTop: '10px'
  },
  progressBarWrapper: {
    boxSizing: 'border-box',
    position: 'relative',
    flex: '10 0 auto',
    alignSelf: 'center',
    padding: '5px 4% 0 0'
  },
  progressBar: {
    boxSizing: 'border-box',
    width: '100%',
    height: '5px',
    left: '0',
    top: '-5px',
    background: '#e4e4e4',
    marginBottom: '7px'
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
    };
  },
  time: {

  }
};

const DEFAULT_LISTEN_INTERVAL = 10000;

class H5AudioPlayer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      duration: 0,
      currentTime: 0,
      dragLeft: 0,
      isDragging: false,
      isPlaying: false,
    };
    this.audio = {};
    this.togglePlay = this.togglePlay.bind(this);
  }

  componentDidMount() {
    // audio player object
    const audio = this.audio;
    // progress bar slider object
    const slider = this.slider;

    this.intervalId = setInterval(() => {
      const currentTime = this.audio.currentTime;
      const duration = this.audio.duration;
      const barWidth = this.bar.offsetWidth;
      const left = barWidth * currentTime / duration || 0;
      if (!this.audio.paused && !this.state.isDragging) {
        this.setState({
          currentTime,
          duration,
          barWidth,
          dragLeft: left,
        });
      }
    }, 500);
    audio.addEventListener('error', (e) => {
      this.props.onError && this.props.onError(e);
    });

    // When enough of the file has downloaded to start playing
    audio.addEventListener('canplay', (e) => {
      this.props.onCanPlay && this.props.onCanPlay(e);
    });

    // When enough of the file has downloaded to play the entire file
    audio.addEventListener('canplaythrough', (e) => {
      this.props.onCanPlayThrough && this.props.onCanPlayThrough(e);
    });

    // When audio play starts
    audio.addEventListener('play', (e) => {
      this.setState({ isPlaying: true });
      this.setListenTrack();
      this.props.onPlay && this.props.onPlay(e);
    });

    // When unloading the audio player (switching to another src)
    audio.addEventListener('abort', (e) => {
      this.clearListenTrack();
      this.props.onAbort && this.props.onAbort(e);
    });

    // When the file has finished playing to the end
    audio.addEventListener('ended', (e) => {
      this.clearListenTrack();
      this.props.onEnded && this.props.onEnded(e);
    });

    // When the user pauses playback
    audio.addEventListener('pause', (e) => {
      this.setState({ isPlaying: false });
      this.clearListenTrack();
      this.props.onPause && this.props.onPause(e);
    });

    let dragX;
    slider.addEventListener('dragstart', (e) => {
      if (!this.audio.src) {
        return;
      }
      e.dataTransfer.setData('text', 'slider');
      if (e.dataTransfer.setDragImage) {
        const crt = slider.cloneNode(true);
        e.dataTransfer.setDragImage(crt, 0, 0);
      }
      this.audio.pause();
      document.addEventListener('dragover', (event) => {
        event = event || window.event;
        dragX = event.pageX;
      });
      this.props.onDragStart && this.props.onDragStart(e);
      this.setState({ isDragging: true });
    });

    slider.addEventListener('touchstart', (e) => {
      this.setState({ isDragging: true });
      this.props.onDragStart && this.props.onDragStart(e);
      setTimeout(() => this.audio.pause(), 0);
    });
    slider.addEventListener('drag', (e) => {
      if (!this.audio.src) {
        return;
      }
      if (dragX ) {
        let dragLeft = dragX - this.bar.getBoundingClientRect().left;
        if (dragLeft < 0) {
          dragLeft = 0;
        } else if (dragLeft > this.bar.offsetWidth) {
          dragLeft = this.bar.offsetWidth - 1;
        }
        this.setState({ dragLeft });
        this.props.onDragMove && this.props.onDragMove(e);
      }
    });
    slider.addEventListener('touchmove', (e) => {
      this.setState({ dragLeft: e.touches[0].clientX - this.bar.getBoundingClientRect().left });
      this.props.onDragMove && this.props.onDragMove(e);
    });
    slider.addEventListener('dragend', (e) => {
      if (!this.audio.src) {
        return;
      }
      const audio = this.audio;
      audio.currentTime = audio.duration * this.state.dragLeft / this.bar.offsetWidth || 0;
      audio.play();
      this.setState({ isDragging: false });
      this.props.onDragEnd && this.props.onDragEnd(e);
    });
    slider.addEventListener('touchend', (e) => {
      this.setState({ isDragging: false });
      this.props.onDragEnd && this.props.onDragEnd(e);
      setTimeout(() => {
        const audio = this.audio;
        audio.currentTime = audio.duration * this.state.dragLeft / this.bar.offsetWidth;
        audio.play();
      }, 0);
    });
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  componentDidUpdate() {
    const { audioFile, isPlaying } = this.props;
    if (isPlaying && this.audio.paused && !!audioFile) {
      this.play();
    }
  }

  togglePlay() {
    if (this.audio.paused && this.audio.src) {
      this.audio.play();
    } else if (!this.audio.paused) {
      this.audio.pause();
    }
  }

  /**
   * Set an interval to call props.onListen every props.listenInterval time period
   */
  setListenTrack() {
    if (!this.listenTracker) {
      const listenInterval = this.props.listenInterval || DEFAULT_LISTEN_INTERVAL;
      this.listenTracker = setInterval(() => {
        this.props.onListen && this.props.onListen(this.audioEl.currentTime);
      }, listenInterval);
    }
  }

  /**
   * Clear the onListen interval
   */
  clearListenTrack() {
    if (this.listenTracker) {
      clearInterval(this.listenTracker);
      this.listenTracker = null;
    }
  }

  render() {
    const incompatibilityMessage = this.props.children || (
        <p>Your browser does not support the <code>audio</code> element.</p>
      );

    let currentTimeMin = Math.floor(this.state.currentTime / 60);
    let currentTimeSec = Math.floor(this.state.currentTime % 60);
    let durationMin = Math.floor(this.state.duration / 60);
    let durationSec = Math.floor(this.state.duration % 60);
    const addHeadingZero = (num) => num > 9 ? num.toString() : '0' + num;

    currentTimeMin = addHeadingZero(currentTimeMin);
    currentTimeSec = addHeadingZero(currentTimeSec);
    durationMin = addHeadingZero(durationMin);
    durationSec = addHeadingZero(durationSec);

    return (
      <div style={style.audioPlayerWrapper(this.props.hidePlayer)} className="react-h5-audio-player">
        <div style={style.flexWrapper} className="flex">
          <audio
            src={this.props.src}
            autoPlay={this.props.autoPlay}
            preload={this.props.preload}
            ref={(ref) => { this.audio = ref; }}
            onPlay={this.onPlay}
          >
            {incompatibilityMessage}
          </audio>
          <div className="toggle-play-wrapper" style={style.togglePlayWrapper}>
            <a className="toggle-play-button" onClick={(e) => this.togglePlay(e)} style={style.togglePlay}>
              {
                this.state.isPlaying ?
                  <i style={style.pause} /> :
                  <i style={style.play} />
              }
            </a>
          </div>
          <div className="progress-bar-wrapper" style={style.progressBarWrapper}>
            <div ref={(ref) => { this.bar = ref; }} style={style.progressBar}></div>
            {/*TODO: color change for sought part */}
            <div className="sought" />
            <div
              className="indicator"
              draggable="true"
              ref={(ref) => { this.slider = ref; }}
              style={style.drag(this.state.dragLeft)}
            />
            <div className="time" style={style.time}>
              <span className="current-time">{currentTimeMin}:{currentTimeSec}</span>/
              <span className="total-time">{durationMin}:{durationSec}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

H5AudioPlayer.propTypes = {
  autoPlay: React.PropTypes.bool,
  children: React.PropTypes.element,
  listenInterval: React.PropTypes.number,
  onAbort: React.PropTypes.func,
  onCanPlay: React.PropTypes.func,
  onCanPlayThrough: React.PropTypes.func,
  onEnded: React.PropTypes.func,
  onError: React.PropTypes.func,
  onListen: React.PropTypes.func,
  onPause: React.PropTypes.func,
  onPlay: React.PropTypes.func,
  onDragStart: React.PropTypes.func,
  onDragMove: React.PropTypes.func,
  onDragEnd: React.PropTypes.func,
  preload: React.PropTypes.string,
  src: React.PropTypes.string,
  hidePlayer: React.PropTypes.bool,
};

export default H5AudioPlayer;
