import React from 'react'
import { render } from '@testing-library/react'
import ProgressBar from './ProgressBar'

describe('ProgressBar component', () => {
	it('renders with provided audio element', () => {
		const audio = new Audio()
		const { getByRole } = render(
			// @ts-ignore forwardRef component usage placeholder
			React.createElement(ProgressBar, {
				audio,
				progressUpdateInterval: 100,
				showDownloadProgress: false,
				showFilledProgress: false,
				i18nProgressBar: 'progress bar',
			})
		)
		expect(getByRole('progressbar')).toBeInTheDocument()
	})
})

