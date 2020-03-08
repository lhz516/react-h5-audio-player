import React, { PureComponent, createRef } from 'react'
import AudioPlayer, { RHAP_UI } from '../src/index'
import { SAMPLE_MP3_URL } from './utils'

class VolumePercentage extends PureComponent<{}, { volumeText: string }> {
  player = createRef<AudioPlayer>()

  state = { volumeText: '100%' }

  componentDidMount(): void {
    this.player.current.audio.current.addEventListener('volumechange', (e) => {
      this.setState({ volumeText: `${((e.target as HTMLAudioElement).volume * 100).toFixed(0)}%` })
    })
  }

  render(): React.ReactNode {
    const { volumeText } = this.state
    return (
      <AudioPlayer
        ref={this.player}
        src={SAMPLE_MP3_URL}
        customVolumeControls={[RHAP_UI.VOLUME, <div key={2}>&nbsp;&nbsp;{volumeText}</div>]}
      />
    )
  }
}

export default VolumePercentage
