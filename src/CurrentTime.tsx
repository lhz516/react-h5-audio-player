import React, { PureComponent, ReactNode } from 'react'
import { TIME_FORMAT } from './constants'
import { getDisplayTimeBySeconds } from './utils'

interface CurrentTimeProps {
  audio?: HTMLAudioElement
  defaultCurrentTime: ReactNode
  isLeftTime: boolean
  timeFormat: TIME_FORMAT
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
    const { isLeftTime, timeFormat, defaultCurrentTime } = this.props
    this.setState({
      currentTime:
        getDisplayTimeBySeconds(
          isLeftTime ? audio.duration - audio.currentTime : audio.currentTime,
          audio.duration,
          timeFormat
        ) || defaultCurrentTime,
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
