const fs = require('fs');
const path = require('path');

const window = {};

function loadScript(filePath) {
    const code = fs.readFileSync(filePath, 'utf8');
    eval(code);
}

loadScript(path.join(__dirname, '../fish.js'));
loadScript(path.join(__dirname, '../fungi.js'));
loadScript(path.join(__dirname, '../trees.js'));
loadScript(path.join(__dirname, '../flowers.js'));
loadScript(path.join(__dirname, '../animals.js'));

console.log("=== FISKAR (fish.js) ===");
(window.swedishFish || []).forEach(f => {
    console.log(`🐟 ${f.id} (${f.nameSv}): length=${f.length} cm, weight=${f.weight}`);
});

console.log("\n=== DJUR (animals.js) ===");
(window.swedishAnimals || []).forEach(a => {
    console.log(`🐾 ${a.id} (${a.nameSv}): height=${a.height} cm, length=${a.length}, weight=${a.weight}`);
});

console.log("\n=== SVAMPAR (fungi.js) ===");
(window.swedishFungi || []).forEach(f => {
    console.log(`🍄 ${f.id} (${f.nameSv}): size=${f.size}, edibility=${f.edibility}`);
});

console.log("\n=== TRÄD (trees.js) ===");
(window.swedishTrees || []).forEach(t => {
    console.log(`🌲 ${t.id} (${t.nameSv}): height=${t.height}, age=${t.age}`);
});

console.log("\n=== BLOMMOR (flowers.js) ===");
(window.swedishFlowers || []).forEach(fl => {
    console.log(`🌸 ${fl.id} (${fl.nameSv}): height=${fl.height}`);
});

