export enum RHAP_UI {
  CURRENT_TIME = 'CURRENT_TIME',
  CURRENT_LEFT_TIME = 'CURRENT_LEFT_TIME',
  PROGRESS_BAR = 'PROGRESS_BAR',
  DURATION = 'DURATION',
  ADDITIONAL_CONTROLS = 'ADDITIONAL_CONTROLS',
  MAIN_CONTROLS = 'MAIN_CONTROLS',
  VOLUME_CONTROLS = 'VOLUME_CONTROLS',
  LOOP = 'LOOP',
  VOLUME = 'VOLUME',
}

export type AUDIO_PRELOAD_ATTRIBUTE = 'auto' | 'metadata' | 'none'

export type MAIN_LAYOUT = 'stacked' | 'stacked-reverse' | 'horizontal' | 'horizontal-reverse'

export type TIME_FORMAT = 'auto' | 'mm:ss' | 'hh:mm:ss'
