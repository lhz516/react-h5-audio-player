import React from 'react'
import { render } from '@testing-library/react'
import Duration from './Duration'

describe('Duration component', () => {
	it('renders with null default (no crash)', () => {
		const { container } = render(
			// @ts-ignore testing JS placeholder
			React.createElement(Duration, { defaultDuration: null, timeFormat: 'auto' })
		)
		expect(container).toBeTruthy()
	})
})

