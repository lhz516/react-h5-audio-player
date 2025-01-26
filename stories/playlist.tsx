import React, { Component } from 'react'
import AudioPlayer from '../src/index'

interface Track {
  src: string
  type: string
  additionalSrcs: [
    {
      src: string
      type: string
    }
  ]
}

interface PlaylistProps {
  playlist: Track[]
  useSourceElements?: boolean
}

interface PlayListState {
  currentMusicIndex: number
}

class PlayList extends Component<PlaylistProps, PlayListState> {
  playlist: Track[]
  useSourceElements?: boolean = false

  state = {
    currentMusicIndex: 0,
  }

  constructor(props: PlaylistProps) {
    super(props)
    this.playlist = props.playlist
    this.useSourceElements = props.useSourceElements
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

    return (
      <div>
        <p>currentMusicIndex: {currentMusicIndex}</p>

        {this.useSourceElements ? (
          <AudioPlayer
            onEnded={this.handleClickNext}
            autoPlayAfterSrcChange={true}
            showSkipControls={true}
            showJumpControls={false}
            onClickPrevious={this.handleClickPrevious}
            onClickNext={this.handleClickNext}
            srcKey={track.src}
            autoLoadAfterSrcChange={true}
          >
            <source src={track.src} type={track.type} />
            {track.additionalSrcs &&
              track.additionalSrcs.map(({ src, type }) => <source key={src} src={src} type={type} />)}
          </AudioPlayer>
        ) : (
          <AudioPlayer
            onEnded={this.handleClickNext}
            autoPlayAfterSrcChange={true}
            showSkipControls={true}
            showJumpControls={false}
            src={track.src}
            onClickPrevious={this.handleClickPrevious}
            onClickNext={this.handleClickNext}
          />
        )}
      </div>
    )
  }
}

export default PlayList
