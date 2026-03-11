const fs = require('fs');
const https = require('https');

const links = fs.readFileSync('images/svampboken_bilder/bilder.txt', 'utf-8').split('\n').map(l => l.trim()).filter(l => l);

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, { headers: { 'User-Agent': 'Birdfinder/1.0' }, timeout: 5000 }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve(null);
                }
            });
        });
        
        req.on('timeout', () => {
            req.abort();
            resolve(null);
        });
        
        req.on('error', (e) => {
            resolve(null);
        });
    });
}

async function run() {
    const invalidLinks = [];
    const validLinks = [];

    for (let i = 0; i < links.length; i++) {
        let url = links[i];
        console.log(`Checking [${i+1}/${links.length}] ${url}...`);

        if (url.endsWith('a') && /\d+a$/.test(url)) url = url.slice(0, -1);
        let isPhotoUrl = url.includes('/photos/');
        const id = url.split('/').pop().replace(/\D/g, '');

        if (!id) {
            console.log("  -> Invalid ID");
            continue;
        }

        let observation = null;
        let photo = null;

        try {
            if (isPhotoUrl) {
                const obsRes = await fetchJson(`https://api.inaturalist.org/v1/observations?photo_id=${id}`);
                if (obsRes && obsRes.results && obsRes.results.length > 0) {
                    observation = obsRes.results[0];
                    photo = observation.photos.find(p => p.id == id) || observation.photos[0];
                } else {
                    const photoRes = await fetchJson(`https://api.inaturalist.org/v1/photos/${id}`);
                    if (photoRes && photoRes.results && photoRes.results.length > 0) {
                        photo = photoRes.results[0];
                    }
                }
            } else {
                const obsRes = await fetchJson(`https://api.inaturalist.org/v1/observations/${id}`);
                if (obsRes && obsRes.results && obsRes.results.length > 0) {
                    observation = obsRes.results[0];
                    photo = observation.photos[0];
                }
            }

            if (!photo) {
                invalidLinks.push({ url, reason: "Bild hittades inte på iNaturalist." });
                console.log("  -> Not found / No photo");
                continue;
            }

            const license = photo.license_code;
            const isCC = license && license.startsWith('cc');

            let realName = null;
            let username = null;

            if (observation && observation.user) {
                realName = observation.user.name;
                username = observation.user.login;
            } else if (photo.native_realname) {
                realName = photo.native_realname;
                username = photo.native_username;
            }

            if (!realName && photo.attribution) {
                const match = photo.attribution.match(/\(c\) (.*?),/);
                if (match) {
                    realName = match[1];
                }
            }

            const cleanName = (realName || "").trim();
            const hasSpace = cleanName.includes(' ');
            
            let problem = [];
            if (!isCC) problem.push("Licensen är inte Creative Commons (All Rights Reserved).");
            if (!cleanName || cleanName === username || !hasSpace) {
                problem.push(`Namnet "${cleanName || username || 'Okänt'}" liknar ett användarnamn (föramn + efternamn saknas).`);
            }

            if (problem.length > 0) {
                invalidLinks.push({ url, reason: problem.join(" ") });
                console.log(`  -> INVALID: ${problem.join(" ")}`);
            } else {
                validLinks.push({ url, photographer: cleanName, license });
                console.log(`  -> VALID: ${cleanName} (${license})`);
            }
        } catch (e) {
            invalidLinks.push({ url, reason: "Nätverksfel: " + e.message });
            console.log("  -> Network Error");
        }
        
        await new Promise(r => setTimeout(r, 600));
    }

    fs.writeFileSync('invalid_links.json', JSON.stringify(invalidLinks, null, 2));
    fs.writeFileSync('valid_links.json', JSON.stringify(validLinks, null, 2));
    console.log(`Klart! Hittade ${invalidLinks.length} ogiltiga och ${validLinks.length} giltiga by_url.`);
}

run();
