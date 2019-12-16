import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import Player from '../src'

import '../src/styles.scss'

const SAMPLE_MP3_URL = 'https://ia802508.us.archive.org/5/items/testmp3testfile/mpthreetest.mp3'

storiesOf('Player', module)
  .add('Default', () => <Player src={SAMPLE_MP3_URL} />)
  .add('Auto Play', () => <Player autoPlay src={SAMPLE_MP3_URL} />)
  .add('Show Skip Controls', () => <Player showSkipControls src={SAMPLE_MP3_URL} />)
  .add('Hide Volume', () => <Player showVolumeControl={false} src={SAMPLE_MP3_URL} />)
  .add('Update Interval', () => (
    <div>
      <p>10ms</p>
      <Player autoPlay progressUpdateInterval={10} src={SAMPLE_MP3_URL} />
      <p>100ms</p>
      <Player autoPlay progressUpdateInterval={100} src={SAMPLE_MP3_URL} muted />
      <p>1000ms</p>
      <Player autoPlay progressUpdateInterval={1000} src={SAMPLE_MP3_URL} muted />
      <p>2000ms</p>
      <Player autoPlay progressUpdateInterval={2000} src={SAMPLE_MP3_URL} muted />
    </div>
  ))
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
        onClickPrevious={action('onClickPrevious')}
        onClickNext={action('onClickNext')}
        volume={1}
        showSkipControls
        progressUpdateInterval={100}
        src={SAMPLE_MP3_URL}
      />
    </div>
  ))
  .add('No src', () => <Player />)
