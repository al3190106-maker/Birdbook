const https = require('https');
const fs = require('fs');

function fetchGBIF(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'Naturboken/1.0' } }, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch(e) { reject(e); }
            });
        }).on('error', reject);
    });
}

async function fetchAllSpeciesInSweden2026() {
    const year = 2026;
    // Step 1: Get total count of occurrences
    const countUrl = 'https://api.gbif.org/v1/occurrence/search?taxonKey=212&country=SE&year=' + year + '&limit=1';
    console.log('Fetching total count...');
    const countData = await fetchGBIF(countUrl);
    console.log('Total occurrences in Sweden ' + year + ':', countData.count);

    // Step 2: Get all unique species via species search (not occurrences)
    // Use GBIF species match approach - get species list with occurrences in Sweden
    const facetUrl = 'https://api.gbif.org/v1/occurrence/search?taxonKey=212&country=SE&year=' + year + '&limit=0&facet=speciesKey&facetLimit=800&facetMincount=1';
    console.log('Fetching species facets...');
    const facetData = await fetchGBIF(facetUrl);
    
    if (!facetData.facets || facetData.facets.length === 0) {
        console.log('No facets found. Keys:', Object.keys(facetData));
        return;
    }
    
    const speciesFacet = facetData.facets.find(f => f.field === 'SPECIES_KEY');
    if (!speciesFacet) {
        console.log('Available facets:', facetData.facets.map(f => f.field));
        return;
    }
    
    const speciesKeys = speciesFacet.counts;
    console.log('Unique species with observations in Sweden ' + year + ':', speciesKeys.length);
    
    // Step 3: Resolve species keys to scientific names (batch)
    console.log('Resolving scientific names...');
    const allSpecies = [];
    
    for (let i = 0; i < speciesKeys.length; i++) {
        const key = speciesKeys[i].name;
        const count = speciesKeys[i].count;
        try {
            const speciesData = await fetchGBIF('https://api.gbif.org/v1/species/' + key);
            allSpecies.push({
                gbifKey: key,
                observationCount: count,
                scientific: speciesData.scientificName || speciesData.canonicalName || 'Unknown',
                canonical: speciesData.canonicalName || '',
                nameSv: '',  // Will fill from vernacular
                nameEn: speciesData.vernacularName || '',
                family: speciesData.family || '',
                order: speciesData.order || ''
            });
            if (i % 50 === 0) console.log('  Progress: ' + i + '/' + speciesKeys.length);
        } catch(e) {
            console.log('  Error for key ' + key + ':', e.message);
        }
    }
    
    fs.writeFileSync('scratch/gbif_sweden_2026_species.json', JSON.stringify(allSpecies, null, 2));
    console.log('\nSaved ' + allSpecies.length + ' species to scratch/gbif_sweden_2026_species.json');
    
    // Step 4: Compare with existing birds.js
    const existingContent = fs.readFileSync('birds.js', 'utf8');
    const match = existingContent.match(/window\.swedishBirds\s*=\s*(\[[\s\S]*\]);/);
    const existingBirds = JSON.parse(match[1]);
    const existingScientific = new Set(existingBirds.map(b => {
        // Normalize: take only genus + species
        return b.scientific.split(' ').slice(0,2).join(' ').toLowerCase();
    }));
    
    const missing = allSpecies.filter(s => {
        const canonical = (s.canonical || '').split(' ').slice(0,2).join(' ').toLowerCase();
        return canonical && !existingScientific.has(canonical);
    });
    
    missing.sort((a,b) => b.observationCount - a.observationCount);
    
    fs.writeFileSync('scratch/missing_from_db.json', JSON.stringify(missing, null, 2));
    console.log('\n=== SAKNAS I DATABASEN ===');
    console.log('Antal arter som observerats i Sverige ' + year + ' men saknas i birds.js:', missing.length);
    console.log('\nTop 30 mest observerade saknade arter:');
    missing.slice(0, 30).forEach((s, i) => {
        console.log((i+1) + '. ' + s.canonical + ' (' + s.observationCount + ' obs) [' + s.order + ']');
    });
}

fetchAllSpeciesInSweden2026().catch(console.error);
