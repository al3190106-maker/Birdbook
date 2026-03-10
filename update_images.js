const fs = require('fs');

const mappings = [
    { file: "Aegithalos_caudatus.jpg", id: "long_tailed_tit" },
    { file: "Aix_galericulata.jpg", id: "mandarin_duck" },
    { file: "Anas_penelope.jpg", id: "eurasian_wigeon" },
    { file: "Chroicocephalus_ridinundus.jpg", id: "black_headed_gull" },
    { file: "Dendrocopos_minor.jpg", id: "lesser_spotted_woodpecker" },
    { file: "Erithacus_rubecula.jpg", id: "european_robin" },
    { file: "Fulica_atra.jpg", id: "eurasian_coot" },
    { file: "Fulica_atra_2.jpg", id: "eurasian_coot" },
    { file: "Ophrys_insectifera.jpg", id: "fly_orchid" },
    { file: "Parus_major.jpg", id: "great_tit" },
    { file: "Picus_Viridis.jpg", id: "european_green_woodpecker" },
    { file: "Pinicola_enucleator.jpg", id: "pine_grosbeak" },
    { file: "Podiceps_auritus.jpg", id: "horned_grebe" },
    { file: "Podiceps_grisgena.jpg", id: "red_necked_grebe" },
    { file: "Rana_temporaria.jpg", id: "common_frog" },
    { file: "Sitta_europaea.jpg", id: "eurasian_nuthatch" },
    { file: "Sterna hirundo.jpg", id: "common_tern" }
];

let content = fs.readFileSync('bird_images.js', 'utf8');

// Instead of eval, we can just surgically inject these or do string replacement
// Actually, it's easier to just append them to the object if we do it carefully, or parse it.

// Mock window
global.window = {};
eval(content);

const imagesObj = window.birdImages || {};

for (const m of mappings) {
    const src = `images/Fotografer/gustav gotthardsson/${m.file}`;
    const entry = { src: src, photographer: 'gustav' };
    
    if (!imagesObj[m.id]) {
        imagesObj[m.id] = [];
    }
    
    // Add to the front of the array if not already there
    const exists = imagesObj[m.id].find(i => typeof i === 'object' ? i.src === src : i === src);
    if (!exists) {
        imagesObj[m.id].unshift(entry);
    }
}

// Convert back to string
let newContent = 'window.birdImages = {\n';

for (const [key, arr] of Object.entries(imagesObj)) {
    newContent += `    '${key}': [\n`;
    const lines = arr.map(item => {
        if (typeof item === 'string') {
            return `        '${item}'`;
        } else {
            return `        { src: '${item.src}', photographer: '${item.photographer}' }`;
        }
    });
    newContent += lines.join(',\n');
    newContent += `\n    ],\n`;
}
// Remove trailing comma from last item if needed
newContent = newContent.replace(/,\n$/, '\n');
newContent += '};\n';

fs.writeFileSync('bird_images.js', newContent, 'utf8');
console.log("Updated bird_images.js successfully");
