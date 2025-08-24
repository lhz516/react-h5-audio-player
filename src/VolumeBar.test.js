import React from 'react'
import { render } from '@testing-library/react'
import VolumeBar from './VolumeBar'

describe('VolumeBar component', () => {
	it('renders with provided audio element', () => {
		const audio = new Audio()
		audio.volume = 0.5
		const { getByRole } = render(
			// @ts-ignore placeholder usage
			React.createElement(VolumeBar, {
				audio,
				volume: audio.volume,
				onMuteChange: () => {},
				showFilledVolume: false,
				i18nVolumeControl: 'volume',
			})
		)
		expect(getByRole('progressbar')).toBeInTheDocument()
	})
})

