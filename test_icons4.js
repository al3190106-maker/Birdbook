const fs = require('fs');
const app = fs.readFileSync('app.js','utf8');
const faMap = {};
let match;
const re = /'([^']+)':\s*'fa-([^']+)'/g;
const lines = app.slice(app.indexOf('function getCategoryIcon(type)'), app.indexOf('return map[type]'));
while ((match = re.exec(lines)) !== null) {
  faMap[match[1]] = true;
}
const types = new Set();
['birds.js', 'trees.js', 'fish.js', 'animals.js', 'fungi.js', 'flowers.js'].forEach(f => {
if (fs.existsSync(f)) {
    const content = fs.readFileSync(f,'utf8');
    let m;
    const re2 = /"type":\s*"([^"]+)"/g;
    while ((m = re2.exec(content)) !== null) {
      types.add(m[1]);
    }
}
});
const missing = [];
for (const t of types) {
if (!faMap[t]) missing.push(t);
}
console.log("Missing from getCategoryIcon:", missing);
