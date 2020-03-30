import { configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

// Configure the enzyme adapter.
configure({ adapter: new Adapter() })

// Mock Audio object in Jest: https://github.com/jsdom/jsdom/issues/2155#issuecomment-581862425
// Mock data and helper methods
global.window.HTMLMediaElement.prototype._mock = {
  paused: true,
  duration: NaN,
  _loaded: false,
  // Emulates the audio file loading
  _load: function audioInit(audio) {
    // Note: we could actually load the file from this.src and get real duration
    // and other metadata.
    // See for example: https://github.com/59naga/mock-audio-element/blob/master/src/index.js
    // For now, the 'duration' and other metadata has to be set manually in test code.
    audio.dispatchEvent(new Event('loadedmetadata'))
    audio.dispatchEvent(new Event('canplaythrough'))
  },
  // Reset audio object mock data to the initial state
  _resetMock: function resetMock(audio) {
    audio._mock = Object.assign({}, global.window.HTMLMediaElement.prototype._mock)
  },
}

// Get "paused" value, it is automatically set to true / false when we play / pause the audio.
Object.defineProperty(global.window.HTMLMediaElement.prototype, 'paused', {
  get() {
    return this._mock.paused
  },
})

// Get and set audio currentTime
Object.defineProperty(global.window.HTMLMediaElement.prototype, 'currentTime', {
  get() {
    return this._mock.currentTime
  },
  set(value) {
    this._mock.currentTime = value
  },
})

// Get and set audio duration
Object.defineProperty(global.window.HTMLMediaElement.prototype, 'duration', {
  get() {
    return this._mock.duration
  },
  set(value) {
    // Reset the mock state to initial (paused) when we set the duration.
    this._mock._resetMock(this)
    this._mock.duration = value
  },
})

// Get and set audio buffered
Object.defineProperty(global.window.HTMLMediaElement.prototype, 'buffered', {
  get() {
    return this._mock.buffered
  },
  set(value) {
    this._mock.buffered = value
  },
})

// Start the playback.
global.window.HTMLMediaElement.prototype.play = function playMock() {
  if (!this._mock._loaded) {
    // emulate the audio file load and metadata initialization
    this._mock._load(this)
  }
  this._mock.paused = false
  this.dispatchEvent(new Event('play'))
  // Note: we could
}

// Pause the playback
global.window.HTMLMediaElement.prototype.pause = function pauseMock() {
  this._mock.paused = true
  this.dispatchEvent(new Event('pause'))
}
