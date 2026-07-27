file_path = r"c:\Users\theia\Documents\AI\birdfinder\app.js"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

new_code = """let _overviewMap = null;
let _overviewMarkerGroup = null;

function _renderSightingsOverviewMap() {
    const container = document.getElementById('sightings-overview-map');
    if (!container) return;

    if (!_overviewMap) {
        _overviewMap = L.map('sightings-overview-map', {
            zoomControl: true,
            attributionControl: false
        }).setView([62.0, 15.5], 5);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18
        }).addTo(_overviewMap);

        _overviewMarkerGroup = L.layerGroup().addTo(_overviewMap);

        // Bind zoomend to dynamically re-cluster markers when zoom changes
        _overviewMap.on('zoomend', () => {
            _updateOverviewMarkers();
        });
    } else {
        // Just clear the layer group
        _overviewMarkerGroup.clearLayers();
        // Trigger Leaflet to invalidate size in case container size changed
        _overviewMap.invalidateSize();
    }

    const geoSightings = state.sightings.filter(s => s.lat && s.lng && s.id !== 'SYSTEM_INIT_BIRD');

    if (geoSightings.length === 0) {
        // Show a message on the map
        const info = L.control({ position: 'topright' });
        info.onAdd = function() {
            const div = L.DomUtil.create('div', 'sighting-popup');
            div.style.background = 'white';
            div.style.borderRadius = '10px';
            div.style.padding = '1rem';
            div.style.boxShadow = '0 2px 10px rgba(0,0,0,0.15)';
            div.innerHTML = '<strong>Inga observationer med platsdata \\u00e4n.</strong><br>Placera en n\\u00e5l n\\u00e4r du skapar en ny observation!';
            return div;
        };
        info.addTo(_overviewMap);
        return;
    }

    // Render initially
    _updateOverviewMarkers();

    // Fit bounds on initial opening
    const bounds = geoSightings.map(s => [s.lat, s.lng]);
    if (bounds.length > 0) {
        _overviewMap.fitBounds(bounds, { padding: [30, 30], maxZoom: 12 });
    }
}

function _updateOverviewMarkers() {
    if (!_overviewMap || !_overviewMarkerGroup) return;

    _overviewMarkerGroup.clearLayers();

    const allSpecies = [
        ...(window.swedishBirds || []),
        ...(window.swedishTrees || []),
        ...(window.swedishFish || []),
        ...(window.swedishAnimals || []),
        ...(window.swedishFungi || []),
        ...(window.swedishFlowers || [])
    ];

    const geoSightings = state.sightings.filter(s => s.lat && s.lng && s.id !== 'SYSTEM_INIT_BIRD');
    if (geoSightings.length === 0) return;

    const clusters = [];
    const clusterRadiusPx = 40; // Group markers if they are within 40 pixels of each other

    geoSightings.forEach(s => {
        const latLng = L.latLng(s.lat, s.lng);
        const point = _overviewMap.latLngToLayerPoint(latLng);

        // Find close cluster
        let foundCluster = null;
        for (const cluster of clusters) {
            const dist = Math.hypot(point.x - cluster.x, point.y - cluster.y);
            if (dist < clusterRadiusPx) {
                foundCluster = cluster;
                break;
            }
        }

        if (foundCluster) {
            foundCluster.sightings.push(s);
        } else {
            clusters.push({
                lat: s.lat,
                lng: s.lng,
                x: point.x,
                y: point.y,
                sightings: [s]
            });
        }
    });

    clusters.forEach(group => {
        if (group.sightings.length === 1) {
            const s = group.sightings[0];
            let item = allSpecies.find(sp => sp.id === s.birdId);
            
            // Build item for custom species
            if (!item && s.birdId && s.birdId.startsWith('custom_')) {
                const customName = (window._customSpeciesNames && window._customSpeciesNames[s.birdId])
                    || s.customName || s.birdId.replace('custom_', '');
                item = {
                    id: s.birdId,
                    nameSv: customName,
                    nameEn: customName,
                    scientific: '',
                    funFact: '',
                    rarity: 1,
                    _isCustom: true
                };
            }
            if (!item) return;

            const customImg = localStorage.getItem(`custom_img_${item.id}`);
            const userPhoto = s.photo;
            const imgSrc = customImg || userPhoto || getBirdImageSrc(item.id, 'identify');
            
            const popupContent = `
                <div class="sighting-popup-square" style="cursor: pointer;" onclick="window.showSightingFromMap('${item.id}', '${s.id}')">
                    <img src="${imgSrc}" alt="${item.nameSv}" class="sighting-popup-img-square" onerror="this.style.display='none'">
                    <div class="sighting-popup-overlay">
                        <span class="sighting-popup-label">${item.nameSv}</span>
                    </div>
                </div>
            `;

            const marker = L.marker([group.lat, group.lng]);
            marker.bindPopup(popupContent, { maxWidth: 160, minWidth: 120, className: 'square-popup', closeButton: false });
            _overviewMarkerGroup.addLayer(marker);
        } else {
            // Multiple sightings: build clustered list
            const headerText = `${group.sightings.length} observationer`;
            let listContent = `
                <div class="sighting-cluster-popup">
                    <div class="sighting-cluster-header">
                        <span>${headerText}</span>
                    </div>
            `;

            group.sightings.forEach(s => {
                let item = allSpecies.find(sp => sp.id === s.birdId);
                
                // Build item for custom species
                if (!item && s.birdId && s.birdId.startsWith('custom_')) {
                    const customName = (window._customSpeciesNames && window._customSpeciesNames[s.birdId])
                        || s.customName || s.birdId.replace('custom_', '');
                    item = {
                        id: s.birdId,
                        nameSv: customName,
                        nameEn: customName,
                        scientific: '',
                        funFact: '',
                        rarity: 1,
                        _isCustom: true
                    };
                }
                if (!item) return;

                const customImg = localStorage.getItem(`custom_img_${item.id}`);
                const userPhoto = s.photo;
                const imgSrc = customImg || userPhoto || getBirdImageSrc(item.id, 'identify');
                
                const badgeHTML = s.heard === true
                    ? `<span class="sighting-cluster-badge heard"><i class="fa-solid fa-ear-listen"></i> Hörd</span>`
                    : `<span class="sighting-cluster-badge"><i class="fa-solid fa-eye"></i> Sedd</span>`;

                listContent += `
                    <div class="sighting-cluster-item" onclick="window.showSightingFromMap('${item.id}', '${s.id}')">
                        <img src="${imgSrc}" alt="${item.nameSv}" class="sighting-cluster-img" onerror="this.style.display='none'">
                        <div class="sighting-cluster-info">
                            <div class="sighting-cluster-name">${item.nameSv}</div>
                            <div class="sighting-cluster-meta">
                                ${badgeHTML} ${s.date}
                            </div>
                        </div>
                    </div>
                `;
            });

            listContent += `</div>`;

            const marker = L.marker([group.lat, group.lng]);
            marker.bindPopup(listContent, { maxWidth: 280, minWidth: 240, className: 'cluster-popup', closeButton: true });
            _overviewMarkerGroup.addLayer(marker);
        }
    });
}

// Global handler to open sighting from map popup click
window.showSightingFromMap = function(birdId, sightingId) {
    const modal = document.getElementById('sightings-map-modal');
    if (modal) {
        modal.classList.remove('active');
        const content = modal.querySelector('.sightings-map-modal-content');
        if (content) content.classList.remove('fullscreen');
    }

    const allData = [
        ...(window.swedishBirds || []), ...(window.swedishTrees || []),
        ...(window.swedishFish || []), ...(window.swedishAnimals || []),
        ...(window.swedishFungi || []), ...(window.swedishFlowers || [])
    ];
    const subject = allData.find(d => d.id === birdId);
    if (subject) {
        let subjectType = 'birds';
        if (window.swedishTrees && window.swedishTrees.some(t => t.id === subject.id)) subjectType = 'trees';
        else if (window.swedishFish && window.swedishFish.some(f => f.id === subject.id)) subjectType = 'fish';
        else if (window.swedishAnimals && window.swedishAnimals.some(a => a.id === subject.id)) subjectType = 'animals';
        else if (window.swedishFungi && window.swedishFungi.some(f => f.id === subject.id)) subjectType = 'fungi';
        else if (window.swedishFlowers && window.swedishFlowers.some(f => f.id === subject.id)) subjectType = 'flowers';
        else if (window.swedishPlants && window.swedishPlants.some(p => p.id === subject.id)) subjectType = 'plants';

        if (state.currentSubject !== subjectType) switchSubject(subjectType);

        const sighting = state.sightings.find(si => si.id === sightingId);
        openBirdDetail(subject, sighting || null);
    }
};"""

start_idx = content.find("let _overviewMap = null;")
if start_idx == -1:
    print("Error: Could not find let _overviewMap = null; in app.js")
    exit(1)

# Find the end of showSightingFromMap function
end_marker = "window.showSightingFromMap = function(birdId, sightingId) {"
marker_idx = content.find(end_marker)
if marker_idx == -1:
    print("Error: Could not find window.showSightingFromMap in app.js")
    exit(1)

# Find matching closing brace for showSightingFromMap
brace_count = 0
end_idx = -1
for i in range(marker_idx, len(content)):
    if content[i] == '{':
        brace_count += 1
    elif content[i] == '}':
        brace_count -= 1
        if brace_count == 0:
            end_idx = i + 1
            break

if end_idx == -1:
    print("Error: Could not find matching closing brace for showSightingFromMap")
    exit(1)

# Perform replacement
new_content = content[:start_idx] + new_code + content[end_idx:]

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Successfully replaced map overview logic with zoom-dependent clustering in app.js")
