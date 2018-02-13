import React from 'react'
import { storiesOf } from '@storybook/react'
import { withInfo } from '@storybook/addon-info'
import Player from '../src'

const SAMPLE_MP3_URL = 'https://ia802508.us.archive.org/5/items/testmp3testfile/mpthreetest.mp3'

storiesOf('Player', module)
  .add(
    'Basic',
    withInfo(`Basic usage
`)(() => <Player progressRefreshInterval={100} src={SAMPLE_MP3_URL} />),
  )
  .add(
    'Auto Play',
    withInfo(`Basic usage
`)(() => <Player autoPlay progressRefreshInterval={100} src={SAMPLE_MP3_URL} />),
  )
