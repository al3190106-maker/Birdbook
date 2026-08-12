const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

// Load mock window environment to parse .js files easily
const window = {};

function loadScript(filePath) {
    const code = fs.readFileSync(filePath, 'utf8');
    eval(code);
}

loadScript(path.join(__dirname, '../birds.js'));
loadScript(path.join(__dirname, '../fungi.js'));
loadScript(path.join(__dirname, '../fish.js'));
loadScript(path.join(__dirname, '../trees.js'));
loadScript(path.join(__dirname, '../flowers.js'));
loadScript(path.join(__dirname, '../animals.js'));

const allItems = [
    ...(window.swedishBirds || []).map(item => ({ ...item, category: 'Fågel' })),
    ...(window.swedishFungi || []).map(item => ({ ...item, category: 'Svamp' })),
    ...(window.swedishFish || []).map(item => ({ ...item, category: 'Fisk' })),
    ...(window.swedishTrees || []).map(item => ({ ...item, category: 'Träd' })),
    ...(window.swedishFlowers || []).map(item => ({ ...item, category: 'Blomma' })),
    ...(window.swedishAnimals || []).map(item => ({ ...item, category: 'Djur' }))
];

console.log(`Analyserar ${allItems.length} arter totalt...`);

// 1. Detect duplicate image URLs in data files
const urlMap = {};
const duplicateUrls = [];

allItems.forEach(item => {
    if (!item.image) return;
    const url = item.image.trim();
    if (!urlMap[url]) {
        urlMap[url] = [];
    }
    urlMap[url].push(item);
});

for (const [url, items] of Object.entries(urlMap)) {
    if (items.length > 1) {
        duplicateUrls.push({ url, items });
    }
}

console.log(`Hittade ${duplicateUrls.length} identiska bild-URL-delningar.`);

// Function to fetch image buffer
function fetchBuffer(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode !== 200) {
                return resolve(null);
            }
            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => resolve(Buffer.concat(chunks)));
            res.on('error', () => resolve(null));
        }).on('error', () => resolve(null));
    });
}

// Process images to check binary content hashes
async function checkBinaryHashes() {
    console.log("Laddar ner och beräknar bild-hashar från naturboken.alt-qq.com...");
    const hashMap = {};
    const contentDuplicates = [];

    const itemsWithImages = allItems.filter(i => i.image && i.image.includes('naturboken.alt-qq.com'));
    let batchSize = 15;
    
    for (let i = 0; i < itemsWithImages.length; i += batchSize) {
        const batch = itemsWithImages.slice(i, i + batchSize);
        await Promise.all(batch.map(async (item) => {
            const buf = await fetchBuffer(item.image);
            if (!buf) return;
            // Compute MD5 hash of raw image content
            const md5 = crypto.createHash('md5').update(buf).digest('hex');
            if (!hashMap[md5]) {
                hashMap[md5] = [];
            }
            hashMap[md5].push(item);
        }));
        process.stdout.write(`Framsteg: ${Math.min(i + batchSize, itemsWithImages.length)} / ${itemsWithImages.length} bilder analyserade...\r`);
    }

    console.log("\nAnalys klar!");

    for (const [hash, items] of Object.entries(hashMap)) {
        if (items.length > 1) {
            contentDuplicates.push({ hash, items });
        }
    }

    console.log(`\n=== DUBBLETT-RAPPORT ===`);
    console.log(`Hittade ${contentDuplicates.length} grupper av identiska bildfiler (samma bild med olika namn).\n`);

    const txtPath = path.join(__dirname, '../re-generate-birds.txt');
    let currentTxt = fs.readFileSync(txtPath, 'utf8');

    let addedCount = 0;
    contentDuplicates.forEach(group => {
        const names = group.items.map(it => `${it.nameSv} (${it.category})`).join(' OCH ');
        console.log(`⚠️ Dubblett-grupp (${group.items[0].image}): ${names}`);
        
        group.items.forEach(it => {
            const entry = `- ${it.nameSv}: Samma bildfil används som för ${group.items.filter(x => x.id !== it.id).map(x => x.nameSv).join(', ')}`;
            if (!currentTxt.includes(it.nameSv)) {
                currentTxt += `\n${entry}`;
                addedCount++;
            }
        });
    });

    if (addedCount > 0) {
        fs.writeFileSync(txtPath, currentTxt, 'utf8');
        console.log(`\nLade till ${addedCount} nya dubblett-fåglar i re-generate-birds.txt!`);
    } else {
        console.log("\nInga nya dubbletter att lägga till i filen.");
    }
}

checkBinaryHashes().catch(console.error);
