const fs = require('fs');
const path = 'c:/Users/theia/Documents/AI/birdfinder/birds.js';
const birdsContent = fs.readFileSync(path, 'utf8');

// Extract the array content
// Helper to find the array bounds
const startRegex = /window\.swedishBirds = \[\s*/;
const endRegex = /\];/;

const startMatch = birdsContent.match(startRegex);
if (!startMatch) {
    console.error("Could not find swedishBirds array start");
    process.exit(1);
}

// We will iterate through lines to find where the array starts and ends
let lines = birdsContent.split('\n');
let newLines = [];
let insideArray = false;
let currentType = '';
let currentName = '';

const timeMapping = {
    'Ugglor': 'Skymning och natt',
    'Sångare': 'Tidig morgon',
    'Trastar': 'Tidig morgon',
    'Rovfåglar': 'Mitt på dagen (termik)',
    'Hägrar': 'Hela dagen',
    'Tranor & Rallar': 'Tidig morgon och kväll',
    'Hackspettar': 'Förmiddag',
    'Andfåglar': 'Hela dagen',
    'Vadare': 'Hela dagen',
    'Måsar & Tärnor': 'Hela dagen',
    'Alkfåglar': 'Hela dagen',
    'Lommar & Doppingar': 'Hela dagen',
    'Hönsfåglar': 'Tidig morgon',
    'Mesar': 'Hela dagen',
    'Finkar': 'Hela dagen',
    'Sparvar': 'Hela dagen',
    'Kråkfåglar': 'Hela dagen',
    'Svalor': 'Hela dagen (jagar insekter)',
    'Duvor': 'Hela dagen',
    'Övriga': 'Morgon och förmiddag'
};

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    if (line.includes('window.swedishBirds = [')) {
        insideArray = true;
        newLines.push(line);
        continue;
    }

    if (insideArray && line.trim() === '];') {
        insideArray = false;
        newLines.push(line);
        continue;
    }

    if (!insideArray) {
        newLines.push(line);
        continue;
    }

    // Inside array processing
    if (line.trim().startsWith('//')) {
        newLines.push(line);
        continue;
    }

    // Check for type
    let typeMatch = line.match(/"type":\s*"([^"]+)"/);
    if (typeMatch) currentType = typeMatch[1];

    // Check for name
    let nameMatch = line.match(/"nameSv":\s*"([^"]+)"/);
    if (nameMatch) currentName = nameMatch[1];

    // Check for end of object
    // Case 1: Single line object: { ... },
    if (line.trim().endsWith('},') || line.trim() === '}') {
        // If it's a minimal line like "    }," we look back for content
        if (line.trim() === '},' || line.trim() === '}') {
            // The previous pushed line contains the last property
            let lastPushed = newLines.pop();
            if (lastPushed && !lastPushed.trim().endsWith(',')) {
                lastPushed = lastPushed.trimEnd() + ',';
            }
            newLines.push(lastPushed);

            // Calculate best time
            let bestTime = timeMapping[currentType] || 'Dagtid';
            if (currentName.includes('Nattskärra')) bestTime = 'Skymning och natt';
            if (currentName.includes('Näktergal')) bestTime = 'Sen kväll och natt';
            if (currentName.includes('morkulla')) bestTime = 'Skymning (drag)';
            if (currentName.includes('Uggla')) bestTime = 'Skymning och natt';

            newLines.push(`        "bestTime": "${bestTime}"`);
            newLines.push(line);

            currentType = '';
            currentName = '';
        } else {
            // It's a single line object e.g. { ... }
            // Insert before the closing brace
            let bestTime = timeMapping[currentType] || 'Dagtid';
            if (currentName.includes('Nattskärra')) bestTime = 'Skymning och natt';
            if (currentName.includes('Näktergal')) bestTime = 'Sen kväll och natt';
            if (currentName.includes('morkulla')) bestTime = 'Skymning (drag)';
            if (currentName.includes('Uggla')) bestTime = 'Skymning och natt';

            // Regex to insert before closing brace
            // Handle both "}" and "},"
            let modified = line.replace(/(,)?(\s*\},?)$/, `, "bestTime": "${bestTime}"$2`);
            // Fallback if regex didn't match (unlikely for single line)
            if (modified === line) {
                // Maybe it ends with just } without comma?
                modified = line.replace(/\}\s*$/, `, "bestTime": "${bestTime}" }`);
            }
            newLines.push(modified);
            currentType = '';
            currentName = '';
        }
    } else {
        newLines.push(line);
    }
}

fs.writeFileSync(path, newLines.join('\n'));
console.log('Done.');
