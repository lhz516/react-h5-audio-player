import { configure, addDecorator, setAddon } from '@storybook/react'
import infoAddon from '@storybook/addon-info'
import { setOptions } from '@storybook/addon-options'

setAddon(infoAddon)

configure(() => {
  require('../stories/index')
}, module)
