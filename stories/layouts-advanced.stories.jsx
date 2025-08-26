import { SAMPLE_MP3_URL } from './utils.js'
import VolumePercentage from './volume-percentage.tsx'
import AudioPlayer, { RHAP_UI } from '../src/index.tsx'
import ChangeLayout from './change-layout.tsx'
import React from 'react'

export default {
  title: 'Layouts - Advanced',
  component: AudioPlayer,
}

export const Stacked = {
  render: () => <AudioPlayer src={SAMPLE_MP3_URL} />,
  name: 'Stacked',
}

export const StackedReverse = {
  render: () => <AudioPlayer src={SAMPLE_MP3_URL} layout="stacked-reverse" />,
  name: 'Stacked Reverse',
}

export const Horizontal = {
  render: () => <AudioPlayer src={SAMPLE_MP3_URL} layout="horizontal" />,
  name: 'Horizontal',
}

export const HorizontalReverse = {
  render: () => <AudioPlayer src={SAMPLE_MP3_URL} layout="horizontal-reverse" />,
  name: 'Horizontal Reverse',
}

export const CustomProgressBarSection = {
  render: () => (
    <AudioPlayer
      src={SAMPLE_MP3_URL}
      customProgressBarSection={[RHAP_UI.PROGRESS_BAR, RHAP_UI.CURRENT_TIME, <div key="1">/</div>, RHAP_UI.DURATION]}
    />
  ),

  name: 'Custom progress bar section',
}

export const CustomControlsSection = {
  render: () => (
    <AudioPlayer
      src={SAMPLE_MP3_URL}
      customControlsSection={[
        <div key="1">This is an additional module in controls section</div>,
        RHAP_UI.ADDITIONAL_CONTROLS,
        RHAP_UI.MAIN_CONTROLS,
        RHAP_UI.VOLUME_CONTROLS,
      ]}
    />
  ),

  name: 'Custom controls section',
}

export const CustomAdditionalControls = {
  render: () => (
    <AudioPlayer
      src={SAMPLE_MP3_URL}
      customAdditionalControls={[
        RHAP_UI.LOOP,
        <button key="1">button 2 </button>,
        <button key="2">button 3 </button>,
        <button key="3">button 4 </button>,
      ]}
    />
  ),

  name: 'Custom additional controls',
}

export const CustomVolumeControls = {
  render: () => <VolumePercentage />,
  name: 'Custom volume controls',
}

export const MoveVolumeControlToProgressBarSection = {
  render: () => (
    <AudioPlayer
      src={SAMPLE_MP3_URL}
      customProgressBarSection={[
        RHAP_UI.CURRENT_TIME,
        <div key="1">/</div>,
        RHAP_UI.DURATION,
        RHAP_UI.PROGRESS_BAR,
        RHAP_UI.VOLUME,
      ]}
      customVolumeControls={[]}
    />
  ),

  name: 'Move Volume control to Progress bar section',
}

export const UseCurrentLeftTime = {
  render: () => (
    <AudioPlayer
      src={SAMPLE_MP3_URL}
      customProgressBarSection={[RHAP_UI.CURRENT_TIME, RHAP_UI.PROGRESS_BAR, RHAP_UI.CURRENT_LEFT_TIME]}
    />
  ),

  name: 'Use current left time',
}

export const ChangeLayoutStory = {
  render: () => <ChangeLayout />,
  name: 'Change Layout',
}
