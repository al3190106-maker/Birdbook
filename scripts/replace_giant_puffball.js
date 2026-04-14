const fs = require('fs');
const https = require('https');
const path = require('path');

const imgUrl = "https://inaturalist-open-data.s3.amazonaws.com/photos/98092824/large.jpg";
const destFile = path.join(__dirname, 'images', 'svampboken_bilder', 'giant_puffball.jpg');

// 1. Download the new image and overwrite giant_puffball.jpg
const file = fs.createWriteStream(destFile);
https.get(imgUrl, (res) => {
    res.pipe(file);
    file.on('finish', () => {
        file.close();
        console.log("Image downloaded to", destFile);
        
        // 2. Update fungi.js text
        const fungiPath = path.join(__dirname, 'fungi.js');
        let fungiData = fs.readFileSync(fungiPath, 'utf-8');
        
        let match = fungiData.match(/window\.swedishFungi\s*=\s*(\[[\s\S]*?\]);/);
        if (match) {
            let arr = eval(match[1]);
            for (let f of arr) {
                if (f.id === 'giant_puffball') {
                    f.photographer = "Carrie Seltzer";
                    f.image = "images/svampboken_bilder/giant_puffball.jpg"; // ensure extension is .jpg
                }
            }
            fs.writeFileSync(fungiPath, `// List of Swedish Fungi (Svampboken)\nwindow.swedishFungi = ${JSON.stringify(arr, null, 4)};\n`);
            console.log("Updated fungi.js photographer to Carrie Seltzer");
        }
    });
});
