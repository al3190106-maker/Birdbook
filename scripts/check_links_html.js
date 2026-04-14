const fs = require('fs');
const https = require('https');

const links = fs.readFileSync('images/svampboken_bilder/bilder.txt', 'utf-8').split('\n').map(l => l.trim()).filter(l => l);

function fetchHtml(url) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }, timeout: 8000 }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return resolve(fetchHtml(res.headers.location));
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        });
        req.on('timeout', () => { req.abort(); resolve(""); });
        req.on('error', () => resolve(""));
    });
}

async function run() {
    const invalidLinks = [];
    const validLinks = [];

    for (let i = 0; i < links.length; i++) {
        let url = links[i];
        console.log(`Checking [${i+1}/${links.length}] ${url}...`);

        if (url.endsWith('a') && /\d+a$/.test(url)) url = url.slice(0, -1);
        
        try {
            const html = await fetchHtml(url);
            
            if (!html) {
                invalidLinks.push({ url, reason: "Kunde inte hämta sidan." });
                console.log("  -> Failed to fetch");
                continue;
            }

            const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
            let title = titleMatch ? titleMatch[1].trim() : "";
            
            let photographer = null;
            let license = "All Rights Reserved";

            // Many photo titles are: "Photo 107147543, (c) Federico Calledda, some rights reserved (CC BY-NC)"
            if (title.includes('(c)')) {
                const attrMatch = title.match(/\(c\) (.*?),/);
                if (attrMatch) photographer = attrMatch[1];
            } else if (title.includes('observed by')) {
                const obsMatch = title.match(/observed by (.*?) on/);
                if (obsMatch) photographer = obsMatch[1];
            } else if (title.includes('photos by')) {
                const userMatch = title.match(/photos by (.*?) - iNaturalist/i);
                if (userMatch) photographer = userMatch[1];
            }

            if (title.toLowerCase().includes('all rights reserved')) {
                license = "All Rights Reserved";
            } else {
                const ccMatch = title.match(/\((CC .*?)\)/);
                if (ccMatch) license = ccMatch[1].toLowerCase().replace(' ', '-');
            }
            
            if (photographer) photographer = photographer.replace(/&amp;/g, '&');
            
            const isCC = license && license.startsWith('cc');
            let cleanName = (photographer || "").trim();
            const hasSpace = cleanName.includes(' ');
            
            // Try to find full name in JSON payload if it is not in the title
            if (!hasSpace || !cleanName) {
                const nameMatch = html.match(/"name":"([^"]+)"/);
                if (nameMatch) {
                    const potentialName = nameMatch[1];
                    if (potentialName.includes(' ')) {
                        cleanName = potentialName;
                    }
                }
            }

            let problem = [];
            if (!isCC) problem.push("Licensen är inte Creative Commons.");
            if (!cleanName || !cleanName.includes(' ')) {
                problem.push(`Namnet i titeln/källkoden ("${cleanName || 'Okänt'}") saknar för/efternamn.`);
            }

            if (problem.length > 0) {
                invalidLinks.push({ url, reason: problem.join(" ") });
                console.log(`  -> INVALID: ${problem.join(" ")} (${cleanName})`);
            } else {
                validLinks.push({ url, photographer: cleanName, license });
                console.log(`  -> VALID: ${cleanName} (${license})`);
            }

        } catch (e) {
            console.log("  -> ERROR:", e.message);
            invalidLinks.push({ url, reason: "Ett fel uppstod: " + e.message });
        }
        
        await new Promise(r => setTimeout(r, 600));
    }

    fs.writeFileSync('invalid_links.json', JSON.stringify(invalidLinks, null, 2));
    fs.writeFileSync('valid_links.json', JSON.stringify(validLinks, null, 2));
    console.log(`Klart! Hittade ${invalidLinks.length} ogiltiga och ${validLinks.length} giltiga by_url.`);
}

run();
