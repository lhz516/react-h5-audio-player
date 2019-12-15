import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import Player from '../src'

const SAMPLE_MP3_URL = 'https://ia802508.us.archive.org/5/items/testmp3testfile/mpthreetest.mp3'

storiesOf('Player', module)
  .add('Basic', () => <Player showSkipControls src={SAMPLE_MP3_URL} volume={0.8} />)
  .add('Auto Play', () => <Player autoPlay progressUpdateInterval={100} src={SAMPLE_MP3_URL} />)
  .add('Hide Volume', () => <Player showVolumeControl={false} src={SAMPLE_MP3_URL} />)
  .add('Action Logger', () => (
    <div style={{ width: '90%' }}>
      <Player
        onAbort={action('onAbort')}
        onCanPlay={action('onCanPlay')}
        onCanPlayThrough={action('onCanPlayThrough')}
        onEnded={action('onEnded')}
        onError={action('onError')}
        onListen={action('onListen')}
        onPause={action('onPause')}
        onPlay={action('onPlay')}
        volume={1}
        progressUpdateInterval={100}
        src={SAMPLE_MP3_URL}
      />
    </div>
  ))
