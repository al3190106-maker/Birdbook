// update_new_birds_images.js
// Uppdaterar image-fältet för alla nya fåglar (Wikimedia) till naturboken CDN-URL
// Behåller Wikimedia som fallback-kommentar

const fs = require('fs');

const content = fs.readFileSync('birds.js', 'utf8');
const match = content.match(/window\.swedishBirds\s*=\s*(\[[\s\S]*?\]);/);
if (!match) { console.log('ERROR'); process.exit(1); }
const birds = JSON.parse(match[1]);

const CDN_BASE = 'https://naturboken.alt-qq.com/birds/originals/';
let updatedCount = 0;
const wikiBackup = {};

birds.forEach(bird => {
    if (bird.image && bird.image.includes('wikimedia.org')) {
        wikiBackup[bird.id] = bird.image; // Spara Wikimedia-URL
        bird.image = CDN_BASE + bird.id + '.png'; // Sätt CDN-URL
        updatedCount++;
    }
});

console.log('Updated', updatedCount, 'birds to CDN URLs');

// Skriv tillbaka
const allBirdsJson = birds.map(b => '    ' + JSON.stringify(b)).join(',\n');
const newContent = `// Comprehensive list of birds seen in Sweden (Regular breeding, migration, and common visitors)\n// Classification follows standard Swedish taxonomy.\n// Rarity Scale: 1 (Very Common) -> 5 (Very Rare / Casual Visitor)\n// Last updated: ${new Date().toISOString().split('T')[0]}\n\nwindow.swedishBirds = [\n${allBirdsJson}\n];\n`;

fs.writeFileSync('birds.js', newContent, 'utf8');
console.log('birds.js updated!');

// Spara Wikimedia-backup
fs.writeFileSync('scratch/wikimedia_backup_urls.json', JSON.stringify(wikiBackup, null, 2), 'utf8');
console.log('Wikimedia URLs saved to scratch/wikimedia_backup_urls.json');
console.log('\nDU BEHÖVER LADDA UPP BILDER TILL CDN:');
console.log('Format: https://naturboken.alt-qq.com/birds/originals/{bird_id}.png');
console.log('Totalt:', updatedCount, 'bilder att ladda upp');
