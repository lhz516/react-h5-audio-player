import React, { PureComponent, ReactNode } from 'react'
import { getDisplayTimeBySeconds } from './utils'

interface CurrentTimeProps {
  audio?: HTMLAudioElement
  defaultCurrentTime: ReactNode
}

interface CurrentTimeState {
  currentTime: ReactNode
}

class CurrentTime extends PureComponent<CurrentTimeProps, CurrentTimeState> {
  hasAddedAudioEventListener = false

  state: CurrentTimeState = {
    currentTime: this.props.defaultCurrentTime,
  }

  handleAudioCurrentTimeChange = (e: Event): void => {
    const audio = e.target as HTMLAudioElement
    this.setState({ currentTime: getDisplayTimeBySeconds(audio.currentTime) })
  }

  componentDidUpdate(): void {
    const { audio } = this.props
    if (audio && !this.hasAddedAudioEventListener) {
      this.hasAddedAudioEventListener = true
      audio.addEventListener('timeupdate', this.handleAudioCurrentTimeChange)
      audio.addEventListener('loadedmetadata', this.handleAudioCurrentTimeChange)
    }
  }

  componentWillUnmount(): void {
    const { audio } = this.props
    audio.removeEventListener('timeupdate', this.handleAudioCurrentTimeChange)
    audio.removeEventListener('loadedmetadata', this.handleAudioCurrentTimeChange)
  }

  render(): React.ReactNode {
    return this.state.currentTime
  }
}

export default CurrentTime
