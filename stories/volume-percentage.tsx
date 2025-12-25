import React, { useState, useCallback } from 'react'
import AudioPlayer, { RHAP_UI } from '../src/index'
import { SAMPLE_MP3_URL } from './utils'

const VolumePercentage: React.FC = () => {
  const [volumeText, setVolumeText] = useState('100%')

  const handleVolumeChange = useCallback((e: Event) => {
    const volume = (e.target as HTMLAudioElement).volume
    setVolumeText(`${(volume * 100).toFixed(0)}%`)
  }, [])

  return (
    <AudioPlayer
      src={SAMPLE_MP3_URL}
      onVolumeChange={handleVolumeChange}
      customVolumeControls={[RHAP_UI.VOLUME, <div key={2}>&nbsp;&nbsp;{volumeText}</div>]}
    />
  )
}

export default VolumePercentage
