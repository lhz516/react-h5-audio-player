import React from 'react'
import { shallow } from 'enzyme'
import VolumeBar from './VolumeBar'

jest.useFakeTimers()

describe('VolumeBar', () => {
  it('should call add/removeEventListener and change duration properly', () => {
    const mockRef = {
      current: {
        getBoundingClientRect: () => ({
          width: 60,
          left: 100,
        }),
      },
    }
    const wrapper = shallow(<VolumeBar audio={null} volumeBar={mockRef} showFilledVolume={true} />)
    expect(wrapper.state('currentVolumePos')).toBe('0.00%')

    const instance = wrapper.instance()
    const audio = new Audio()
    const audioAddEventListener = jest.spyOn(audio, 'addEventListener')
    const audioRemoveEventListener = jest.spyOn(audio, 'removeEventListener')
    wrapper.setProps({ audio })
    expect(audioAddEventListener).toHaveBeenCalledTimes(1)
    expect(audioAddEventListener).toHaveBeenNthCalledWith(1, 'volumechange', instance.handleAudioVolumeChange)

    audio.src = 'https://song.mp3'

    const mockMouseEvent = new MouseEvent(null)
    const mockSyntheticEvent = {
      nativeEvent: mockMouseEvent,
      stopPropagation: () => {},
      preventDefault: () => {},
      target: audio,
    }
    mockMouseEvent.pageX = 50

    global.window.getSelection = () => ({ type: 'Range', empty: () => {} })

    instance.handleVolumnControlMouseOrTouchDown(mockSyntheticEvent)
    instance.handleWindowMouseOrTouchMove(mockMouseEvent)
    instance.handleWindowMouseOrTouchUp(mockMouseEvent)
    instance.handleAudioVolumeChange(mockSyntheticEvent)
    expect(wrapper.state('currentVolumePos')).toBe('100.00%')

    // Cover relativePos < maxRelativePos branch in getCurrentProgress
    wrapper.setProps({
      progressBar: {
        current: {
          getBoundingClientRect: () => ({
            width: 100,
            left: 40,
          }),
        },
      },
    })
    instance.handleVolumnControlMouseOrTouchDown(mockSyntheticEvent)

    // Cover getSelection returns null branch in handleWindowMouseOrTouchMove
    global.window.getSelection = () => null
    instance.handleWindowMouseOrTouchMove(mockMouseEvent)

    // Cover isDraggingProgress: false branch in handleWindowMouseOrTouchMove and handleAudioVolumeChange
    wrapper.setState({ isDraggingProgress: false })
    instance.handleWindowMouseOrTouchMove(mockMouseEvent)
    wrapper.setState({ isDraggingProgress: true })
    jest.runOnlyPendingTimers()
    instance.handleAudioVolumeChange(mockSyntheticEvent)
    expect(wrapper.state('currentVolumePos')).toBe('100.00%')

    wrapper.unmount()
    expect(audioRemoveEventListener).toHaveBeenCalledTimes(1)
    expect(audioAddEventListener).toHaveBeenNthCalledWith(1, 'volumechange', instance.handleAudioVolumeChange)
  })

  it('should handle touch events properly', () => {
    const mockRef = {
      current: {
        getBoundingClientRect: () => ({
          width: 20,
          left: 20,
        }),
      },
    }
    const wrapper = shallow(<VolumeBar audio={null} progressBar={mockRef} showFilledVolume={true} />)
    expect(wrapper.state('currentVolumePos')).toBe('0.00%')

    const instance = wrapper.instance()
    const audio = new Audio()

    audio.src = 'https://song.mp3'
    wrapper.setProps({ audio })

    const mockTouchEvent = {
      preventDefault: () => {},
      stopPropagation: () => {},
      touches: [{ pageX: 50 }],
    }
    const mockSyntheticEvent = {
      nativeEvent: mockTouchEvent,
      stopPropagation: () => {},
      preventDefault: () => {},
      target: audio,
    }
    global.window.getSelection = () => ({ type: 'Range', empty: () => {} })

    instance.handleVolumnControlMouseOrTouchDown(mockSyntheticEvent)
    instance.handleWindowMouseOrTouchMove(mockTouchEvent)
    instance.handleWindowMouseOrTouchUp(mockTouchEvent)
  })

  it('should set current time position to 0% when no src is provided', () => {
    const mockRef = {
      current: {
        getBoundingClientRect: () => ({
          width: 20,
          left: 20,
        }),
      },
    }
    const wrapper = shallow(<VolumeBar audio={null} progressBar={mockRef} showFilledVolume={true} />)
    expect(wrapper.state('currentVolumePos')).toBe('0.00%')

    const instance = wrapper.instance()
    const audio = new Audio()
    wrapper.setProps({ audio })

    audio.currentTime = 14
    audio.duration = 28

    const mockMouseEvent = new MouseEvent(null)
    const mockSyntheticEvent = {
      nativeEvent: mockMouseEvent,
      stopPropagation: () => {},
      preventDefault: () => {},
      target: audio,
    }
    mockMouseEvent.pageX = 50

    global.window.getSelection = () => ({ type: 'Range', empty: () => {} })

    instance.handleVolumnControlMouseOrTouchDown(mockSyntheticEvent)
    expect(wrapper.state('currentVolumePos')).toBe('0.00%')
  })

  it('should not throw when unmount even if no audio object passed in', () => {
    const wrapper = shallow(<VolumeBar audio={null} showFilledVolume={true} />)

    wrapper.setProps({ audio: null })
    expect(() => {
      wrapper.unmount()
    }).not.toThrow()
  })
})
