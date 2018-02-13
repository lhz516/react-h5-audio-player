import { configure } from '@storybook/react'
import { setDefaults } from '@storybook/addon-info'

// Docs: https://github.com/storybooks/storybook/tree/master/addons/info
setDefaults({
  header: true,
})

configure(() => {
  require('../stories/index')
}, module)
