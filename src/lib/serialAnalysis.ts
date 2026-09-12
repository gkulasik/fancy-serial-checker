export type SpecialSerialType =
  | 'Date Note'
  | 'Low Serial'
  | 'High Serial'
  | 'Seven of a Kind'
  | 'Six of a Kind'
  | 'Solid'
  | 'Binary'
  | 'Repeater'
  | 'Flipper'
  | 'Ladder'
  | 'Radar'
  | 'QuadDouble'

export type SerialFormat =
  | '8 digits'
  | 'Letter + 8 digits'
  | '8 digits + letter'
  | 'Letter + 8 digits + letter'

export interface FancyMatch {
  analyzerName: string
  noteType: SpecialSerialType
  variation: string
  title: string
  explanation: string
}

export interface SerialAnalysis {
  rawInput: string
  normalized: string
  digits: string | null
  format: SerialFormat | null
  validationMessage: string | null
  matches: FancyMatch[]
  primaryMatch: FancyMatch | null
  isFancy: boolean
}

interface AnalyzerDef {
  name: string
  analyze: (digits: string) => FancyMatch | null
}

interface LadderInfo {
  startDigit: number
  endDigit: number
  length: number
  isReverse: boolean
  intrudingDigit?: number | null
  missingDigit?: number | null
}

export interface ExampleSerial {
  label: string
  serial: string
  hint: string
}

export interface SupportedPattern {
  title: string
  sample: string
  description: string
}

const validFormatsMessage = 'Use 8 digits, A12345678, 12345678B, or A12345678B.'

export const analyzerPriority = [
  'Low Serial',
  'High Serial',
  'Solid',
  'QuadDouble',
  'Ladder',
  'Radar',
  'Flipper',
  'Binary',
  'Repeater',
  'Seven of a Kind',
  'Six of a Kind',
  'Date Note',
] as const

export const exampleSerials: ExampleSerial[] = [
  {
    label: 'Low serial',
    serial: 'A00000123B',
    hint: 'Starts with five zeroes.',
  },
  {
    label: 'High serial',
    serial: '99999991',
    hint: 'Nearly all nines.',
  },
  {
    label: 'Solid',
    serial: '55555555',
    hint: 'Every digit matches.',
  },
  {
    label: 'True ladder',
    serial: '12345678',
    hint: 'Perfect climb from 1 to 8.',
  },
  {
    label: 'Broken ladder',
    serial: '12346789',
    hint: 'Almost a ladder, missing 5.',
  },
  {
    label: 'Radar',
    serial: '06288260',
    hint: 'Reads the same forward and backward.',
  },
  {
    label: 'Flipper',
    serial: '00069000',
    hint: 'Still works upside down.',
  },
  {
    label: 'Binary',
    serial: '01010101',
    hint: 'Only 0s and 1s.',
  },
  {
    label: 'Repeater',
    serial: '12341234',
    hint: 'First half repeats.',
  },
  {
    label: 'QuadDouble',
    serial: '11223344',
    hint: 'Four doubled pairs.',
  },
  {
    label: 'Date note',
    serial: '20241125',
    hint: 'Valid YYYYMMDD date.',
  },
  {
    label: 'Not fancy',
    serial: '53827164',
    hint: 'No special pattern match.',
  },
]

export const supportedPatterns: SupportedPattern[] = [
  {
    title: 'Low serial',
    sample: '00000123',
    description: 'Starts with five, six, or seven zeroes.',
  },
  {
    title: 'High serial',
    sample: '99999912',
    description: 'Starts with five, six, or seven nines.',
  },
  {
    title: 'Solid',
    sample: '88888888',
    description: 'All eight digits are the same.',
  },
  {
    title: 'QuadDouble',
    sample: '11223344',
    description: 'Four doubled pairs, including double-quad variants.',
  },
  {
    title: 'Ladder / broken ladder',
    sample: '12345678',
    description: 'Consecutive digits ascending or descending, with an optional single break.',
  },
  {
    title: 'Radar / super radar',
    sample: '06288260',
    description: 'Palindrome-style numbers and super-radar variations.',
  },
  {
    title: 'Flipper',
    sample: '00069000',
    description: 'Digits that still work when the note is flipped upside down.',
  },
  {
    title: 'Binary',
    sample: '01010101',
    description: 'Only two distinct digits, especially 0 and 1.',
  },
  {
    title: 'Repeater / super repeater',
    sample: '12341234',
    description: 'Repeating halves or repeating two-digit blocks.',
  },
  {
    title: 'Seven of a kind',
    sample: '44474444',
    description: 'Seven matching digits, in a row or across the serial.',
  },
  {
    title: 'Six of a kind',
    sample: '44444483',
    description: 'Six matching digits, in a row or across the serial.',
  },
  {
    title: 'Date note',
    sample: '20241125',
    description: 'Valid MMDDYYYY, YYYYMMDD, or DDMMYYYY date.',
  },
]

const analyzers: AnalyzerDef[] = [
  { name: 'LowSerialAnalyzer', analyze: analyzeLowSerial },
  { name: 'HighSerialAnalyzer', analyze: analyzeHighSerial },
  { name: 'SolidAnalyzer', analyze: analyzeSolid },
  { name: 'QuadDoubleAnalyzer', analyze: analyzeQuadDouble },
  { name: 'LadderAnalyzer', analyze: analyzeLadder },
  { name: 'RadarAnalyzer', analyze: analyzeRadar },
  { name: 'FlipperAnalyzer', analyze: analyzeFlipper },
  { name: 'BinaryAnalyzer', analyze: analyzeBinary },
  { name: 'RepeaterAnalyzer', analyze: analyzeRepeater },
  { name: 'SevenDigitsAnalyzer', analyze: analyzeSevenDigits },
  { name: 'SixDigitsAnalyzer', analyze: analyzeSixDigits },
  { name: 'DateAnalyzer', analyze: analyzeDate },
]

export function analyzeSerial(rawInput: string): SerialAnalysis {
  const normalized = rawInput.toUpperCase().replace(/\s+/g, '')

  if (!normalized) {
    return {
      rawInput,
      normalized,
      digits: null,
      format: null,
      validationMessage: null,
      matches: [],
      primaryMatch: null,
      isFancy: false,
    }
  }

  const extracted = validateAndExtractDigits(normalized)
  if (!extracted) {
    return {
      rawInput,
      normalized,
      digits: null,
      format: null,
      validationMessage: validFormatsMessage,
      matches: [],
      primaryMatch: null,
      isFancy: false,
    }
  }

  const matches = analyzers
    .map((analyzer) => analyzer.analyze(extracted.digits))
    .filter((match): match is FancyMatch => match !== null)

  return {
    rawInput,
    normalized,
    digits: extracted.digits,
    format: extracted.format,
    validationMessage: null,
    matches,
    primaryMatch: matches[0] ?? null,
    isFancy: matches.length > 0,
  }
}

function validateAndExtractDigits(serial: string): { digits: string; format: SerialFormat } | null {
  if (/^[A-Z]\d{8}[A-Z]$/.test(serial)) {
    return { digits: serial.slice(1, 9), format: 'Letter + 8 digits + letter' }
  }

  if (/^[A-Z]\d{8}$/.test(serial)) {
    return { digits: serial.slice(1), format: 'Letter + 8 digits' }
  }

  if (/^\d{8}[A-Z]$/.test(serial)) {
    return { digits: serial.slice(0, 8), format: '8 digits + letter' }
  }

  if (/^\d{8}$/.test(serial)) {
    return { digits: serial, format: '8 digits' }
  }

  return null
}

function analyzeLowSerial(digits: string): FancyMatch | null {
  if (/^0000000\d$/.test(digits)) {
    return createMatch(
      'LowSerialAnalyzer',
      'Low Serial',
      '0000000X',
      'Low serial',
      `${digits} starts with seven zeroes, putting it into the ultra-low serial bucket.`
    )
  }

  if (/^000000\d{2}$/.test(digits)) {
    return createMatch(
      'LowSerialAnalyzer',
      'Low Serial',
      '000000XX',
      'Low serial',
      `${digits} starts with six zeroes, which the repo treats as a very low serial.`
    )
  }

  if (/^00000\d{3}$/.test(digits)) {
    return createMatch(
      'LowSerialAnalyzer',
      'Low Serial',
      '00000XXX',
      'Low serial',
      `${digits} starts with five zeroes, so it lands in the low-serial range.`
    )
  }

  return null
}

function analyzeHighSerial(digits: string): FancyMatch | null {
  if (/^9999999\d$/.test(digits)) {
    return createMatch(
      'HighSerialAnalyzer',
      'High Serial',
      '9999999X',
      'High serial',
      `${digits} starts with seven nines, so it sits near the very top of a run.`
    )
  }

  if (/^999999\d{2}$/.test(digits)) {
    return createMatch(
      'HighSerialAnalyzer',
      'High Serial',
      '999999XX',
      'High serial',
      `${digits} starts with six nines, which the repo treats as a very high serial.`
    )
  }

  if (/^99999\d{3}$/.test(digits)) {
    return createMatch(
      'HighSerialAnalyzer',
      'High Serial',
      '99999XXX',
      'High serial',
      `${digits} starts with five nines, so it lands in the high-serial range.`
    )
  }

  return null
}

function analyzeSolid(digits: string): FancyMatch | null {
  if (new Set(digits).size === 1) {
    return createMatch(
      'SolidAnalyzer',
      'Solid',
      digits[0],
      'Solid',
      `All eight digits are ${digits[0]}, making ${digits} a solid serial.`
    )
  }

  return null
}

function analyzeQuadDouble(digits: string): FancyMatch | null {
  const pairs = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 6), digits.slice(6, 8)]
  const allPairsAreDoubles = pairs.every((pair) => pair[0] === pair[1])

  if (allPairsAreDoubles) {
    const [pair1, pair2, pair3, pair4] = pairs

    if (pair1 === pair3 && pair2 === pair4) {
      return createMatch(
        'QuadDoubleAnalyzer',
        'QuadDouble',
        `QuadDouble: ${pair1[0]}-${pair2[0]}`,
        'QuadDouble',
        `${digits} alternates doubled pairs in an AA BB AA BB pattern.`
      )
    }

    if (pair1 === pair2 && pair3 === pair4) {
      return createMatch(
        'QuadDoubleAnalyzer',
        'QuadDouble',
        `DoubleQuad: ${pair1[0]}-${pair3[0]}`,
        'DoubleQuad',
        `${digits} groups into AA AA BB BB, which the repo labels as a double-quad variant.`
      )
    }

    return createMatch(
      'QuadDoubleAnalyzer',
      'QuadDouble',
      `QuadDouble: ${pairs.map((pair) => pair[0]).join('-')}`,
      'QuadDouble',
      `${digits} is made of four doubled pairs.`
    )
  }

  return null
}

function analyzeLadder(digits: string): FancyMatch | null {
  const longestLadder = findLongestLadder(digits)

  if (longestLadder && longestLadder.length >= 6) {
    const variation = longestLadder.isReverse
      ? `TrueLadder: ${longestLadder.length} Digit, ${longestLadder.startDigit}-${longestLadder.endDigit}, Reverse`
      : `TrueLadder: ${longestLadder.length} Digit, ${longestLadder.startDigit}-${longestLadder.endDigit}`

    const direction = longestLadder.isReverse ? 'descending' : 'ascending'
    return createMatch(
      'LadderAnalyzer',
      'Ladder',
      variation,
      'True ladder',
      `${digits} contains a ${longestLadder.length}-digit ${direction} run from ${longestLadder.startDigit} to ${longestLadder.endDigit}.`
    )
  }

  const brokenLadder = findLongestBrokenLadder(digits)
  if (brokenLadder && brokenLadder.length >= 6) {
    const baseInfo = brokenLadder.isReverse
      ? `BrokenLadder: ${brokenLadder.length} Digit, ${brokenLadder.startDigit}-${brokenLadder.endDigit}, Reverse`
      : `BrokenLadder: ${brokenLadder.length} Digit, ${brokenLadder.startDigit}-${brokenLadder.endDigit}`

    if (brokenLadder.intrudingDigit !== undefined && brokenLadder.intrudingDigit !== null) {
      return createMatch(
        'LadderAnalyzer',
        'Ladder',
        `${baseInfo}, Intruding: ${brokenLadder.intrudingDigit}`,
        'Broken ladder',
        `${digits} is almost a ladder. It has one intruding digit (${brokenLadder.intrudingDigit}) inside an otherwise consecutive run.`
      )
    }

    return createMatch(
      'LadderAnalyzer',
      'Ladder',
      `${baseInfo}, Missing: ${brokenLadder.missingDigit}`,
      'Broken ladder',
      `${digits} is almost a ladder. It skips one expected digit (${brokenLadder.missingDigit}) in an otherwise consecutive run.`
    )
  }

  return null
}

function analyzeRadar(digits: string): FancyMatch | null {
  if (isSuperRadar(digits)) {
    return createMatch(
      'RadarAnalyzer',
      'Radar',
      `SuperRadar: ${digits.slice(0, 4)}`,
      'Super radar',
      `${digits} has matching outer digits with six identical middle digits, which makes it a super radar.`
    )
  }

  if (digits === digits.split('').reverse().join('')) {
    return createMatch(
      'RadarAnalyzer',
      'Radar',
      `Radar: ${digits.slice(0, 4)}`,
      'Radar',
      `${digits} reads the same forward and backward.`
    )
  }

  return null
}

function analyzeFlipper(digits: string): FancyMatch | null {
  const flipper069 = new Set(['0', '6', '9'])
  const flipper0689 = new Set(['0', '6', '8', '9'])
  const digitSet = new Set(digits)

  if (digits.includes('8') && isSubset(digitSet, flipper0689)) {
    const flippedDigits = flipDigits(digits, { '0': '0', '6': '9', '8': '8', '9': '6' })
    if (digits === flippedDigits) {
      return createMatch(
        'FlipperAnalyzer',
        'Flipper',
        `TrueFlipper-0689: ${digits}`,
        'True flipper',
        `${digits} only uses 0, 6, 8, and 9, and it still matches when flipped upside down.`
      )
    }
  } else if (isSubset(digitSet, flipper069)) {
    const flippedDigits = flipDigits(digits, { '0': '0', '6': '9', '9': '6' })

    if (digits === flippedDigits) {
      return createMatch(
        'FlipperAnalyzer',
        'Flipper',
        `TrueFlipper-069: ${digits}`,
        'True flipper',
        `${digits} only uses 0, 6, and 9, and it stays the same when flipped upside down.`
      )
    }

    return createMatch(
      'FlipperAnalyzer',
      'Flipper',
      `Flipper: ${digits}`,
      'Flipper',
      `${digits} is built entirely from flipper digits (0, 6, and 9), even though the upside-down reading changes.`
    )
  }

  return null
}

function analyzeBinary(digits: string): FancyMatch | null {
  const uniqueDigits = orderedUniqueDigits(digits)

  if (uniqueDigits.every((digit) => digit === '0' || digit === '1')) {
    return createMatch(
      'BinaryAnalyzer',
      'Binary',
      'TrueBinary',
      'True binary',
      `${digits} only uses 0s and 1s.`
    )
  }

  if (uniqueDigits.length === 2) {
    return createMatch(
      'BinaryAnalyzer',
      'Binary',
      `Binary: ${uniqueDigits[0]} and ${uniqueDigits[1]}`,
      'Binary',
      `${digits} only uses two distinct digits: ${uniqueDigits[0]} and ${uniqueDigits[1]}.`
    )
  }

  return null
}

function analyzeRepeater(digits: string): FancyMatch | null {
  if (digits.slice(0, 2).repeat(4) === digits) {
    return createMatch(
      'RepeaterAnalyzer',
      'Repeater',
      `SuperRepeater: ${digits.slice(0, 2)}`,
      'Super repeater',
      `${digits} repeats the same two-digit block four times.`
    )
  }

  if (digits.slice(0, 4) === digits.slice(4)) {
    return createMatch(
      'RepeaterAnalyzer',
      'Repeater',
      `Repeater: ${digits.slice(0, 4)}`,
      'Repeater',
      `${digits} repeats the first four digits exactly in the second half.`
    )
  }

  return null
}

function analyzeSevenDigits(digits: string): FancyMatch | null {
  for (const digit of orderedUniqueDigits(digits)) {
    if (digits.includes(digit.repeat(7))) {
      return createMatch(
        'SevenDigitsAnalyzer',
        'Seven of a Kind',
        `SevenInARow: ${digit}`,
        'Seven in a row',
        `${digits} contains seven ${digit}s in a row.`
      )
    }
  }

  for (const digit of orderedUniqueDigits(digits)) {
    if (countDigit(digits, digit) >= 7) {
      return createMatch(
        'SevenDigitsAnalyzer',
        'Seven of a Kind',
        `SevenOfAKind: ${digit}`,
        'Seven of a kind',
        `${digits} contains at least seven ${digit}s overall.`
      )
    }
  }

  return null
}

function analyzeSixDigits(digits: string): FancyMatch | null {
  for (const digit of orderedUniqueDigits(digits)) {
    if (digits.includes(digit.repeat(6))) {
      return createMatch(
        'SixDigitsAnalyzer',
        'Six of a Kind',
        `SixInARow: ${digit}`,
        'Six in a row',
        `${digits} contains six ${digit}s in a row.`
      )
    }
  }

  for (const digit of orderedUniqueDigits(digits)) {
    if (countDigit(digits, digit) >= 6) {
      return createMatch(
        'SixDigitsAnalyzer',
        'Six of a Kind',
        `SixOfAKind: ${digit}`,
        'Six of a kind',
        `${digits} contains at least six ${digit}s overall.`
      )
    }
  }

  return null
}

function analyzeDate(digits: string): FancyMatch | null {
  if (isValidMmDdYyyy(digits)) {
    const month = digits.slice(0, 2)
    const day = digits.slice(2, 4)
    const year = digits.slice(4, 8)
    return createMatch(
      'DateAnalyzer',
      'Date Note',
      `MMDDYYYY: ${month}-${day}-${year}`,
      'Date note',
      `${digits} forms a valid MMDDYYYY date: ${month}-${day}-${year}.`
    )
  }

  if (isValidYyyyMmDd(digits)) {
    const year = digits.slice(0, 4)
    const month = digits.slice(4, 6)
    const day = digits.slice(6, 8)
    return createMatch(
      'DateAnalyzer',
      'Date Note',
      `YYYYMMDD: ${year}-${month}-${day}`,
      'Date note',
      `${digits} forms a valid YYYYMMDD date: ${year}-${month}-${day}.`
    )
  }

  if (isValidDdMmYyyy(digits)) {
    const day = digits.slice(0, 2)
    const month = digits.slice(2, 4)
    const year = digits.slice(4, 8)
    return createMatch(
      'DateAnalyzer',
      'Date Note',
      `DDMMYYYY: ${day}-${month}-${year}`,
      'Date note',
      `${digits} forms a valid DDMMYYYY date: ${day}-${month}-${year}.`
    )
  }

  return null
}

function findLongestLadder(digits: string): LadderInfo | null {
  let longestLadder: LadderInfo | null = null
  let maxLength = 0

  for (let startPos = 0; startPos < digits.length; startPos += 1) {
    const ascending = checkSequence(digits, startPos, true)
    if (ascending && ascending.length > maxLength) {
      maxLength = ascending.length
      longestLadder = ascending
    }

    const descending = checkSequence(digits, startPos, false)
    if (descending && descending.length > maxLength) {
      maxLength = descending.length
      longestLadder = descending
    }
  }

  return maxLength >= 6 ? longestLadder : null
}

function checkSequence(digits: string, startPos: number, ascending: boolean): LadderInfo | null {
  if (startPos >= digits.length) {
    return null
  }

  let currentDigit = Number(digits[startPos])
  const startDigit = currentDigit
  let length = 1

  for (let i = startPos + 1; i < digits.length; i += 1) {
    const nextDigit = Number(digits[i])
    const expectedDigit = ascending ? currentDigit + 1 : currentDigit - 1

    if (nextDigit === expectedDigit) {
      currentDigit = nextDigit
      length += 1
    } else {
      break
    }
  }

  if (length >= 6) {
    return {
      startDigit,
      endDigit: currentDigit,
      length,
      isReverse: !ascending,
    }
  }

  return null
}

function findLongestBrokenLadder(digits: string): LadderInfo | null {
  let longestBrokenLadder: LadderInfo | null = null
  let maxLength = 0

  for (let startPos = 0; startPos < digits.length; startPos += 1) {
    const ascending = checkBrokenSequence(digits, startPos, true)
    if (ascending && ascending.length > maxLength) {
      maxLength = ascending.length
      longestBrokenLadder = ascending
    }

    const descending = checkBrokenSequence(digits, startPos, false)
    if (descending && descending.length > maxLength) {
      maxLength = descending.length
      longestBrokenLadder = descending
    }
  }

  return maxLength >= 6 ? longestBrokenLadder : null
}

function checkBrokenSequence(digits: string, startPos: number, ascending: boolean): LadderInfo | null {
  if (startPos >= digits.length) {
    return null
  }

  let currentDigit = Number(digits[startPos])
  const startDigit = currentDigit
  let length = 1
  let breaksUsed = 0
  let intrudingDigit: number | null = null
  let missingDigit: number | null = null
  let i = startPos + 1

  while (i < digits.length) {
    const nextDigit = Number(digits[i])
    const expectedDigit = ascending ? currentDigit + 1 : currentDigit - 1

    if (nextDigit === expectedDigit) {
      currentDigit = nextDigit
      length += 1
      i += 1
      continue
    }

    if (breaksUsed === 0) {
      if (i + 1 < digits.length) {
        const nextNextDigit = Number(digits[i + 1])
        if (nextNextDigit === expectedDigit) {
          intrudingDigit = nextDigit
          missingDigit = null
          breaksUsed = 1
          length += 1
          i += 1
          continue
        }
      }

      const expectedAfterSkip = ascending ? currentDigit + 2 : currentDigit - 2
      if (nextDigit === expectedAfterSkip) {
        missingDigit = expectedDigit
        intrudingDigit = null
        breaksUsed = 1
        currentDigit = nextDigit
        length += 1
        i += 1
        continue
      }
    }

    break
  }

  if (length >= 6) {
    return {
      startDigit,
      endDigit: currentDigit,
      length,
      isReverse: !ascending,
      intrudingDigit,
      missingDigit,
    }
  }

  return null
}

function isSuperRadar(digits: string): boolean {
  if (digits.length !== 8) {
    return false
  }

  const firstDigit = digits[0]
  const lastDigit = digits[7]
  const middleDigits = digits.slice(1, 7)

  if (firstDigit !== lastDigit) {
    return false
  }

  if (!middleDigits.split('').every((digit) => digit === middleDigits[0])) {
    return false
  }

  if (firstDigit === middleDigits[0]) {
    return false
  }

  return true
}

function isValidYyyyMmDd(digits: string): boolean {
  const year = Number(digits.slice(0, 4))
  const month = Number(digits.slice(4, 6))
  const day = Number(digits.slice(6, 8))
  return isValidDateParts(year, month, day)
}

function isValidMmDdYyyy(digits: string): boolean {
  const month = Number(digits.slice(0, 2))
  const day = Number(digits.slice(2, 4))
  const year = Number(digits.slice(4, 8))
  return isValidDateParts(year, month, day)
}

function isValidDdMmYyyy(digits: string): boolean {
  const day = Number(digits.slice(0, 2))
  const month = Number(digits.slice(2, 4))
  const year = Number(digits.slice(4, 8))
  return isValidDateParts(year, month, day)
}

function isValidDateParts(year: number, month: number, day: number): boolean {
  if (!/^\d{8}$/.test(`${year}`.padStart(4, '0') + `${month}`.padStart(2, '0') + `${day}`.padStart(2, '0'))) {
    return false
  }

  const currentYear = new Date().getFullYear()
  if (year < 1492 || year > currentYear + 10) {
    return false
  }

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return false
  }

  const date = new Date(Date.UTC(year, month - 1, day))
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}

function countDigit(digits: string, target: string): number {
  return digits.split('').filter((digit) => digit === target).length
}

function orderedUniqueDigits(digits: string): string[] {
  const seen = new Set<string>()
  const ordered: string[] = []

  for (const digit of digits) {
    if (!seen.has(digit)) {
      seen.add(digit)
      ordered.push(digit)
    }
  }

  return ordered
}

function flipDigits(digits: string, flipMap: Record<string, string>): string {
  return digits
    .split('')
    .reverse()
    .map((digit) => flipMap[digit])
    .join('')
}

function isSubset(left: Set<string>, right: Set<string>): boolean {
  for (const value of left) {
    if (!right.has(value)) {
      return false
    }
  }

  return true
}

function createMatch(
  analyzerName: string,
  noteType: SpecialSerialType,
  variation: string,
  title: string,
  explanation: string
): FancyMatch {
  return {
    analyzerName,
    noteType,
    variation,
    title,
    explanation,
  }
}
