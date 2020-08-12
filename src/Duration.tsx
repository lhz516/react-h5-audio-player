import React, { PureComponent, ReactNode } from 'react'
import { TIME_FORMAT } from './constants'
import { getDisplayTimeBySeconds } from './utils'

interface DurationProps {
  audio?: HTMLAudioElement
  defaultDuration: ReactNode
  timeFormat: TIME_FORMAT
}

interface DurationState {
  duration: ReactNode
}

class Duration extends PureComponent<DurationProps, DurationState> {
  audio?: HTMLAudioElement

  hasAddedAudioEventListener = false

  state: DurationState = {
    duration: this.props.defaultDuration,
  }

  handleAudioDurationChange = (e: Event): void => {
    const audio = e.target as HTMLAudioElement
    const { timeFormat, defaultDuration } = this.props
    this.setState({
      duration: getDisplayTimeBySeconds(audio.duration, audio.duration, timeFormat) || defaultDuration,
    })
  }

  componentDidUpdate(): void {
    const { audio } = this.props
    if (audio && !this.hasAddedAudioEventListener) {
      this.audio = audio
      this.hasAddedAudioEventListener = true
      audio.addEventListener('durationchange', this.handleAudioDurationChange)
      audio.addEventListener('abort', this.handleAudioDurationChange)
    }
  }

  componentWillUnmount(): void {
    if (this.audio && this.hasAddedAudioEventListener) {
      this.audio.removeEventListener('durationchange', this.handleAudioDurationChange)
      this.audio.removeEventListener('abort', this.handleAudioDurationChange)
    }
  }

  render(): React.ReactNode {
    return this.state.duration
  }
}

export default Duration
