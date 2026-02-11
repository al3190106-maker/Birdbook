// ==========================================
// Sweden Interactive Map Module
// ==========================================

// --- Sweden Regions (Landskap) with SVG paths ---
// Simplified SVG paths for Sweden's major regions
const SWEDEN_REGIONS = [
    {
        id: 'norrbotten',
        name: 'Norrbotten',
        label: 'Norrbotten',
        zone: 'north',
        // Northernmost region
        path: 'M 145,10 L 200,8 230,20 250,35 260,60 255,85 240,100 225,105 200,95 180,100 160,90 140,80 130,60 125,40 Z',
        labelPos: { x: 190, y: 55 }
    },
    {
        id: 'vasterbotten',
        name: 'Västerbotten',
        label: 'Västerbotten',
        zone: 'north',
        path: 'M 130,60 L 140,80 160,90 180,100 200,95 225,105 230,115 220,130 200,140 170,138 145,130 120,115 110,95 115,75 Z',
        labelPos: { x: 170, y: 110 }
    },
    {
        id: 'jamtland',
        name: 'Jämtland',
        label: 'Jämtland',
        zone: 'north',
        path: 'M 80,100 L 110,95 120,115 145,130 150,145 140,160 120,165 95,155 75,140 65,120 70,105 Z',
        labelPos: { x: 110, y: 135 }
    },
    {
        id: 'angermanland',
        name: 'Ångermanland',
        label: 'Ångermanland',
        zone: 'north',
        path: 'M 145,130 L 170,138 200,140 210,150 205,165 185,170 160,168 150,160 140,160 150,145 Z',
        labelPos: { x: 175, y: 155 }
    },
    {
        id: 'medelpad',
        name: 'Medelpad',
        label: 'Medelpad',
        zone: 'north',
        path: 'M 140,160 L 160,168 185,170 190,185 175,195 155,192 138,180 130,170 Z',
        labelPos: { x: 160, y: 180 }
    },
    {
        id: 'harjedalen',
        name: 'Härjedalen',
        label: 'Härjedalen',
        zone: 'north',
        path: 'M 75,140 L 95,155 120,165 140,160 130,170 138,180 125,195 105,195 85,180 70,165 65,150 Z',
        labelPos: { x: 105, y: 172 }
    },
    {
        id: 'halsingland',
        name: 'Hälsingland',
        label: 'Hälsingland',
        zone: 'central',
        path: 'M 105,195 L 125,195 138,180 155,192 175,195 180,210 168,225 145,225 120,218 108,205 Z',
        labelPos: { x: 142, y: 210 }
    },
    {
        id: 'gastrikland',
        name: 'Gästrikland',
        label: 'Gästrikland',
        zone: 'central',
        path: 'M 120,218 L 145,225 168,225 175,240 160,250 140,248 125,240 118,228 Z',
        labelPos: { x: 148, y: 238 }
    },
    {
        id: 'dalarna',
        name: 'Dalarna',
        label: 'Dalarna',
        zone: 'central',
        path: 'M 70,195 L 85,180 105,195 108,205 120,218 118,228 125,240 115,255 95,258 75,248 60,230 58,210 Z',
        labelPos: { x: 92, y: 225 }
    },
    {
        id: 'uppland',
        name: 'Uppland',
        label: 'Uppland',
        zone: 'central',
        path: 'M 140,248 L 160,250 175,240 190,245 200,260 195,275 180,280 160,278 145,270 138,258 Z',
        labelPos: { x: 168, y: 263 }
    },
    {
        id: 'vastmanland',
        name: 'Västmanland',
        label: 'Västmanland',
        zone: 'central',
        path: 'M 115,255 L 125,240 140,248 138,258 145,270 135,280 118,278 108,268 Z',
        labelPos: { x: 128, y: 265 }
    },
    {
        id: 'varmland',
        name: 'Värmland',
        label: 'Värmland',
        zone: 'central',
        path: 'M 40,240 L 58,210 60,230 75,248 95,258 108,268 100,285 85,295 65,290 45,275 35,255 Z',
        labelPos: { x: 72, y: 268 }
    },
    {
        id: 'sodermanland',
        name: 'Södermanland',
        label: 'Södermanland',
        zone: 'central',
        path: 'M 118,278 L 135,280 145,270 160,278 155,295 140,305 125,300 115,290 Z',
        labelPos: { x: 137, y: 290 }
    },
    {
        id: 'narke',
        name: 'Närke',
        label: 'Närke',
        zone: 'central',
        path: 'M 100,285 L 108,268 118,278 115,290 110,300 95,298 90,290 Z',
        labelPos: { x: 105, y: 288 }
    },
    {
        id: 'ostergotland',
        name: 'Östergötland',
        label: 'Östergötland',
        zone: 'south',
        path: 'M 95,298 L 110,300 115,290 125,300 140,305 155,295 165,310 155,325 135,330 110,325 95,315 90,305 Z',
        labelPos: { x: 128, y: 315 }
    },
    {
        id: 'vastergotland',
        name: 'Västergötland',
        label: 'Västergötland',
        zone: 'south',
        path: 'M 55,295 L 65,290 85,295 90,290 95,298 90,305 95,315 85,330 70,335 55,325 48,310 Z',
        labelPos: { x: 73, y: 315 }
    },
    {
        id: 'bohuslan',
        name: 'Bohuslän',
        label: 'Bohuslän',
        zone: 'south',
        path: 'M 30,270 L 45,275 55,295 48,310 38,305 28,290 25,275 Z',
        labelPos: { x: 38, y: 290 }
    },
    {
        id: 'dalsland',
        name: 'Dalsland',
        label: 'Dalsland',
        zone: 'south',
        path: 'M 35,255 L 45,275 55,295 65,290 85,295 100,285 95,258 75,248 60,250 45,260 Z',
        labelPos: { x: 65, y: 272 }
    },
    {
        id: 'smaland',
        name: 'Småland',
        label: 'Småland',
        zone: 'south',
        path: 'M 70,335 L 85,330 95,315 110,325 135,330 155,325 160,340 150,360 130,375 105,378 85,370 70,355 65,345 Z',
        labelPos: { x: 115, y: 355 }
    },
    {
        id: 'halland',
        name: 'Halland',
        label: 'Halland',
        zone: 'south',
        path: 'M 48,310 L 55,325 70,335 65,345 58,360 50,365 40,355 35,335 38,318 Z',
        labelPos: { x: 50, y: 340 }
    },
    {
        id: 'gotland',
        name: 'Gotland',
        label: 'Gotland',
        zone: 'south',
        path: 'M 205,310 L 215,305 222,315 225,335 220,355 212,360 205,350 200,330 Z',
        labelPos: { x: 213, y: 335 }
    },
    {
        id: 'oland',
        name: 'Öland',
        label: 'Öland',
        zone: 'south',
        path: 'M 178,330 L 183,325 187,335 190,355 188,370 183,375 179,365 176,345 Z',
        labelPos: { x: 183, y: 350 }
    },
    {
        id: 'blekinge',
        name: 'Blekinge',
        label: 'Blekinge',
        zone: 'south',
        path: 'M 95,385 L 105,378 130,375 140,382 135,395 120,400 100,398 90,392 Z',
        labelPos: { x: 115, y: 392 }
    },
    {
        id: 'skane',
        name: 'Skåne',
        label: 'Skåne',
        zone: 'south',
        path: 'M 50,370 L 58,360 65,345 70,355 85,370 95,385 90,392 100,398 95,410 80,418 60,415 45,405 40,390 42,378 Z',
        labelPos: { x: 70, y: 395 }
    }
];

// --- Month Names in Swedish ---
const SWEDISH_MONTHS = [
    'Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni',
    'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'
];

let currentMapSort = 'name'; // name, wingspan, eggs, weight, rarity


// --- Season Classification ---
function getSeasonForMonth(month) {
    // month is 0-indexed (0 = January)
    if (month >= 2 && month <= 4) return 'spring';   // Mar-May
    if (month >= 5 && month <= 7) return 'summer';    // Jun-Aug
    if (month >= 8 && month <= 10) return 'autumn';   // Sep-Nov
    return 'winter';                                   // Dec-Feb
}

function getSeasonLabel(season) {
    const labels = {
        'spring': 'Vår',
        'summer': 'Sommar',
        'autumn': 'Höst',
        'winter': 'Vinter'
    };
    return labels[season] || season;
}

// --- Bird-Region Mapping Logic ---
// Determines whether a bird can be found in a given region/zone during the current season
function getBirdsForRegion(regionId, month) {
    const region = SWEDEN_REGIONS.find(r => r.id === regionId);
    if (!region) return [];

    const season = getSeasonForMonth(month);
    const zone = region.zone; // 'north', 'central', 'south'

    return window.swedishBirds.filter(bird => {
        return isBirdInRegion(bird, zone, season, regionId);
    });
}

function isBirdInRegion(bird, zone, season, regionId) {
    const dist = (bird.seasonDistribution || '').toLowerCase();

    // Special island regions
    if (regionId === 'gotland' || regionId === 'oland') {
        // These islands get coastal + southern birds
        if (dist.includes('kuster') || dist.includes('östersjön')) {
            return isInSeason(dist, season);
        }
        if (dist.includes('hela landet') || dist.includes('södra')) {
            return isInSeason(dist, season);
        }
        return false;
    }

    // Check if bird is present in this zone
    const inZone = checkZone(dist, zone);
    if (!inZone) return false;

    // Check season
    return isInSeason(dist, season);
}

function checkZone(dist, zone) {
    // "Hela landet" = everywhere
    if (dist.includes('hela landet')) return true;

    if (zone === 'south') {
        return dist.includes('södra') || dist.includes('hela landet') ||
            dist.includes('skåne') || dist.includes('kuster') ||
            dist.includes('landsbygd') || dist.includes('bebyggelse') ||
            dist.includes('jordbruk') || dist.includes('skogar') ||
            dist.includes('sjöar') || dist.includes('lövskog') ||
            dist.includes('öppna marker') || dist.includes('parker') ||
            dist.includes('våtmarker') || dist.includes('rinnande vatten');
    }

    if (zone === 'central') {
        return dist.includes('mellersta') || dist.includes('hela landet') ||
            dist.includes('skogar') || dist.includes('sjöar') ||
            dist.includes('bebyggelse') || dist.includes('landsbygd') ||
            dist.includes('lövskog') || dist.includes('rinnande vatten') ||
            dist.includes('södra');
    }

    if (zone === 'north') {
        return dist.includes('norra') || dist.includes('hela landet') ||
            dist.includes('skogar') || dist.includes('fjäll');
    }

    return false;
}

function isInSeason(dist, season) {
    // "Hela året" = all seasons
    if (dist.includes('hela året') || dist.includes('året runt')) return true;

    // Check specific seasons
    if (season === 'summer') {
        return dist.includes('sommar') || dist.includes('hela året') || dist.includes('året runt');
    }
    if (season === 'winter') {
        return dist.includes('vinter') || dist.includes('hela året') || dist.includes('året runt');
    }
    if (season === 'spring') {
        return dist.includes('vår') || dist.includes('sommar') ||
            dist.includes('hela året') || dist.includes('året runt');
    }
    if (season === 'autumn') {
        return dist.includes('höst') || dist.includes('sommar') ||
            dist.includes('hela året') || dist.includes('året runt');
    }

    return false;
}

// --- Month-by-month presence for a bird in a zone/region ---
function getMonthPresence(bird, zone, regionId) {
    const presence = [];
    for (let m = 0; m < 12; m++) {
        const season = getSeasonForMonth(m);
        presence.push(isBirdInRegion(bird, zone, season, regionId));
    }
    return presence;
}

// Short month labels
const MONTH_SHORT = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

// Season color for each month index
const MONTH_SEASON_COLORS = [
    '#5b9bd5', '#5b9bd5',  // Jan, Feb  = winter (blue)
    '#4caf50', '#4caf50', '#4caf50',  // Mar-May = spring (green)
    '#ffc107', '#ffc107', '#ffc107',  // Jun-Aug = summer (gold)
    '#e65100', '#e65100', '#e65100',  // Sep-Nov = autumn (orange)
    '#5b9bd5'  // Dec = winter (blue)
];

function generateMonthDots(bird, zone, regionId, currentMonth) {
    const presence = getMonthPresence(bird, zone, regionId);
    let html = '<div class="month-dots" title="Månadsnärvaro">';
    for (let m = 0; m < 12; m++) {
        const active = presence[m];
        const isCurrent = m === currentMonth;
        const color = MONTH_SEASON_COLORS[m];
        html += `<span class="month-dot${active ? ' active' : ''}${isCurrent ? ' current' : ''}"
                       style="${active ? 'background:' + color : ''}"
                       title="${SWEDISH_MONTHS[m]}">${MONTH_SHORT[m]}</span>`;
    }
    html += '</div>';
    return html;
}

// --- Zone Colors ---
const ZONE_COLORS = {
    north: {
        fill: '#1a3a4a',
        hover: '#245a6e',
        active: '#2E7D9B',
        stroke: '#0d2030',
        gradient: ['#0f2d3a', '#1a4a5e']
    },
    central: {
        fill: '#1a4a2a',
        hover: '#2a6a3a',
        active: '#2E8D4B',
        stroke: '#0d301a',
        gradient: ['#123820', '#1e5a35']
    },
    south: {
        fill: '#3a3a1a',
        hover: '#5a5a2a',
        active: '#7a8D2E',
        stroke: '#25250d',
        gradient: ['#2e2e14', '#4a4a22']
    }
};

// --- Render the SVG Map ---
function renderSwedenMap(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const currentMonth = new Date().getMonth();
    const season = getSeasonForMonth(currentMonth);

    container.innerHTML = `
        <div class="sweden-map-wrapper">
            <div class="map-header">
                <h2><i class="fa-solid fa-map-location-dot"></i> Fåglar i Sverige</h2>
                <p class="map-subtitle">Tryck på en region för att se vilka fåglar som finns där just nu</p>
            </div>

            <div class="map-controls">
                <div class="month-selector">
                    <button class="month-nav-btn" id="prev-month"><i class="fa-solid fa-chevron-left"></i></button>
                    <div class="month-display">
                        <span class="month-name" id="current-month-name">${SWEDISH_MONTHS[currentMonth]}</span>
                        <span class="season-badge ${season}" id="current-season-badge">${getSeasonLabel(season)}</span>
                    </div>
                    <button class="month-nav-btn" id="next-month"><i class="fa-solid fa-chevron-right"></i></button>
                </div>
            </div>

            <div class="map-content">
                <div class="map-svg-container" id="sweden-svg-container">
                    <!-- SVG injected below -->
                </div>
                <div class="region-info-panel" id="region-info-panel">
                    <div class="region-placeholder">
                        <i class="fa-solid fa-hand-pointer"></i>
                        <p>Välj en region på kartan</p>
                        <p class="subtitle">för att se fåglar som kan ses där</p>
                    </div>
                </div>
            </div>

            <div class="map-legend">
                <div class="legend-item">
                    <span class="legend-color north"></span>
                    <span>Norra Sverige (Norrland)</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color central"></span>
                    <span>Mellersta Sverige (Svealand)</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color south"></span>
                    <span>Södra Sverige (Götaland)</span>
                </div>

            </div>
        </div>
    `;

    // Build & inject SVG
    renderSvgMap(currentMonth);

    // Wire up month navigation
    let selectedMonth = currentMonth;

    document.getElementById('prev-month').addEventListener('click', () => {
        selectedMonth = (selectedMonth - 1 + 12) % 12;
        updateMonth(selectedMonth);
    });

    document.getElementById('next-month').addEventListener('click', () => {
        selectedMonth = (selectedMonth + 1) % 12;
        updateMonth(selectedMonth);
    });
}

function updateMonth(month) {
    const season = getSeasonForMonth(month);
    document.getElementById('current-month-name').textContent = SWEDISH_MONTHS[month];
    const badge = document.getElementById('current-season-badge');
    badge.textContent = getSeasonLabel(season);
    badge.className = `season-badge ${season}`;

    // Re-render bird counts on map
    updateRegionCounts(month);

    // If a zone is selected, refresh the bird list
    const activeRegion = document.querySelector('.sweden-region.active');
    if (activeRegion) {
        showZoneBirds(activeRegion.dataset.zone, month);
    }

}

function renderSvgMap(month) {
    const svgContainer = document.getElementById('sweden-svg-container');

    let svgContent = `<svg viewBox="0 0 270 430" xmlns="http://www.w3.org/2000/svg" class="sweden-svg" id="sweden-map-svg">`;

    // Add defs for gradients and filters
    svgContent += `<defs>`;

    // Glow filter
    svgContent += `
        <filter id="region-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="1" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.3"/>
        </filter>
    `;

    // Zone gradients
    Object.entries(ZONE_COLORS).forEach(([zone, colors]) => {
        svgContent += `
            <linearGradient id="grad-${zone}" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="${colors.gradient[0]}"/>
                <stop offset="100%" stop-color="${colors.gradient[1]}"/>
            </linearGradient>
        `;
    });

    svgContent += `</defs>`;

    // Water background
    svgContent += `<rect width="270" height="430" fill="#0a1628" rx="8"/>`;

    // Render each region
    SWEDEN_REGIONS.forEach(region => {
        const birds = getBirdsForRegion(region.id, month);
        const colors = ZONE_COLORS[region.zone];

        svgContent += `
            <g class="sweden-region" data-region-id="${region.id}" data-zone="${region.zone}">
                <path d="${region.path}"
                      fill="url(#grad-${region.zone})"
                      stroke="${colors.stroke}"
                      stroke-width="1.2"
                      class="region-path"/>
                <text x="${region.labelPos.x}" y="${region.labelPos.y - 5}"
                      text-anchor="middle"
                      class="region-label"
                      font-size="6"
                      fill="rgba(255,255,255,0.8)"
                      font-family="Outfit, sans-serif"
                      font-weight="600">${region.label}</text>
                <text x="${region.labelPos.x}" y="${region.labelPos.y + 5}"
                      text-anchor="middle"
                      class="region-count"
                      font-size="7"
                      fill="${colors.active}"
                      font-family="Outfit, sans-serif"
                      font-weight="700">${birds.length} arter</text>
            </g>
        `;
    });

    svgContent += `</svg>`;
    svgContainer.innerHTML = svgContent;

    // Add click handlers
    // Add click & hover handlers
    document.querySelectorAll('.sweden-region').forEach(regionEl => {
        const zone = regionEl.dataset.zone;

        regionEl.addEventListener('mouseenter', () => {
            document.querySelectorAll(`.sweden-region[data-zone="${zone}"] .region-path`).forEach(path => {
                path.style.filter = 'brightness(1.2)';
                path.style.stroke = 'white';
                path.style.strokeWidth = '2';
            });
        });

        regionEl.addEventListener('mouseleave', () => {
            document.querySelectorAll(`.sweden-region[data-zone="${zone}"] .region-path`).forEach(path => {
                path.style.filter = '';
                path.style.stroke = '';
                path.style.strokeWidth = '';
            });
        });

        regionEl.addEventListener('click', () => {
            // Remove active from all
            document.querySelectorAll('.sweden-region').forEach(r => r.classList.remove('active'));

            // Add active to ALL in zone
            document.querySelectorAll(`.sweden-region[data-zone="${zone}"]`).forEach(r => r.classList.add('active'));

            const currentMonthEl = document.getElementById('current-month-name');
            const month = SWEDISH_MONTHS.indexOf(currentMonthEl.textContent);
            showZoneBirds(zone, month);
        });
    });
}

function updateRegionCounts(month) {
    SWEDEN_REGIONS.forEach(region => {
        const birds = getBirdsForRegion(region.id, month);
        const regionEl = document.querySelector(`[data-region-id="${region.id}"] .region-count`);
        if (regionEl) {
            regionEl.textContent = `${birds.length} arter`;
        }
    });
}


function showZoneBirds(zone, month) {
    const panel = document.getElementById('region-info-panel');
    if (!panel) return;

    // aggregated birds for the zone
    // simplistic approach: check if bird is in ANY region of the zone?
    // actually our isBirdInRegion logic already checks by zone for most birds.
    // simpler: just check `checkZone` logic directly.

    const season = getSeasonForMonth(month);
    const zoneColors = ZONE_COLORS[zone];

    // Filter birds for the whole zone
    const birds = window.swedishBirds.filter(bird => {
        return checkZone(bird.seasonDistribution.toLowerCase(), zone) &&
            isInSeason(bird.seasonDistribution.toLowerCase(), season);
    });

    // Sort Birds
    birds.sort((a, b) => {
        if (currentMapSort === 'name') return a.nameSv.localeCompare(b.nameSv);
        if (currentMapSort === 'wingspan') return (b.wingspan || 0) - (a.wingspan || 0);
        if (currentMapSort === 'eggs') return (b.eggs || 0) - (a.eggs || 0);
        if (currentMapSort === 'weight') return (b.weight || 0) - (a.weight || 0);
        if (currentMapSort === 'rarity') return (b.rarity || 0) - (a.rarity || 0);
        return 0;
    });

    // Group birds by type
    const birdsByType = {};
    birds.forEach(bird => {
        const type = bird.type || 'Övriga';
        if (!birdsByType[type]) birdsByType[type] = [];
        birdsByType[type].push(bird);
    });

    const sortedTypes = Object.keys(birdsByType).sort();

    const zoneNames = {
        north: 'Norra Sverige',
        central: 'Mellersta Sverige',
        south: 'Södra Sverige'
    };

    let html = `
        <div class="region-detail">
            <div class="region-detail-header" style="border-left: 4px solid ${zoneColors.active}; display: flex; justify-content: space-between; align-items: center;">
                <div>
                   <h3>${zoneNames[zone]}</h3>
                   <div class="region-stats">
                       <span class="region-bird-count">${birds.length} arter</span>
                       <span class="region-season">${getSeasonLabel(season)} · ${SWEDISH_MONTHS[month]}</span>
                   </div>
                </div>
                <div class="map-sort-wrapper">
                    <select id="map-sort-select" style="padding: 0.3rem; border-radius: 6px; border: 1px solid #ddd; font-size: 0.9rem; pointer-events: auto;">
                        <option value="name" ${currentMapSort === 'name' ? 'selected' : ''}>Namn</option>
                        <option value="wingspan" ${currentMapSort === 'wingspan' ? 'selected' : ''}>Vingspann</option>
                        <option value="eggs" ${currentMapSort === 'eggs' ? 'selected' : ''}>Ägg</option>
                        <option value="weight" ${currentMapSort === 'weight' ? 'selected' : ''}>Vikt</option>
                        <option value="rarity" ${currentMapSort === 'rarity' ? 'selected' : ''}>Sällsynthet</option>
                    </select>
                </div>
            </div>

            <div class="region-bird-types">
    `;

    sortedTypes.forEach(type => {
        const typeBirds = birdsByType[type];
        const icon = getCategoryIcon(type);
        html += `
            <div class="region-type-group">
                <div class="type-header" onclick="this.parentElement.classList.toggle('collapsed')">
                    <span class="type-icon"><i class="fa-solid ${icon}"></i></span>
                    <span class="type-name">${type}</span>
                    <span class="type-count">${typeBirds.length}</span>
                    <i class="fa-solid fa-chevron-down type-chevron"></i>
                </div>
                <div class="type-birds">
        `;

        typeBirds.forEach(bird => {
            const imgSrc = getBirdImageSrc(bird.id);
            // Dots are tricky for zones, let's just use the zone logic
            const monthDotsHtml = generateMonthDots(bird, zone, null, month);
            html += `
                <div class="map-bird-card" data-bird-id="${bird.id}" onclick="openBirdDetail(window.swedishBirds.find(b => b.id === '${bird.id}'))">
                    <img src="${imgSrc}" alt="${bird.nameSv}" data-bird-id="${bird.id}"
                         onerror="handleImageError(this)" loading="lazy"/>
                    <div class="map-bird-info">
                        <div class="map-bird-name-row">
                            <span class="map-bird-name">${bird.nameSv}</span>
                            <span class="map-bird-rarity">${'★'.repeat(bird.rarity || 1)}${'☆'.repeat(5 - (bird.rarity || 1))}</span>
                        </div>
                        <span class="map-bird-en">${bird.nameEn}</span>
                        ${monthDotsHtml}
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    });

    if (birds.length === 0) {
        html += `
            <div class="no-birds-message">
                <i class="fa-solid fa-snowflake"></i>
                <p>Inga fåglar registrerade för denna region under ${getSeasonLabel(season).toLowerCase()}</p>
            </div>
        `;
    }

    html += `
            </div>
        </div>
    `;

    panel.innerHTML = html;
    panel.classList.add('active');

    // Add listener
    const sSelect = document.getElementById('map-sort-select');
    if (sSelect) {
        sSelect.addEventListener('change', (e) => {
            currentMapSort = e.target.value;
            showZoneBirds(zone, month);
        });
    }
}

