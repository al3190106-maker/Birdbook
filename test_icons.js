const fs = require('fs');

const appJs = fs.readFileSync('app.js', 'utf8');
const regex = /const CATEGORY_ICON_IMAGES = {([\s\S]*?)};\n/m;
const match = appJs.match(regex);
const categoryMap = {};
if (match) {
    const lines = match[1].split('\n');
    for (const line of lines) {
        const parts = line.split(':');
        if (parts.length === 2 && !line.trim().startsWith('//')) {
            let key = parts[0].trim().replace(/^['"]|['"]$/g, '');
            let val = parts[1].trim().replace(/^['"]|['"],?$/g, '').replace(/,/g, '');
            categoryMap[key] = val;
        }
    }
}

const types = new Set();
const files = ['birds.js', 'trees.js', 'fish.js', 'animals.js', 'fungi.js', 'flowers.js', 'plants.js', 'nature.js'];
for (const file of files) {
    if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        const typeMatches = content.match(/"type":\s*"([^"]+)"/g);
        if (typeMatches) {
            for (const t of typeMatches) {
                const typeStr = t.split(':')[1].trim().replace(/^"|"$/g, '');
                types.add(typeStr);
            }
        }
    }
}

console.log("Categories found in data files:", Array.from(types).join(', '));
const missingMappings = [];
for (const type of types) {
    if (!categoryMap[type]) missingMappings.push(type);
}
console.log("Missing Mappings:", missingMappings.join(', ') || 'None');

const missingImages = [];
for (const key in categoryMap) {
    const filename = categoryMap[key];
    if (!fs.existsSync('images/category_icons/' + filename)) {
        missingImages.push(key + ' -> ' + filename);
    }
}
console.log("Missing Images on disk:", missingImages.join(', ') || 'None');
