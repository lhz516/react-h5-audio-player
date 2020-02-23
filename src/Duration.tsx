import React, { Component } from 'react'
import { getDisplayTimeBySeconds } from './utils'

interface DurationProps {
  audio?: HTMLAudioElement
}

interface DurationState {
  DurationString: string
}

class Duration extends Component<DurationProps, DurationState> {
  hasAddedAudioEventListener = false

  state: DurationState = {
    DurationString: '--:--',
  }

  handleAudioDurationChange = (e: Event): void => {
    const audio = e.target as HTMLAudioElement
    this.setState({ DurationString: getDisplayTimeBySeconds(audio.duration) })
  }

  componentDidUpdate(): void {
    const { audio } = this.props
    if (audio && !this.hasAddedAudioEventListener) {
      this.hasAddedAudioEventListener = true
      audio.addEventListener('durationchange', this.handleAudioDurationChange)
    }
  }

  componentWillUnmount(): void {
    const { audio } = this.props
    audio.removeEventListener('durationchange', this.handleAudioDurationChange)
  }

  render(): React.ReactNode {
    return this.state.DurationString
  }
}

export default Duration
