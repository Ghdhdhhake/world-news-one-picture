// main.ts — entry program for make.fun competition "news-image-20261125"
// ("Sum up 25 November's world news in one image").
//
// The entry itself is the picture in `entry.png` next to this file: a single
// 1024x1024 front-page-style collage, dated Wednesday 25 November 2026 in
// its masthead, that sums up that day's world news — the Hormuz tanker
// attacks and the Houthi strike on Riyadh, Russian strikes on Kyiv and
// Odesa, Shenzhou-24 carrying the first foreign astronaut to China's
// Tiangong station, Huawei's conviction in a US court, Washington's new
// tariffs and Wall Street's slide, and the Australia–Solomon Islands
// treaty, with a strip of shorter items (Sudan, the failed COP31 talks,
// Bangladesh's garment-wage rise) along the bottom.
//
// This program's whole job is to deliver those exact bytes to the grader:
// it checks the image is present, really a PNG, and inside the gate's caps
// (at most 1 MiB, at most 1024 by 1024 pixels), then copies it to
// `entry.png` inside the output directory.
//
// The output directory is /output in the grader's container; when running
// locally, MAKEFUN_OUTPUT_DIR points somewhere else instead:
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// Node 22, standard library only, no network. Running it twice writes the
// same bytes both times, because it only ever copies the one fixed file.

import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoDir = dirname(fileURLToPath(import.meta.url));
const sourcePath = join(repoDir, 'entry.png');
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const targetPath = join(outputDir, 'entry.png');

// Every PNG file starts with these eight bytes; checking them catches a
// truncated or wrong file before we hand anything to the judge.
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function fail(message: string): never {
  console.error(`main.ts: ${message}`);
  process.exit(1);
}

if (!existsSync(sourcePath)) {
  fail(`entry image not found at ${sourcePath}`);
}

const image = readFileSync(sourcePath);
if (!PNG_MAGIC.every((byte, i) => image[i] === byte)) {
  fail(`${sourcePath} does not start with the PNG magic bytes`);
}

// The gate's caps, checked here so a bad image fails loudly at build time
// rather than quietly at grading time. A PNG's IHDR chunk always puts the
// width and height at byte offsets 16 and 20.
const MAX_BYTES = 1_048_576;
const MAX_SIDE = 1024;
if (image.length > MAX_BYTES) {
  fail(`${sourcePath} is ${image.length} bytes, over the 1 MiB cap`);
}
const width = image.readUInt32BE(16);
const height = image.readUInt32BE(20);
if (width > MAX_SIDE || height > MAX_SIDE) {
  fail(`${sourcePath} is ${width}x${height}, over the ${MAX_SIDE}x${MAX_SIDE} cap`);
}

mkdirSync(outputDir, { recursive: true });
copyFileSync(sourcePath, targetPath);
console.log(`main.ts: wrote ${targetPath}`);
