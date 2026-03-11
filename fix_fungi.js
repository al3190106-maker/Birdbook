const fs = require('fs');
const https = require('https');
const path = require('path');

let fungiFile = fs.readFileSync('fungi.js', 'utf-8');
const match = fungiFile.match(/window\.swedishFungi\s*=\s*(\[[\s\S]*?\]);/);
let fungiData = eval(match[1]);

const imagesDir = path.join(__dirname, 'images', 'svampboken_bilder');

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'Birdfinder/1.0' }, timeout: 8000 }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
    });
}

function downloadImage(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                https.get(response.headers.location, (res) => {
                    res.pipe(file);
                    file.on('finish', () => file.close(resolve));
                });
                return;
            }
            response.pipe(file);
            file.on('finish', () => file.close(resolve));
        });
    });
}

function hasRealName(name) {
    if (!name) return false;
    name = name.trim();
    // Exclude usernames like "photolith", "NatureLover99" etc. We want a space.
    if (!name.includes(' ')) return false;
    // Exclude known non-person names if there are any obvious ones
    return true;
}

async function run() {
    let changed = false;
    
    // First, clear all current images that we just downloaded since they had weak licenses
    for (const file of fs.readdirSync(imagesDir)) {
        if (file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png') || file.endsWith('.gif')) {
            fs.unlinkSync(path.join(imagesDir, file));
        }
    }
    
    for (let f of fungiData) {
        // Clear properties
        delete f.image;
        delete f.photographer;
        
        console.log(`Fetching new commercial CC image for ${f.scientific}...`);
        
        const encodedName = encodeURIComponent(f.scientific);
        // We only allow commercial CC: cc0, cc-by, cc-by-sa
        // We fetch per_page=10 so we can filter for a real name
        const url = `https://api.inaturalist.org/v1/observations?taxon_name=${encodedName}&photo_license=cc-by,cc-by-sa,cc0&per_page=15&order_by=votes&quality_grade=research`;
        
        try {
            const result = await fetchJson(url);
            if (result.results && result.results.length > 0) {
                
                let selectedPhoto = null;
                let selectedPhotographer = null;
                
                // Find first observation with a valid real name photographer
                for (const obs of result.results) {
                    if (!obs.photos || obs.photos.length === 0) continue;
                    
                    const photo = obs.photos[0];
                    let realName = null;
                    
                    if (obs.user && obs.user.name) {
                        realName = obs.user.name;
                    } else if (photo.native_realname) {
                        realName = photo.native_realname;
                    } 
                    
                    if (!realName && photo.attribution) {
                        const m = photo.attribution.match(/\(c\) (.*?),/);
                        if (m) realName = m[1];
                    }
                    
                    const cleanName = (realName || "").trim();
                    if (hasRealName(cleanName)) {
                        selectedPhoto = photo;
                        selectedPhotographer = cleanName;
                        break;
                    }
                }
                
                if (selectedPhoto) {
                    const imgUrl = selectedPhoto.url.replace('square', 'large');
                    const imgExt = imgUrl.split('.').pop().split('?')[0] || 'jpg';
                    const destPath = path.join(imagesDir, `${f.id}.${imgExt}`);
                    
                    await downloadImage(imgUrl, destPath);
                    
                    f.image = `images/svampboken_bilder/${f.id}.${imgExt}`;
                    f.photographer = selectedPhotographer;
                    console.log(` -> SUCCESS: ${f.nameSv} by ${selectedPhotographer}`);
                    changed = true;
                } else {
                    console.log(` -> FAILED: No commercial image with real photographer name found for ${f.scientific}`);
                }
            } else {
                console.log(` -> FAILED: No results found at all for ${f.scientific}`);
            }
        } catch (e) {
            console.error(e.message);
        }
        
        await new Promise(r => setTimeout(r, 1000)); // Rate limit
    }
    
    if (changed) {
        fs.writeFileSync('fungi.js', `// List of Swedish Fungi (Svampboken)\nwindow.swedishFungi = ${JSON.stringify(fungiData, null, 4)};\n`);
        console.log("Updated fungi.js successfully.");
    }
}

run();
