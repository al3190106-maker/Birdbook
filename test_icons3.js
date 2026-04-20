const fs = require('fs');
const app = fs.readFileSync('app.js','utf8');
const cats = {};
let match;
const re = /'([^']+)':\s*'([^']+)'/g;
const lines = app.slice(app.indexOf('const CATEGORY_ICON_IMAGES'), app.indexOf('};', app.indexOf('const CATEGORY_ICON_IMAGES')));
while ((match = re.exec(lines)) !== null) {
  cats[match[1]] = match[2];
}
const missingFiles = [];
for (const key in cats) {
  if (!fs.existsSync('images/category_icons/' + cats[key])) {
    missingFiles.push(cats[key]);
  }
}
console.log("Missing files:", missingFiles);
