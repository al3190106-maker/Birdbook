const fs = require('fs');

const fileContent = fs.readFileSync('birds.js', 'utf8');
// Extract the array
const match = fileContent.match(/window\.swedishBirds\s*=\s*(\[\s*\{[\s\S]+?\}\s*\])\s*;/);

if (!match) {
    console.error("Could not find window.swedishBirds array");
    process.exit(1);
}

let birds = eval(match[1]);

function getSubType(name, type) {
    name = name.toLowerCase();
    
    // Detailed mappings for perfect logical grouping
    if (type === 'Rovfåglar') {
        if (name.includes('örn')) return '1_örn';
        if (name.includes('gjuse')) return '2_gjuse';
        if (name.includes('glada')) return '3_glada';
        if (name.includes('vråk')) return '4_vråk';
        if (name.includes('hök')) return '5_hök';
        if (name.includes('falk')) return '6_falk';
    }
    if (type === 'Andfåglar') {
        if (name.includes('svan')) return '1_svan';
        if (name.includes('gås')) return '2_gås';
        if (name.includes('skrake')) return '4_skrake';
        // The rest are ducks
        return '3_and';
    }
    if (type === 'Måsar & Tärnor') {
        if (name.includes('trut')) return '1_trut';
        if (name.includes('mås')) return '2_mås';
        if (name.includes('tärna')) return '3_tärna';
    }
    if (type === 'Finkar') {
        if (name.includes('korsnäbb')) return '1_korsnäbb';
        if (name.includes('fink')) return '2_fink';
        if (name.includes('siska')) return '3_siska';
        if (name.includes('hämpling')) return '4_hämpling';
        if (name.includes('domherre') || name.includes('stenknäck')) return '5_övrigt';
    }
    if (type === 'Lommar & Doppingar') {
        if (name.includes('lom')) return '1_lom';
        if (name.includes('dopping')) return '2_dopping';
    }
    if (type === 'Ugglor') {
        if (name.includes('uv')) return '1_uv';
        return '2_uggla';
    }
    if (type === 'Hackspettar') {
        if (name.includes('göktyta')) return '1_göktyta';
        if (name.includes('spillkråka')) return '2_spillkråka';
        return '3_spett';
    }
    if (type === 'Kråkfåglar') {
        if (name.includes('skrika')) return '1_skrika';
        if (name.includes('skata')) return '2_skata';
        if (name.includes('kråka') || name.includes('korp') || name.includes('kaja') || name.includes('råka')) return '3_corvus';
        return '4_övrigt';
    }
    if (type === 'Sångare') {
        if (name.includes('sångare')) return '1_sångare';
        return '2_övrigt';
    }
    if (type === 'Vadare') {
        if (name.includes('strandskata')) return '0_strandskata';
        if (name.includes('pipare')) return '1_pipare';
        if (name.includes('vipa')) return '2_vipa';
        if (name.includes('snäppa')) return '3_snäppa';
        if (name.includes('spov')) return '4_spov';
        if (name.includes('beckasin') || name.includes('morkulla')) return '5_beckasin';
        return '6_övrigt';
    }

    // Default by type
    return '1_default';
}

birds.sort((a, b) => {
    // 1. Group by Type (we want to keep the original type order overall, so let's find the first index of this type in the original list)
    const typeA = a.type;
    const typeB = b.type;
    
    // We don't want to mess up the general bird type order (Andfåglar -> Hönsfåglar -> ...), so let's preserve the original type order
    // We can do this by recording the order of types as they appear
    return 0; // We'll do a custom sort logic
});

// Extract original type order
const typeOrder = [];
birds.forEach(b => {
    if (!typeOrder.includes(b.type)) typeOrder.push(b.type);
});

birds.sort((a, b) => {
    const tA = typeOrder.indexOf(a.type);
    const tB = typeOrder.indexOf(b.type);
    if (tA !== tB) return tA - tB;
    
    // Same type, sort by sub-type
    const sA = getSubType(a.nameSv, a.type);
    const sB = getSubType(b.nameSv, b.type);
    if (sA !== sB) return sA.localeCompare(sB);
    
    // Same sub-type, sort by wingspan descending (usually bigger birds come first within a group)
    return (b.wingspan || 0) - (a.wingspan || 0);
});

// Reconstruct file
const newArrayStr = JSON.stringify(birds, null, 4);
const newContent = fileContent.replace(/window\.swedishBirds\s*=\s*\[\s*\{[\s\S]+?\}\s*\]\s*;/, `window.swedishBirds = ${newArrayStr};`);

fs.writeFileSync('birds.js', newContent, 'utf8');
console.log('Successfully sorted birds.js');
