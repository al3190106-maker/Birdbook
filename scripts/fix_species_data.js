const fs = require('fs');
const path = require('path');

// 1. Fix fish.js (convert weight from grams to kg if weight > 50)
const fishPath = path.join(__dirname, '../fish.js');
let fishContent = fs.readFileSync(fishPath, 'utf8');

// Match "weight": <number>
fishContent = fishContent.replace(/"weight":\s*(\d+(\.\d+)?)/g, (match, p1) => {
    const val = parseFloat(p1);
    if (val >= 1) {
        const kgVal = val / 1000;
        return `"weight": ${kgVal}`;
    }
    return match;
});
fs.writeFileSync(fishPath, fishContent, 'utf8');
console.log("✅ Fixed fish.js weights to kg");

// 2. Fix animals.js (convert weight from grams to kg)
const animalsPath = path.join(__dirname, '../animals.js');
let animalsContent = fs.readFileSync(animalsPath, 'utf8');

animalsContent = animalsContent.replace(/"weight":\s*(\d+(\.\d+)?)/g, (match, p1) => {
    const val = parseFloat(p1);
    if (val >= 1) {
        const kgVal = val / 1000;
        return `"weight": ${kgVal}`;
    }
    return match;
});
fs.writeFileSync(animalsPath, animalsContent, 'utf8');
console.log("✅ Fixed animals.js weights to kg");

// 3. Fix trees.js (add typical max age)
const treeAges = {
    "silver_birch": 100,
    "downy_birch": 100,
    "scots_pine": 350,
    "norway_spruce": 400,
    "oak": 1000,
    "beech": 350,
    "european_ash": 250,
    "wych_elm": 300,
    "norway_maple": 150,
    "small_leaved_lime": 800,
    "aspen": 100,
    "rowan": 80,
    "juniper": 500,
    "goat_willow": 80,
    "bird_cherry": 60,
    "hawthorn": 100,
    "alder": 120,
    "black_alder": 100,
    "whitebeam": 100,
    "crab_apple": 100,
    "wild_cherry": 80,
    "wych_elm2": 300,
    "hornbeam": 150,
    "yew": 1000,
    "field_maple": 150
};

const treesPath = path.join(__dirname, '../trees.js');
let treesContent = fs.readFileSync(treesPath, 'utf8');

// For each tree object, insert "age": N after "height": N
Object.keys(treeAges).forEach(id => {
    const age = treeAges[id];
    // Find item by id and add age
    const regex = new RegExp(`("id":\\s*"${id}"[\\s\\S]*?"height":\\s*\\d+)`, 'g');
    treesContent = treesContent.replace(regex, `$1,\n        "age": ${age}`);
});

fs.writeFileSync(treesPath, treesContent, 'utf8');
console.log("✅ Fixed trees.js ages");
