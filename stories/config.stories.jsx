import { SAMPLE_MP3_URL } from './utils.js'
import AudioPlayer from '../src/index.tsx'
import React from 'react'

export default {
  title: 'Config',
  component: AudioPlayer,
}

export const ForwardAndBackwardJumpStep = {
  render: () => (
    <AudioPlayer
      progressJumpSteps={{
        forward: 30000,
        backward: 10000,
      }}
      src={SAMPLE_MP3_URL}
    />
  ),

  name: 'Forward and backward jump step',
  height: 'auto',
}

export const DeprecatedJumpStep = {
  render: () => <AudioPlayer progressJumpStep={10000} src={SAMPLE_MP3_URL} />,
  name: 'Deprecated jump step',
  height: 'auto',
}
