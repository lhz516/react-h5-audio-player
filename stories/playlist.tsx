import React, { Component } from 'react'
import AudioPlayer from '../src/index'

const playlist = [
  { name: 'SoundHelix-Song-9', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3' },
  { name: 'SoundHelix-Song-4', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
  { name: 'SoundHelix-Song-8', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' },
]

interface PlayListState {
  currentMusicIndex: number
}

class PlayList extends Component<null, PlayListState> {
  state = {
    currentMusicIndex: 0,
  }

  handleClickPrevious = (): void => {
    this.setState((prevState) => ({
      currentMusicIndex: prevState.currentMusicIndex === 0 ? playlist.length - 1 : prevState.currentMusicIndex - 1,
    }))
  }

  handleClickNext = (): void => {
    this.setState((prevState) => ({
      currentMusicIndex: prevState.currentMusicIndex < playlist.length - 1 ? prevState.currentMusicIndex + 1 : 0,
    }))
  }

  render(): React.ReactNode {
    const { currentMusicIndex } = this.state
    return (
      <div>
        <p>currentMusicIndex: {currentMusicIndex}</p>
        <AudioPlayer
          onEnded={this.handleClickNext}
          autoPlayAfterSrcChange={true}
          showSkipControls={true}
          showJumpControls={false}
          src={playlist[currentMusicIndex].src}
          onClickPrevious={this.handleClickPrevious}
          onClickNext={this.handleClickNext}
        />
      </div>
    )
  }
}

export default PlayList
