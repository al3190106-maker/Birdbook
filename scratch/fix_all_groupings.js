// fix_all_groupings.js – Komplett grupperingsrensning

const fs = require('fs');
const content = fs.readFileSync('birds.js', 'utf8');
const match = content.match(/window\.swedishBirds\s*=\s*(\[[\s\S]*?\]);/);
const birds = JSON.parse(match[1]);

const changes = {
    // === Falkar + Hökfåglar → Rovfåglar ===
    'saker_falcon':           'Rovfåglar',
    'eleonoraes_falcon':      'Rovfåglar',
    'lesser_kestrel':         'Rovfåglar',
    'pallid_harrier':         'Rovfåglar',
    'cinereous_vulture':      'Rovfåglar',
    'bearded_vulture':        'Rovfåglar',
    'steppe_eagle':           'Rovfåglar',
    'black_shouldered_kite':  'Rovfåglar',
    'lesser_spotted_eagle':   'Rovfåglar',
    'bald_eagle':             'Rovfåglar',
    'greater_spotted_eagle':  'Rovfåglar',
    'imperial_eagle':         'Rovfåglar',
    'short_toed_snake_eagle': 'Rovfåglar',
    'eurasian_griffon':       'Rovfåglar',

    // === Lärkor i Övriga → Lärkor ===
    'eurasian_skylark': 'Lärkor',   // Sånglärka
    'woodlark':         'Lärkor',   // Trädlärka

    // === Järnsparv i Övriga → Järnsparvar ===
    'dunnock': 'Järnsparvar',       // Järnsparv (vanlig)

    // === Ärlor – piplärkor och ärlor i Övriga → Ärlor ===
    'white_wagtail':       'Ärlor',  // Sädesärla
    'grey_wagtail':        'Ärlor',  // Forsärla
    'yellow_wagtail':      'Ärlor',  // Gulärla
    'tree_pipit':          'Ärlor',  // Trädpiplärka
    'red_throated_pipit':  'Ärlor',  // Rödstrupig piplärka
    'meadow_pipit':        'Ärlor',  // Ängspiplärka

    // === Törnskator (varfåglar) – finns i Övriga → Törnskator ===
    'great_grey_shrike': 'Törnskator',  // Varfågel
    'red_backed_shrike': 'Törnskator',  // Törnskata

    // === Starar – slå ihop till en grupp ===
    'common_starling':  'Starar',
    'rosy_starling':    'Starar',
    'spotless_starling':'Starar',

    // === Trädkrypare – slå ihop ===
    'eurasian_treecreeper':      'Trädkrypare',
    'short_toed_treecreeper':    'Trädkrypare',

    // === Finkar – twite och european_serin hör hit (redan i Finkar, men dubbelkolla via skript) ===
    // twite och european_serin är redan i Finkar - OK

    // === Gök(fåglar) – Gök och Fläckig gök ===
    'common_cuckoo':        'Gökfåglar',
    'great_spotted_cuckoo': 'Gökfåglar',
};

let changed = 0;
birds.forEach(b => {
    if (changes[b.id]) {
        console.log(`  ${b.nameSv}: ${b.type} → ${changes[b.id]}`);
        b.type = changes[b.id];
        changed++;
    }
});

console.log(`\n✅ ${changed} fåglar uppdaterade`);

// Spara
const allBirdsJson = birds.map(b => '    ' + JSON.stringify(b)).join(',\n');
fs.writeFileSync('birds.js', 'window.swedishBirds = [\n' + allBirdsJson + '\n];\n', 'utf8');

// Slutrapport
const birds2 = JSON.parse(fs.readFileSync('birds.js','utf8').match(/window\.swedishBirds\s*=\s*(\[[\s\S]*?\]);/)[1]);
const typeCounts = {};
birds2.forEach(b => { typeCounts[b.type]=(typeCounts[b.type]||0)+1; });
console.log('\n=== ALLA TYPER EFTER ÄNDRING ===');
Object.entries(typeCounts).sort((a,b)=>b[1]-a[1]).forEach(([t,c]) => {
    const warn = c===1?' ⚠️':'';
    console.log(c.toString().padStart(3),'  '+t+warn);
});
console.log('\nÖvriga kvar:');
birds2.filter(b=>b.type==='Övriga').forEach(b=>console.log(' ',b.nameSv));
