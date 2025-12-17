#!/usr/bin/env node

import sharp from 'sharp';
import { writeFile } from 'fs/promises';
import path from 'path';

const inputSvg = path.join(process.cwd(), 'docs', 'dcversus.svg');
const outputDir = path.join(process.cwd(), 'docs');

async function generateFavicon() {
  try {
    console.log('🎨 Generating favicon from dcversus.svg...');

    // Generate favicon.ico (16x16, 32x32, 48x48)
    await sharp(inputSvg)
      .resize(48, 48)
      .toFile(path.join(outputDir, 'favicon-48.png'));

    await sharp(inputSvg)
      .resize(32, 32)
      .toFile(path.join(outputDir, 'favicon-32.png'));

    await sharp(inputSvg)
      .resize(16, 16)
      .toFile(path.join(outputDir, 'favicon-16.png'));

    // Generate larger icons for PWA
    await sharp(inputSvg)
      .resize(192, 192)
      .toFile(path.join(outputDir, 'icon-192.png'));

    await sharp(inputSvg)
      .resize(512, 512)
      .toFile(path.join(outputDir, 'icon-512.png'));

    // Generate apple touch icon
    await sharp(inputSvg)
      .resize(180, 180)
      .toFile(path.join(outputDir, 'apple-touch-icon.png'));

    console.log('✅ Favicon and icons generated successfully!');
    console.log('📁 Generated files:');
    console.log('   - docs/favicon-16.png');
    console.log('   - docs/favicon-32.png');
    console.log('   - docs/favicon-48.png');
    console.log('   - docs/icon-192.png');
    console.log('   - docs/icon-512.png');
    console.log('   - docs/apple-touch-icon.png');

  } catch (error) {
    console.error('❌ Error generating favicon:', error);
    process.exit(1);
  }
}

generateFavicon();