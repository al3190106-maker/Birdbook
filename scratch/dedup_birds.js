// Dedup: remove old entries with outdated scientific names, keep new ones
const fs = require('fs');
const content = fs.readFileSync('birds.js', 'utf8');
const match = content.match(/window\.swedishBirds\s*=\s*(\[[\s\S]*?\]);/);
const birds = JSON.parse(match[1]);

// These IDs have duplicates - old name -> keep new (last occurrence)
const dupeIds = ['eurasian_wigeon', 'wood_warbler', 'barred_warbler'];

// For each dupe, keep the one with updated scientific name
const deduped = [];
const seen = new Set();

for (const bird of birds) {
    if (!dupeIds.includes(bird.id)) {
        deduped.push(bird);
        seen.add(bird.id);
    }
}

// Now add the new versions of the dupes (from our added entries)
const newVersions = {
    'eurasian_wigeon': 'Mareca penelope',
    'wood_warbler': 'Phylloscopus sibillatrix',
    'barred_warbler': 'Sylvia nisoria'
};

for (const bird of birds) {
    if (dupeIds.includes(bird.id) && bird.scientific === (newVersions[bird.id] + ' (Bechstein, 1792)' || newVersions[bird.id])) {
        deduped.push(bird);
    }
}

// Actually simpler: just keep last occurrence of each id
const finalMap = new Map();
for (const bird of birds) {
    finalMap.set(bird.id, bird); // last wins = our new entries
}
const finalBirds = [...finalMap.values()];

const allBirdsJson = finalBirds.map(b => '    ' + JSON.stringify(b)).join(',\n');
const newContent = `// Comprehensive list of birds seen in Sweden (Regular breeding, migration, and common visitors)\n// Classification follows standard Swedish taxonomy.\n// Rarity Scale: 1 (Very Common) -> 5 (Very Rare / Casual Visitor)\n// Last updated: ${new Date().toISOString().split('T')[0]} – Added new species from GBIF Sweden 2026\n\nwindow.swedishBirds = [\n${allBirdsJson}\n];\n`;

fs.writeFileSync('birds.js', newContent, 'utf8');

// Verify
const finalContent = fs.readFileSync('birds.js', 'utf8');
const finalMatch = finalContent.match(/window\.swedishBirds\s*=\s*(\[[\s\S]*?\]);/);
const finalBirdsVerify = JSON.parse(finalMatch[1]);
const finalIds = finalBirdsVerify.map(b => b.id);
const uniqueIds = new Set(finalIds);
console.log('FINAL:');
console.log('  Total birds:', finalBirdsVerify.length);
console.log('  Unique IDs:', uniqueIds.size);
console.log('  File size:', (finalContent.length / 1024).toFixed(1) + ' KB');
if (uniqueIds.size === finalBirdsVerify.length) {
    console.log('  OK: No duplicates!');
} else {
    console.log('  STILL has dupes!');
}
