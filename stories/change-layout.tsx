import React, { useState } from 'react'
import AudioPlayer, { RHAP_UI } from '../src/index.tsx'
import { MAIN_LAYOUT } from '../src/constants.ts'

const expandedPlayerProps: {
  layout: MAIN_LAYOUT
  customControlsSection: RHAP_UI[]
  customProgressBarSection: RHAP_UI[]
} = {
  layout: 'stacked',
  customControlsSection: [RHAP_UI.CURRENT_TIME, RHAP_UI.CURRENT_LEFT_TIME],
  customProgressBarSection: [RHAP_UI.PROGRESS_BAR, RHAP_UI.MAIN_CONTROLS],
}

const ChangeLayout: React.FC = () => {
  const [config, setConfig] = useState({})

  const setStacked = () => setConfig(expandedPlayerProps)
  const setHorizontal = () => setConfig({})

  return (
    <div className="container">
      <button onClick={setStacked}>stacked</button>
      <button onClick={setHorizontal}>horizontal</button>

      <h1>Hello, audio player!</h1>
      <AudioPlayer
        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3"
        volume={0.5}
        layout="stacked-reverse"
        {...config}
      />
    </div>
  )
}

export default ChangeLayout
