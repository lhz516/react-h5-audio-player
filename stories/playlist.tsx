import React, { Component } from 'react'
import AudioPlayer from '../src/index'

interface AudioSource {
  src: string
  type?: string
}

interface PlaylistProps {
  playlist: string[] | AudioSource[][]
}

interface PlayListState {
  currentMusicIndex: number
}

class PlayList extends Component<PlaylistProps, PlayListState> {
  playlist: string[] | AudioSource[][]

  state = {
    currentMusicIndex: 0,
  }

  constructor(props: PlaylistProps) {
    super(props)
    this.playlist = props.playlist
  }

  handleClickPrevious = (): void => {
    this.setState((prevState) => ({
      currentMusicIndex: prevState.currentMusicIndex === 0 ? this.playlist.length - 1 : prevState.currentMusicIndex - 1,
    }))
  }

  handleClickNext = (): void => {
    this.setState((prevState) => ({
      currentMusicIndex: prevState.currentMusicIndex < this.playlist.length - 1 ? prevState.currentMusicIndex + 1 : 0,
    }))
  }

  render(): React.ReactNode {
    const { currentMusicIndex } = this.state
    const track = this.playlist[currentMusicIndex]
    const singleStringSrc = typeof track === 'string' ? track : null
    const multipleSrcs: AudioSource[] | null = Array.isArray(track) ? track : null

    return (
      <div>
        <p>currentMusicIndex: {currentMusicIndex}</p>

        <AudioPlayer
          onEnded={this.handleClickNext}
          autoPlayAfterSrcChange={true}
          showSkipControls={true}
          showJumpControls={false}
          onClickPrevious={this.handleClickPrevious}
          onClickNext={this.handleClickNext}
          {...(singleStringSrc ? { src: singleStringSrc } : {})}
        >
          {multipleSrcs && multipleSrcs.map(({ src, type }) => <source key={src} src={src} type={type} />)}
        </AudioPlayer>
      </div>
    )
  }
}

export default PlayList
