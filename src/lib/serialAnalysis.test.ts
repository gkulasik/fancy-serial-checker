import { describe, expect, it } from 'vitest'
import { analyzeSerial } from './serialAnalysis'

describe('analyzeSerial format handling', () => {
  it('normalizes supported serial formats to the same digit payload', () => {
    const cases = ['12345678', 'A12345678', '12345678B', 'A12345678B']

    for (const serial of cases) {
      const analysis = analyzeSerial(serial)
      expect(analysis.validationMessage).toBeNull()
      expect(analysis.digits).toBe('12345678')
      expect(analysis.primaryMatch?.noteType).toBe('Ladder')
      expect(analysis.primaryMatch?.variation).toBe('TrueLadder: 8 Digit, 1-8')
    }
  })

  it('rejects unsupported formats', () => {
    const analysis = analyzeSerial('123456789')

    expect(analysis.validationMessage).toBe('Use 8 digits, A12345678, 12345678B, or A12345678B.')
    expect(analysis.digits).toBeNull()
    expect(analysis.matches).toEqual([])
    expect(analysis.isFancy).toBe(false)
  })
})

describe('analyzeSerial representative fancy-note detection', () => {
  it('detects low serials using the same variation labels as the Python tests', () => {
    const analysis = analyzeSerial('00000001')

    expect(analysis.primaryMatch?.noteType).toBe('Low Serial')
    expect(analysis.primaryMatch?.variation).toBe('0000000X')
  })

  it('detects high serials', () => {
    const analysis = analyzeSerial('99999912')

    expect(analysis.primaryMatch?.noteType).toBe('High Serial')
    expect(analysis.primaryMatch?.variation).toBe('999999XX')
  })

  it('detects super radar notes', () => {
    const analysis = analyzeSerial('27777772')

    expect(analysis.primaryMatch?.noteType).toBe('Radar')
    expect(analysis.primaryMatch?.variation).toBe('SuperRadar: 2777')
  })

  it('detects repeaters', () => {
    const analysis = analyzeSerial('12341234')

    expect(analysis.primaryMatch?.noteType).toBe('Repeater')
    expect(analysis.primaryMatch?.variation).toBe('Repeater: 1234')
  })

  it('detects valid date notes', () => {
    const analysis = analyzeSerial('20241125')

    expect(analysis.primaryMatch?.noteType).toBe('Date Note')
    expect(analysis.primaryMatch?.variation).toBe('YYYYMMDD: 2024-11-25')
  })
})

describe('analyzeSerial ladder behavior mirrored from the Python tests', () => {
  it('detects true ascending and descending ladders', () => {
    expect(analyzeSerial('A01234567B').primaryMatch?.variation).toBe('TrueLadder: 8 Digit, 0-7')
    expect(analyzeSerial('87654321B').primaryMatch?.variation).toBe('TrueLadder: 8 Digit, 8-1, Reverse')
    expect(analyzeSerial('A13456789B').primaryMatch?.variation).toBe('TrueLadder: 7 Digit, 3-9')
    expect(analyzeSerial('86543210').primaryMatch?.variation).toBe('TrueLadder: 7 Digit, 6-0, Reverse')
  })

  it('detects broken ladders with missing digits and intruding digits', () => {
    expect(analyzeSerial('12346789').primaryMatch?.variation).toBe('BrokenLadder: 8 Digit, 1-9, Missing: 5')
    expect(analyzeSerial('A01235678B').primaryMatch?.variation).toBe('BrokenLadder: 8 Digit, 0-8, Missing: 4')
    expect(analyzeSerial('98754321').primaryMatch?.variation).toBe('BrokenLadder: 8 Digit, 9-1, Reverse, Missing: 6')
    expect(analyzeSerial('12340567').primaryMatch?.variation).toBe('BrokenLadder: 8 Digit, 1-7, Intruding: 0')
  })

  it('prefers true ladders over broken-ladder interpretations', () => {
    const analysis = analyzeSerial('A12345678B')

    expect(analysis.primaryMatch?.noteType).toBe('Ladder')
    expect(analysis.primaryMatch?.variation).toBe('TrueLadder: 8 Digit, 1-8')
    expect(analysis.matches[0]?.title).toBe('True ladder')
  })

  it('does not flag non-ladders', () => {
    const analysis = analyzeSerial('13579246')

    expect(analysis.matches.some((match) => match.noteType === 'Ladder')).toBe(false)
    expect(analysis.primaryMatch).toBeNull()
    expect(analysis.isFancy).toBe(false)
  })
})

describe('analyzer priority', () => {
  it('keeps the service priority order when multiple analyzers match', () => {
    const analysis = analyzeSerial('11111111')

    expect(analysis.matches.length).toBeGreaterThan(1)
    expect(analysis.primaryMatch?.noteType).toBe('Solid')
    expect(analysis.matches.some((match) => match.noteType === 'Radar')).toBe(true)
    expect(analysis.matches.some((match) => match.noteType === 'Binary')).toBe(true)
  })
})
