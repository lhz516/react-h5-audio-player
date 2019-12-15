import { configure, addDecorator } from '@storybook/react'
import { configureActions } from '@storybook/addon-actions';
import { withInfo } from '@storybook/addon-info'

// Docs: https://github.com/storybooks/storybook/tree/master/addons/info
addDecorator(
  withInfo({
    header: true,
  }),
)

configure(() => {
  require('../stories/index')
}, module)
