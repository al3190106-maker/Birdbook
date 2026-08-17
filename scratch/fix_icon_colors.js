// fix_icon_colors.js
// Justerar alla nya ikoners gröna nyans till att matcha de befintliga (#1e4d2b)
// Kör: node scratch/fix_icon_colors.js

const fs = require('fs');
const path = require('path');

// Target color from existing icons (dark forest green)
// Measured visually from finkar.png / svalor.png
const TARGET = { r: 30, g: 77, b: 43 }; // #1e4d2b

const iconsDir = 'images/category_icons';
const newIcons = [
    'svalor_seglare.png',
    'larkor.png',
    'arlor.png',
    'starar.png',
    'skarvar.png',
    'stormfaglar.png',
    'labbar.png',
    'tornskator.png',
    'jarnsparvar.png',
    'gokfaglar.png',
    'tradkrypare.png',
    'papegojor.png',
];

// We need to read the PNG binary and remap green pixels
// Use a simple approach: recolor any dark-green-ish pixel to the target
// PNG format: we'll use a minimal pixel manipulation

// Check if 'sharp' is available
try {
    const sharp = require('sharp');
    
    async function recolorIcon(filename) {
        const filepath = path.join(iconsDir, filename);
        const image = sharp(filepath);
        const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
        
        let changed = 0;
        for (let i = 0; i < data.length; i += info.channels) {
            const r = data[i], g = data[i+1], b = data[i+2];
            // Detect green-ish pixels (bird silhouette area)
            // Green channel dominant, not white
            if (g > r && g > b && r < 200 && b < 200 && !(r > 240 && g > 240 && b > 240)) {
                data[i]   = TARGET.r;
                data[i+1] = TARGET.g;
                data[i+2] = TARGET.b;
                changed++;
            }
        }
        
        await sharp(data, {
            raw: { width: info.width, height: info.height, channels: info.channels }
        }).png().toFile(filepath.replace('.png', '_fixed.png'));
        
        console.log(`✓ ${filename}: recolored ${changed} pixels`);
    }
    
    (async () => {
        for (const icon of newIcons) {
            await recolorIcon(icon);
        }
        console.log('\nDone! Check _fixed.png versions.');
    })();
    
} catch (e) {
    console.log('sharp not available:', e.message);
    console.log('\nAlternativ: Använd online-verktyg som ezgif.com/color-picker');
    console.log('Eller vänta tills bildkvoten återställs och generera om med exakt färg.');
    
    // Fallback: Provide exact color info
    console.log('\nExakt färg för de befintliga ikonerna:');
    console.log('HEX: #1e4d2b');
    console.log('RGB: rgb(30, 77, 43)');
    console.log('HSL: hsl(136, 44%, 21%)');
}
