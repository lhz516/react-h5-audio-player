import { configure, addParameters } from '@storybook/react'
import { DocsPage, DocsContainer } from '@storybook/addon-docs/blocks'

function requireAll(requireContext) {
  console.log(requireContext)
  return requireContext.keys().map(requireContext);
}

configure(require.context('../stories', true, /\.stories\.(js|mdx)$/), module)

addParameters({
  docs: {
    container: DocsContainer,
    page: DocsPage,
  },
})
