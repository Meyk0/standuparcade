const VERSION = 6;
const SIZE = 21 + (VERSION - 1) * 4;
const DATA_CODEWORDS = 136;
const ECC_CODEWORDS_PER_BLOCK = 18;
const BLOCK_COUNT = 2;
const BLOCK_DATA_CODEWORDS = DATA_CODEWORDS / BLOCK_COUNT;
const FORMAT_POLY = 0x537;
const FORMAT_MASK = 0x5412;

type Cell = boolean | null;

function appendBits(bits: number[], value: number, length: number) {
  for (let i = length - 1; i >= 0; i--) {
    bits.push(((value >>> i) & 1) === 1 ? 1 : 0);
  }
}

function bitsToBytes(bits: number[]): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let value = 0;
    for (let j = 0; j < 8; j++) {
      value = (value << 1) | (bits[i + j] || 0);
    }
    bytes.push(value);
  }
  return bytes;
}

function encodeData(text: string): number[] {
  const data = Array.from(new TextEncoder().encode(text));

  if (data.length > DATA_CODEWORDS - 2) {
    throw new Error("QR data is too long");
  }

  const bits: number[] = [];
  appendBits(bits, 0b0100, 4);
  appendBits(bits, data.length, 8);
  data.forEach((byte) => appendBits(bits, byte, 8));

  const capacityBits = DATA_CODEWORDS * 8;
  appendBits(bits, 0, Math.min(4, capacityBits - bits.length));
  while (bits.length % 8 !== 0) bits.push(0);

  const bytes = bitsToBytes(bits);
  for (let pad = 0xec; bytes.length < DATA_CODEWORDS; pad ^= 0xec ^ 0x11) {
    bytes.push(pad);
  }

  return bytes;
}

function gfMultiply(x: number, y: number): number {
  let product = 0;
  for (let i = 7; i >= 0; i--) {
    product = (product << 1) ^ ((product >>> 7) * 0x11d);
    product ^= ((y >>> i) & 1) * x;
  }
  return product & 0xff;
}

function reedSolomonDivisor(degree: number): number[] {
  const result = Array(degree).fill(0);
  result[degree - 1] = 1;

  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < degree; j++) {
      result[j] = gfMultiply(result[j], root);
      if (j + 1 < degree) result[j] ^= result[j + 1];
    }
    root = gfMultiply(root, 2);
  }

  return result;
}

function reedSolomonRemainder(data: number[], divisor: number[]): number[] {
  const result = Array(divisor.length).fill(0);

  for (const byte of data) {
    const factor = byte ^ result.shift();
    result.push(0);
    divisor.forEach((coefficient, i) => {
      result[i] ^= gfMultiply(coefficient, factor);
    });
  }

  return result;
}

function addErrorCorrection(data: number[]): number[] {
  const divisor = reedSolomonDivisor(ECC_CODEWORDS_PER_BLOCK);
  const blocks = Array.from({ length: BLOCK_COUNT }, (_, blockIndex) => {
    const start = blockIndex * BLOCK_DATA_CODEWORDS;
    const blockData = data.slice(start, start + BLOCK_DATA_CODEWORDS);
    return {
      data: blockData,
      ecc: reedSolomonRemainder(blockData, divisor),
    };
  });

  const result: number[] = [];
  for (let i = 0; i < BLOCK_DATA_CODEWORDS; i++) {
    blocks.forEach((block) => result.push(block.data[i]));
  }
  for (let i = 0; i < ECC_CODEWORDS_PER_BLOCK; i++) {
    blocks.forEach((block) => result.push(block.ecc[i]));
  }

  return result;
}

function createMatrix() {
  return {
    modules: Array.from({ length: SIZE }, () => Array<Cell>(SIZE).fill(null)),
    functionModules: Array.from({ length: SIZE }, () => Array(SIZE).fill(false)),
  };
}

function setFunctionModule(
  modules: Cell[][],
  functionModules: boolean[][],
  x: number,
  y: number,
  dark: boolean
) {
  if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) return;
  modules[y][x] = dark;
  functionModules[y][x] = true;
}

function drawFinderPattern(
  modules: Cell[][],
  functionModules: boolean[][],
  left: number,
  top: number
) {
  for (let y = -1; y <= 7; y++) {
    for (let x = -1; x <= 7; x++) {
      const xx = left + x;
      const yy = top + y;
      const isFinder =
        x >= 0 &&
        x <= 6 &&
        y >= 0 &&
        y <= 6 &&
        (x === 0 ||
          x === 6 ||
          y === 0 ||
          y === 6 ||
          (x >= 2 && x <= 4 && y >= 2 && y <= 4));
      setFunctionModule(modules, functionModules, xx, yy, isFinder);
    }
  }
}

function drawAlignmentPattern(
  modules: Cell[][],
  functionModules: boolean[][],
  centerX: number,
  centerY: number
) {
  for (let y = -2; y <= 2; y++) {
    for (let x = -2; x <= 2; x++) {
      const dark = Math.max(Math.abs(x), Math.abs(y)) !== 1;
      setFunctionModule(modules, functionModules, centerX + x, centerY + y, dark);
    }
  }
}

function getFormatBits(mask: number): number {
  const errorCorrectionLevelLow = 1;
  const data = (errorCorrectionLevelLow << 3) | mask;
  let remainder = data << 10;

  for (let i = 14; i >= 10; i--) {
    if (((remainder >>> i) & 1) !== 0) {
      remainder ^= FORMAT_POLY << (i - 10);
    }
  }

  return ((data << 10) | remainder) ^ FORMAT_MASK;
}

function getBit(value: number, index: number): boolean {
  return ((value >>> index) & 1) !== 0;
}

function drawFormatBits(
  modules: Cell[][],
  functionModules: boolean[][],
  mask: number
) {
  const bits = getFormatBits(mask);

  for (let i = 0; i <= 5; i++) setFunctionModule(modules, functionModules, 8, i, getBit(bits, i));
  setFunctionModule(modules, functionModules, 8, 7, getBit(bits, 6));
  setFunctionModule(modules, functionModules, 8, 8, getBit(bits, 7));
  setFunctionModule(modules, functionModules, 7, 8, getBit(bits, 8));
  for (let i = 9; i < 15; i++) setFunctionModule(modules, functionModules, 14 - i, 8, getBit(bits, i));

  for (let i = 0; i < 8; i++) setFunctionModule(modules, functionModules, SIZE - 1 - i, 8, getBit(bits, i));
  for (let i = 8; i < 15; i++) setFunctionModule(modules, functionModules, 8, SIZE - 15 + i, getBit(bits, i));

  setFunctionModule(modules, functionModules, 8, SIZE - 8, true);
}

function drawFunctionPatterns(modules: Cell[][], functionModules: boolean[][]) {
  drawFinderPattern(modules, functionModules, 0, 0);
  drawFinderPattern(modules, functionModules, SIZE - 7, 0);
  drawFinderPattern(modules, functionModules, 0, SIZE - 7);

  for (let i = 8; i < SIZE - 8; i++) {
    const dark = i % 2 === 0;
    setFunctionModule(modules, functionModules, 6, i, dark);
    setFunctionModule(modules, functionModules, i, 6, dark);
  }

  [6, 34].forEach((y) => {
    [6, 34].forEach((x) => {
      const overlapsFinder = (x === 6 && y === 6) || (x === 34 && y === 6) || (x === 6 && y === 34);
      if (!overlapsFinder) drawAlignmentPattern(modules, functionModules, x, y);
    });
  });

  drawFormatBits(modules, functionModules, 0);
}

function drawCodewords(
  modules: Cell[][],
  functionModules: boolean[][],
  codewords: number[]
) {
  const bits = codewords.flatMap((byte) =>
    Array.from({ length: 8 }, (_, i) => ((byte >>> (7 - i)) & 1) !== 0)
  );
  let bitIndex = 0;
  let upward = true;

  for (let right = SIZE - 1; right >= 1; right -= 2) {
    if (right === 6) right--;

    for (let vertical = 0; vertical < SIZE; vertical++) {
      const y = upward ? SIZE - 1 - vertical : vertical;
      for (let offset = 0; offset < 2; offset++) {
        const x = right - offset;
        if (!functionModules[y][x]) {
          modules[y][x] = bitIndex < bits.length ? bits[bitIndex] : false;
          bitIndex++;
        }
      }
    }

    upward = !upward;
  }
}

function shouldMask(mask: number, x: number, y: number): boolean {
  switch (mask) {
    case 0:
      return (x + y) % 2 === 0;
    case 1:
      return y % 2 === 0;
    case 2:
      return x % 3 === 0;
    case 3:
      return (x + y) % 3 === 0;
    case 4:
      return (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0;
    case 5:
      return ((x * y) % 2) + ((x * y) % 3) === 0;
    case 6:
      return (((x * y) % 2) + ((x * y) % 3)) % 2 === 0;
    case 7:
      return (((x + y) % 2) + ((x * y) % 3)) % 2 === 0;
    default:
      return false;
  }
}

function applyMask(modules: Cell[][], functionModules: boolean[][], mask: number) {
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (!functionModules[y][x] && shouldMask(mask, x, y)) {
        modules[y][x] = !modules[y][x];
      }
    }
  }
}

function cloneModules(modules: Cell[][]): Cell[][] {
  return modules.map((row) => [...row]);
}

function scoreRuns(lines: boolean[][]): number {
  let score = 0;

  lines.forEach((line) => {
    let runColor = line[0];
    let runLength = 1;

    for (let i = 1; i <= line.length; i++) {
      if (i < line.length && line[i] === runColor) {
        runLength++;
      } else {
        if (runLength >= 5) score += 3 + runLength - 5;
        runColor = line[i];
        runLength = 1;
      }
    }
  });

  return score;
}

function scoreFinderPatterns(lines: boolean[][]): number {
  const patterns = ["10111010000", "00001011101"];
  let score = 0;

  lines.forEach((line) => {
    const text = line.map((cell) => (cell ? "1" : "0")).join("");
    patterns.forEach((pattern) => {
      let index = text.indexOf(pattern);
      while (index !== -1) {
        score += 40;
        index = text.indexOf(pattern, index + 1);
      }
    });
  });

  return score;
}

function scoreMatrix(modules: Cell[][]): number {
  const rows = modules.map((row) => row.map(Boolean));
  const columns = Array.from({ length: SIZE }, (_, x) => rows.map((row) => row[x]));
  let score = scoreRuns(rows) + scoreRuns(columns);

  for (let y = 0; y < SIZE - 1; y++) {
    for (let x = 0; x < SIZE - 1; x++) {
      const color = rows[y][x];
      if (
        rows[y][x + 1] === color &&
        rows[y + 1][x] === color &&
        rows[y + 1][x + 1] === color
      ) {
        score += 3;
      }
    }
  }

  score += scoreFinderPatterns(rows) + scoreFinderPatterns(columns);

  const darkCount = rows.flat().filter(Boolean).length;
  const total = SIZE * SIZE;
  const percent = (darkCount * 100) / total;
  score += Math.floor(Math.abs(percent - 50) / 5) * 10;

  return score;
}

export function generateQrMatrix(text: string): boolean[][] {
  const dataCodewords = encodeData(text);
  const allCodewords = addErrorCorrection(dataCodewords);
  const { modules, functionModules } = createMatrix();

  drawFunctionPatterns(modules, functionModules);
  drawCodewords(modules, functionModules, allCodewords);

  let bestMask = 0;
  let bestScore = Number.POSITIVE_INFINITY;

  for (let mask = 0; mask < 8; mask++) {
    const candidate = cloneModules(modules);
    const candidateFunctions = functionModules.map((row) => [...row]);
    applyMask(candidate, candidateFunctions, mask);
    drawFormatBits(candidate, candidateFunctions, mask);
    const score = scoreMatrix(candidate);

    if (score < bestScore) {
      bestScore = score;
      bestMask = mask;
    }
  }

  applyMask(modules, functionModules, bestMask);
  drawFormatBits(modules, functionModules, bestMask);

  return modules.map((row) => row.map(Boolean));
}
