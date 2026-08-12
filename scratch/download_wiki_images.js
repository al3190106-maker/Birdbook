// download_wiki_images.js
// Laddar ner alla Wikimedia-bilder för de nya fåglarna och sparar dem som {bird_id}.png
// Kör: node scratch/download_wiki_images.js
// Ladda sedan upp alla filer i scratch/bird_images_for_cdn/ till naturboken.alt-qq.com/birds/originals/

const fs = require('fs');
const https = require('https');
const path = require('path');

const wikiUrls = JSON.parse(fs.readFileSync('scratch/wikimedia_backup_urls.json', 'utf8'));

const outputDir = 'scratch/bird_images_for_cdn';
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

async function downloadImage(birdId, url) {
    return new Promise((resolve) => {
        // Wikimedia ger 302-redirect, vi behöver följa
        const outputPath = path.join(outputDir, birdId + '.jpg');
        
        function fetch(fetchUrl, redirects = 0) {
            if (redirects > 5) { resolve({ birdId, success: false, error: 'Too many redirects' }); return; }
            
            const protocol = fetchUrl.startsWith('https') ? require('https') : require('http');
            const req = protocol.get(fetchUrl, {
                headers: { 'User-Agent': 'Naturboken/1.0 (naturboken.alt-qq.com; educational bird guide)' }
            }, (res) => {
                if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 303) {
                    fetch(res.headers.location, redirects + 1);
                    return;
                }
                if (res.statusCode !== 200) {
                    resolve({ birdId, success: false, error: 'Status ' + res.statusCode });
                    return;
                }
                const file = fs.createWriteStream(outputPath);
                res.pipe(file);
                file.on('finish', () => {
                    file.close();
                    const stats = fs.statSync(outputPath);
                    resolve({ birdId, success: true, size: Math.round(stats.size / 1024) + ' KB' });
                });
                file.on('error', (err) => {
                    resolve({ birdId, success: false, error: err.message });
                });
            });
            req.on('error', (err) => {
                resolve({ birdId, success: false, error: err.message });
            });
            req.setTimeout(15000, () => {
                req.destroy();
                resolve({ birdId, success: false, error: 'Timeout' });
            });
        }
        
        fetch(url);
    });
}

async function downloadAll() {
    const entries = Object.entries(wikiUrls);
    console.log('Laddar ner', entries.length, 'bilder...\n');
    
    // Ladda ner 5 åt gången
    const batchSize = 5;
    let success = 0;
    let failed = [];
    
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
        
        // Kort paus mellan batchar
        if (i + batchSize < entries.length) {
            await new Promise(r => setTimeout(r, 500));
        }
    }
    
    console.log('\n=============================');
    console.log('Klart! Framgång:', success, '/', entries.length);
    if (failed.length > 0) {
        console.log('Misslyckades:', failed.join(', '));
    }
    console.log('\nFilerna finns i:', outputDir);
    console.log('Ladda upp ALLA .jpg-filer till: https://naturboken.alt-qq.com/birds/originals/');
    console.log('OBS: Byt ut .jpg → .png i CDN:et om nödvändigt (de sparas som .jpg)');
    
    // Skapa en lista med CDN-filnamn och motservarande bird_id
    const uploadList = entries.map(([id]) => `  ${id}.jpg → naturboken.alt-qq.com/birds/originals/${id}.png`).join('\n');
    fs.writeFileSync('scratch/cdn_upload_list.txt', 'FILER ATT LADDA UPP TILL CDN:\n\n' + uploadList + '\n');
    console.log('\nFullständig lista sparad i scratch/cdn_upload_list.txt');
}

downloadAll().catch(console.error);
