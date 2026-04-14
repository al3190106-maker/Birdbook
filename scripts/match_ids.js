const fs = require('fs');

global.window = {};

try {
    eval(fs.readFileSync('birds.js', 'utf8'));
    eval(fs.readFileSync('animals.js', 'utf8'));
    eval(fs.readFileSync('flowers.js', 'utf8'));
    eval(fs.readFileSync('fish.js', 'utf8'));
    eval(fs.readFileSync('fungi.js', 'utf8'));
    eval(fs.readFileSync('trees.js', 'utf8'));
} catch (e) {}

const allData = [
    ...(window.swedishBirds || []),
    ...(window.swedishAnimals || []),
    ...(window.swedishFlowers || []),
    ...(window.swedishFish || []),
    ...(window.swedishFungi || []),
    ...(window.swedishTrees || [])
];

const targetNames = [
    "Mindre hackspett",
    "Flugblomster",
    "Vanlig groda",
    "Mandarinand"
];

for (let name of targetNames) {
    const found = allData.find(item => item.nameSv && item.nameSv.toLowerCase().includes(name.toLowerCase()));
    if (found) {
        console.log(`FOUND: ${name} -> ID: ${found.id} (Scientific: ${found.scientific})`);
    } else {
        console.log(`NOT FOUND: ${name}`);
    }
}
