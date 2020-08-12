import { getDisplayTimeBySeconds } from './utils'

describe('Utils', () => {
  it('should getDisplayTimeBySeconds correctly', () => {
    // timeFormat is auto
    expect(getDisplayTimeBySeconds(NaN, NaN, 'auto')).toBe(null)
    expect(getDisplayTimeBySeconds(0, 0, 'auto')).toBe('00:00')
    expect(getDisplayTimeBySeconds(0, 3600, 'auto')).toBe('0:00:00')
    expect(getDisplayTimeBySeconds(30, 60, 'auto')).toBe('00:30')
    expect(getDisplayTimeBySeconds(60, 300, 'auto')).toBe('01:00')
    expect(getDisplayTimeBySeconds(90, 180, 'auto')).toBe('01:30')
    expect(getDisplayTimeBySeconds(90, 4500, 'auto')).toBe('0:01:30')
    expect(getDisplayTimeBySeconds(1805, 2000, 'auto')).toBe('30:05')
    expect(getDisplayTimeBySeconds(3600, 4500, 'auto')).toBe('1:00:00')
    expect(getDisplayTimeBySeconds(5400, 5800, 'auto')).toBe('1:30:00')

    // timeFormat is mm:ss
    expect(getDisplayTimeBySeconds(NaN, NaN, 'mm:ss')).toBe(null)
    expect(getDisplayTimeBySeconds(0, 0, 'mm:ss')).toBe('00:00')
    expect(getDisplayTimeBySeconds(0, 3600, 'mm:ss')).toBe('00:00')
    expect(getDisplayTimeBySeconds(30, 60, 'mm:ss')).toBe('00:30')
    expect(getDisplayTimeBySeconds(60, 300, 'mm:ss')).toBe('01:00')
    expect(getDisplayTimeBySeconds(90, 180, 'mm:ss')).toBe('01:30')
    expect(getDisplayTimeBySeconds(90, 4500, 'mm:ss')).toBe('01:30')
    expect(getDisplayTimeBySeconds(1805, 2000, 'mm:ss')).toBe('30:05')
    expect(getDisplayTimeBySeconds(3600, 4500, 'mm:ss')).toBe('60:00')
    expect(getDisplayTimeBySeconds(5400, 5800, 'mm:ss')).toBe('90:00')

    // timeFormat is hh:mm:ss
    expect(getDisplayTimeBySeconds(NaN, NaN, 'hh:mm:ss')).toBe(null)
    expect(getDisplayTimeBySeconds(0, 0, 'hh:mm:ss')).toBe('0:00:00')
    expect(getDisplayTimeBySeconds(0, 3600, 'hh:mm:ss')).toBe('0:00:00')
    expect(getDisplayTimeBySeconds(30, 60, 'hh:mm:ss')).toBe('0:00:30')
    expect(getDisplayTimeBySeconds(60, 300, 'hh:mm:ss')).toBe('0:01:00')
    expect(getDisplayTimeBySeconds(90, 180, 'hh:mm:ss')).toBe('0:01:30')
    expect(getDisplayTimeBySeconds(90, 4500, 'hh:mm:ss')).toBe('0:01:30')
    expect(getDisplayTimeBySeconds(1805, 2000, 'hh:mm:ss')).toBe('0:30:05')
    expect(getDisplayTimeBySeconds(3600, 4500, 'hh:mm:ss')).toBe('1:00:00')
    expect(getDisplayTimeBySeconds(5400, 5800, 'hh:mm:ss')).toBe('1:30:00')
  })
})
