// main.ts — entry program for make.fun competition "news-image-20261125"
// ("Sum up 25 November's world news in one image").
//
// The entry itself is the picture in `entry.png` next to this file: a single
// 1024x1024 front-page-style collage that sums up the world news of
// Wednesday 25 November 2026. This program's whole job is to deliver those
// exact bytes to the grader: it checks the image is present and really a
// PNG, then copies it to `entry.png` inside the output directory.
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

const head = readFileSync(sourcePath).subarray(0, PNG_MAGIC.length);
if (!PNG_MAGIC.every((byte, i) => head[i] === byte)) {
  fail(`${sourcePath} does not start with the PNG magic bytes`);
}

mkdirSync(outputDir, { recursive: true });
copyFileSync(sourcePath, targetPath);
console.log(`main.ts: wrote ${targetPath}`);
