/**
 * This script creates placeholder audio files for development.
 * These are minimal valid MP3 files that can be replaced with real audio later.
 *
 * Run with: node scripts/generate-audio-placeholders.js
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const audioDir = join(__dirname, '..', 'public', 'assets', 'audio');

// Minimal valid MP3 frame (silent ~0.026s)
// This is a minimal valid MP3 file header with a silent frame
const SILENT_MP3_BASE64 =
  '//uQxAAAAAANIAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';

// Create audio directory if it doesn't exist
if (!existsSync(audioDir)) {
  mkdirSync(audioDir, { recursive: true });
}

// Audio files to create
const audioFiles = [
  { name: 'beep.mp3', description: 'Countdown beep sound' },
  { name: 'go.mp3', description: 'Race start GO! sound' },
  { name: 'race-music.mp3', description: 'Background racing music loop' },
  { name: 'finish.mp3', description: 'Finish celebration fanfare' },
  { name: 'results-music.mp3', description: 'Results screen music loop' },
  { name: 'correct.mp3', description: 'Correct answer sound' },
  { name: 'wrong.mp3', description: 'Wrong answer sound' },
  { name: 'tap.mp3', description: 'Tap button feedback sound' },
];

// Convert base64 to buffer and write files
const silentBuffer = Buffer.from(SILENT_MP3_BASE64, 'base64');

audioFiles.forEach(({ name, description }) => {
  const filePath = join(audioDir, name);
  writeFileSync(filePath, silentBuffer);
  console.log(`Created ${name} - ${description}`);
});

console.log(`\nAll ${audioFiles.length} placeholder audio files created in ${audioDir}`);
console.log('Replace these with real audio files for production.');
