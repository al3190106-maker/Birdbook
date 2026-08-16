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

console.log("=== FISKFEL (weight > 100 kg / misstänkta värden) ===");
(window.swedishFish || []).forEach(f => {
    if (f.weight > 100 || f.weight > 500) {
        console.log(`🐟 ${f.nameSv} (${f.id}): vikt=${f.weight} (kg?), längd=${f.length} cm`);
    }
});

console.log("\n=== VILTDJUR ===");
(window.swedishAnimals || []).forEach(a => {
    if (a.weight > 1000 || a.length > 500) {
        console.log(`🐾 ${a.nameSv} (${a.id}): vikt=${a.weight}, längd=${a.length}`);
    }
});

console.log("\n=== BLOMMOR / TRÄD / SVAMP (Snabbkoll) ===");
console.log(`Totalt: ${window.swedishFish?.length || 0} fiskar, ${window.swedishFungi?.length || 0} svampar, ${window.swedishTrees?.length || 0} träd, ${window.swedishFlowers?.length || 0} blommor, ${window.swedishAnimals?.length || 0} djur.`);
