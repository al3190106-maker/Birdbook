/**
 * nature-reserve.js
 * Hämtar naturreservat nära användarens GPS-position via Overpass API (OpenStreetMap)
 * och visar vilka fåglar som observerats i respektive reservat via GBIF.
 */
window.NatureReserves = (function () {
    'use strict';

    const CONFIG = {
        OVERPASS_URL: 'https://overpass-api.de/api/interpreter',
        GBIF_URL: 'https://api.gbif.org/v1/occurrence/search',
        GBIF_TAXON_KEY: 212,   // Aves
        GBIF_YEARS_BACK: 5,
        DEFAULT_RADIUS_KM: 10,
        MAX_GBIF_BIRDS: 100,
        POSITION_TIMEOUT: 12000,
    };

    let _initialized = false;
    let _isLoading = false;
    let _error = null;
    let _userLat = null;
    let _userLng = null;
    let _reserves = [];
    let _activeReserve = null;
    let _reserveBirds = {};
    let _loadingBirdsFor = null;
    let _radiusKm = CONFIG.DEFAULT_RADIUS_KM;

    // --- Hjälpfunktioner ---

    function _haversineDistance(lat1, lng1, lat2, lng2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) ** 2;
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

    // Konvertera OSM noder/ways till en enkel WKT-polygon för GBIF
    function _buildBboxWkt(lat, lng, km) {
        var d = km / 111;
        var dLng = km / (111 * Math.cos(lat * Math.PI / 180));
        var s = lat - d, n = lat + d, w = lng - dLng, e = lng + dLng;
        return 'POLYGON((' + w + ' ' + s + ',' + e + ' ' + s + ',' + e + ' ' + n + ',' + w + ' ' + n + ',' + w + ' ' + s + '))';
    }

    // --- Hämta naturreservat via Overpass ---
    async function _fetchReserves() {
        if (!_userLat) return [];

        var radiusM = _radiusKm * 1000;
        // Hämta relationer (naturreservat) med centre-punkt
        var query = '[out:json][timeout:20];' +
            'relation["leisure"="nature_reserve"]' +
            '(around:' + radiusM + ',' + _userLat + ',' + _userLng + ');' +
            'out center tags;';

        try {
            var resp = await fetch(CONFIG.OVERPASS_URL, {
                method: 'POST',
                body: 'data=' + encodeURIComponent(query),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            if (!resp.ok) throw new Error('Overpass ' + resp.status);
            var json = await resp.json();

            var elements = json.elements || [];
            if (elements.length === 0) {
                // Fallback: sök med boundary=protected_area
                return await _fetchReservesFallback();
            }

            return elements.map(function (el) {
                var lat = el.center ? el.center.lat : (el.lat || _userLat);
                var lng = el.center ? el.center.lon : (el.lon || _userLng);
                var dist = _haversineDistance(_userLat, _userLng, lat, lng);
                var tags = el.tags || {};
                return {
                    id: '' + el.id,
                    name: tags.name || tags['name:sv'] || 'Okänt reservat',
                    municipality: tags['addr:city'] || tags.municipality || '',
                    county: tags['addr:county'] || '',
                    area: parseFloat(tags.area) || 0,
                    lat: lat,
                    lng: lng,
                    distKm: Math.round(dist * 10) / 10,
                    osmType: el.type,
                };
            }).filter(function (r) { return r.distKm <= _radiusKm; })
              .sort(function (a, b) { return a.distKm - b.distKm; })
              .slice(0, 40);
        } catch (e) {
            console.warn('[NR] Overpass fel:', e);
            return await _fetchReservesFallback();
        }
    }

    async function _fetchReservesFallback() {
        var radiusM = _radiusKm * 1000;
        var query = '[out:json][timeout:20];' +
            '(' +
            'relation["boundary"="protected_area"]["protect_class"="2"]' +
            '(around:' + radiusM + ',' + _userLat + ',' + _userLng + ');' +
            'relation["boundary"="protected_area"]["protect_class"="4"]' +
            '(around:' + radiusM + ',' + _userLat + ',' + _userLng + ');' +
            ');' +
            'out center tags;';

        try {
            var resp = await fetch(CONFIG.OVERPASS_URL, {
                method: 'POST',
                body: 'data=' + encodeURIComponent(query),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            if (!resp.ok) return [];
            var json = await resp.json();
            var elements = json.elements || [];

            return elements.map(function (el) {
                var lat = el.center ? el.center.lat : _userLat;
                var lng = el.center ? el.center.lon : _userLng;
                var dist = _haversineDistance(_userLat, _userLng, lat, lng);
                var tags = el.tags || {};
                return {
                    id: '' + el.id,
                    name: tags.name || tags['name:sv'] || 'Skyddat område',
                    municipality: '',
                    county: '',
                    area: 0,
                    lat: lat,
                    lng: lng,
                    distKm: Math.round(dist * 10) / 10,
                    osmType: el.type,
                };
            }).filter(function (r) { return r.distKm <= _radiusKm; })
              .sort(function (a, b) { return a.distKm - b.distKm; })
              .slice(0, 30);
        } catch (e) {
            console.warn('[NR] Fallback fel:', e);
            return [];
        }
    }

    // --- Hämta GBIF-fåglar (bounding box kring reservatets centrum) ---
    async function _fetchBirdsForReserve(reserve) {
        // Använd reservatets position + en rimlig radie (minst 1 km)
        var radiusKm = Math.max(1, Math.min(reserve.area ? Math.sqrt(reserve.area) / 100 : 2, 5));
        var wkt = _buildBboxWkt(reserve.lat, reserve.lng, radiusKm);

        var yearFrom = new Date().getFullYear() - CONFIG.GBIF_YEARS_BACK;
        var params = new URLSearchParams({
            taxonKey: CONFIG.GBIF_TAXON_KEY,
            geometry: wkt,
            year: yearFrom + ',' + new Date().getFullYear(),
            limit: CONFIG.MAX_GBIF_BIRDS,
            hasCoordinate: 'true',
            country: 'SE',
        });

        try {
            var resp = await fetch(CONFIG.GBIF_URL + '?' + params.toString());
            if (!resp.ok) throw new Error('GBIF ' + resp.status);
            var json = await resp.json();

            var seen = {};
            var birds = [];
            (json.results || []).forEach(function (occ) {
                var key = occ.species || occ.scientificName;
                if (!key || seen[key]) return;
                seen[key] = true;
                var matched = _matchBird(occ.species || '', occ.scientificName || '');
                birds.push({
                    scientificName: occ.species || occ.scientificName || '',
                    vernacularName: matched ? matched.nameSv : (occ.vernacularName || ''),
                    matchedBird: matched,
                    taxonKey: occ.speciesKey,
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
        if (!s) return null;
        return window.birdsData.find(function (b) {
            return b.nameLatin && b.nameLatin.toLowerCase().startsWith(s);
        }) || null;
    }

    // --- Rendering ---
    function _render() {
        var container = document.getElementById('nr-container');
        if (!container) return;

        if (_activeReserve) { _renderDetail(container); return; }

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
            html += '<div class="nr-empty">' +
                '<i class="fa-solid fa-tree" style="font-size:2rem;opacity:0.3;"></i>' +
                '<span>Inga naturreservat hittades inom ' + _radiusKm + ' km.<br>Prova att öka avståndet.</span>' +
                '</div>';
        } else {
            html += '<div class="nr-list">';
            _reserves.forEach(function (r) {
                html += '<div class="nr-card" onclick="NatureReserves.selectReserve(\'' + r.id + '\')">' +
                    '<div class="nr-card-icon"><i class="fa-solid fa-tree"></i></div>' +
                    '<div class="nr-card-body">' +
                    '<div class="nr-card-name">' + _escHtml(r.name) + '</div>' +
                    '<div class="nr-card-meta">' +
                    (r.municipality ? '<span><i class="fa-solid fa-location-dot"></i> ' + _escHtml(r.municipality) + '</span>' : '<span><i class="fa-solid fa-seedling"></i> Naturreservat</span>') +
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

    function _initRadiusPicker() {
        var picker = document.getElementById('nr-radius-picker');
        if (!picker) return;
        var opts = [5, 10, 20, 50];
        picker.innerHTML = opts.map(function (km) {
            return '<button class="nr-radius-btn' + (km === _radiusKm ? ' active' : '') +
                '" onclick="NatureReserves.setRadius(' + km + ')">' +
                (km < 10 ? km + ' km' : km + ' km') + '</button>';
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
            '<p>' + r.distKm + ' km från dig' +
            (r.municipality ? ' · ' + _escHtml(r.municipality) : '') + '</p>' +
            '</div>' +
            '</div>' +
            '<div class="nr-birds-section">' +
            '<div class="nr-birds-header">' +
            '<i class="fa-solid fa-feather-pointed" style="color:var(--primary)"></i>' +
            '<span>Fåglar i reservatet</span>' +
            '<span class="nr-birds-sub">GBIF · senaste ' + CONFIG.GBIF_YEARS_BACK + ' åren</span>' +
            '</div>';

        if (isLoadingBirds) {
            html += '<div class="nr-birds-loading"><div class="nr-spinner-sm"></div> Hämtar fågeldata...</div>';
        } else if (!birds || birds.length === 0) {
            html += '<div class="nr-birds-empty"><i class="fa-solid fa-binoculars" style="opacity:0.3;font-size:1.5rem;"></i>' +
                '<span>Inga fågelobservationer hittades för detta reservat i GBIF.</span></div>';
        } else {
            html += '<div class="nr-birds-count">' + birds.length + ' arter registrerade</div>';
            html += '<div class="nr-birds-grid">';
            birds.forEach(function (b) {
                var img = b.matchedBird ? _getBirdImage(b.matchedBird) : null;
                var name = b.matchedBird ? b.matchedBird.nameSv : (b.vernacularName || b.scientificName);
                var sci = b.scientificName;
                var seen = b.matchedBird ? _checkUserSeen(b.matchedBird) : false;

                html += '<div class="nr-bird-card' + (seen ? ' nr-bird-seen' : '') + '"' +
                    (b.matchedBird ? ' onclick="NatureReserves._openBird(\'' + _escAttr(b.matchedBird.nameLatin || sci) + '\')"' : '') + '>' +
                    (img ? '<img class="nr-bird-img" src="' + img + '" alt="' + _escAttr(name) + '" loading="lazy">' :
                        '<div class="nr-bird-img-placeholder"><i class="fa-solid fa-dove"></i></div>') +
                    '<div class="nr-bird-info">' +
                    '<span class="nr-bird-name">' + _escHtml(name) + '</span>' +
                    '<span class="nr-bird-sci">' + _escHtml(sci) + '</span>' +
                    '</div>' +
                    (seen ? '<i class="fa-solid fa-check nr-bird-check"></i>' : '') +
                    '</div>';
            });
            html += '</div>';
        }

        html += '</div></div>';
        container.innerHTML = html;
    }

    function _checkUserSeen(bird) {
        if (!window.state || !window.state.sightings) return false;
        return window.state.sightings.some(function (s) {
            return s.species === bird.nameLatin || s.speciesName === bird.nameSv;
        });
    }

    function _getBirdImage(bird) {
        if (!bird) return null;
        if (window.birdImages && window.birdImages[bird.nameLatin]) return window.birdImages[bird.nameLatin];
        if (bird.image) return bird.image;
        return null;
    }

    function _escHtml(str) {
        return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    function _escAttr(str) {
        return String(str || '').replace(/'/g, "\\'");
    }

    // --- Public API ---
    async function init() {
        // Visa cached resultat direkt om vi redan har dem
        if (_initialized && !_error) {
            _render();
            return;
        }
        _initialized = false;
        _isLoading = true;
        _error = null;
        _activeReserve = null;
        _render();

        if (_userLat === null || _userLng === null) {
            var pos = await _getPosition();
            if (!pos) {
                _isLoading = false;
                _error = 'Platsbehörighet krävs. Tillåt platstjänster i din webbläsare och försök igen.';
                _render();
                return;
            }
        }

        _reserves = await _fetchReserves();
        _isLoading = false;
        _initialized = true;
        _render();
    }

    async function selectReserve(id) {
        var reserve = _reserves.find(function (r) { return r.id === id; });
        if (!reserve) return;

        _activeReserve = reserve;
        _loadingBirdsFor = id;
        _render();

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
        _reserveBirds = {};
        _initialized = false;
        init();
    }

    function _openBird(latinName) {
        if (window.openBirdDetailByLatin) window.openBirdDetailByLatin(latinName);
    }

    return { init, selectReserve, back, setRadius, _openBird };
})();
