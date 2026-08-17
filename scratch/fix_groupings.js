// fix_groupings.js – Åtgärdar alla grupperingsproblem i birds.js

const fs = require('fs');
const content = fs.readFileSync('birds.js', 'utf8');
const match = content.match(/window\.swedishBirds\s*=\s*(\[[\s\S]*?\]);/);
const birds = JSON.parse(match[1]);

// Alla ändringar som ett mappningsobjekt: { bird_id: ny_typ }
const typeChanges = {

    // === 1. Storskarv → Skarvar (så gruppen får 2 fåglar) ===
    'great_cormorant': 'Skarvar',

    // === 2. Lommor → Lommar & Doppingar ===
    'common_loon':       'Lommar & Doppingar',
    'yellow_billed_loon': 'Lommar & Doppingar',

    // === 3. Rallfåglar → Tranor & Rallar ===
    'little_crake': 'Tranor & Rallar',

    // === 4. Alkor → Alkfåglar ===
    'atlantic_puffin': 'Alkfåglar',

    // === 5. Vadarfåglar → Vadare ===
    'collared_pratincole': 'Vadare',

    // === 6. Albatrossar → Stormfåglar ===
    'black_browed_albatross': 'Stormfåglar',

    // === 7. Storkar → Hägrar ===
    'black_stork': 'Hägrar',

    // === 8. Svalor & Seglare – slå ihop till en intuitiv grupp ===
    'barn_swallow':     'Svalor & Seglare',
    'common_house_martin': 'Svalor & Seglare',
    'sand_martin':      'Svalor & Seglare',
    'common_swift':     'Svalor & Seglare',
    'pallid_swift':     'Svalor & Seglare',

    // === 9. Alla Måsar slås ihop till Måsar & Tärnor ===
    // (alla birds med type='Måsar' → 'Måsar & Tärnor')
    // Hanteras nedan i loop

    // === 10. Ensamstående familjer → Övriga ===
    'short_toed_treecreeper': 'Övriga',   // Trädkrypare
    'rosy_starling':          'Övriga',   // Starar
    'spotless_starling':      'Övriga',   // Starar
    'dalmatian_pelican':      'Övriga',   // Pelikaner
    'eurasian_hoopoe':        'Övriga',   // Härfåglar
    'european_bee_eater':     'Övriga',   // Biätare
    'little_bustard':         'Övriga',   // Trappe
    'european_roller':        'Övriga',   // Blåkråkor
    'great_spotted_cuckoo':   'Övriga',   // Gökfåglar
    'european_shag':          'Övriga',   // Skarvar (nu att Storskarv tar platsen)
    // Tornseglare i Övriga redan hanterad ovan (→ Svalor & Seglare)
};

let changed = 0;
birds.forEach(bird => {
    // Specifika ID-ändringar
    if (typeChanges[bird.id]) {
        console.log(`  ${bird.nameSv}: ${bird.type} → ${typeChanges[bird.id]}`);
        bird.type = typeChanges[bird.id];
        changed++;
    }
    // Alla Måsar → Måsar & Tärnor
    else if (bird.type === 'Måsar') {
        console.log(`  ${bird.nameSv}: Måsar → Måsar & Tärnor`);
        bird.type = 'Måsar & Tärnor';
        changed++;
    }
});

console.log(`\n✅ ${changed} fåglar uppdaterade`);

// Skriv tillbaka
const allBirdsJson = birds.map(b => '    ' + JSON.stringify(b)).join(',\n');
const newContent = `// Comprehensive list of birds seen in Sweden (Regular breeding, migration, and common visitors)\n// Classification follows standard Swedish taxonomy.\n// Rarity Scale: 1 (Very Common) -> 5 (Very Rare / Casual Visitor)\n// Last updated: ${new Date().toISOString().split('T')[0]}\n\nwindow.swedishBirds = [\n${allBirdsJson}\n];\n`;
fs.writeFileSync('birds.js', newContent, 'utf8');

// Verifiera
const birds2 = JSON.parse(newContent.match(/window\.swedishBirds\s*=\s*(\[[\s\S]*?\]);/)[1]);
const typeCounts = {};
birds2.forEach(b => { typeCounts[b.type] = (typeCounts[b.type]||0)+1; });
console.log('\n=== TYPER EFTER ÄNDRING ===');
Object.entries(typeCounts).sort((a,b)=>b[1]-a[1]).forEach(([t,c]) => {
    const marker = c === 1 ? ' ⚠️' : '';
    console.log(c.toString().padStart(3), ' ', t + marker);
});
console.log('\nAntal typer:', Object.keys(typeCounts).length);
