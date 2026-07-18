/**
 * nature-reserve.js
 * Hämtar naturreservat nära användarens position och
 * visar vilka fåglar som observerats i respektive reservat (GBIF).
 */
window.NatureReserves = (function () {
    'use strict';

    // --- Konfiguration ---
    const CONFIG = {
        // Naturvårdsverket WFS för naturreservat
        NVR_URL: 'https://geodata.naturvardsverket.se/naturvardsregistret/rest/omrade/v3/NR?maxResults=50&geometryFormat=geojson',
        // GBIF occurrence search (klass Aves = 212)
        GBIF_URL: 'https://api.gbif.org/v1/occurrence/search',
        GBIF_TAXON_KEY: 212,   // Aves
        GBIF_YEARS_BACK: 5,    // Sök fynd de senaste 5 åren
        DEFAULT_RADIUS_KM: 20, // Standard sökradie för reservat
        MAX_GBIF_BIRDS: 80,    // Max fågelarter att visa per reservat
        POSITION_TIMEOUT: 12000,
    };

    // --- State ---
    let _initialized = false;
    let _isLoading = false;
    let _error = null;
    let _userLat = null;
    let _userLng = null;
    let _reserves = [];       // [{id, name, lat, lng, distKm, geometry, ...}]
    let _activeReserve = null; // Valt reservat (för detaljvy)
    let _reserveBirds = {};   // {reserveId: [birdSpecies]}
    let _loadingBirdsFor = null;
    let _radiusKm = CONFIG.DEFAULT_RADIUS_KM;
    let _mapInstance = null;
    let _mapInited = false;

    // --- Hjälpfunktioner ---
    function _haversineDistance(lat1, lng1, lat2, lng2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    function _getPosition() {
        return new Promise(function (resolve) {
            if (!navigator.geolocation) { resolve(null); return; }
            navigator.geolocation.getCurrentPosition(
                function (pos) {
                    _userLat = pos.coords.latitude;
                    _userLng = pos.coords.longitude;
                    resolve({ lat: _userLat, lng: _userLng });
                },
                function () { resolve(null); },
                { timeout: CONFIG.POSITION_TIMEOUT, enableHighAccuracy: true }
            );
        });
    }

    // Bygg bounding box kring GPS-punkt
    function _bbox(lat, lng, km) {
        const dLat = km / 111;
        const dLng = km / (111 * Math.cos(lat * Math.PI / 180));
        return {
            minLat: lat - dLat, maxLat: lat + dLat,
            minLng: lng - dLng, maxLng: lng + dLng
        };
    }

    // Konvertera GeoJSON polygon till WKT för GBIF
    function _geojsonToWkt(geometry) {
        if (!geometry) return null;
        try {
            var type = geometry.type;
            var coords;
            if (type === 'Polygon') {
                coords = geometry.coordinates[0];
            } else if (type === 'MultiPolygon') {
                // Ta den största ringen
                coords = geometry.coordinates.reduce(function (best, poly) {
                    return poly[0].length > (best ? best.length : 0) ? poly[0] : best;
                }, null);
            } else return null;

            // Max 200 punkter för GBIF (förenkla om nödvändigt)
            if (coords.length > 200) {
                var step = Math.ceil(coords.length / 200);
                var simplified = coords.filter(function (_, i) { return i % step === 0; });
                // Se till att sista punkten är samma som första (stäng polygonen)
                if (simplified[simplified.length - 1] !== simplified[0]) {
                    simplified.push(simplified[0]);
                }
                coords = simplified;
            }

            var pts = coords.map(function (c) { return c[0] + ' ' + c[1]; }).join(', ');
            return 'POLYGON((' + pts + '))';
        } catch (e) {
            return null;
        }
    }

    // --- Hämta naturreservat ---
    async function _fetchReserves() {
        if (!_userLat) return [];
        var box = _bbox(_userLat, _userLng, _radiusKm);

        // Naturvårdsverket WFS endpoint - hämta reservat i bounding box
        var url = 'https://geodata.naturvardsverket.se/naturvardsregistret/rest/omrade/v3/NR?' +
            'bbox=' + box.minLng + ',' + box.minLat + ',' + box.maxLng + ',' + box.maxLat +
            '&maxResults=50&geometryFormat=geojson';

        try {
            var resp = await fetch(url, { signal: AbortSignal.timeout ? AbortSignal.timeout(10000) : undefined });
            if (!resp.ok) throw new Error('NVR ' + resp.status);
            var json = await resp.json();

            // Stöder både FeatureCollection och array
            var features = json.features || json || [];

            return features.map(function (f) {
                var props = f.properties || {};
                var geom = f.geometry;
                var centroid = _getCentroid(geom);
                var dist = centroid ? _haversineDistance(_userLat, _userLng, centroid.lat, centroid.lng) : 999;

                return {
                    id: props.NVRID || props.nvrid || f.id || Math.random().toString(36).slice(2),
                    name: props.NAMN || props.namn || 'Okänt reservat',
                    municipality: props.KOMMUN || props.kommun || '',
                    county: props.LAN || props.lan || '',
                    area: props.AREAL_HA || props.areal_ha || 0,
                    geometry: geom,
                    lat: centroid ? centroid.lat : _userLat,
                    lng: centroid ? centroid.lng : _userLng,
                    distKm: Math.round(dist * 10) / 10,
                };
            }).filter(function (r) { return r.distKm <= _radiusKm; })
              .sort(function (a, b) { return a.distKm - b.distKm; });
        } catch (e) {
            console.warn('[NR] Kunde inte hämta reservat:', e);
            return [];
        }
    }

    function _getCentroid(geometry) {
        if (!geometry) return null;
        try {
            var coords;
            if (geometry.type === 'Polygon') coords = geometry.coordinates[0];
            else if (geometry.type === 'MultiPolygon') coords = geometry.coordinates[0][0];
            else return null;
            var sumLat = 0, sumLng = 0;
            coords.forEach(function (c) { sumLng += c[0]; sumLat += c[1]; });
            return { lat: sumLat / coords.length, lng: sumLng / coords.length };
        } catch (e) { return null; }
    }

    // --- Hämta GBIF-fåglar för ett reservat ---
    async function _fetchBirdsForReserve(reserve) {
        var wkt = _geojsonToWkt(reserve.geometry);
        if (!wkt) {
            // Fallback: bounding box runt reservatets centrum
            var box = _bbox(reserve.lat, reserve.lng, Math.max(1, Math.sqrt(reserve.area || 100) / 100));
            wkt = 'POLYGON((' +
                box.minLng + ' ' + box.minLat + ',' +
                box.maxLng + ' ' + box.minLat + ',' +
                box.maxLng + ' ' + box.maxLat + ',' +
                box.minLng + ' ' + box.maxLat + ',' +
                box.minLng + ' ' + box.minLat + '))';
        }

        var yearFrom = new Date().getFullYear() - CONFIG.GBIF_YEARS_BACK;
        var params = new URLSearchParams({
            taxonKey: CONFIG.GBIF_TAXON_KEY,
            geometry: wkt,
            year: yearFrom + ',' + new Date().getFullYear(),
            limit: CONFIG.MAX_GBIF_BIRDS,
            hasCoordinate: 'true',
            country: 'SE',
            facet: 'SPECIES_KEY',
            facetLimit: CONFIG.MAX_GBIF_BIRDS,
        });

        try {
            var resp = await fetch(CONFIG.GBIF_URL + '?' + params.toString());
            if (!resp.ok) throw new Error('GBIF ' + resp.status);
            var json = await resp.json();

            // Samla unika arter
            var seen = {};
            var birds = [];
            (json.results || []).forEach(function (occ) {
                var key = occ.species || occ.scientificName;
                if (!key || seen[key]) return;
                seen[key] = true;
                // Försök matcha mot birds.js
                var matched = _matchBird(occ.species || '', occ.scientificName || '');
                birds.push({
                    scientificName: occ.species || occ.scientificName || '',
                    vernacularName: matched ? matched.nameSv : (occ.vernacularName || ''),
                    englishName: matched ? matched.nameEn : '',
                    matchedBird: matched,
                    taxonKey: occ.speciesKey,
                    count: 1,
                });
            });

            return birds.sort(function (a, b) {
                if (a.matchedBird && !b.matchedBird) return -1;
                if (!a.matchedBird && b.matchedBird) return 1;
                var nameA = (a.matchedBird ? a.matchedBird.nameSv : a.scientificName).toLowerCase();
                var nameB = (b.matchedBird ? b.matchedBird.nameSv : b.scientificName).toLowerCase();
                return nameA.localeCompare(nameB, 'sv');
            });
        } catch (e) {
            console.warn('[NR] GBIF fel:', e);
            return [];
        }
    }

    function _matchBird(species, sciName) {
        if (!window.birdsData) return null;
        var s = (species || sciName || '').toLowerCase().split(' ').slice(0, 2).join(' ');
        return window.birdsData.find(function (b) {
            return b.nameLatin && b.nameLatin.toLowerCase().startsWith(s);
        }) || null;
    }

    // --- Rendering ---

    function _render() {
        var container = document.getElementById('nr-container');
        if (!container) return;

        if (_activeReserve) {
            _renderDetail(container);
            return;
        }

        if (_isLoading) {
            container.innerHTML =
                '<div class="nr-loading">' +
                '<div class="nr-spinner"></div>' +
                '<p>' + (_userLat === null ? 'Söker din GPS-position...' : 'Söker naturreservat nära dig...') + '</p>' +
                '</div>';
            return;
        }

        if (_error) {
            container.innerHTML =
                '<div class="nr-error">' +
                '<i class="fa-solid fa-triangle-exclamation"></i>' +
                '<p>' + _error + '</p>' +
                '<button onclick="NatureReserves.init()" class="nr-retry-btn">Försök igen</button>' +
                '</div>';
            return;
        }

        // Hero + lista
        var html = '<div class="nr-hero">' +
            '<div class="nr-hero-bg"></div>' +
            '<div class="nr-hero-content">' +
            '<div class="nr-hero-icon"><i class="fa-solid fa-tree"></i></div>' +
            '<h2 class="nr-hero-title">Naturreservat</h2>' +
            '<p class="nr-hero-subtitle">Fåglar observerade i reservat nära dig</p>' +
            '<div class="nr-hero-badge"><i class="fa-solid fa-map-pin"></i> ' + _reserves.length + ' reservat inom ' + _radiusKm + ' km</div>' +
            '</div>' +
            '<div class="nr-radius-picker" id="nr-radius-picker"></div>' +
            '</div>';

        if (_reserves.length === 0) {
            html += '<div class="nr-empty"><i class="fa-solid fa-tree" style="font-size:2rem;opacity:0.3;"></i>' +
                '<span>Inga naturreservat hittades inom ' + _radiusKm + ' km.<br>Prova att öka avståndet.</span></div>';
        } else {
            html += '<div class="nr-list">';
            _reserves.forEach(function (r) {
                var status = _getUserSightingStatus(r);
                html += '<div class="nr-card" onclick="NatureReserves.selectReserve(\'' + r.id + '\')">' +
                    '<div class="nr-card-icon ' + (status ? 'nr-icon-visited' : '') + '">' +
                    '<i class="fa-solid fa-' + (status ? 'check' : 'tree') + '"></i>' +
                    '</div>' +
                    '<div class="nr-card-body">' +
                    '<div class="nr-card-name">' + _escHtml(r.name) + '</div>' +
                    '<div class="nr-card-meta">' +
                    (r.municipality ? '<span><i class="fa-solid fa-location-dot"></i> ' + _escHtml(r.municipality) + '</span>' : '') +
                    (r.area ? '<span><i class="fa-solid fa-expand"></i> ' + Math.round(r.area) + ' ha</span>' : '') +
                    '</div>' +
                    '</div>' +
                    '<div class="nr-card-dist">' + r.distKm + ' km</div>' +
                    '<i class="fa-solid fa-chevron-right nr-card-arrow"></i>' +
                    '</div>';
            });
            html += '</div>';
        }

        container.innerHTML = html;
        _initRadiusPicker();
    }

    function _getUserSightingStatus(reserve) {
        // Enkel check – om reservatnamnet finns i localStorage som besökt
        try {
            var visited = JSON.parse(localStorage.getItem('nr-visited') || '[]');
            return visited.includes(reserve.id);
        } catch (e) { return false; }
    }

    function _initRadiusPicker() {
        var picker = document.getElementById('nr-radius-picker');
        if (!picker) return;
        var opts = [5, 10, 20, 50];
        picker.innerHTML = opts.map(function (km) {
            return '<button class="nr-radius-btn' + (km === _radiusKm ? ' active' : '') +
                '" onclick="NatureReserves.setRadius(' + km + ')">' + (km < 10 ? km + ' km' : km / 10 + ' mil') + '</button>';
        }).join('');
    }

    function _renderDetail(container) {
        var r = _activeReserve;
        var birds = _reserveBirds[r.id];
        var isLoadingBirds = _loadingBirdsFor === r.id;

        var html = '<div class="nr-detail">' +
            '<div class="nr-detail-header">' +
            '<button class="nr-back-btn" onclick="NatureReserves.back()">' +
            '<i class="fa-solid fa-arrow-left"></i>' +
            '</button>' +
            '<div class="nr-detail-title">' +
            '<h2>' + _escHtml(r.name) + '</h2>' +
            '<p>' + [r.municipality, r.county].filter(Boolean).join(', ') +
            (r.area ? ' · ' + Math.round(r.area) + ' ha' : '') + '</p>' +
            '</div>' +
            '</div>' +

            // Karta
            '<div id="nr-map" class="nr-map"></div>' +

            // Fåglar
            '<div class="nr-birds-section">' +
            '<div class="nr-birds-header">' +
            '<i class="fa-solid fa-feather-pointed" style="color:var(--primary)"></i>' +
            '<span>Fåglar i reservatet</span>' +
            '<span class="nr-birds-sub">Observerade via GBIF de senaste ' + CONFIG.GBIF_YEARS_BACK + ' åren</span>' +
            '</div>';

        if (isLoadingBirds) {
            html += '<div class="nr-birds-loading"><div class="nr-spinner-sm"></div> Hämtar fågeldata...</div>';
        } else if (!birds || birds.length === 0) {
            html += '<div class="nr-birds-empty"><i class="fa-solid fa-binoculars" style="opacity:0.3"></i>' +
                '<span>Inga fågelobservationer hittade i GBIF för detta reservat.</span></div>';
        } else {
            html += '<div class="nr-birds-count">' + birds.length + ' arter registrerade</div>';
            html += '<div class="nr-birds-grid">';
            birds.forEach(function (b) {
                var img = b.matchedBird ? _getBirdImage(b.matchedBird) : null;
                var name = b.matchedBird ? b.matchedBird.nameSv : b.vernacularName || b.scientificName;
                var sci = b.scientificName;
                var status = b.matchedBird ? _checkUserSeen(b.matchedBird) : null;

                html += '<div class="nr-bird-card' + (status ? ' nr-bird-seen' : '') + '"' +
                    (b.matchedBird ? ' onclick="NatureReserves._openBird(\'' + _escAttr(b.matchedBird.nameLatin || sci) + '\')"' : '') + '>' +
                    (img ? '<img class="nr-bird-img" src="' + img + '" alt="' + _escAttr(name) + '" loading="lazy">' :
                        '<div class="nr-bird-img-placeholder"><i class="fa-solid fa-dove"></i></div>') +
                    '<div class="nr-bird-info">' +
                    '<span class="nr-bird-name">' + _escHtml(name) + '</span>' +
                    '<span class="nr-bird-sci">' + _escHtml(sci) + '</span>' +
                    '</div>' +
                    (status ? '<i class="fa-solid fa-check nr-bird-check"></i>' : '') +
                    '</div>';
            });
            html += '</div>';
        }

        html += '</div></div>'; // nr-birds-section + nr-detail
        container.innerHTML = html;

        // Init karta
        _initDetailMap(r);
    }

    function _checkUserSeen(bird) {
        if (!window.state || !window.state.sightings) return false;
        return window.state.sightings.some(function (s) {
            return s.species === bird.nameLatin || (bird.nameSv && s.speciesName === bird.nameSv);
        });
    }

    function _getBirdImage(bird) {
        if (!bird) return null;
        if (window.birdImages && window.birdImages[bird.nameLatin]) return window.birdImages[bird.nameLatin];
        if (bird.image) return bird.image;
        return null;
    }

    function _initDetailMap(reserve) {
        var mapEl = document.getElementById('nr-map');
        if (!mapEl || typeof L === 'undefined') return;

        var map = L.map('nr-map', { zoomControl: false });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap',
            maxZoom: 18
        }).addTo(map);
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Lägg till reservatpolygon
        if (reserve.geometry) {
            try {
                var layer = L.geoJSON(reserve.geometry, {
                    style: {
                        color: '#2e5d4b',
                        weight: 2,
                        opacity: 0.9,
                        fillColor: '#4ade80',
                        fillOpacity: 0.15
                    }
                }).addTo(map);
                map.fitBounds(layer.getBounds(), { padding: [20, 20] });
            } catch (e) {
                map.setView([reserve.lat, reserve.lng], 13);
            }
        } else {
            map.setView([reserve.lat, reserve.lng], 13);
        }

        // Användarposition
        if (_userLat !== null && _userLng !== null) {
            var userIcon = L.divIcon({
                className: '',
                html: '<div style="width:14px;height:14px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 2px 8px rgba(59,130,246,0.5)"></div>',
                iconSize: [14, 14],
                iconAnchor: [7, 7]
            });
            L.marker([_userLat, _userLng], { icon: userIcon }).addTo(map)
                .bindPopup('Du är här');
        }
    }

    function _escHtml(str) {
        return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    function _escAttr(str) {
        return String(str || '').replace(/'/g, "\\'");
    }

    // --- Public API ---

    async function init() {
        if (_initialized && _reserves.length >= 0 && !_error) {
            _render();
            return;
        }
        _initialized = false;
        _isLoading = true;
        _error = null;
        _activeReserve = null;
        _render();

        // Hämta GPS
        if (_userLat === null || _userLng === null) {
            var pos = await _getPosition();
            if (!pos) {
                _isLoading = false;
                _error = 'Platsbehörighet krävs för att hitta naturreservat nära dig. Tillåt platstjänster i din webbläsare.';
                _render();
                return;
            }
        }

        // Hämta reservat
        _reserves = await _fetchReserves();
        _isLoading = false;
        _initialized = true;
        _render();
    }

    async function selectReserve(id) {
        var reserve = _reserves.find(function (r) { return r.id == id; });
        if (!reserve) return;

        _activeReserve = reserve;
        _loadingBirdsFor = id;
        _render();

        // Hämta fåglar om vi inte redan har dem
        if (!_reserveBirds[id]) {
            _reserveBirds[id] = await _fetchBirdsForReserve(reserve);
        }
        _loadingBirdsFor = null;
        _render();
    }

    function back() {
        _activeReserve = null;
        _render();
    }

    function setRadius(km) {
        if (km === _radiusKm) return;
        _radiusKm = km;
        _reserves = [];
        _initialized = false;
        init();
    }

    function _openBird(latinName) {
        if (!window.openBirdDetailByLatin) return;
        window.openBirdDetailByLatin(latinName);
    }

    return {
        init: init,
        selectReserve: selectReserve,
        back: back,
        setRadius: setRadius,
        _openBird: _openBird,
    };
})();
