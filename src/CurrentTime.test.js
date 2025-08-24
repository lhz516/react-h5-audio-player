import React from 'react'
import { render } from '@testing-library/react'
import CurrentTime from './CurrentTime'

describe('CurrentTime component', () => {
	it('renders with default current time (placeholder)', () => {
		const { container } = render(
			// @ts-ignore testing JS placeholder
			React.createElement(CurrentTime, { defaultCurrentTime: null, isLeftTime: false, timeFormat: 'auto' })
		)
		expect(container).toBeTruthy()
	})
})

