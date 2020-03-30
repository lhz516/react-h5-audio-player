import React from 'react'
import { shallow } from 'enzyme'
import { ProgressBar, ProgressBarForwardRef } from './ProgressBar'

jest.useFakeTimers()

describe('ProgressBar', () => {
  it('should call add/removeEventListener and change duration properly', () => {
    const mockRef = {
      current: {
        getBoundingClientRect: () => ({
          width: 60,
          left: 100,
        }),
      },
    }
    const wrapper = shallow(
      <ProgressBar
        showFilledProgress={true}
        showDownloadProgress={true}
        progressUpdateInterval={20}
        audio={null}
        progressBar={mockRef}
      />
    )
    expect(wrapper.state('currentTimePos')).toBe('0%')

    const instance = wrapper.instance()
    const audio = new Audio()
    const audioAddEventListener = jest.spyOn(audio, 'addEventListener')
    const audioRemoveEventListener = jest.spyOn(audio, 'removeEventListener')
    wrapper.setProps({ audio })
    expect(audioAddEventListener).toHaveBeenCalledTimes(2)
    expect(audioAddEventListener).toHaveBeenNthCalledWith(1, 'timeupdate', instance.handleAudioTimeUpdate)
    expect(audioAddEventListener).toHaveBeenNthCalledWith(2, 'progress', instance.handleAudioDownloadProgressUpdate)

    audio.src = 'https://song.mp3'
    audio.currentTime = 14
    audio.duration = 28
    audio.buffered = {
      length: 1,
      start: () => 0,
      end: () => 50,
    }

    const mockMouseEvent = new MouseEvent(null)
    const mockSyntheticEvent = {
      nativeEvent: mockMouseEvent,
      stopPropagation: () => {},
      preventDefault: () => {},
      target: audio,
    }
    mockMouseEvent.pageX = 50

    global.window.getSelection = () => ({ type: 'Range', empty: () => {} })

    instance.handleAudioDownloadProgressUpdate(mockSyntheticEvent)
    instance.handleMouseDownOrTouchStartProgressBar(mockSyntheticEvent)
    instance.handleWindowMouseOrTouchMove(mockMouseEvent)
    instance.handleWindowMouseOrTouchUp(mockMouseEvent)
    instance.handleAudioTimeUpdate(mockSyntheticEvent)
    expect(wrapper.state('currentTimePos')).toBe('0.00%')

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
    instance.handleMouseDownOrTouchStartProgressBar(mockSyntheticEvent)

    // Cover infinite currentTime branch in handleMouseDownOrTouchStartProgressBar
    jest.spyOn(instance, 'getCurrentProgress').mockReturnValue({ currentTime: NaN, currentTimePos: '0%' })
    instance.handleMouseDownOrTouchStartProgressBar(mockSyntheticEvent)

    // Cover getSelection returns null branch in handleWindowMouseOrTouchMove
    global.window.getSelection = () => null
    instance.handleWindowMouseOrTouchMove(mockMouseEvent)

    // Cover isDraggingProgress: false branch in handleWindowMouseOrTouchMove and handleAudioTimeUpdate
    wrapper.setState({ isDraggingProgress: false })
    instance.handleWindowMouseOrTouchMove(mockMouseEvent)
    wrapper.setState({ isDraggingProgress: true })
    jest.runOnlyPendingTimers()
    instance.handleAudioTimeUpdate(mockSyntheticEvent)
    expect(wrapper.state('currentTimePos')).toBe('0%')

    // Cover isFinite checking branch in handleWindowMouseOrTouchUp TODO: fix
    instance.timeOnMouseMove = NaN
    instance.handleWindowMouseOrTouchUp(mockMouseEvent)
    expect(audio.currentTime).toBe(0)

    expect(wrapper.find('.rhap_progress-bar-show-download')).toHaveLength(1)
    wrapper.setProps({ showDownloadProgress: false })
    expect(wrapper.find('.rhap_progress-bar-show-download')).toHaveLength(0)

    expect(wrapper.find('.rhap_progress-filled')).toHaveLength(1)
    wrapper.setProps({ showFilledProgress: false })
    expect(wrapper.find('.rhap_progress-filled')).toHaveLength(0)

    wrapper.unmount()
    expect(audioRemoveEventListener).toHaveBeenCalledTimes(2)
    expect(audioAddEventListener).toHaveBeenNthCalledWith(1, 'timeupdate', instance.handleAudioTimeUpdate)
    expect(audioAddEventListener).toHaveBeenNthCalledWith(2, 'progress', instance.handleAudioDownloadProgressUpdate)
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
    const wrapper = shallow(
      <ProgressBar
        showFilledProgress={true}
        showDownloadProgress={true}
        progressUpdateInterval={20}
        audio={null}
        progressBar={mockRef}
      />
    )
    expect(wrapper.state('currentTimePos')).toBe('0%')

    const instance = wrapper.instance()
    const audio = new Audio()

    audio.src = 'https://song.mp3'
    audio.currentTime = 14
    audio.duration = 28
    audio.buffered = {
      length: 1,
      start: () => 20,
      end: () => 50,
    }
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

    instance.handleAudioDownloadProgressUpdate(mockSyntheticEvent)
    instance.handleMouseDownOrTouchStartProgressBar(mockSyntheticEvent)
    instance.handleWindowMouseOrTouchMove(mockTouchEvent)
    instance.handleWindowMouseOrTouchUp(mockTouchEvent)

    audio.duration = NaN
    audio.buffered = {
      length: 1,
      start: () => 0,
      end: () => 50,
    }
    instance.handleAudioDownloadProgressUpdate(mockSyntheticEvent)

    expect(wrapper.state('hasDownloadProgressAnimation')).toBe(true)
    jest.runOnlyPendingTimers()
    expect(wrapper.state('hasDownloadProgressAnimation')).toBe(false)
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
    const wrapper = shallow(
      <ProgressBar
        showFilledProgress={true}
        showDownloadProgress={true}
        progressUpdateInterval={20}
        audio={null}
        progressBar={mockRef}
      />
    )
    expect(wrapper.state('currentTimePos')).toBe('0%')

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

    instance.handleMouseDownOrTouchStartProgressBar(mockSyntheticEvent)
    expect(wrapper.state('currentTimePos')).toBe('0%')
  })

  it('should not throw when unmount even if no audio object passed in', () => {
    const wrapper = shallow(
      <ProgressBar
        showFilledProgress={true}
        showDownloadProgress={true}
        progressUpdateInterval={20}
        audio={null}
        progressBar={{}}
      />
    )

    wrapper.setProps({ audio: null })
    expect(() => {
      wrapper.unmount()
    }).not.toThrow()
  })

  it('should render the forwardRef wrapper', () => {
    expect(() => {
      shallow(<ProgressBarForwardRef />)
    }).not.toThrow()
  })
})
