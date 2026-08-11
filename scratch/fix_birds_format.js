// fix_birds_format.js - Rensa ny_birds_entries.js och infoga korrekt i birds.js

const fs = require('fs');

// Läs och parsa det genererade datat (utan kommentarer)
const newBirdsContent = fs.readFileSync('scratch/new_birds_entries.js', 'utf8');

// Ta bort kommentarsrader och extrahera JSON-objekt
// Hitta alla JSON-objekt via ett enklare sätt – kör generate-scriptet och hämta arrayen direkt
const genContent = fs.readFileSync('scratch/generate_new_birds.js', 'utf8');

// Extrahera newBirds arrayen från generate-filen
const arrayMatch = genContent.match(/const newBirds = \[([\s\S]*?)\];\s*\n\s*\/\/ Generera/);
if (!arrayMatch) {
    console.log('Could not extract array from generate script');
    process.exit(1);
}

// Eval the array safely
const newBirds = eval('[' + arrayMatch[1] + ']');
console.log('Parsed', newBirds.length, 'new bird entries');

// Läs original birds.js (vi behöver återskapa det utan den felaktiga infogningen)
// Hämta bara de ursprungliga 257 fåglarna
const originalContent = fs.readFileSync('birds.js', 'utf8');

// Hitta positionen för kommentaren vi lade till
const insertMarker = ',\n\n// === TILLAGDA FRÅN GBIF SVERIGE 2026';
const insertPos = originalContent.indexOf(insertMarker);

if (insertPos === -1) {
    console.log('Could not find insert marker - looking for last valid entry...');
    // Hitta slutet på arrayen (sista } innan ];)
    const lastClose = originalContent.lastIndexOf('}', originalContent.lastIndexOf('];') - 1);
    const cleanContent = originalContent.substring(0, lastClose + 1) + '\n];';
    fs.writeFileSync('birds.js', cleanContent + '\n', 'utf8');
    console.log('Reset birds.js to original');
} else {
    // Återställ till original
    const cleanContent = originalContent.substring(0, insertPos) + '\n];';
    fs.writeFileSync('birds.js', cleanContent + '\n', 'utf8');
    console.log('Restored original birds.js');
}

// Verifiera original
const cleanRead = fs.readFileSync('birds.js', 'utf8');
const origMatch = cleanRead.match(/window\.swedishBirds\s*=\s*(\[[\s\S]*?\]);/);
if (!origMatch) {
    console.log('ERROR: Could not find array after restore');
    process.exit(1);
}
const origBirds = JSON.parse(origMatch[1]);
console.log('Original birds count:', origBirds.length);

// Nu infoga de nya fåglarna korrekt
// Bygg ny array-sträng
const allBirds = [...origBirds, ...newBirds];
const allBirdsJson = allBirds.map(b => '    ' + JSON.stringify(b)).join(',\n');
const newContent = `// Comprehensive list of birds seen in Sweden (Regular breeding, migration, and common visitors)\n// Classification follows standard Swedish taxonomy.\n// Rarity Scale: 1 (Very Common) -> 5 (Very Rare / Casual Visitor)\n// Last updated: ${new Date().toISOString().split('T')[0]} – Added ${newBirds.length} species from GBIF Sweden 2026\n\nwindow.swedishBirds = [\n${allBirdsJson}\n];\n`;

fs.writeFileSync('birds.js', newContent, 'utf8');
console.log('Written new birds.js with', allBirds.length, 'total birds');

// Final verify
const finalContent = fs.readFileSync('birds.js', 'utf8');
const finalMatch = finalContent.match(/window\.swedishBirds\s*=\s*(\[[\s\S]*?\]);/);
if (finalMatch) {
    const finalBirds = JSON.parse(finalMatch[1]);
    const finalIds = new Set(finalBirds.map(b => b.id));
    console.log('FINAL VERIFY:');
    console.log('  Total birds:', finalBirds.length);
    console.log('  Unique IDs:', finalIds.size);
    console.log('  File size:', (finalContent.length / 1024).toFixed(1) + ' KB');
    if (finalIds.size !== finalBirds.length) {
        console.log('  WARNING: duplicate IDs!');
    } else {
        console.log('  OK: No duplicate IDs');
    }
}
