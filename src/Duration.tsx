import React, { PureComponent, ReactNode } from 'react'
import { getDisplayTimeBySeconds } from './utils'

interface DurationProps {
  audio?: HTMLAudioElement
  defaultDuration: ReactNode
}

interface DurationState {
  duration: ReactNode
}

class Duration extends PureComponent<DurationProps, DurationState> {
  hasAddedAudioEventListener = false

  state: DurationState = {
    duration: this.props.defaultDuration,
  }

  handleAudioDurationChange = (e: Event): void => {
    const audio = e.target as HTMLAudioElement
    this.setState({ duration: getDisplayTimeBySeconds(audio.duration) })
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
    return this.state.duration
  }
}

export default Duration
