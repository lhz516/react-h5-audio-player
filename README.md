React H5 Audio Player
=========================

React audio player component with UI. It provides time indicator on both desktop and mobile devices. Inspired by [React Audio Player](https://github.com/justinmc/react-audio-player)


Flexbox design with CSS shapes. No extra dependencies.

![screenshot](./screenshot.png)

Supported browsers: Chrome, Firefox, Safari, Opera, Edge, IE (≥10)

## Installation

`npm i --save react-h5-audio-player`

## Usage

```jsx harmony
import AudioPlayer from 'react-h5-audio-player';

const Player = () => (
  <AudioPlayer
    autoPlay
    src="http://example.com/audio.mp3"
    onPlay={(e) => console.log('onPlay')}
    // other props here
  />
);
```

## Props

#### autoPlay {Bool}
Indicates if the audio will play automatically

#### src {String}
Indicates the audio file url

#### hidePlayer {Bool}
Indicates if the audio player is hidden.

#### listenInterval {Number} [10000]
Indicates how often to call the `onListened` prop during playback, in milliseconds.

#### onAbort {Function (event)}
Called when unloading the audio player, like when switching to a different src file. Passed the event.

#### onCanPlay {Function (event)}
Called when enough of the file has been downloaded to be able to start playing.

#### onEnded {Function (event)}
Called when playback has finished to the end of the file. Passed the event.

#### onError {Function (event)}
Called when the audio tag encounters an error. Passed the event.

#### onListen {Function (event)}
Called every `listenInterval` milliseconds during playback.

#### onPause {Function (event)}
Called when the user pauses playback. Passed the event.

#### onPlay {Function (event)}
Called when the user taps play.

#### onDragStart {Function (event)}
Called when the user start dragging the time indicator. Passed the event.

#### onDragMove {Function (event)}
Called when the user is dragging the time indicator. Passed the event.

#### onDragEnd {Function (event)}
Called when the user finish dragging the time indicator. Passed the event.

#### preload {String}
Indicates whether the browser should preload the media. See the [audio tag documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio) for details.

## Advanced Usage

### Access to the audio element
You can get direct access to the underlying audio element.  First get a ref to ReactAudioPlayer:

```jsx harmony
<ReactAudioPlayer
  ref={c => this.player = c}
/>
```

Then you can access the audio element like this:

`this.player.audio`
    
## How to contribute

Issues and PR's are welcome.
