// scripts/generate_image_sitemap.js
// Genererar en Google Image Sitemap för alla arter i Naturboken

const fs = require('fs');
const path = require('path');

global.window = {};
require('../birds.js');
require('../trees.js');
require('../fungi.js');
require('../fish.js');

const BASE_URL = 'https://al3190106-maker.github.io/Birdbook/';

function escapeXml(unsafe) {
    if (!unsafe) return '';
    return String(unsafe)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

const images = [];

// 1. Kategoriikoner & Logotyper
const mainIcons = [
    { file: 'images/category_icons/nature_alla.png', title: 'Naturboken – Sveriges interaktiva naturguide', caption: 'Officiell logotyp och ikon för Naturboken' },
    { file: 'images/category_icons/alla.png', title: 'Fågelboken – Sveriges fåglar', caption: 'Kategoriikon för Fågelboken i Naturboken' },
    { file: 'images/category_icons/plants_alla.png', title: 'Växtboken – Svenska träd och blommor', caption: 'Kategoriikon för Växtboken i Naturboken' },
    { file: 'images/category_icons/fish_alla.png', title: 'Fiskboken – Svenska fiskar', caption: 'Kategoriikon för Fiskboken i Naturboken' },
    { file: 'images/category_icons/fungi_alla.png', title: 'Svampboken – Svenska mat- och giftsvampar', caption: 'Kategoriikon för Svampboken i Naturboken' },
    { file: 'images/category_icons/animal_alla.png', title: 'Däggdjursboken – Svenska däggdjur och vilt', caption: 'Kategoriikon för Däggdjursboken i Naturboken' }
];

for (const icon of mainIcons) {
    if (fs.existsSync(icon.file)) {
        images.push({
            loc: BASE_URL + icon.file,
            title: icon.title,
            caption: icon.caption
        });
    }
}

// 2. Fåglar (348 dioramor)
if (window.swedishBirds) {
    for (const bird of window.swedishBirds) {
        const dioramaRel = `images/dioramas/${bird.id}.webp`;
        if (fs.existsSync(dioramaRel)) {
            const sc = bird.scientific ? ` (${bird.scientific})` : '';
            images.push({
                loc: BASE_URL + dioramaRel,
                title: `${bird.nameSv} – Fågelboken`,
                caption: `Artplansch för ${bird.nameSv}${sc} i Naturboken (${bird.type || 'Fågel'})`
            });
        }
    }
}

// 3. Träd (25 arter)
if (window.swedishTrees) {
    for (const tree of window.swedishTrees) {
        const treeRel = `images/tradboken_bilder/${tree.id}.jpg`;
        if (fs.existsSync(treeRel)) {
            const sc = tree.scientific ? ` (${tree.scientific})` : '';
            images.push({
                loc: BASE_URL + treeRel,
                title: `${tree.nameSv} – Växtboken`,
                caption: `Botanisk plansch av ${tree.nameSv}${sc} i Naturboken (${tree.type || 'Träd'})`
            });
        }
    }
}

// 4. Svampar (26 arter)
if (window.swedishFungi) {
    for (const fungi of window.swedishFungi) {
        if (fungi.image && fs.existsSync(fungi.image)) {
            const sc = fungi.scientific ? ` (${fungi.scientific})` : '';
            images.push({
                loc: BASE_URL + fungi.image,
                title: `${fungi.nameSv} – Svampboken`,
                caption: `Artbild för ${fungi.nameSv}${sc} i Naturboken (${fungi.type || 'Svamp'})`
            });
        }
    }
}

// 5. Fiskar (28 arter)
if (window.swedishFish) {
    for (const fish of window.swedishFish) {
        if (fish.image && fs.existsSync(fish.image)) {
            const sc = fish.scientific ? ` (${fish.scientific})` : '';
            images.push({
                loc: BASE_URL + fish.image,
                title: `${fish.nameSv} – Fiskboken`,
                caption: `Artbild för ${fish.nameSv}${sc} i Naturboken (${fish.type || 'Fisk'})`
            });
        }
    }
}

console.log(`Totalt insamlade bilder för sitemap: ${images.length}`);

// Generera XML
const today = new Date().toISOString().split('T')[0];
let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${BASE_URL}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
`;

for (const img of images) {
    xml += `    <image:image>
      <image:loc>${escapeXml(img.loc)}</image:loc>
      <image:title>${escapeXml(img.title)}</image:title>
      <image:caption>${escapeXml(img.caption)}</image:caption>
    </image:image>
`;
}

xml += `  </url>
</urlset>
`;

const outputPath = path.join(__dirname, '../sitemap.xml');
fs.writeFileSync(outputPath, xml, 'utf8');
console.log(`Skrev sitemap.xml framgångsrikt till ${outputPath} (${(xml.length / 1024).toFixed(1)} KB)`);
