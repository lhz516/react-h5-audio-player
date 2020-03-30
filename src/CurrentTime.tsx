import React, { PureComponent, ReactNode } from 'react'
import { getDisplayTimeBySeconds } from './utils'

interface CurrentTimeProps {
  audio?: HTMLAudioElement
  defaultCurrentTime: ReactNode
  isLeftTime: boolean
}

interface CurrentTimeState {
  currentTime: ReactNode
}

class CurrentTime extends PureComponent<CurrentTimeProps, CurrentTimeState> {
  audio?: HTMLAudioElement

  hasAddedAudioEventListener = false

  state: CurrentTimeState = {
    currentTime: this.props.defaultCurrentTime,
  }

  handleAudioCurrentTimeChange = (e: Event): void => {
    const audio = e.target as HTMLAudioElement
    this.setState({
      currentTime: getDisplayTimeBySeconds(
        this.props.isLeftTime ? audio.duration - audio.currentTime : audio.currentTime
      ),
    })
  }

  componentDidUpdate(): void {
    const { audio } = this.props
    if (audio && !this.hasAddedAudioEventListener) {
      this.audio = audio
      this.hasAddedAudioEventListener = true
      audio.addEventListener('timeupdate', this.handleAudioCurrentTimeChange)
      audio.addEventListener('loadedmetadata', this.handleAudioCurrentTimeChange)
    }
  }

  componentWillUnmount(): void {
    if (this.audio && this.hasAddedAudioEventListener) {
      this.audio.removeEventListener('timeupdate', this.handleAudioCurrentTimeChange)
      this.audio.removeEventListener('loadedmetadata', this.handleAudioCurrentTimeChange)
    }
  }

  render(): React.ReactNode {
    return this.state.currentTime
  }
}

export default CurrentTime
