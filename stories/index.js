import React from 'react'
import { storiesOf } from '@storybook/react'
import { withInfo } from '@storybook/addon-info'
import { action } from '@storybook/addon-actions'
import Player from '../src'

const SAMPLE_MP3_URL = 'https://ia802508.us.archive.org/5/items/testmp3testfile/mpthreetest.mp3'

storiesOf('Player', module)
  .add(
    'Basic',
    withInfo(`Basic usage
`)(() => <Player src={SAMPLE_MP3_URL} volume={0.8} />),
  )
  .add(
    'Auto Play',
    withInfo(`Auto Play
`)(() => <Player autoPlay progressUpdateInterval={100} src={SAMPLE_MP3_URL} />),
  )
  .add(
    'Action Logger',
    withInfo(`Auto Play
`)(() => (
      <Player
        onAbort={action('onAbort')}
        onCanPlay={action('onCanPlay')}
        onCanPlayThrough={action('onCanPlayThrough')}
        onEnded={action('onEnded')}
        onError={action('onError')}
        onListen={action('onListen')}
        onPause={action('onPause')}
        onPlay={action('onPlay')}
        onDragStart={action('onDragStart')}
        onDragMove={action('onDragMove')}
        onDragEnd={action('onDragEnd')}
        progressUpdateInterval={100}
        src={SAMPLE_MP3_URL}
      />
    )),
  )
