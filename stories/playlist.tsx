import React, { Component } from 'react'
import AudioPlayer from '../src/index'

const playlist = [
  { name: '枝芽', src: 'https://hanzluo.s3-us-west-1.amazonaws.com/music/zhiya.mp3' },
  { name: '自由女神', src: 'https://hanzluo.s3-us-west-1.amazonaws.com/music/ziyounvshen.mp3' },
  { name: '无雨无晴', src: 'https://hanzluo.s3-us-west-1.amazonaws.com/music/wuyuwuqing.mp3' },
  { name: '碎片', src: 'https://hanzluo.s3-us-west-1.amazonaws.com/music/suipian.mp3' },
  { name: '永恒的港湾', src: 'https://hanzluo.s3-us-west-1.amazonaws.com/music/yonghengdegangwan.mp3' },
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
