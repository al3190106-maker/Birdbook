const fs = require('fs');

const content = fs.readFileSync('birds.js', 'utf8');
const newEntries = fs.readFileSync('scratch/new_birds_entries.js', 'utf8');

// Find the closing bracket of the array
const lastBracket = content.lastIndexOf('];');
if (lastBracket === -1) {
    console.log('ERROR: could not find end of array');
    process.exit(1);
}

// Insert before the closing bracket
const before = content.substring(0, lastBracket);
const after = content.substring(lastBracket);

const newContent = before + ',\n' + newEntries + '\n' + after;
fs.writeFileSync('birds.js', newContent, 'utf8');

// Quick count via id fields
const idMatches = newContent.match(/"id":/g);
console.log('Insertion done!');
console.log('Total bird entries (id fields):', idMatches ? idMatches.length : 'unknown');
console.log('File size:', (newContent.length / 1024).toFixed(1) + ' KB');
