// Script to generate PWA icons from the existing favicon.svg
// Run: node scripts/generate-icons.mjs

import { writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public', 'icons');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Generate a simple PNG-like SVG icon for each size
// In production, you'd use sharp or canvas to convert SVG to PNG
// For now, create SVG icons that browsers can use
function generateIconSVG(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7c3aed"/>
      <stop offset="100%" style="stop-color:#ec4899"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.2)}" fill="url(#bg)"/>
  <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle"
    font-family="system-ui, -apple-system, sans-serif" font-weight="bold" 
    font-size="${Math.round(size * 0.4)}" fill="white">NC</text>
  <text x="50%" y="78%" dominant-baseline="middle" text-anchor="middle"
    font-family="system-ui, -apple-system, sans-serif" font-weight="500" 
    font-size="${Math.round(size * 0.1)}" fill="rgba(255,255,255,0.8)">⚡</text>
</svg>`;
}

// Generate all icon sizes
for (const size of sizes) {
  const svg = generateIconSVG(size);
  // Save as SVG (browsers support SVG icons in manifest)
  writeFileSync(join(publicDir, `icon-${size}x${size}.svg`), svg);
  console.log(`Generated: icon-${size}x${size}.svg`);
}

// Generate screenshot placeholders
const wideScreenshot = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0a0a0a"/>
      <stop offset="100%" style="stop-color:#1a0a2e"/>
    </linearGradient>
  </defs>
  <rect width="1280" height="720" fill="url(#bg)"/>
  <text x="640" y="320" dominant-baseline="middle" text-anchor="middle"
    font-family="system-ui" font-weight="bold" font-size="64" fill="white">NeuralCards</text>
  <text x="640" y="400" dominant-baseline="middle" text-anchor="middle"
    font-family="system-ui" font-size="24" fill="#a78bfa">Master AI with Interactive Flashcards</text>
</svg>`;

const narrowScreenshot = `<svg xmlns="http://www.w3.org/2000/svg" width="390" height="844" viewBox="0 0 390 844">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0a0a0a"/>
      <stop offset="100%" style="stop-color:#1a0a2e"/>
    </linearGradient>
  </defs>
  <rect width="390" height="844" fill="url(#bg)"/>
  <text x="195" y="380" dominant-baseline="middle" text-anchor="middle"
    font-family="system-ui" font-weight="bold" font-size="36" fill="white">NeuralCards</text>
  <text x="195" y="430" dominant-baseline="middle" text-anchor="middle"
    font-family="system-ui" font-size="14" fill="#a78bfa">AI-Powered Flashcards</text>
</svg>`;

writeFileSync(join(publicDir, 'screenshot-wide.svg'), wideScreenshot);
writeFileSync(join(publicDir, 'screenshot-narrow.svg'), narrowScreenshot);
console.log('Generated screenshot placeholders');

console.log('\n✅ All icons generated! For production PNG icons, use a tool like:');
console.log('   npx pwa-asset-generator public/favicon.svg public/icons');
