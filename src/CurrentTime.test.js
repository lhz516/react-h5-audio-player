import React from 'react'
import { shallow } from 'enzyme'
import CurrentTime from './CurrentTime'

describe('CurrentTime', () => {
  it('should call add/removeEventListener and change currentTime properly', () => {
    const wrapper = shallow(<CurrentTime defaultCurrentTime="00:00" audio={null} timeFormat="auto" />)
    expect(wrapper.state('currentTime')).toBe('00:00')

    const audio = new Audio()
    const audioAddEventListener = jest.spyOn(audio, 'addEventListener')
    const audioRemoveEventListener = jest.spyOn(audio, 'removeEventListener')
    wrapper.setProps({ audio })

    const handleAudioCurrentTimeChange = wrapper.instance().handleAudioCurrentTimeChange
    expect(audioAddEventListener).toHaveBeenCalledTimes(2)
    expect(audioAddEventListener).toHaveBeenNthCalledWith(1, 'timeupdate', handleAudioCurrentTimeChange)
    expect(audioAddEventListener).toHaveBeenNthCalledWith(2, 'loadedmetadata', handleAudioCurrentTimeChange)
    audio.currentTime = 12
    handleAudioCurrentTimeChange({ target: audio })

    expect(wrapper.state('currentTime')).toBe('00:12')

    wrapper.unmount()
    expect(audioRemoveEventListener).toHaveBeenCalledTimes(2)
    expect(audioRemoveEventListener).toHaveBeenNthCalledWith(1, 'timeupdate', handleAudioCurrentTimeChange)
    expect(audioRemoveEventListener).toHaveBeenNthCalledWith(2, 'loadedmetadata', handleAudioCurrentTimeChange)
  })

  it('should not throw when unmount even if no audio object passed in', () => {
    const wrapper = shallow(<CurrentTime defaultCurrentTime="00:00" audio={null} />)

    wrapper.setProps({ audio: null })
    expect(() => {
      wrapper.unmount()
    }).not.toThrow()
  })
})
