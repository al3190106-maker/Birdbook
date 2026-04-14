const fs = require('fs');
const https = require('https');
const path = require('path');

let fungiFile = fs.readFileSync('fungi.js', 'utf-8');
const match = fungiFile.match(/window\.swedishFungi\s*=\s*(\[[\s\S]*?\]);/);
let fungiData = eval(match[1]);

const imagesDir = path.join(__dirname, 'images', 'svampboken_bilder');

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'Birdfinder/1.0' } }, (res) => {
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

async function run() {
    let changed = false;
    for (let f of fungiData) {
        if (!f.image) {
            console.log(`Retrying ${f.scientific}...`);
            changed = true;
            const encodedName = encodeURIComponent(f.scientific);
            const url = `https://api.inaturalist.org/v1/observations?taxon_name=${encodedName}&photo_license=cc-by,cc-by-nc,cc-by-sa,cc-by-nc-sa,cc0&per_page=1&order_by=votes&quality_grade=research`;
            
            try {
                const result = await fetchJson(url);
                if (result.results && result.results[0].photos) {
                    const photo = result.results[0].photos[0];
                    const imgUrl = photo.url.replace('square', 'large');
                    const imgExt = imgUrl.split('.').pop().split('?')[0] || 'jpg';
                    const destPath = path.join(imagesDir, `${f.id}.${imgExt}`);
                    
                    await downloadImage(imgUrl, destPath);
                    
                    let photographer = photo.attribution;
                    const matchAtt = photographer.match(/\(c\) (.*?),/);
                    if (matchAtt) photographer = matchAtt[1];
                    
                    f.image = `images/svampboken_bilder/${f.id}.${imgExt}`;
                    f.photographer = photographer;
                    console.log(`Done for ${f.scientific}`);
                }
            } catch (e) {
                console.error(e.message);
            }
        }
    }
    
    if (changed) {
        fs.writeFileSync('fungi.js', `// List of Swedish Fungi (Svampboken)\nwindow.swedishFungi = ${JSON.stringify(fungiData, null, 4)};\n`);
        console.log("Updated fungi.js");
    } else {
        console.log("No missing images found.");
    }
}
run();
