/**
 * sightings.js – Senaste fågelfynd i Sverige via GBIF API
 * 
 * Hämtar observationer från GBIF (Global Biodiversity Information Facility)
 * som speglar data från Artportalen. Matchar mot birds.js för att visa
 * svenska namn och bilder.
 * 
 * API: https://api.gbif.org/v1/occurrence/search
 */

window.RecentSightings = (function () {
    'use strict';

    // --- Konfiguration ---
    const CONFIG = {
        API_BASE: 'https://api.gbif.org/v1/occurrence/search',
        TAXON_KEY: 212,         // Aves (fåglar) i GBIF:s taxonomi
        COUNTRY: 'SE',          // Sverige
        LIMIT: 300,             // Max antal per hämtning (GBIF max per sida)
        CACHE_KEY: 'naturboken_recent_sightings',
        CACHE_TTL: 30 * 60 * 1000,  // 30 minuter cache
        MAX_DISPLAY: 80,        // Max att visa i UI
        RADIUS_KM: 50,          // 5 mil = 50 km radie
    };

    // --- Svenska län-namn (för filtrering) ---
    const REGIONS = [
        'Blekinge', 'Dalarna', 'Gotland', 'Gävleborg', 'Halland',
        'Jämtland', 'Jönköping', 'Kalmar', 'Kronoberg', 'Norrbotten',
        'Skåne', 'Stockholm', 'Södermanland', 'Uppsala', 'Värmland',
        'Västerbotten', 'Västernorrland', 'Västmanland',
        'Västra Götaland', 'Örebro', 'Östergötland'
    ];

    // Mapping av engelska län-namn från GBIF till svenska
    const REGION_MAP = {
        'blekinge': 'Blekinge',
        'blekinge län': 'Blekinge',
        'blekinge county': 'Blekinge',
        'dalarna': 'Dalarna',
        'dalarnas län': 'Dalarna',
        'dalarna county': 'Dalarna',
        'gotland': 'Gotland',
        'gotlands län': 'Gotland',
        'gotland county': 'Gotland',
        'gävleborg': 'Gävleborg',
        'gävleborgs län': 'Gävleborg',
        'gävleborg county': 'Gävleborg',
        'halland': 'Halland',
        'hallands län': 'Halland',
        'halland county': 'Halland',
        'jämtland': 'Jämtland',
        'jämtlands län': 'Jämtland',
        'jämtland county': 'Jämtland',
        'jönköping': 'Jönköping',
        'jönköpings län': 'Jönköping',
        'jönköping county': 'Jönköping',
        'kalmar': 'Kalmar',
        'kalmar län': 'Kalmar',
        'kalmar county': 'Kalmar',
        'kronoberg': 'Kronoberg',
        'kronobergs län': 'Kronoberg',
        'kronoberg county': 'Kronoberg',
        'norrbotten': 'Norrbotten',
        'norrbottens län': 'Norrbotten',
        'norrbotten county': 'Norrbotten',
        'skåne': 'Skåne',
        'skåne län': 'Skåne',
        'skåne county': 'Skåne',
        'stockholm': 'Stockholm',
        'stockholms län': 'Stockholm',
        'stockholm county': 'Stockholm',
        'södermanland': 'Södermanland',
        'södermanlands län': 'Södermanland',
        'södermanland county': 'Södermanland',
        'uppsala': 'Uppsala',
        'uppsala län': 'Uppsala',
        'uppsala county': 'Uppsala',
        'värmland': 'Värmland',
        'värmlands län': 'Värmland',
        'värmland county': 'Värmland',
        'västerbotten': 'Västerbotten',
        'västerbottens län': 'Västerbotten',
        'västerbotten county': 'Västerbotten',
        'västernorrland': 'Västernorrland',
        'västernorrlands län': 'Västernorrland',
        'västernorrland county': 'Västernorrland',
        'västmanland': 'Västmanland',
        'västmanlands län': 'Västmanland',
        'västmanland county': 'Västmanland',
        'västra götaland': 'Västra Götaland',
        'västra götalands län': 'Västra Götaland',
        'västra götaland county': 'Västra Götaland',
        'örebro': 'Örebro',
        'örebro län': 'Örebro',
        'örebro county': 'Örebro',
        'östergötland': 'Östergötland',
        'östergötlands län': 'Östergötland',
        'östergötland county': 'Östergötland',
    };

    // --- Intern state ---
    let _sightings = [];        // Rå observationsdata
    let _grouped = [];          // Grupperade per art
    let _isLoading = false;
    let _error = null;
    let _lastFetch = null;
    let _activeRegion = null;   // Aktivt länsfilter
    let _searchTerm = '';
    let _nearbyMode = false;    // true = visa bara inom 5 mil
    let _userLat = null;
    let _userLng = null;
    let _locationError = null;

    // --- Bygg scientific name lookup från birds.js ---
    let _sciNameMap = null;     // lowercase scientific -> bird object

    function _buildSciNameMap() {
        if (_sciNameMap) return;
        _sciNameMap = {};
        if (!window.swedishBirds) return;
        window.swedishBirds.forEach(function (bird) {
            if (bird.scientific) {
                // GBIF returnerar ibland "Genus species Author, Year"
                // Vi matchar bara genus + species
                const parts = bird.scientific.toLowerCase().trim().split(/\s+/);
                const key = parts.slice(0, 2).join(' ');
                _sciNameMap[key] = bird;
            }
        });
    }

    /**
     * Matcha ett GBIF-occurrence-objekt mot en fågel i birds.js
     */
    function _matchBird(occurrence) {
        _buildSciNameMap();
        if (!occurrence.scientificName) return null;

        // Normalisera: ta bort author/year, behåll genus + species
        const parts = occurrence.scientificName.toLowerCase().trim().split(/\s+/);
        const key = parts.slice(0, 2).join(' ');
        return _sciNameMap[key] || null;
    }

    /**
     * Normalisera GBIF-regionnamn till svenskt län
     */
    function _normalizeRegion(stateProvince) {
        if (!stateProvince) return 'Okänt';
        const lower = stateProvince.toLowerCase().trim();
        return REGION_MAP[lower] || stateProvince;
    }

    // --- Geolocation ---

    /**
     * Hämta användarens GPS-position.
     * Returnerar { lat, lng } eller null vid fel.
     */
    function _getPosition() {
        return new Promise(function (resolve) {
            if (!navigator.geolocation) {
                _locationError = 'Geolocation stöds inte i din webbläsare';
                resolve(null);
                return;
            }
            navigator.geolocation.getCurrentPosition(
                function (pos) {
                    _userLat = pos.coords.latitude;
                    _userLng = pos.coords.longitude;
                    _locationError = null;
                    resolve({ lat: _userLat, lng: _userLng });
                },
                function (err) {
                    _locationError = err.code === 1
                        ? 'Platsåtkomst nekad – tillåt i webbläsarinställningar'
                        : 'Kunde inte hämta din position';
                    resolve(null);
                },
                { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
            );
        });
    }

    /**
     * Beräkna bounding box runt en punkt (lat, lng) med radie i km.
     * Returnerar { minLat, maxLat, minLng, maxLng }
     */
    function _boundingBox(lat, lng, radiusKm) {
        var latDelta = radiusKm / 111.32;
        var lngDelta = radiusKm / (111.32 * Math.cos(lat * Math.PI / 180));
        return {
            minLat: (lat - latDelta).toFixed(4),
            maxLat: (lat + latDelta).toFixed(4),
            minLng: (lng - lngDelta).toFixed(4),
            maxLng: (lng + lngDelta).toFixed(4)
        };
    }

    // --- API-anrop ---

    /**
     * Bygger API-URL med datumfilter.
     * GBIF har ~2-4 veckors fördröjning jämfört med Artportalen,
     * så vi söker 60 dagar bakåt för att alltid hitta resultat.
     * Om _nearbyMode är aktiv, begränsar till bounding box runt användaren.
     */
    function _buildUrl() {
        const now = new Date();
        const startDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

        const fmt = function (d) {
            return d.toISOString().split('T')[0];
        };

        const params = new URLSearchParams({
            taxonKey: CONFIG.TAXON_KEY,
            country: CONFIG.COUNTRY,
            hasCoordinate: 'true',
            hasGeospatialIssue: 'false',
            occurrenceStatus: 'PRESENT',
            limit: CONFIG.LIMIT,
            eventDate: fmt(startDate) + ',' + fmt(now),
            orderBy: 'eventDate',
            desc: 'true'
        });

        // Lägg till bounding box om nära-mig-läge
        if (_nearbyMode && _userLat !== null && _userLng !== null) {
            var box = _boundingBox(_userLat, _userLng, CONFIG.RADIUS_KM);
            params.set('decimalLatitude', box.minLat + ',' + box.maxLat);
            params.set('decimalLongitude', box.minLng + ',' + box.maxLng);
        }

        return CONFIG.API_BASE + '?' + params.toString();
    }

    /**
     * Hämta data från GBIF API (eller cache)
     */
    async function fetchData(forceRefresh) {
        // Kolla cache först
        if (!forceRefresh) {
            const cached = _loadCache();
            if (cached) {
                _sightings = cached.data;
                _lastFetch = new Date(cached.timestamp);
                _processData();
                return { success: true, fromCache: true };
            }
        }

        _isLoading = true;
        _error = null;
        _render();

        try {
            const url = _buildUrl();
            console.log('[Sightings] Fetching GBIF:', url);
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('GBIF API svarade med status ' + response.status);
            }

            const json = await response.json();
            _sightings = (json.results || []).map(function (occ) {
                return {
                    key: occ.key,
                    scientificName: occ.scientificName || occ.species || '',
                    species: occ.species || '',
                    eventDate: occ.eventDate || '',
                    region: _normalizeRegion(occ.stateProvince),
                    locality: occ.locality || '',
                    lat: occ.decimalLatitude,
                    lng: occ.decimalLongitude,
                    individualCount: occ.individualCount || 1,
                    recordedBy: occ.recordedBy || '',
                    datasetName: occ.datasetName || '',
                    matchedBird: _matchBird(occ),
                };
            });

            _lastFetch = new Date();
            _saveCache();
            _processData();
            _isLoading = false;
            _render();
            return { success: true, fromCache: false, count: _sightings.length };

        } catch (err) {
            console.error('[Sightings] Fetch error:', err);
            _error = err.message || 'Kunde inte hämta data';
            _isLoading = false;

            // Försök med gammal cache som fallback
            const oldCache = _loadCache(true);
            if (oldCache) {
                _sightings = oldCache.data;
                _lastFetch = new Date(oldCache.timestamp);
                _processData();
            }
            _render();
            return { success: false, error: _error };
        }
    }

    // --- Databearbetning ---

    function _processData() {
        // Gruppera per art (scientific name)
        const groups = {};
        _sightings.forEach(function (s) {
            const key = s.species || s.scientificName;
            if (!key) return;
            if (!groups[key]) {
                groups[key] = {
                    species: key,
                    scientificName: s.scientificName,
                    matchedBird: s.matchedBird,
                    observations: [],
                    regions: new Set(),
                    totalCount: 0,
                    latestDate: s.eventDate,
                };
            }
            groups[key].observations.push(s);
            groups[key].totalCount += s.individualCount || 1;
            if (s.region && s.region !== 'Okänt') groups[key].regions.add(s.region);
            if (s.eventDate > groups[key].latestDate) {
                groups[key].latestDate = s.eventDate;
            }
        });

        _grouped = Object.values(groups).sort(function (a, b) {
            // Matchade arter (finns i birds.js) först, sedan efter datum
            if (a.matchedBird && !b.matchedBird) return -1;
            if (!a.matchedBird && b.matchedBird) return 1;
            return b.latestDate.localeCompare(a.latestDate);
        });
    }

    // --- Cache ---

    function _saveCache() {
        try {
            const payload = {
                timestamp: Date.now(),
                data: _sightings,
            };
            localStorage.setItem(CONFIG.CACHE_KEY, JSON.stringify(payload));
        } catch (e) {
            console.warn('[Sightings] Cache save failed:', e);
        }
    }

    function _loadCache(ignoreExpiry) {
        try {
            const raw = localStorage.getItem(CONFIG.CACHE_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (!ignoreExpiry && (Date.now() - parsed.timestamp > CONFIG.CACHE_TTL)) {
                return null; // Cache utgått
            }
            // Återskapa matchedBird-referenserna
            parsed.data.forEach(function (s) {
                s.matchedBird = _matchBird(s);
            });
            return parsed;
        } catch (e) {
            return null;
        }
    }

    // --- Filtrering ---

    function _getFiltered() {
        var result = _grouped;

        if (_activeRegion) {
            result = result.filter(function (g) {
                return g.regions.has(_activeRegion);
            });
        }

        if (_searchTerm) {
            var term = _searchTerm.toLowerCase();
            result = result.filter(function (g) {
                var svName = g.matchedBird ? g.matchedBird.nameSv.toLowerCase() : '';
                var enName = g.matchedBird ? g.matchedBird.nameEn.toLowerCase() : '';
                var sciName = g.scientificName.toLowerCase();
                return svName.includes(term) || enName.includes(term) || sciName.includes(term);
            });
        }

        return result.slice(0, CONFIG.MAX_DISPLAY);
    }

    // --- Rendering ---

    function _render() {
        var container = document.getElementById('recent-sightings-container');
        var listEl = document.getElementById('recent-sightings-list');
        var loadingEl = document.getElementById('recent-sightings-loading');
        var errorEl = document.getElementById('recent-sightings-error');
        var emptyEl = document.getElementById('recent-sightings-empty');
        var countEl = document.getElementById('recent-sightings-count');
        var updatedEl = document.getElementById('recent-sightings-updated');

        if (!container) return;

        // Loading
        if (loadingEl) loadingEl.style.display = _isLoading ? 'flex' : 'none';
        if (errorEl) {
            errorEl.style.display = _error ? 'flex' : 'none';
            if (_error) {
                errorEl.querySelector('.rs-error-text').textContent = _error;
            }
        }

        if (_isLoading) {
            if (listEl) listEl.innerHTML = '';
            return;
        }

        // Uppdatera header-info
        if (countEl) {
            countEl.textContent = _grouped.length + ' arter';
        }
        if (updatedEl && _lastFetch) {
            var mins = Math.round((Date.now() - _lastFetch.getTime()) / 60000);
            if (mins < 1) {
                updatedEl.textContent = 'Just nu';
            } else if (mins < 60) {
                updatedEl.textContent = mins + ' min sedan';
            } else {
                updatedEl.textContent = _lastFetch.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
            }
        }

        // Filtrera och rendera
        var filtered = _getFiltered();

        if (emptyEl) {
            emptyEl.style.display = (!_error && filtered.length === 0 && !_isLoading) ? 'flex' : 'none';
        }

        if (!listEl) return;
        listEl.innerHTML = '';

        filtered.forEach(function (group, i) {
            var card = _createCard(group, i);
            listEl.appendChild(card);
        });
    }

    function _createCard(group, index) {
        var card = document.createElement('div');
        card.className = 'rs-card';
        card.style.animationDelay = Math.min(index * 30, 300) + 'ms';

        var bird = group.matchedBird;
        var isMatched = !!bird;

        // Bild
        var imgHTML;
        if (isMatched) {
            var imgSrc = typeof getBirdImageSrc === 'function'
                ? getBirdImageSrc(bird.id)
                : 'images/' + bird.id + '.jpg';
            imgHTML = '<img class="rs-card-img" src="' + imgSrc + '" alt="' + bird.nameSv + '" loading="lazy" onerror="handleImageError(this)" data-bird-id="' + bird.id + '">';
        } else {
            imgHTML = '<div class="rs-card-placeholder"><i class="fa-solid fa-dove"></i></div>';
        }

        // Namn
        var nameHTML;
        if (isMatched) {
            nameHTML = '<div class="rs-card-name">' + bird.nameSv + '</div>' +
                '<div class="rs-card-sci">' + bird.scientific + '</div>';
        } else {
            nameHTML = '<div class="rs-card-name rs-card-name-sci">' + _formatSciName(group.scientificName) + '</div>' +
                '<div class="rs-card-sci">Ej i databasen</div>';
        }

        // Datum
        var dateStr = _formatDate(group.latestDate);

        // Regioner
        var regionArr = Array.from(group.regions);
        var regionText = regionArr.length > 2
            ? regionArr.slice(0, 2).join(', ') + ' +' + (regionArr.length - 2)
            : regionArr.join(', ') || 'Okänd plats';

        // Antal observationer
        var obsCountBadge = group.observations.length > 1
            ? '<span class="rs-card-obs-badge">' + group.observations.length + ' obs</span>'
            : '';

        // Rarity badge (om matchad)
        var rarityBadge = '';
        if (isMatched && bird.rarity >= 4) {
            var rarityLabels = ['', '', '', 'Sällsynt', 'Mycket sällsynt'];
            var rarityClasses = ['', '', '', 'rs-rarity-rare', 'rs-rarity-very-rare'];
            rarityBadge = '<span class="rs-card-rarity ' + rarityClasses[bird.rarity - 1] + '">' +
                '<i class="fa-solid fa-star"></i> ' + rarityLabels[bird.rarity - 1] + '</span>';
        }

        card.innerHTML =
            imgHTML +
            '<div class="rs-card-body">' +
            nameHTML +
            '<div class="rs-card-meta">' +
            '<span class="rs-card-date"><i class="fa-regular fa-calendar"></i> ' + dateStr + '</span>' +
            '<span class="rs-card-region"><i class="fa-solid fa-location-dot"></i> ' + regionText + '</span>' +
            '</div>' +
            '<div class="rs-card-footer">' +
            obsCountBadge +
            rarityBadge +
            (isMatched ? '<span class="rs-card-matched"><i class="fa-solid fa-check-circle"></i> I Fågelboken</span>' : '') +
            '</div>' +
            '</div>';

        // Klick öppnar detaljmodal om matchad
        if (isMatched) {
            card.classList.add('rs-card-matched-border');
            card.style.cursor = 'pointer';
            card.addEventListener('click', function () {
                if (typeof openBirdDetail === 'function') {
                    openBirdDetail(bird);
                }
            });
        }

        return card;
    }

    // --- Hjälpfunktioner ---

    function _formatSciName(name) {
        if (!name) return 'Okänd';
        // Behåll bara genus + species, kursivera
        var parts = name.split(/\s+/);
        return '<i>' + parts.slice(0, 2).join(' ') + '</i>';
    }

    function _formatDate(dateStr) {
        if (!dateStr) return 'Okänt datum';
        try {
            var d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr.split('T')[0];

            var now = new Date();
            var diff = now.getTime() - d.getTime();
            var days = Math.floor(diff / (24 * 60 * 60 * 1000));

            if (days === 0) return 'Idag';
            if (days === 1) return 'Igår';
            if (days < 7) return days + ' dagar sedan';

            return d.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
        } catch (e) {
            return dateStr.split('T')[0];
        }
    }

    // --- Regionfilter-rendering ---

    function _renderRegionFilters() {
        var filtersEl = document.getElementById('recent-sightings-filters');
        if (!filtersEl) return;

        filtersEl.innerHTML = '';

        // "Alla" knapp
        var allBtn = document.createElement('button');
        allBtn.className = 'rs-filter-btn' + (!_activeRegion ? ' active' : '');
        allBtn.textContent = 'Alla';
        allBtn.addEventListener('click', function () {
            _activeRegion = null;
            _renderRegionFilters();
            _render();
        });
        filtersEl.appendChild(allBtn);

        // Unika regioner som finns i datan
        var availableRegions = new Set();
        _sightings.forEach(function (s) {
            if (s.region && s.region !== 'Okänt') availableRegions.add(s.region);
        });

        // Sortera och skapa knappar
        Array.from(availableRegions).sort().forEach(function (region) {
            var btn = document.createElement('button');
            btn.className = 'rs-filter-btn' + (_activeRegion === region ? ' active' : '');
            btn.textContent = region;
            btn.addEventListener('click', function () {
                _activeRegion = (_activeRegion === region) ? null : region;
                _renderRegionFilters();
                _render();
            });
            filtersEl.appendChild(btn);
        });
    }

    // --- Sökfälthantering ---

    function _setupSearch() {
        var searchInput = document.getElementById('recent-sightings-search');
        if (!searchInput) return;

        searchInput.addEventListener('input', function () {
            _searchTerm = searchInput.value.trim();
            _render();
        });
    }

    // --- Init (kallas när tabben visas) ---

    var _initialized = false;

    async function init() {
        if (_initialized && _sightings.length > 0) {
            // Redan initialiserad, bara rendera om
            _render();
            _renderRegionFilters();
            _updateNearbyBtn();
            return;
        }

        _setupSearch();
        _renderRegionFilters();
        _updateNearbyBtn();

        var result = await fetchData(false);
        _renderRegionFilters(); // Uppdatera efter data laddats

        _initialized = true;
        console.log('[Sightings] Init complete:', result);
    }

    async function refresh() {
        var result = await fetchData(true);
        _renderRegionFilters();
        return result;
    }

    /**
     * Växla "Nära mig" (5 mil radie) läge.
     * Hämtar GPS-position vid aktivering, sedan hämtar ny data.
     */
    async function toggleNearby() {
        if (_nearbyMode) {
            // Stäng av nära-mig
            _nearbyMode = false;
            _updateNearbyBtn();
            _updateSubtitle();
            // Rensa cache och hämta hela Sverige
            localStorage.removeItem(CONFIG.CACHE_KEY);
            await fetchData(true);
            _renderRegionFilters();
            return;
        }

        // Aktivera nära-mig: hämta position först
        _updateNearbyBtn('loading');
        var pos = await _getPosition();

        if (!pos) {
            _updateNearbyBtn();
            // Visa felmeddelande
            var errorEl = document.getElementById('recent-sightings-error');
            if (errorEl) {
                errorEl.style.display = 'flex';
                var errText = errorEl.querySelector('.rs-error-text');
                if (errText) errText.textContent = _locationError || 'Kunde inte hämta position';
            }
            return;
        }

        _nearbyMode = true;
        _updateNearbyBtn();
        _updateSubtitle();
        // Rensa cache och hämta med koordinater
        localStorage.removeItem(CONFIG.CACHE_KEY);
        await fetchData(true);
        _renderRegionFilters();
    }

    /**
     * Uppdatera "Nära mig"-knappens utseende
     */
    function _updateNearbyBtn(state) {
        var btn = document.getElementById('rs-nearby-btn');
        if (!btn) return;

        if (state === 'loading') {
            btn.classList.add('loading');
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Söker position...';
            return;
        }

        btn.classList.remove('loading');
        if (_nearbyMode) {
            btn.classList.add('active');
            btn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i> Nära mig · 5 mil';
        } else {
            btn.classList.remove('active');
            btn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i> Nära mig';
        }
    }

    /**
     * Uppdatera hero-subtitle beroende på läge
     */
    function _updateSubtitle() {
        var el = document.querySelector('.rs-hero-subtitle');
        if (!el) return;
        if (_nearbyMode) {
            el.textContent = 'Visar fynd inom 5 mil från din position';
        } else {
            el.textContent = 'Observationer rapporterade de senaste veckorna via GBIF';
        }
    }

    // --- Public API ---
    return {
        init: init,
        refresh: refresh,
        fetchData: fetchData,
        toggleNearby: toggleNearby,
        get isLoading() { return _isLoading; },
        get error() { return _error; },
        get sightings() { return _sightings; },
        get grouped() { return _grouped; },
        get lastFetch() { return _lastFetch; },
        get nearbyMode() { return _nearbyMode; },
        REGIONS: REGIONS,
    };
})();
