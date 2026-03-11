const fs = require('fs');
const https = require('https');

const urls = [
    "https://www.inaturalist.org/observations/106863258",
    "https://www.inaturalist.org/photos/107147543",
    "https://www.inaturalist.org/photos/332872409",
    "https://www.inaturalist.org/photos/172926337",
    "https://www.inaturalist.org/photos/457253795",
    "https://www.inaturalist.org/photos/256148291",
    "https://www.inaturalist.org/photos/10028",
    "https://www.inaturalist.org/photos/51450983",
    "https://www.inaturalist.org/photos/29239600",
    "https://www.inaturalist.org/photos/110384969",
    "https://www.inaturalist.org/photos/42106925",
    "https://www.inaturalist.org/photos/111266235",
    "https://www.inaturalist.org/photos/166311914",
    "https://www.inaturalist.org/photos/5497",
    "https://www.inaturalist.org/photos/29239661",
    "https://www.inaturalist.org/photos/386579128",
    "https://www.inaturalist.org/photos/39899941",
    "https://www.inaturalist.org/photos/111494893",
    "https://www.inaturalist.org/photos/353955610",
    "https://www.inaturalist.org/photos/93399523",
    "https://www.inaturalist.org/photos/32765817",
    "https://www.inaturalist.org/photos/989",
    "https://www.inaturalist.org/photos/29353347",
    "https://www.inaturalist.org/photos/28004893",
    "https://www.inaturalist.org/photos/1871609",
    "https://www.inaturalist.org/photos/84560531",
    "https://www.inaturalist.org/photos/185479981",
    "https://www.inaturalist.org/photos/250397284",
    "https://www.inaturalist.org/photos/22053",
    "https://www.inaturalist.org/photos/91430656",
    "https://www.inaturalist.org/photos/88871138"
];

const options = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'sv-SE,sv;q=0.9,en-US;q=0.8,en;q=0.7'
    }
};

function fetchHtml(url) {
    return new Promise((resolve, reject) => {
        https.get(url, options, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return resolve(fetchHtml(res.headers.location));
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

function fetchApi(url) {
    return new Promise((resolve, reject) => {
        https.get(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); } catch (e) { resolve(null); }
            });
        }).on('error', reject);
    });
}

async function run() {
    const results = [];
    for (const urlStr of urls) {
        try {
            console.log("Fetching", urlStr);
            let photoId;
            let origUrl, license, photographer, sciname, swedish;

            // Use html directly because it handles everything for photos
            const html = await fetchHtml(urlStr);
            
            const imgMatch = html.match(/og:image" content="(.*?)"/);
            if (imgMatch) origUrl = imgMatch[1].replace(/large\./, 'original.');
            else {
                const img2Match = html.match(/"large_url":"(.*?)"/);
                if (img2Match) origUrl = img2Match[1].replace(/large\./, 'original.');
            }
            
            const titleMatch = html.match(/<title>(.*?) \((.*?)\) - iNaturalist<\/title>/);
            if (titleMatch) {
                sciname = titleMatch[2];
                swedish = titleMatch[1];
            } else {
                const title2Match = html.match(/<title>(.*?) - iNaturalist<\/title>/);
                if (title2Match) {
                    sciname = title2Match[1];
                    // some don't have swedish name
                }
            }
            
            const ccMatch = html.match(/license\/([a-z\-]+)\//);
            license = ccMatch ? `cc-${ccMatch[1]}` : "All Rights Reserved";
            
            const userMatch = html.match(/photos by (.*?) - iNaturalist/i);
            if (userMatch) {
                photographer = userMatch[1].replace(/&amp;/g, '&');
            } else {
                const attrMatch = html.match(/\(c\) (.*?),/);
                if (attrMatch) photographer = attrMatch[1];
            }

            console.log(`  -> ${sciname} | ${license} | ${photographer}`);
            results.push({
                sourceUrl: urlStr,
                imgUrl: origUrl,
                license: license,
                photographer: photographer || "Unknown",
                sciname: sciname || "Unknown",
                swedish: swedish || sciname
            });
            
        } catch (e) {
            console.error(`Error processing ${urlStr}:`, e.message);
        }
        await new Promise(r => setTimeout(r, 600)); // sleep 600ms to avoid rate limit
    }
    fs.writeFileSync('inat_results.json', JSON.stringify(results, null, 2));
    console.log("Saved 31 results to inat_results.json");
}
run();
