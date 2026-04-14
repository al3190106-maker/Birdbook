const fs = require('fs');
const path = require('path');

let fungiFile = fs.readFileSync('fungi.js', 'utf-8');
const match = fungiFile.match(/window\.swedishFungi\s*=\s*(\[[\s\S]*?\]);/);
let fungiData = eval(match[1]);

let allExist = true;

for (const f of fungiData) {
    if (!f.image) {
        console.error(`ERROR: ${f.nameSv} has no image property!`);
        allExist = false;
    } else {
        const fullPath = path.join(__dirname, f.image);
        if (!fs.existsSync(fullPath)) {
            console.error(`ERROR: Image file for ${f.nameSv} does not exist at ${fullPath}`);
            allExist = false;
        }
    }
    
    if (!f.photographer) {
        console.error(`ERROR: ${f.nameSv} has no photographer property!`);
        allExist = false;
    }
}

if (allExist) {
    console.log("SUCCESS: All 26 mushrooms have a valid image and photographer.");
} else {
    process.exit(1);
}
