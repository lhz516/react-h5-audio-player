# React H5 Audio Player

* Audio player component that provides consistent UI on different browsers.
* Flexbox layout with SVG icons. Mobile friendly.
* Accessibility supported, keyboards friendly.
* Written in TypeScript.

![screenshot](./screenshot.png)

Live Demo: [Storybook](https://static.hanzluo.com/react-h5-audio-player-storybook/index.html?path=/docs/layouts--default-story)

Supported browsers: Chrome, Firefox, Safari, Opera, Edge, IE (≥10)

## Installation

`$ npm i react-h5-audio-player`

Or

`$ yarn add react-h5-audio-player`

## Usage

```jsx
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
// import 'react-h5-audio-player/lib/styles.less' Use LESS
// import 'react-h5-audio-player/src/styles.scss' Use SASS

const Player = () => (
  <AudioPlayer
    autoPlay
    src="http://example.com/audio.mp3"
    onPlay={e => console.log("onPlay")}
    // other props here
  />
);
```

## Props

### HTML Audio Tag Native Attributes

| Props       |  Type   |  Default  | Note                 |
| ----------- | :-----: | :-------: | :-------------------:|
| src         | String  | ''        |                      |
| preload     | String  | 'auto'    |                      |
| autoPlay    | Boolean | false     | Won't work on mobile |
| loop        | Boolean | false     |                      |
| muted       | Boolean | false     |                      |
| loop        | Boolean | false     |                      |
| volume      | Number  | 1.0       | Won't work on mobile |
| crossOrigin | String  | undefined |                      |
| mediaGroup  | String  | undefined |                      |


More native attributes detail: [MDN Audio element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio)

The `controls` attribute defaults to `false` and should never be changed to `true` because this library is already providing UI.

### Other Props

#### showVolumeControl {Boolean} [true]

Show volume bar and mute button

#### showLoopControl {Boolean} [true]

Show loop toggle button

#### showSkipControls {Boolean} [false]

Show previous/Next buttons

#### showJumpControls {Boolean} [true]

Show Rewind/Forward buttons

#### onClickPrevious {Function (event)}

Called when click Previous button

#### onClickNext {Function (event)}

Called when click Next button

#### onPlayError {Function (error)}

Called when there's error clicking play button

#### progressJumpStep {Number} [5000]

Indicates the jump step when clicking rewind/forward button or left/right arrow key

#### volumeJumpStep {Number} [.1]

Indicates the jump step when pressing up/down arrow key

#### progressUpdateInterval {Number} [20]

Indicates the interval that the progress bar UI updates.

#### listenInterval {Number} [1000]

Indicates how often to call the `onListened` prop during playback, in milliseconds.

#### onAbort {Function (event)}

Called when unloading the audio player, like when switching to a different src file. Passed the event.

#### onCanPlay {Function (event)}

Called when enough of the file has been downloaded to be able to start playing.

#### onEnded {Function (event)}

Called when playback has finished to the end of the file. Passed the event.

#### onError {Function (event)}

Called when the audio tag encounters an error. Passed the event.

#### onListen {Function (currentTime)}

Called every `listenInterval` milliseconds during playback.

#### onPause {Function (event)}

Called when the user pauses playback. Passed the event.

#### onPlay {Function (event)}

Called when the user taps play.

## UI Overwrites

React H5 Audio Player provides built-in class names and SASS/LESS variables for developers to overwrite.

### SASS variables

- $rhap_theme-color: #868686 !default;
- $rhap_background-color: #fff !default;
- $rhap_bar-color: #e4e4e4 !default;
- $rhap_time-color: #333 !default;
- $rhap_font-family: inherit !default;

For LESS variables, just replace `$` with `@`.

## Advanced Usage

### Access to the audio element

You can get direct access to the underlying audio element. First get a ref to ReactAudioPlayer:

```jsx
<ReactAudioPlayer ref={c => (this.player = c)} /> // Use `createRef` also works
```

Then you can access the audio element like this:

`this.player.audio`

## Migrations

### Breaking changes from 1.x to 2.x

- Removed inline styles, import `css` or `scss` manually
- Removed props `hidePlayer` - Use parent logic to hide player
- Removed props `onDragStart`, `onDragMove`, `onDragEnd` - V2 isn't using drag events anymore

### Breaking changes from 0.x to 1.x

In 1.x, we use `prop-types` package instead of using it directly in React. Thus we dropped support under `react@15.5.0`. The usage will remain the same.


## How to contribute

Issues and PR's are welcome.

## Credits

- Inspired by [React Audio Player](https://github.com/justinmc/react-audio-player).
- Icon wrapper [iconify](https://iconify.design/)
- Icons [Material Design Icons](https://github.com/Templarian/MaterialDesign)
