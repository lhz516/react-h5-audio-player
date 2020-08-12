import React from 'react'
import { shallow } from 'enzyme'
import Duration from './Duration'

describe('Duration', () => {
  it('should call add/removeEventListener and change duration properly', () => {
    const wrapper = shallow(<Duration defaultDuration="00:00" audio={null} timeFormat="auto" />)
    expect(wrapper.state('duration')).toBe('00:00')

    const audio = new Audio()
    const audioAddEventListener = jest.spyOn(audio, 'addEventListener')
    const audioRemoveEventListener = jest.spyOn(audio, 'removeEventListener')
    wrapper.setProps({ audio })

    const handleAudioDurationChange = wrapper.instance().handleAudioDurationChange
    expect(audioAddEventListener).toHaveBeenCalledTimes(2)
    expect(audioAddEventListener).toHaveBeenCalledWith('durationchange', handleAudioDurationChange)
    expect(audioAddEventListener).toHaveBeenCalledWith('abort', handleAudioDurationChange)
    // @ts-ignore: error TS2540: Cannot assign to 'duration' because it is a read-only property.
    audio.duration = 18
    handleAudioDurationChange({ target: audio })

    expect(wrapper.state('duration')).toBe('00:18')

    wrapper.unmount()
    expect(audioRemoveEventListener).toHaveBeenCalledTimes(2)
    expect(audioRemoveEventListener).toHaveBeenCalledWith('durationchange', handleAudioDurationChange)
    expect(audioRemoveEventListener).toHaveBeenCalledWith('abort', handleAudioDurationChange)
  })

  it('should not throw when unmount even if no audio object passed in', () => {
    const wrapper = shallow(<Duration defaultDuration="00:00" audio={null} />)

    wrapper.setProps({ audio: null })
    expect(() => {
      wrapper.unmount()
    }).not.toThrow()
  })
})
