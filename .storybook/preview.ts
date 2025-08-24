import { DocsPage, DocsContainer } from '@storybook/addon-docs/blocks'
import '../src/styles.scss'

export const parameters = {
  docs: {
    container: DocsContainer,
    page: DocsPage,
  },
}
export const tags = ['autodocs'];
