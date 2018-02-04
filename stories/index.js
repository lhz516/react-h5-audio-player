import React from 'react'
import { storiesOf } from '@storybook/react'
import { withInfo } from '@storybook/addon-info'
import Player from '../src'

storiesOf('Player', module)
  .add('Basic',
    withInfo(`Basic usage
`)(() => (
      <Player
        src="https://ia802508.us.archive.org/5/items/testmp3testfile/mpthreetest.mp3"
      />
    )),
  )
