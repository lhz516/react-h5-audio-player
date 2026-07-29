import React from 'react'

/**
 * Material Design Icons (https://github.com/Templarian/MaterialDesign), 24x24 grid.
 */
const ICON_PATHS = {
  'play-circle': 'M10 16.5v-9l6 4.5M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2',
  'pause-circle': 'M15 16h-2V8h2m-4 8H9V8h2m1-6A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2',
  'skip-previous': 'M6 18V6h2v12zm3.5-6L18 6v12z',
  'skip-next': 'M16 18h2V6h-2M6 18l8.5-6L6 6z',
  rewind: 'm11.5 12l8.5 6V6m-9 12V6l-8.5 6z',
  'fast-forward': 'M13 6v12l8.5-6M4 18l8.5-6L4 6z',
  repeat: 'M17 17H7v-3l-4 4l4 4v-3h12v-6h-2M7 7h10v3l4-4l-4-4v3H5v6h2z',
  'repeat-off':
    'M2 5.27L3.28 4L20 20.72L18.73 22l-3-3H7v3l-4-4l4-4v3h6.73L7 10.27V11H5V8.27zM17 13h2v4.18l-2-2zm0-8V2l4 4l-4 4V7H8.82l-2-2z',
  'volume-high':
    'M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.84-5 6.7v2.07c4-.91 7-4.49 7-8.77s-3-7.86-7-8.77M16.5 12c0-1.77-1-3.29-2.5-4.03V16c1.5-.71 2.5-2.24 2.5-4M3 9v6h4l5 5V4L7 9z',
  'volume-mute':
    'M3 9h4l5-5v16l-5-5H3zm13.59 3L14 9.41L15.41 8L18 10.59L20.59 8L22 9.41L19.41 12L22 14.59L20.59 16L18 13.41L15.41 16L14 14.59z',
} as const

export type IconName = keyof typeof ICON_PATHS

interface IconProps {
  name: IconName
}

const Icon: React.FC<IconProps> = ({ name }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
  >
    <path fill="currentColor" d={ICON_PATHS[name]} />
  </svg>
)

export default Icon
