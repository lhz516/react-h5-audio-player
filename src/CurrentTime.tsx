import React, { Component } from 'react'
import { getDisplayTimeBySeconds } from './utils'

interface CurrentTimeProps {
  audio?: HTMLAudioElement
}

interface CurrentTimeState {
  currentTimeString: string
}

class CurrentTime extends Component<CurrentTimeProps, CurrentTimeState> {
  hasAddedAudioEventListener = false

  state: CurrentTimeState = {
    currentTimeString: '--:--',
  }

  handleAudioCurrentTimeChange = (e: Event): void => {
    const audio = e.target as HTMLAudioElement
    this.setState({ currentTimeString: getDisplayTimeBySeconds(audio.currentTime) })
  }

  shouldComponentUpdate(nextProps: CurrentTimeProps, nextState: CurrentTimeState): boolean {
    return nextState.currentTimeString !== this.state.currentTimeString || nextProps.audio !== this.props.audio
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
    return this.state.currentTimeString
  }
}

export default CurrentTime
