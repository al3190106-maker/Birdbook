// download_wiki_images_v2.js
// Laddar ner Wikimedia-bilder via deras thumbnail-API (korrekt User-Agent)
// Kör: node scratch/download_wiki_images_v2.js

const fs = require('fs');
const https = require('https');
const path = require('path');

const wikiUrls = JSON.parse(fs.readFileSync('scratch/wikimedia_backup_urls.json', 'utf8'));
const outputDir = 'scratch/bird_images_for_cdn';
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

function downloadImage(birdId, url) {
    return new Promise((resolve) => {
        const outputPath = path.join(outputDir, birdId + '.jpg');
        
        // Wikimedia kräver korrekt User-Agent per deras policy
        const options = {
            headers: {
                'User-Agent': 'Naturboken/1.0 (https://naturboken.alt-qq.com; educational non-commercial bird identification app for Sweden) contact@naturboken.se',
                'Accept': 'image/jpeg,image/png,image/*',
                'Referer': 'https://commons.wikimedia.org/'
            }
        };
        
        function fetchUrl(targetUrl, redirects) {
            if (redirects > 8) return resolve({ birdId, success: false, error: 'Too many redirects' });
            
            const mod = targetUrl.startsWith('https') ? https : require('http');
            const req = mod.get(targetUrl, options, (res) => {
                if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
                    const loc = res.headers.location;
                    res.resume();
                    return fetchUrl(loc.startsWith('http') ? loc : new URL(loc, targetUrl).href, redirects + 1);
                }
                if (res.statusCode !== 200) {
                    res.resume();
                    return resolve({ birdId, success: false, error: 'HTTP ' + res.statusCode });
                }
                const file = fs.createWriteStream(outputPath);
                res.pipe(file);
                file.on('finish', () => {
                    file.close();
                    const sz = Math.round(fs.statSync(outputPath).size / 1024);
                    resolve({ birdId, success: true, size: sz + ' KB' });
                });
                file.on('error', err => resolve({ birdId, success: false, error: err.message }));
            });
            req.on('error', err => resolve({ birdId, success: false, error: err.message }));
            req.setTimeout(20000, () => { req.destroy(); resolve({ birdId, success: false, error: 'Timeout' }); });
        }
        
        // Konvertera till 480px thumbnail-URL
        const thumbUrl = url.replace(/\/(\d+)px-/, '/480px-');
        fetchUrl(thumbUrl, 0);
    });
}

async function downloadAll() {
    const entries = Object.entries(wikiUrls);
    console.log('Laddar ner', entries.length, 'bilder (via Wikimedia thumbnail-API)...\n');
    
    let success = 0, failed = [];
    const batchSize = 3;
    
    for (let i = 0; i < entries.length; i += batchSize) {
        const batch = entries.slice(i, i + batchSize);
        const results = await Promise.all(batch.map(([id, url]) => downloadImage(id, url)));
        results.forEach(r => {
            if (r.success) {
                success++;
                process.stdout.write('✓ ' + r.birdId + ' (' + r.size + ')\n');
            } else {
                failed.push(r.birdId);
                process.stdout.write('✗ ' + r.birdId + ': ' + r.error + '\n');
            }
        });
        await new Promise(r => setTimeout(r, 300));
    }
    
    console.log('\n=============================');
    console.log('Klart! Framgång:', success, '/', entries.length);
    if (failed.length > 0) {
        console.log('Misslyckades (' + failed.length + '):', failed.join(', '));
        fs.writeFileSync('scratch/failed_downloads.json', JSON.stringify(failed, null, 2));
    }
    console.log('\nBilder sparade i:', path.resolve(outputDir));
}

downloadAll().catch(console.error);
