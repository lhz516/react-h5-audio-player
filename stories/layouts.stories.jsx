import { SAMPLE_MP3_URL } from './utils.js'
import AudioPlayer from '../src/index.tsx'
import React from 'react'

const sampleIcon = (
  <svg role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <title>asciinema icon</title>
    <path d="M1.61 0V24L22.39 12L1.61 0M5.76 7.2L10.06 9.68L5.76 12.16V7.2M12.55 11.12L14.08 12L5.76 16.8V15.04L12.55 11.12Z"></path>
  </svg>
)

export default {
  title: 'Layouts',
  component: AudioPlayer,
}

export const Default = {
  render: () => <AudioPlayer src={SAMPLE_MP3_URL} />,
  name: 'Default',
}

export const Width = {
  render: () => (
    <div>
      <p>300px</p>
      <AudioPlayer
        style={{
          width: '300px',
        }}
        src={SAMPLE_MP3_URL}
      />
      <p>400px</p>
      <AudioPlayer
        style={{
          width: '400px',
        }}
        src={SAMPLE_MP3_URL}
      />
      <p>500px</p>
      <AudioPlayer
        style={{
          width: '500px',
        }}
        src={SAMPLE_MP3_URL}
      />
      <p>600px</p>
      <AudioPlayer
        style={{
          width: '600px',
        }}
        src={SAMPLE_MP3_URL}
      />
      <p>100%</p>
      <AudioPlayer src={SAMPLE_MP3_URL} />
    </div>
  ),

  name: 'Width',
  height: '700px',
}

export const ShowSkipControls = {
  render: () => <AudioPlayer src={SAMPLE_MP3_URL} showSkipControls={true} />,
  name: 'Show Skip Controls',
}

export const ShowJumpControlsAndShowSkipControls = {
  render: () => <AudioPlayer src={SAMPLE_MP3_URL} showSkipControls={true} showJumpControls={false} />,
  name: 'Show Jump Controls and Show Skip Controls',
}

export const HideAllControls = {
  render: () => <AudioPlayer src={SAMPLE_MP3_URL} showJumpControls={false} />,
  name: 'Hide all Controls',
}

export const HideVolume = {
  render: () => <AudioPlayer src={SAMPLE_MP3_URL} customVolumeControls={[]} />,
  name: 'Hide Volume',
}

export const HideLoopButton = {
  render: () => <AudioPlayer src={SAMPLE_MP3_URL} customAdditionalControls={[]} />,
  name: 'Hide Loop Button',
}

export const HideDownloadProgress = {
  render: () => <AudioPlayer src={SAMPLE_MP3_URL} showDownloadProgress={false} />,
  name: 'Hide Download Progress',
}

export const CustomDefaultCurrentTimeAndDuration = {
  render: () => <AudioPlayer src={SAMPLE_MP3_URL} defaultCurrentTime="Loading" defaultDuration="Loading" />,

  name: 'Custom default current time and duration',
}

export const HideFilledProgress = {
  render: () => <AudioPlayer src={SAMPLE_MP3_URL} showFilledProgress={false} />,
  name: 'Hide filled progress',
}

export const ShowHeaderAndFooter = {
  render: () => <AudioPlayer src={SAMPLE_MP3_URL} header="Now playing: Let it go!" footer="This is a footer" />,

  name: 'Show header and footer',
}

export const CustomIcons = {
  render: () => (
    <AudioPlayer
      src={SAMPLE_MP3_URL}
      defaultCurrentTime="Loading"
      defaultDuration="Loading"
      customIcons={{
        play: sampleIcon,
      }}
    />
  ),

  name: 'Custom icons',
}
