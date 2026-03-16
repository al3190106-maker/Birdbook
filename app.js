// --- Configuration & State ---
// --- Configuration & State ---
const state = {
    sightings: [],
    yearFilter: new Date().getFullYear(),
    view: 'log-view',
    activeCategory: null,
    guideSearchTerm: '',
    guideSortBy: 'name',
    quizMode: null,
    quizDifficulty: null,
    quizQuestions: [],
    quizCurrent: 0,
    quizScore: 0,
    quizAnswered: false,
    timeFilter: 'all',
    currentSubject: 'birds' // Replaces appMode
};

const appStateMeta = {
    isInitialized: false,
    lastRank: null,
    lastBadges: new Set()
};

const STORAGE_KEY = 'birdfinder_sightings';

const SUBJECT_CONFIG = {
    birds: {
        id: 'birds',
        name: 'Fågelboken',
        icon: 'fa-dove',
        dataVar: 'swedishBirds',
        themeClass: 'mode-birds',
        texts: {
            itemLabel: 'Fågelart',
            searchPlaceholder: 'Sök fågel...',
            locationPlaceholder: 'Var såg du fågeln?',
            quizTitle: 'Fågelquiz',
            quizSubtitle: 'Testa dina fågelkunskaper!',
            quizGuessItem: 'Gissa Fågeln',
            quizGuessItemDesc: 'Vilken fågel är detta?',
            quizGuessStats: 'Gissa Fakta',
            quizGuessStatsDesc: 'Vad vet du om fågeln?',
            detailBestTimeLabel: '',
            emptyLog: 'Inga fåglar sedda än under',
            addFirst: 'Logga din första fågel',
            guideTab: 'Fågelguide',
            quizTab: 'Fågelquiz'
        },
        fields: {
            size: { key: 'wingspan', label: 'Vingspann', unit: 'cm' },
            weight: { key: 'weight', label: 'Vikt', unit: 'g', hidden: false },
            lifespan: { key: 'eggs', label: 'Ägg per kull', unit: 'st', hidden: false }
        }
    },
    trees: {
        id: 'trees',
        name: 'Trädboken',
        icon: 'fa-tree',
        dataVar: 'swedishTrees',
        themeClass: 'mode-trees',
        texts: {
            itemLabel: 'Trädart',
            searchPlaceholder: 'Sök träd...',
            locationPlaceholder: 'Var såg du trädet?',
            quizTitle: 'Trädquiz',
            quizSubtitle: 'Testa dina trädkunskaper!',
            quizGuessItem: 'Gissa Trädet',
            quizGuessItemDesc: 'Vilket träd är detta?',
            quizGuessStats: 'Gissa Trädfakta',
            quizGuessStatsDesc: 'Vad vet du om trädet?',
            detailBestTimeLabel: 'Växtplats',
            emptyLog: 'Inga träd sedda än under',
            addFirst: 'Logga ditt första träd',
            guideTab: 'Trädguide',
            quizTab: 'Trädquiz'
        },
        fields: {
            size: { key: 'height', label: 'Höjd', unit: 'm' },
            weight: { key: 'age', label: 'Ålder', unit: 'år', hidden: false },
            lifespan: { key: 'type', label: 'Typ', unit: '', hidden: true }
        }
    },
    fish: {
        id: 'fish',
        name: 'Fiskboken',
        icon: 'fa-fish',
        dataVar: 'swedishFish',
        themeClass: 'mode-fish',
        texts: {
            itemLabel: 'Fiskart',
            searchPlaceholder: 'Sök fisk...',
            locationPlaceholder: 'Var såg du fisken?',
            quizTitle: 'Fiskquiz',
            quizSubtitle: 'Testa dina fiskkunskaper!',
            quizGuessItem: 'Gissa Fisken',
            quizGuessItemDesc: 'Vilken fisk är detta?',
            quizGuessStats: 'Gissa Fakta',
            quizGuessStatsDesc: 'Vad vet du om fisken?',
            detailBestTimeLabel: 'Vatten',
            emptyLog: 'Inga fiskar sedda än under',
            addFirst: 'Logga din första fisk',
            guideTab: 'Fiskguide',
            quizTab: 'Fiskquiz'
        },
        fields: {
            size: { key: 'length', label: 'Längd', unit: 'cm' },
            weight: { key: 'weight', label: 'Vikt', unit: 'kg', hidden: false },
            lifespan: { key: 'lifespan', label: 'Livslängd', unit: 'år', hidden: false }
        }
    },
    animals: {
        id: 'animals',
        name: 'Däggdjursboken',
        icon: 'fa-paw',
        dataVar: 'swedishAnimals',
        themeClass: 'mode-animals',
        texts: {
            itemLabel: 'Djurart',
            searchPlaceholder: 'Sök djur...',
            locationPlaceholder: 'Var såg du djuret?',
            quizTitle: 'Djurquiz',
            quizSubtitle: 'Testa dina djurkunskaper!',
            quizGuessItem: 'Gissa Djuret',
            quizGuessItemDesc: 'Vilket djur är detta?',
            quizGuessStats: 'Gissa Fakta',
            quizGuessStatsDesc: 'Vad vet du om djuret?',
            detailBestTimeLabel: 'Aktivitet',
            emptyLog: 'Inga djur sedda än under',
            addFirst: 'Logga ditt första djur',
            guideTab: 'Djurguide',
            quizTab: 'Djurquiz'
        },
        fields: {
            size: { key: 'height', label: 'Mankhöjd', unit: 'cm' },
            weight: { key: 'weight', label: 'Vikt', unit: 'kg', hidden: false },
            lifespan: { key: 'lifespan', label: 'Livslängd', unit: 'år', hidden: false }
        }
    },
    fungi: {
        id: 'fungi',
        name: 'Svampboken',
        icon: 'fa-circle',
        dataVar: 'swedishFungi',
        themeClass: 'mode-fungi',
        texts: {
            itemLabel: 'Svampart',
            searchPlaceholder: 'Sök svamp...',
            locationPlaceholder: 'Var såg du svampen?',
            quizTitle: 'Svampquiz',
            quizSubtitle: 'Testa dina svampkunskaper!',
            quizGuessItem: 'Gissa Svampen',
            quizGuessItemDesc: 'Vilken svamp är detta?',
            quizGuessStats: 'Gissa Fakta',
            quizGuessStatsDesc: 'Vad vet du om svampen?',
            detailBestTimeLabel: 'Säsong',
            emptyLog: 'Inga svampar sedda än under',
            addFirst: 'Logga din första svamp',
            guideTab: 'Svampguide',
            quizTab: 'Svampquiz'
        },
        fields: {
            size: { key: 'size', label: 'Hattbredd', unit: 'cm' },
            weight: { key: 'edibility', label: 'Ätlighet', unit: '', hidden: false },
            lifespan: { key: 'type', label: 'Typ', unit: '', hidden: true }
        }
    },
    flowers: {
        id: 'flowers',
        name: 'Blomboken',
        icon: 'fa-seedling',
        dataVar: 'swedishFlowers',
        themeClass: 'mode-flowers',
        texts: {
            itemLabel: 'Blomstart',
            searchPlaceholder: 'Sök blomma...',
            locationPlaceholder: 'Var såg du blomman?',
            quizTitle: 'Blomquiz',
            quizSubtitle: 'Testa dina blomsterkunskaper!',
            quizGuessItem: 'Gissa Blomman',
            quizGuessItemDesc: 'Vilken blomma är detta?',
            quizGuessStats: 'Gissa Faktum',
            quizGuessStatsDesc: 'Vad vet du om blomman?',
            detailBestTimeLabel: 'Blomningstid',
            emptyLog: 'Inga blommor sedda än under',
            addFirst: 'Logga din första blomma',
            guideTab: 'Blomguide',
            quizTab: 'Blomquiz'
        },
        fields: {
            size: { key: 'height', label: 'Höjd', unit: 'cm' },
            weight: { key: 'color', label: 'Färg', unit: '', hidden: false },
            lifespan: { key: 'type', label: 'Typ', unit: '', hidden: true }
        }
    }
};

const CATEGORY_THEMES = {
    // Birds
    'Andfåglar': { bg: ['#0e4a6e', '#1a7ab5'], accent: '#5ec6e8', icon: '🦆' },
    'Hönsfåglar': { bg: ['#5c3d1e', '#8b6914'], accent: '#d4a843', icon: '🐔' },
    'Lommar & Doppingar': { bg: ['#0d3b4f', '#1a6b7a'], accent: '#4ec9d4', icon: '🌊' },
    'Hägrar': { bg: ['#2d4a3e', '#3d7a5e'], accent: '#7acfa0', icon: '🪿' },
    'Rovfåglar': { bg: ['#5a2d0c', '#8b4513'], accent: '#e8a03e', icon: '🦅' },
    'Tranor & Rallar': { bg: ['#3a4a2e', '#5a7a3e'], accent: '#9acd5e', icon: '🦩' },
    'Vadare': { bg: ['#4a3a2e', '#7a6a4e'], accent: '#c4b48e', icon: '🦤' },
    'Måsar & Tärnor': { bg: ['#3a5a7a', '#5a8aaa'], accent: '#b0d8f0', icon: '🕊️' },
    'Alkfåglar': { bg: ['#1a2a3a', '#2a4a5a'], accent: '#6aafcf', icon: '🐧' },
    'Hackspettar': { bg: ['#3a1a1a', '#6a2a2a'], accent: '#e05050', icon: '🪶' },
    'Ugglor': { bg: ['#2a1a3a', '#4a2a5a'], accent: '#b080d0', icon: '🦉' },
    'Duvor': { bg: ['#4a4a5a', '#6a6a7a'], accent: '#b0b0d0', icon: '🕊️' },
    'Sångare': { bg: ['#1a4a2a', '#2a7a3a'], accent: '#6ad06a', icon: '🎵' },
    'Trastar': { bg: ['#3a2a1a', '#6a4a2a'], accent: '#c08a4a', icon: '🐦' },
    'Mesar': { bg: ['#1a3a4a', '#2a6a7a'], accent: '#5ac0e0', icon: '🐤' },
    'Finkar': { bg: ['#4a2a1a', '#7a4a2a'], accent: '#e0904a', icon: '🎶' },
    'Sparvar': { bg: ['#4a3a1a', '#7a6a2a'], accent: '#d0c04a', icon: '🐦' },
    'Kråkfåglar': { bg: ['#1a1a2a', '#2a2a3a'], accent: '#7070a0', icon: '🐦‍⬛' },
    'Svalor': { bg: ['#2a4a6a', '#3a6a8a'], accent: '#70b0e0', icon: '💨' },
    'Övriga': { bg: ['#2a3a2a', '#4a6a4a'], accent: '#80c080', icon: '🐦' },
    // Tree Themes
    'Lövträd': { bg: ['#385a3c', '#5e8c61'], accent: '#a7c1a8', icon: '🍃' },
    'Barrträd': { bg: ['#1e3a34', '#2d5a4e'], accent: '#85c5b5', icon: '🌲' },
    'Ädla lövträd': { bg: ['#5a4a27', '#8c7a4d'], accent: '#d4c185', icon: '🌳' },
    'Buskar': { bg: ['#4a5a27', '#7a8c4d'], accent: '#c1d485', icon: '🌿' },
    // Fish Themes
    'Rovfisk': { bg: ['#2c3e50', '#4a6b8c'], accent: '#95afc0', icon: '🐟' },
    'Abborrfiskar': { bg: ['#3d4a27', '#5a6d34'], accent: '#a3b37a', icon: '🐠' },
    'Sillfiskar': { bg: ['#2d4a5a', '#4a6d8c'], accent: '#a5c1e1', icon: '🐟' },
    'Torskfiskar': { bg: ['#3a3a2a', '#5a5a4a'], accent: '#a1a185', icon: '🐟' },
    'Laxfiskar': { bg: ['#4a3a3a', '#7a5a5a'], accent: '#c1a5a5', icon: '🎣' },
    'Karpfiskar': { bg: ['#5a4a1a', '#8c7a2d'], accent: '#d1c5a5', icon: '🐟' },
    'Platfiskar': { bg: ['#5a5a4a', '#8a8a7a'], accent: '#c1c1b5', icon: '🐟' },
    'Ålfiskar': { bg: ['#1a2a3a', '#2a4a5a'], accent: '#6aafcf', icon: '🐍' },
    'Makrillfiskar': { bg: ['#1a3a4a', '#2a5a6d'], accent: '#85b5c5', icon: '🐟' },
    'Fisk': { bg: ['#1a4a6d', '#2a6d85'], accent: '#85b5d5', icon: '🐟' },
    'Djur': { bg: ['#795548', '#8d6e63'], accent: '#d7ccc8', icon: '🐾' },
    // Fungi Themes
    'Kantareller': { bg: ['#6d5a1a', '#9c8c2d'], accent: '#f1e1a5', icon: '🍄' },
    'Soppar': { bg: ['#4a3728', '#6d5d44'], accent: '#c5b585', icon: '🍄' },
    'Flugsvampar': { bg: ['#6d1a1a', '#9c2d2d'], accent: '#f1a5a5', icon: '🍄' },
    'Riska': { bg: ['#6d3a1a', '#9c5a2d'], accent: '#f1b5a5', icon: '🍄' },
    'Tickor': { bg: ['#3a2a1a', '#5a4a3a'], accent: '#a59585', icon: '🍄' },
    'Röksvampar': { bg: ['#5a5a5a', '#7a7a7a'], accent: '#c1c1c1', icon: '🍄' },
    'Murkla': { bg: ['#4a3a2a', '#6d5a4a'], accent: '#b5a595', icon: '🍄' },
    'Svamp': { bg: ['#5a2d1a', '#8c4a2d'], accent: '#d1a585', icon: '🍄' },
    // Flower Themes
    'Vårblommor': { bg: ['#2d4a5a', '#4a6d8c'], accent: '#a5c1e1', icon: '🌸' },
    'Ängsblommor': { bg: ['#6d5a1a', '#8c7a2d'], accent: '#d1c585', icon: '🌼' },
    'Skogsblommor': { bg: ['#1e3a1e', '#2d5a2d'], accent: '#85c585', icon: '🌿' },
    'Orkidéer': { bg: ['#441a44', '#6d2a6d'], accent: '#c585c5', icon: '🌺' },
    'Vattenblommor': { bg: ['#0d3b4f', '#1a6b7a'], accent: '#4ec9d4', icon: '🌊' },
    'Hedblommor': { bg: ['#4a2d44', '#6d3d5a'], accent: '#b585a3', icon: '🫐' }
};

// --- DOM Elements ---
const elements = {
    totalSightings: document.getElementById('total-sightings'),
    uniqueSpecies: document.getElementById('unique-species'),
    addSightingBtn: document.getElementById('add-sighting-btn'),
    modal: document.getElementById('sighting-modal'),
    closeModal: document.getElementById('close-modal'),
    form: document.getElementById('sighting-form'),
    yearSelect: document.getElementById('year-select'),
    yearFilterContainer: document.querySelector('.year-filter-container'),
    currentYearDisplay: document.getElementById('current-year-display'),
    sightingsList: document.getElementById('sightings-list'),
    guideList: document.getElementById('guide-list'),
    birdSearchInput: document.getElementById('bird-search-input'),
    autocompleteList: document.getElementById('autocomplete-list'),
    selectedBirdId: document.getElementById('selected-bird-id'),
    navBtns: document.querySelectorAll('.nav-btn'),
    viewSections: document.querySelectorAll('.view-section'),
    guideSearch: document.getElementById('guide-search'),
    customImageInput: document.getElementById('custom-image-upload'),
    resetBtn: document.getElementById('reset-app-btn'),
    settingsBtn: document.getElementById('settings-btn'),
    settingsModal: document.getElementById('settings-modal'),
    exportDataBtn: document.getElementById('export-data-btn'),
    importDataBtn: document.getElementById('import-data-btn'),
    importDataInput: document.getElementById('import-data-input'),
    imagePreviewContainer: document.getElementById('image-preview-container'),
    sightingPhoto: document.getElementById('sighting-photo'),
    // Guide Elements
    guideCategories: document.getElementById('guide-categories'),
    guideNavigation: document.getElementById('guide-navigation'),
    backToCategoriesBtn: document.getElementById('back-to-categories'),
    currentCategoryTitle: document.getElementById('current-category-title'),
    // Detail Modal Elements
    detailModal: document.getElementById('bird-detail-modal-overlay'),
    closeDetailModal: document.getElementById('close-detail-modal'),
    carouselSlides: document.getElementById('carousel-slides'),
    carouselDots: document.getElementById('carousel-dots'),
    carouselCounter: document.getElementById('carousel-counter'),
    carouselPrev: document.getElementById('carousel-prev'),
    carouselNext: document.getElementById('carousel-next'),
    detailNameSv: document.getElementById('detail-name-sv'),
    detailNameScEn: document.getElementById('detail-name-sc-en'),
    detailRarity: document.getElementById('detail-rarity'),

    detailWeight: document.getElementById('detail-weight'),
    detailSeasonText: document.getElementById('detail-season-text'),
    detailBestTime: document.getElementById('detail-best-time'),

    detailWingspan: document.getElementById('detail-wingspan'),
    detailEggs: document.getElementById('detail-eggs'),
    detailArtportalenLink: document.getElementById('detail-artportalen-link'),

    // Fullscreen Modal Elements
    fsModal: document.getElementById('fullscreen-image-modal'),
    fsImg: document.getElementById('fullscreen-img-element'),
    fsPrev: document.getElementById('fullscreen-prev'),
    fsNext: document.getElementById('fullscreen-next'),
    fsCounter: document.getElementById('fullscreen-counter'),

    sortSelect: document.getElementById('sort-select'),
    guideSortSelect: document.getElementById('guide-sort-select'),
    timeFilterContainer: document.getElementById('time-filter-container'),
    timeFilterBtns: document.querySelectorAll('.time-filter-btn'),
    logoHome: document.getElementById('app-logo-home')
};

let editingBirdId = null;

// --- History State Handler ---
window.addEventListener('popstate', (event) => {
    // 1. Close all modals visually first
    elements.modal.classList.remove('active');
    elements.detailModal.classList.remove('active');
    const fsModal = document.getElementById('fullscreen-image-modal');
    if (fsModal) fsModal.classList.remove('active');

    // 2. Restore state
    if (event.state) {
        if (event.state.modal === 'detail' && event.state.birdId) {
            const list = getCurrentSpeciesList();
            const bird = list.find(b => b.id === event.state.birdId);
            if (bird) {
                _renderBirdDetail(bird);
                elements.detailModal.classList.add('active');
            }
        } else if (event.state.modal === 'sighting') {
            // If we have prefill data in state, use it
            if (event.state.birdId) {
                const list = getCurrentSpeciesList();
                const bird = list.find(b => b.id === event.state.birdId);
                if (bird) {
                    elements.selectedBirdId.value = bird.id;
                    elements.birdSearchInput.value = bird.nameSv;
                }
            }
            elements.modal.classList.add('active');
        }
    }
});

let _sightingMap = null;
let _sightingMarker = null;

// Toggle visibility of sighting sections
window.toggleSightingSection = function(section) {
    const sections = ['map', 'date', 'notes'];
    let openedElement = null;

    sections.forEach(s => {
        const el = document.getElementById('sighting-section-' + s);
        const btn = document.getElementById('btn-toggle-' + s);
        if (!el || !btn) return;

        if (s === section) {
            el.classList.toggle('hidden');
            btn.classList.toggle('active');
            
            if (!el.classList.contains('hidden')) {
                openedElement = el;
                // If map is shown, trigger a resize for Leaflet
                if (s === 'map' && typeof _sightingMap !== 'undefined' && _sightingMap) {
                    setTimeout(() => _sightingMap.invalidateSize(), 150);
                }
            }
        } else {
            el.classList.add('hidden');
            btn.classList.remove('active');
        }
    });

    if (openedElement) {
        // Wait for rendering to complete before scrolling
        setTimeout(() => {
            openedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 50);
    }
};

function _showSightingModal(prefillBirdId = null, prefillBirdName = null) {
    elements.form.reset();
    const sightingDateEl = document.getElementById('sighting-date');
    const today = new Date();
    sightingDateEl.valueAsDate = today;
    sightingDateEl.max = today.toISOString().split('T')[0];
    elements.imagePreviewContainer.innerHTML = '';

    // Reset hidden sections
    ['map', 'date', 'notes'].forEach(s => {
        const el = document.getElementById('sighting-section-' + s);
        const btn = document.getElementById('btn-toggle-' + s);
        if (el) el.classList.add('hidden');
        if (btn) btn.classList.remove('active');
    });

    // Clear lat/lng
    document.getElementById('sighting-lat').value = '';
    document.getElementById('sighting-lng').value = '';

    if (prefillBirdId) {
        elements.selectedBirdId.value = prefillBirdId;
        elements.birdSearchInput.value = prefillBirdName || '';
    } else {
        elements.selectedBirdId.value = '';
    }

    elements.modal.classList.add('active');

    // Initialize or reset Leaflet map
    setTimeout(() => {
        _initSightingMap();
    }, 150);
}

function _initSightingMap() {
    const mapContainer = document.getElementById('sighting-map');
    if (!mapContainer) return;

    // Destroy previous map instance
    if (_sightingMap) {
        _sightingMap.remove();
        _sightingMap = null;
        _sightingMarker = null;
    }

    // Center on Sweden
    _sightingMap = L.map('sighting-map', {
        zoomControl: true,
        attributionControl: false
    }).setView([62.0, 15.5], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18
    }).addTo(_sightingMap);

    // Click to place pin
    _sightingMap.on('click', (e) => {
        _placeSightingPin(e.latlng.lat, e.latlng.lng);
    });

    // GPS button
    const gpsBtn = document.getElementById('sighting-map-gps-btn');
    if (gpsBtn) {
        // Remove old listeners by cloning
        const newGpsBtn = gpsBtn.cloneNode(true);
        gpsBtn.replaceWith(newGpsBtn);
        newGpsBtn.addEventListener('click', () => {
            if (!navigator.geolocation) {
                alert('Geolokalisering stöds inte av din webbläsare.');
                return;
            }
            newGpsBtn.classList.add('locating');
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    newGpsBtn.classList.remove('locating');
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    _sightingMap.setView([lat, lng], 13);
                    _placeSightingPin(lat, lng);
                },
                (err) => {
                    newGpsBtn.classList.remove('locating');
                    console.warn('Kunde inte hämta din position. Kontrollera att du tillåter platsåtkomst.');
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        });
        
        // Automatically trigger GPS click on start
        setTimeout(() => newGpsBtn.click(), 100);
    }
}

function _placeSightingPin(lat, lng) {
    if (!_sightingMap) return;

    // Store coordinates
    document.getElementById('sighting-lat').value = lat;
    document.getElementById('sighting-lng').value = lng;

    // Place or move marker
    if (_sightingMarker) {
        _sightingMarker.setLatLng([lat, lng]);
    } else {
        _sightingMarker = L.marker([lat, lng], { draggable: true }).addTo(_sightingMap);
        _sightingMarker.on('dragend', (e) => {
            const pos = e.target.getLatLng();
            document.getElementById('sighting-lat').value = pos.lat;
            document.getElementById('sighting-lng').value = pos.lng;
            _reverseGeocode(pos.lat, pos.lng);
        });
    }

    // Reverse geocode to fill location text
    _reverseGeocode(lat, lng);
}

function _reverseGeocode(lat, lng) {
    const locationInput = document.getElementById('sighting-location');
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`, {
        headers: { 'Accept-Language': 'sv' }
    })
    .then(r => r.json())
    .then(data => {
        if (data && data.address) {
            const a = data.address;
            const parts = [a.village || a.town || a.city || a.municipality, a.county || a.state].filter(Boolean);
            locationInput.value = parts.join(', ') || data.display_name || '';
        }
    })
    .catch(() => { /* silently fail, user can still type manually */ });
}

// --- Carousel State ---
let carouselIndex = 0;
let carouselImages = [];

function _buildCarousel(images) {
    carouselImages = images;
    carouselIndex = 0;
    const slides = elements.carouselSlides;
    const dots = elements.carouselDots;
    slides.innerHTML = '';
    dots.innerHTML = '';

    images.forEach((item, i) => {
        const src = typeof item === 'object' ? item.src : item;
        const photographerId = typeof item === 'object' ? item.photographer : null;
        let photographer = photographerId && window.photographers ? window.photographers[photographerId] : null;

        if (typeof item === 'object' && item.photographerName) {
            photographer = { name: item.photographerName };
        }

        const slide = document.createElement('div');
        slide.className = 'carousel-slide' + (i === 0 ? ' active' : '');
        const img = document.createElement('img');
        img.src = src;
        img.alt = 'Bild ' + (i + 1);
        img.className = 'carousel-img';
        img.onerror = function () {
            this.src = `images/${currentCarouselBirdId}.jpg`;
            this.onerror = null;
        };
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', () => {
            _openFullscreenSlide(i);
        });
        slide.appendChild(img);

        if (photographer) {
            const tag = document.createElement('div');
            tag.className = 'photographer-tag';
            tag.innerHTML = '<i class="fa-solid fa-camera"></i> ' + photographer.name;
            if (photographerId) {
                tag.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent fullscreen
                    
                    const returnBirdId = currentCarouselBirdId;
                    const returnSubject = state.currentSubject;
                    
                    elements.detailModal.classList.remove('active');
                    
                    _showPhotographer(photographerId, () => {
                        if (state.currentSubject !== returnSubject) switchSubject(returnSubject);
                        const btn = document.querySelector('.nav-btn[data-tab="guide-view"]');
                        if (btn) btn.click();
                        
                        const allData = [
                            ...(window.swedishBirds || []), ...(window.swedishTrees || []),
                            ...(window.swedishFish || []), ...(window.swedishAnimals || []),
                            ...(window.swedishFungi || []), ...(window.swedishFlowers || [])
                        ];
                        const subject = allData.find(d => d.id === returnBirdId);
                        if (subject) {
                            _renderBirdDetail(subject);
                            elements.detailModal.classList.add('active');
                        }
                    });
                });
            } else {
                // Just display the tag, ignore clicks for un-registered photographers
                tag.addEventListener('click', (e) => e.stopPropagation());
            }
            slide.appendChild(tag);
        }

        slides.appendChild(slide);

        // Dots disabled in favor of text counter
    });

    // Show/hide nav buttons
    const showNav = images.length > 1;
    elements.carouselPrev.style.display = showNav ? '' : 'none';
    elements.carouselNext.style.display = showNav ? '' : 'none';
    elements.carouselDots.style.display = 'none';
    _updateCarouselCounter();
}

let currentCarouselBirdId = '';

function _applyFullscreenItem(index) {
    const item = carouselImages[index];
    const src = typeof item === 'object' ? item.src : item;
    const photographerId = typeof item === 'object' ? item.photographer : null;
    let photographer = photographerId && window.photographers ? window.photographers[photographerId] : null;
    
    if (typeof item === 'object' && item.photographerName) {
        photographer = { name: item.photographerName };
    }
    
    elements.fsImg.src = src;
    
    let existingTag = elements.fsModal.querySelector('.photographer-tag');
    if (existingTag) existingTag.remove();
    
    if (photographer) {
        const tag = document.createElement('div');
        tag.className = 'photographer-tag';
        tag.innerHTML = '<i class="fa-solid fa-camera"></i> ' + photographer.name;
        tag.style.bottom = '40px'; 
        if (photographerId) {
            tag.addEventListener('click', (e) => {
                e.stopPropagation();
                elements.fsModal.classList.remove('active');
                elements.detailModal.classList.remove('active');
                
                const returnBirdId = currentCarouselBirdId;
                const returnSubject = state.currentSubject;
                
                _showPhotographer(photographerId, () => {
                    if (state.currentSubject !== returnSubject) switchSubject(returnSubject);
                    const btn = document.querySelector('.nav-btn[data-tab="guide-view"]');
                    if (btn) btn.click();
                    
                    const allData = [
                        ...(window.swedishBirds || []), ...(window.swedishTrees || []),
                        ...(window.swedishFish || []), ...(window.swedishAnimals || []),
                        ...(window.swedishFungi || []), ...(window.swedishFlowers || [])
                    ];
                    const subject = allData.find(d => d.id === returnBirdId);
                    if (subject) {
                        _renderBirdDetail(subject);
                        elements.detailModal.classList.add('active');
                    }
                });
            });
        } else {
            tag.addEventListener('click', (e) => e.stopPropagation());
        }
        elements.fsModal.appendChild(tag);
    }
}

function _goToSlide(index) {
    const allSlides = elements.carouselSlides.querySelectorAll('.carousel-slide');
    const allDots = elements.carouselDots.querySelectorAll('.carousel-dot');
    if (allSlides.length === 0) return;

    // Clamp index
    index = (index + allSlides.length) % allSlides.length;
    carouselIndex = index;

    allSlides.forEach((s, i) => s.classList.toggle('active', i === index));
    allDots.forEach((d, i) => d.classList.toggle('active', i === index));
    _updateCarouselCounter();

    if (elements.fsImg && elements.fsModal && elements.fsModal.classList.contains('active')) {
        _applyFullscreenItem(carouselIndex);
        _updateFullscreenNav();
    }
}

function _updateCarouselCounter() {
    const total = carouselImages.length;
    if (elements.carouselCounter) {
        elements.carouselCounter.textContent = total > 1 ? `${carouselIndex + 1} / ${total}` : '';
    }
}

function _openFullscreenSlide(index) {
    if (!elements.fsModal || !elements.fsImg) return;
    _goToSlide(index);
    _applyFullscreenItem(carouselIndex);
    elements.fsModal.classList.add('active');
    history.pushState({ modal: 'fullscreen' }, '');
    _updateFullscreenNav();
}

function _updateFullscreenNav() {
    const total = carouselImages.length;
    if (elements.fsPrev && elements.fsNext) {
        const showNav = total > 1;
        elements.fsPrev.style.display = showNav ? '' : 'none';
        elements.fsNext.style.display = showNav ? '' : 'none';
    }
    if (elements.fsCounter) {
        elements.fsCounter.textContent = total > 1 ? `${carouselIndex + 1} / ${total}` : '';
        elements.fsCounter.style.display = total > 1 ? '' : 'none';
    }
}

function _renderBirdDetail(item, sighting = null) {
    const config = SUBJECT_CONFIG[state.currentSubject];
    const fields = config.fields;

    // Build image carousel
    currentCarouselBirdId = item.id;
    const galleryImages = (window.birdImages && window.birdImages[item.id]) || [];
    const fallbackSrc = item.image || getBirdImageSrc(item.id);
    let imagesToShow = galleryImages.length > 0 ? [...galleryImages] : [];
    
    if (imagesToShow.length === 0) {
        if (item.photographer) {
            imagesToShow.push({ src: fallbackSrc, photographerName: item.photographer });
        } else {
            imagesToShow.push(fallbackSrc);
        }
    }

    // If user has a custom image, prepend it as the primary image
    const userCustomImg = localStorage.getItem(`custom_img_${item.id}`);
    if (userCustomImg) {
        imagesToShow = [userCustomImg, ...imagesToShow];
    }

    _buildCarousel(imagesToShow);

    elements.detailNameSv.textContent = item.nameSv;
    elements.detailNameScEn.textContent = `${item.scientific} (${item.nameEn})`;
    const rarityLevels = ['Allmän', 'Vanlig', 'Ovanlig', 'Sällsynt', 'Mycket sällsynt'];
    const rarityColors = ['#ffffff', '#16a34a', '#2563eb', '#9333ea', '#ea580c']; 
    const rIndex = (item.rarity || 1) - 1;
    elements.detailRarity.textContent = rarityLevels[rIndex] || 'Allmän';
    elements.detailRarity.style.color = rarityColors[rIndex] || '#ffffff';
    elements.detailRarity.style.backgroundColor = rIndex === 0 ? '#94a3b8' : 'transparent';
    elements.detailRarity.style.padding = rIndex === 0 ? '0.1rem 0.4rem' : '0';
    elements.detailRarity.style.borderRadius = rIndex === 0 ? '6px' : '0';
    elements.detailRarity.style.display = 'inline-block';
    elements.detailRarity.style.textShadow = 'none';
    elements.detailRarity.style.border = 'none';
    
    // 0. Description / Fun Fact
    const descEl = document.getElementById('detail-description');
    if (descEl) {
        descEl.textContent = item.funFact || '';
        descEl.style.display = item.funFact ? 'block' : 'none';
    }


    // 1. Weight / Second Field
    if (fields.weight.hidden) {
        elements.detailWeight.parentElement.style.display = 'none';
    } else {
        elements.detailWeight.parentElement.style.display = 'block';
        // Check if item has the specific key, e.g. item.weight
        const val = item[fields.weight.key];
        elements.detailWeight.textContent = val ? `${val} ${fields.weight.unit}` : '--';
        // Update label (if needed to be dynamic per item, but usually per subject)
        const label = elements.detailWeight.parentElement.querySelector('.fact-title');
        if (label) label.innerHTML = `<i class="fa-solid fa-weight-hanging"></i> ${fields.weight.label}`;
        const subLabel = elements.detailWeight.parentElement.querySelector('.stat-label');
        if (subLabel) subLabel.textContent = 'Genomsnitt';
    }

    elements.detailSeasonText.textContent = item.seasonDistribution || 'Hela landet';
    elements.detailBestTime.textContent = item.bestTime || 'Dag/Natt';

    // 2. Size / First Field (Wingspan/Height/Length)
    const labelSize = elements.detailWingspan.parentElement.querySelector('.fact-title');
    if (labelSize) labelSize.innerHTML = `<i class="fa-solid fa-ruler-horizontal"></i> ${fields.size.label}`;

    const subLabelSize = elements.detailWingspan.parentElement.querySelector('.stat-label');
    if (subLabelSize) subLabelSize.textContent = '';

    const valSize = item[fields.size.key];
    elements.detailWingspan.textContent = valSize ? `${valSize} ${fields.size.unit}` : '--';

    // 3. Lifespan / Eggs / Third Field
    if (fields.lifespan.hidden) {
        elements.detailEggs.parentElement.style.display = 'none';
    } else {
        elements.detailEggs.parentElement.style.display = 'block';
        const valLife = item[fields.lifespan.key];
        elements.detailEggs.textContent = valLife || '--';

        const labelLife = elements.detailEggs.parentElement.querySelector('.fact-title');
        // Icon logic might need to be generic or mapped. Defaulting to egg icon for now, 
        // but maybe should update icon based on config if I had that in fields.
        if (labelLife) labelLife.innerHTML = `<i class="fa-solid fa-egg"></i> ${fields.lifespan.label}`;

        const subLabelLife = elements.detailEggs.parentElement.querySelector('.stat-label');
        if (subLabelLife) subLabelLife.textContent = '';
    }


    // Setup Actions
    if (elements.detailArtportalenLink) {
        elements.detailArtportalenLink.href = `https://www.artportalen.se/search/sightings/site/days/30/taxon/${encodeURIComponent(item.nameSv)}`;
    }

    // Delete sighting button — only show when opened from log
    const existingDeleteBtn = document.getElementById('detail-delete-btn');
    if (existingDeleteBtn) existingDeleteBtn.remove();

    // Quick Add button — only show when opened from guide (no sighting passed)
    const detailQuickAddBtn = document.getElementById('detail-quick-add-btn');

    if (sighting) {
        if (detailQuickAddBtn) detailQuickAddBtn.style.display = 'none';

        const deleteBtn = document.createElement('button');
        deleteBtn.id = 'detail-delete-btn';
        deleteBtn.className = 'detail-delete-btn';
        deleteBtn.innerHTML = `<i class="fa-solid fa-trash"></i> Ta bort observation`;
        deleteBtn.addEventListener('click', () => {
            elements.detailModal.classList.remove('active');
            deleteSighting(sighting.id);
        });
        const actionsDiv = document.querySelector('.detail-actions');
        if (actionsDiv) actionsDiv.appendChild(deleteBtn);
    } else {
        if (detailQuickAddBtn) {
            detailQuickAddBtn.style.display = 'inline-flex';

            // Clean up old event listeners to prevent duplicate clicks
            const newDetailQuickAddBtn = detailQuickAddBtn.cloneNode(true);
            detailQuickAddBtn.replaceWith(newDetailQuickAddBtn);

            newDetailQuickAddBtn.addEventListener('click', (e) => {
                e.preventDefault();
                quickAddSighting(item.id);

                // Visual feedback
                const originalHTML = newDetailQuickAddBtn.innerHTML;
                newDetailQuickAddBtn.innerHTML = '<i class="fa-solid fa-check"></i> Tillagd';
                newDetailQuickAddBtn.style.backgroundColor = '#2ecc71';

                setTimeout(() => {
                    newDetailQuickAddBtn.innerHTML = originalHTML;
                    newDetailQuickAddBtn.style.backgroundColor = '';
                }, 1500);
            });
        }
    }

    // Add Camera/Photo button in detail modal for both views
    const existingCameraBtn = document.getElementById('detail-camera-btn');
    if (existingCameraBtn) existingCameraBtn.remove();

    const cameraBtn = document.createElement('button');
    cameraBtn.id = 'detail-camera-btn';
    cameraBtn.className = 'add-sighting-detail-btn';
    cameraBtn.style.cssText = 'padding: 0.8rem 1.5rem; font-size: 1rem;';
    cameraBtn.innerHTML = `<i class="fa-solid fa-camera"></i> Lägg till egen bild`;
    cameraBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Use a special handler that also refreshes the detail view
        editingBirdId = item.id;
        const tempInput = document.createElement('input');
        tempInput.type = 'file';
        tempInput.accept = 'image/*';
        tempInput.capture = 'environment';
        tempInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    try {
                        localStorage.setItem(`custom_img_${item.id}`, ev.target.result);
                        // Refresh the detail modal carousel with new image
                        _renderBirdDetail(item, sighting);
                        // Also refresh the log/guide behind
                        renderApp();
                        if (!elements.guideList.classList.contains('hidden')) {
                            const list = getCurrentSpeciesList();
                            renderGuideList(list);
                        }
                        // Visual feedback
                        cameraBtn.innerHTML = '<i class="fa-solid fa-check"></i> Bild sparad!';
                        cameraBtn.style.backgroundColor = '#2ecc71';
                        setTimeout(() => {
                            cameraBtn.innerHTML = `<i class="fa-solid fa-camera"></i> Lägg till egen bild`;
                            cameraBtn.style.backgroundColor = '';
                        }, 2000);
                    } catch (err) {
                        alert('Bilden är för stor!');
                    }
                };
                reader.readAsDataURL(this.files[0]);
            }
        });
        tempInput.click();
    });
    const actionsDiv2 = document.querySelector('.detail-actions');
    if (actionsDiv2) actionsDiv2.appendChild(cameraBtn);
}
function getCurrentSpeciesList() {
    const config = SUBJECT_CONFIG[state.currentSubject];
    return window[config.dataVar] || [];
}

function switchSubject(subjectId) {
    if (!SUBJECT_CONFIG[subjectId]) return;
    state.currentSubject = subjectId;
    const config = SUBJECT_CONFIG[subjectId];

    // 1. Update Body Theme
    document.body.className = ''; // Reset
    document.body.classList.add(config.themeClass);

    // 2. Update Header Title & Icon
    const titleText = document.getElementById('app-title-text');
    const titleIcon = document.getElementById('app-logo-icon');
    if (titleText) titleText.textContent = config.name;
    if (titleIcon) titleIcon.className = `fa-solid ${config.icon}`;

    // 3. Update Placeholders & Text
    const place = (id, p) => { const el = document.getElementById(id); if (el) el.placeholder = p; };
    const set = (id, t) => { const el = document.getElementById(id); if (el) el.textContent = t; };

    place('guide-search', config.texts.searchPlaceholder);
    place('bird-search-input', config.texts.searchPlaceholder); // Re-use search placeholder or create specific if needed
    place('sighting-location', config.texts.locationPlaceholder);

    // Label for Add Sighting Bird/Tree Input
    const l1 = document.querySelector('label[for="bird-search-input"]');
    if (l1) l1.textContent = config.texts.itemLabel;

    // Quiz Texts
    const qTitle = document.getElementById('quiz-main-title');
    if (qTitle) qTitle.innerHTML = `<i class="fa-solid ${config.icon}"></i> ${config.texts.quizTitle}`;
    set('quiz-subtitle', config.texts.quizSubtitle);

    document.querySelectorAll('[data-mode="image"] h3').forEach(e => e.textContent = config.texts.quizGuessItem);
    document.querySelectorAll('[data-mode="image"] p').forEach(e => e.textContent = config.texts.quizGuessItemDesc);
    document.querySelectorAll('[data-mode="stats"] h3').forEach(e => e.textContent = config.texts.quizGuessStats);
    document.querySelectorAll('[data-mode="stats"] p').forEach(e => e.textContent = config.texts.quizGuessStatsDesc);

    // Detail Labels
    const bestTimeLabel = document.querySelector('#detail-best-time + .stat-label');
    if (bestTimeLabel) bestTimeLabel.textContent = config.texts.detailBestTimeLabel;

    // 3b. Update Nav Tabs & Interface Labels
    const guideTabBtn = document.querySelector('.nav-btn[data-tab="guide-view"]');
    const quizTabBtn = document.querySelector('.nav-btn[data-tab="quiz-view"]');
    if (guideTabBtn) guideTabBtn.textContent = config.texts.guideTab;
    if (quizTabBtn) quizTabBtn.textContent = config.texts.quizTab;

    const subjectPrefix = config.name.replace('boken', '');
    
    // Update Quiz Difficulty Cards
    const diffCards = document.querySelectorAll('.difficulty-card h3');
    if (diffCards.length >= 4) {
        // Nybörjaren remains unchanged
        diffCards[1].textContent = subjectPrefix + 'intresserad';
        diffCards[2].textContent = subjectPrefix + 'skådare';
        diffCards[3].textContent = subjectPrefix + 'orakel';
    }

    // Update Stats Panel Title
    const statsTitle = document.querySelector('#stats-birds-panel .stats-panel-title');
    if (statsTitle) statsTitle.innerHTML = `<i class="fa-solid ${config.icon}"></i> ${subjectPrefix}statistik`;

    // 4. Update Sort Options
    const sortSelect = document.getElementById('guide-sort-select');
    if (sortSelect) {
        // Enable all first
        Array.from(sortSelect.options).forEach(o => { o.disabled = false; o.style.display = ''; });

        // Disable irrelevant ones based on config fields
        // We know 'name' and 'rarity' and 'bestTime' are generic.
        // We check fields: size, weight, lifespan(eggs)
        const fields = config.fields;

        const setOpt = (val, text, show) => {
            const o = sortSelect.querySelector(`option[value="${val}"]`);
            if (o) {
                if (show) {
                    o.textContent = text;
                    o.disabled = false;
                    o.style.display = '';
                } else {
                    o.disabled = true;
                    o.style.display = 'none';
                }
            }
        };

        setOpt('wingspan', fields.size.label, true);
        setOpt('weight', fields.weight.label, !fields.weight.hidden);
        setOpt('eggs', fields.lifespan.label, !fields.lifespan.hidden);

        // Reset sort if selected is disabled
        if (sortSelect.selectedOptions[0].disabled) {
            sortSelect.value = 'name';
            sortSelect.dispatchEvent(new Event('change'));
        }
    }

    // 5. Reset Filters & Render
    state.activeCategory = null;
    state.guideSearchTerm = '';

    // Check if we need to close the library menu (if we implement it as a modal)
    const libraryModal = document.getElementById('library-modal');
    if (libraryModal) libraryModal.classList.remove('active');

    setupYearFilter();
    renderApp();
    renderGuideCategories();

    if (state.view === 'quiz-view') {
        showQuizMenu();
    }
}


// --- Initialization ---
async function init() {
    console.log('App Initializing...');

    // --- Password Protection ---
    const isAuthenticated = localStorage.getItem('birdfinder_auth_token') === 'valid';
    const hasSeenWelcome = localStorage.getItem('birdfinder_welcome_shown') === 'true';
    const passwordModal = document.getElementById('password-modal');
    const passwordForm = document.getElementById('password-form');
    const passwordInput = document.getElementById('password-input');
    const passwordError = document.getElementById('password-error');
    const welcomeModal = document.getElementById('welcome-modal');

    if (!isAuthenticated) {
        // Show modal
        passwordModal.classList.add('active');

        // Handle Submit
        passwordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = passwordInput.value.trim();
            if (input === 'apa') {
                // Correct
                localStorage.setItem('birdfinder_auth_token', 'valid');
                passwordModal.classList.remove('active');

                // Show Welcome screen if never seen
                if (!hasSeenWelcome && welcomeModal) {
                    welcomeModal.classList.add('active');
                    localStorage.setItem('birdfinder_welcome_shown', 'true');
                }
            } else {
                // Incorrect
                passwordError.style.display = 'block';
                passwordInput.value = '';
                passwordInput.focus();
            }
        });
    } else {
        // Already authenticated
        if (passwordModal) passwordModal.classList.remove('active');

        // Show Welcome screen if they haven't seen it yet
        if (!hasSeenWelcome && welcomeModal) {
            welcomeModal.classList.add('active');
            localStorage.setItem('birdfinder_welcome_shown', 'true');
        }
    }

    // Check for data dependency
    if (!window.swedishBirds || !window.swedishTrees) {
        console.error('Data not loaded!');
        alert('Fel: Datafil saknas. Vänligen ladda om sidan.');
        return;
    }

    // Initialize Firebase (Removed)

    // Load Data (local first, then merge with cloud)
    await loadSightings();

    const initStats = computeStats();
    appStateMeta.lastRank = initStats.activeRank ? initStats.activeRank.title : null;
    initStats.badges.filter(b => b.earned).forEach(b => appStateMeta.lastBadges.add(b.name));
    appStateMeta.isInitialized = true;

    // Setup Year Filter
    setupYearFilter();

    // Initial Render
    try {
        renderApp();
        renderGuideCategories();
    } catch (e) {
        console.error('Render failed:', e);
        alert('Ett fel uppstod vid start. Se konsolen.');
    }

    // Event Listeners
    setupEventListeners();

    // Subject Switching / Library
    const appTitle = document.getElementById('app-title');
    if (appTitle) {
        appTitle.style.cursor = 'pointer';
        appTitle.addEventListener('click', () => {
            document.getElementById('library-modal').classList.add('active');
        });
    }

    // Default to birds if not set (or load from storage if we persisted subject? 
    // For now default is fine, or arguably we should persist it. 
    // Let's stick to default birds for simplicity unless changed).
    // Ensure UI matches state after everything is set up
    switchSubject(state.currentSubject); 

    // --- Cloud Real-Time Listener (Removed) ---

    // --- PWA Install Logic ---
    let deferredPrompt;
    const installBtn = document.getElementById('install-btn');
    const installBtnLogin = document.getElementById('install-btn-login');

    // Initial check: Hide if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    
    // Detect iOS
    const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase()) || 
                  (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);

    if (isStandalone) {
        if (installBtn) installBtn.style.display = 'none';
        if (installBtnLogin) installBtnLogin.style.display = 'none';
    } else if (isIos) {
        // iOS doesn't support beforeinstallprompt, so we always show the button
        if (installBtn) installBtn.style.display = 'inline-block';
        if (installBtnLogin) installBtnLogin.style.display = 'inline-flex';
    }

    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        // Stash the event so it can be triggered later.
        deferredPrompt = e;

        // Show promotion only if not already installed
        if (!isStandalone) {
            if (installBtn) installBtn.style.display = 'block';
            if (installBtnLogin) installBtnLogin.style.display = 'block';
        }

        console.log('User can install app');
    });

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            if (isIos) {
               const iosModal = document.getElementById('ios-install-modal');
               if (iosModal) iosModal.classList.add('active');
            } else {
               alert('Appen kan inte installeras automatiskt just nu. Försök att lägga till den på hemskärmen via din webbläsares meny.');
            }
            return;
        }
        // Hide the promotion
        if (installBtn) installBtn.style.display = 'none';
        if (installBtnLogin) installBtnLogin.style.display = 'none';

        // Show the install prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        // We've used the prompt, and can't use it again, throw it away
        deferredPrompt = null;
    };

    if (installBtn) installBtn.addEventListener('click', handleInstallClick);
    if (installBtnLogin) installBtnLogin.addEventListener('click', handleInstallClick);

    window.addEventListener('appinstalled', () => {
        if (installBtn) installBtn.style.display = 'none';
        if (installBtnLogin) installBtnLogin.style.display = 'none';
        deferredPrompt = null;
        console.log('PWA was installed');
    });

    // --- PERSISTENCE FIX (Ghost Bird) ---
    // This logic ensures the app "wakes up" and saves data correctly on first load
    // by adding and then "hiding" a system initialization record.
    setTimeout(() => {
        if (state.sightings.length === 0) {
            // Only necessary if empty or potentially frozen
            console.log('Running Persistence Check...');
        }

        const ghostId = 'SYSTEM_INIT_BIRD';

        // 1. Clean any old ghost
        state.sightings = state.sightings.filter(s => s.id !== ghostId);

        // 2. Create new ghost
        const ghost = {
            id: ghostId,
            birdId: window.swedishBirds[0].id,
            date: new Date().toISOString().split('T')[0],
            location: 'System Init',
            notes: 'Hidden Initialization Bird',
            photo: null
        };

        // 3. Add and Save (Forces render and storage write)
        state.sightings.push(ghost);
        saveSightings();

        // Note: We do NOT remove it immediately. We leave it in storage
        // but filter it out of the UI. This proved to be the stable fix.
        console.log('Persistence Check Complete.');

    }, 500);
}

// --- Data Management ---
async function loadSightings() {
    // 1. Load from localStorage (instant, always available)
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            state.sightings = JSON.parse(stored);
        }
        console.log('📂 Loaded', state.sightings.length, 'sightings from LocalStorage');
    } catch (e) {
        console.error('Data corruption detected', e);
        localStorage.removeItem(STORAGE_KEY);
        state.sightings = [];
    }
}

function showAchievementToast(icon, title, desc) {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'achievement-toast';
    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-desc">${desc}</div>
        </div>
    `;
    container.appendChild(toast);
    
    // Add fly-in class wait a tiny bit for DOM
    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400); // Wait for transition
    }, 5000); // Display time
}

function checkAchievements() {
    if (!appStateMeta.isInitialized) return;
    const stats = computeStats();
    
    const newRank = stats.activeRank;
    if (newRank && newRank.title !== appStateMeta.lastRank) {
        showAchievementToast(newRank.icon, `Ny rang upplåst: ${newRank.title}!`, newRank.subtitle);
        appStateMeta.lastRank = newRank.title;
        localStorage.setItem(`birdfinder_unseen_rank_${newRank.title}`, 'true');
    }

    stats.badges.forEach(b => {
        if (b.earned && !appStateMeta.lastBadges.has(b.name)) {
            appStateMeta.lastBadges.add(b.name);
            showAchievementToast(b.icon, `Ny utmärkelse: ${b.name}!`, b.desc);
            localStorage.setItem(`birdfinder_unseen_badge_${b.name}`, 'true');
        } else if (!b.earned && appStateMeta.lastBadges.has(b.name)) {
            appStateMeta.lastBadges.delete(b.name);
        }
    });
}

function saveSightings() {
    // 1. Always save to localStorage (instant)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.sightings));

    checkAchievements();
    renderApp();
}

// --- Logic Helpers ---

function getBirdImageSrc(birdId) {
    // 1. Check LocalStorage for custom override
    const custom = localStorage.getItem(`custom_img_${birdId}`);
    if (custom) return custom;
    
    // Check if it's fungi
    const fungiItem = (window.swedishFungi || []).find(f => f.id === birdId);
    if (fungiItem && fungiItem.image) return fungiItem.image;

    // 2. Default
    return `images/${birdId}.jpg`;
}

function handleImageError(img) {
    const birdId = img.dataset.birdId;
    if (!birdId) return;
    const svg = generateHolderSvg(birdId);
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    img.onerror = null;
    img.classList.add('placeholder-active');
}

function triggerImageUpload(birdId) {
    editingBirdId = birdId;
    elements.customImageInput.click();
}

function getFilteredSightings() {
    const currentList = getCurrentSpeciesList();
    return state.sightings.filter(s => {
        if (s.id === 'SYSTEM_INIT_BIRD') return false;

        // Filter by Current Mode (Bird vs Tree)
        const belongsToMode = currentList.some(item => item.id === s.birdId);
        if (!belongsToMode) return false;

        if (state.yearFilter !== 'all') {
            const y = new Date(s.date).getFullYear();
            if (y !== state.yearFilter) return false;
        }
        return true;
    });
}

function openBirdDetail(item, sighting = null) {
    _renderBirdDetail(item, sighting);
    elements.detailModal.classList.add('active');
    history.pushState({ modal: 'detail', birdId: item.id }, '');
}

function quickAddSighting(birdId) {
    const list = getCurrentSpeciesList();
    const bird = list.find(b => b.id === birdId);
    if (!bird) return;

    const newSighting = {
        id: Date.now().toString(),
        birdId: bird.id,
        date: new Date().toISOString().split('T')[0],
        location: 'Snabbtillägg',
        notes: '',
        photo: null
    };

    state.sightings.push(newSighting);

    // Auto-switch year
    const sYear = new Date().getFullYear();
    if (state.yearFilter !== 'all' && state.yearFilter !== sYear) {
        state.yearFilter = sYear;
    }

    saveSightings();
    setupYearFilter();
    alert(`+1 observation av ${bird.nameSv} tillagd!`);
}

function deleteSighting(id) {
    if (!confirm('Vill du ta bort denna observation?')) return;
    state.sightings = state.sightings.filter(s => s.id !== id);
    saveSightings();
    setupYearFilter();
}

// --- Rendering ---
function renderApp() {
    // 1. Apply Filters
    const filteredSightings = getFilteredSightings();

    // 2. Update Stats (Exclude Ghost)
    const validSightings = filteredSightings.filter(s => s.id !== 'SYSTEM_INIT_BIRD');

    if (elements.totalSightings) elements.totalSightings.textContent = validSightings.length;
    const uniqueBirds = new Set(validSightings.map(s => s.birdId));
    elements.uniqueSpecies.textContent = uniqueBirds.size;

    // 3. Update Text
    if (state.yearFilter === 'all') {
        elements.currentYearDisplay.textContent = 'Alla observationer';
    } else {
        elements.currentYearDisplay.textContent = `Observationer under ${state.yearFilter}`;
    }

    // 4. Render Grid
    renderSightingsList(validSightings);
}

function renderSightingsList(sightings) {
    elements.sightingsList.innerHTML = '';
    const config = SUBJECT_CONFIG[state.currentSubject];

    if (sightings.length === 0) {
        const emptyText = config.texts.emptyLog
            + ` <span class="highlight">${state.yearFilter === 'all' ? 'totalen' : state.yearFilter}</span>.`;

        elements.sightingsList.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid ${config.icon}"></i>
                <p>${emptyText}</p>
                <button onclick="elements.addSightingBtn.click()" style="margin-top:1rem; padding:0.5rem 1rem; cursor:pointer;">${config.texts.addFirst}</button>
            </div>
        `;
        return;
    }

    // Sort by Date Descending by default for grouping
    sightings.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Grouping Logic (group by Species)
    const birdGroups = {};
    sightings.forEach(s => {
        if (!birdGroups[s.birdId]) {
            birdGroups[s.birdId] = {
                latestSighting: s,
                count: 0,
                allSightings: []
            };
        }
        birdGroups[s.birdId].count++;
        birdGroups[s.birdId].allSightings.push(s);
    });

    // Convert to array and sort
    let groups = Object.values(birdGroups);

    // Sorting Logic
    groups.sort((a, b) => {
        const list = getCurrentSpeciesList();
        const itemA = list.find(x => x.id === a.latestSighting.birdId);
        const itemB = list.find(x => x.id === b.latestSighting.birdId);

        if (!itemA || !itemB) return 0;

        const getVal = (item, sortKey) => {
            if (sortKey === 'wingspan') return item[config.fields.size.key] || 0;
            if (sortKey === 'weight') return item[config.fields.weight.key] || 0;
            if (sortKey === 'eggs') return item[config.fields.lifespan.key] || 0;
            if (sortKey === 'rarity') return item.rarity || 0;
            return 0; // name/date handled separately
        };

        switch (state.sortBy) {
            case 'name':
                return itemA.nameSv.localeCompare(itemB.nameSv);
            case 'wingspan':
                return getVal(itemB, 'wingspan') - getVal(itemA, 'wingspan');
            case 'eggs':
                return getVal(itemB, 'eggs') - getVal(itemA, 'eggs');
            case 'weight':
                return getVal(itemB, 'weight') - getVal(itemA, 'weight');
            case 'rarity':
                return getVal(itemB, 'rarity') - getVal(itemA, 'rarity');
            case 'date':
            default:
                return new Date(b.latestSighting.date) - new Date(a.latestSighting.date);
        }
    });

    groups.forEach(group => {
        const sighting = group.latestSighting;
        const list = getCurrentSpeciesList();
        const item = list.find(b => b.id === sighting.birdId);

        if (!item) return;

        const card = document.createElement('div');
        card.className = 'bird-card';

        // Custom image takes priority
        const customImg = localStorage.getItem(`custom_img_${item.id}`);
        const imgSource = customImg || sighting.photo || getBirdImageSrc(item.id);

        card.innerHTML = `
            <div class="bird-image-container">
                <img src="${imgSource}" alt="${item.nameEn}" data-bird-id="${item.id}" loading="lazy" onerror="handleImageError(this)">
                <button class="edit-image-btn" id="log-edit-btn-${item.id}" title="Lägg till egen bild">
                    <i class="fa-solid fa-camera"></i>
                </button>
                <button class="delete-sighting-btn" id="delete-btn-${sighting.id}" title="Ta bort observation">
                    <i class="fa-solid fa-trash"></i>
                </button>
                ${group.count > 1 ? `<div class="sighting-count-badge">+${group.count - 1} till</div>` : ''}
                <div class="bird-image-name">${item.nameSv}</div>
            </div>
            <div class="bird-info">
                <div class="bird-primary-name">${item.nameSv}</div>
                <div class="bird-secondary-name">${item.nameEn}</div>
                <div class="bird-scientific">${item.scientific}</div>
                <div class="bird-description">
                    ${sighting.date} i ${sighting.location || 'Okänd plats'}
                    ${sighting.notes ? `<br><i>"${sighting.notes}"</i>` : ''}
                </div>
            </div>
        `;

        // Bind delete button
        const deleteBtn = card.querySelector(`#delete-btn-${sighting.id}`);
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteSighting(sighting.id);
            });
        }

        // Bind camera/edit image button
        const logEditBtn = card.querySelector(`#log-edit-btn-${item.id}`);
        if (logEditBtn) {
            logEditBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                triggerImageUpload(item.id);
            });
        }

        card.addEventListener('click', (e) => {
            if (e.target.closest('button')) return;
            openBirdDetail(item, sighting);
        });
        card.style.cursor = 'pointer';
        elements.sightingsList.appendChild(card);
    });
}

function renderGuideList(birdList) {
    if (!birdList) return;

    const config = SUBJECT_CONFIG[state.currentSubject];

    // Sort before rendering
    birdList.sort((a, b) => {
        const getVal = (item, sortKey) => {
            if (sortKey === 'wingspan') return item[config.fields.size.key] || 0;
            if (sortKey === 'weight') return item[config.fields.weight.key] || 0;
            if (sortKey === 'eggs') return item[config.fields.lifespan.key] || 0;
            if (sortKey === 'rarity') return item.rarity || 0;
            return 0;
        };

        switch (state.guideSortBy) {
            case 'name': return a.nameSv.localeCompare(b.nameSv);
            case 'wingspan': return getVal(b, 'wingspan') - getVal(a, 'wingspan');
            case 'weight': return getVal(b, 'weight') - getVal(a, 'weight');
            case 'eggs': return getVal(b, 'eggs') - getVal(a, 'eggs');
            case 'rarity': return getVal(b, 'rarity') - getVal(a, 'rarity');
            case 'bestTime':
                // Group by time roughly: Morgon < Dag < Kväll < Natt
                const timeOrder = { 'Morgon': 1, 'Gryning': 1, 'Gryning/Skymning': 3, 'Dag': 2, 'Hela dagen': 2, 'Kväll': 3, 'Skymning': 3, 'Natt': 4 };
                const tA = timeOrder[a.bestTime] || 5;
                const tB = timeOrder[b.bestTime] || 5;
                if (tA !== tB) return tA - tB;
                return a.nameSv.localeCompare(b.nameSv);
            default: return 0;
        }
    });

    elements.guideList.innerHTML = '';

    const rarityLevels = ['Allmän', 'Vanlig', 'Ovanlig', 'Sällsynt', 'Mycket sällsynt'];
    const rarityColors = ['#ffffff', '#16a34a', '#2563eb', '#9333ea', '#ea580c'];

    birdList.forEach(bird => {
        const card = document.createElement('div');
        card.className = 'bird-card';
        // Make the whole card clickable for details
        card.style.cursor = 'pointer';

        const obj = (window.swedishFungi || []).find(f => f.id === bird.id);
        const imgSource = (obj && obj.image) || getBirdImageSrc(bird.id);

        card.innerHTML = `
            <div class="bird-image-container">
                <img src="${imgSource}" alt="${bird.nameEn}" data-bird-id="${bird.id}" loading="lazy" onerror="handleImageError(this)">
                <button class="edit-image-btn" id="edit-btn-${bird.id}" title="Ändra bild">
                    <i class="fa-solid fa-camera"></i>
                </button>
                <button class="quick-add-btn" id="quick-add-${bird.id}" title="Lägg till observation">
                    <i class="fa-solid fa-plus"></i>
                </button>
                <div class="bird-image-name">${bird.nameSv}</div>
            </div>
            <div class="bird-info">
                 <div class="bird-primary-name">${bird.nameSv}</div>
                <div class="bird-secondary-name">${bird.nameEn}</div>
                <div class="bird-scientific">${bird.scientific}</div>
                ${bird.funFact ? `<div class="bird-description">${bird.funFact}</div>` : ''}
                <div class="bird-card-rarity" style="color: ${rarityColors[(bird.rarity || 1) - 1]}; ${(bird.rarity || 1) === 1 ? 'background: #94a3b8; padding: 0.1rem 0.4rem; border-radius: 6px; display: inline-flex; width: max-content;' : ''}">
                    <i class="fa-solid fa-star"></i> ${rarityLevels[(bird.rarity || 1) - 1]}
                </div>
            </div>
        `;

        // Add Click Listener to Card
        card.addEventListener('click', (e) => {
            // Avoid triggering when clicking the edit or quick-add buttons
            if (e.target.closest('.edit-image-btn') || e.target.closest('.quick-add-btn')) {
                return;
            }
            openBirdDetail(bird);
        });

        // Bind Edit Button
        const editBtn = card.querySelector(`#edit-btn-${bird.id}`);
        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                triggerImageUpload(bird.id);
            });
        }

        // Bind Quick Add Button
        const quickAddBtn = card.querySelector(`#quick-add-${bird.id}`);
        if (quickAddBtn) {
            quickAddBtn.addEventListener('click', (e) => {
                e.stopPropagation();

                quickAddSighting(bird.id);

                // Visual feedback
                const originalIcon = quickAddBtn.innerHTML;
                quickAddBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
                quickAddBtn.style.backgroundColor = '#2ecc71';

                setTimeout(() => {
                    quickAddBtn.innerHTML = originalIcon;
                    quickAddBtn.style.backgroundColor = '';
                }, 1500);
            });
        }

        elements.guideList.appendChild(card);
    });
}

function renderGuideCategories() {
    const config = SUBJECT_CONFIG[state.currentSubject];
    const list = getCurrentSpeciesList();

    // 1. Group birds by type
    const categories = {};
    list.forEach(item => {
        const type = item.type || 'Övriga';
        if (!categories[type]) {
            categories[type] = {
                name: type,
                count: 0,
                // Assign icon based on type name
                icon: getCategoryIcon(type),
            };
        }
        categories[type].count++;
    });

    // 2. Clear & Render
    elements.guideCategories.innerHTML = '';
    const sortedCategories = Object.values(categories).sort((a, b) => a.name.localeCompare(b.name));

    // "All" Category
    const allName = 'Alla ' + config.texts.itemLabel + 'er'; // Crude pluralization or use config
    // Actually, config.texts.itemLabel is "Fågelart", "Trädart". Plural: "Fågelarter"?
    // Let's us a generic "Alla Arter" or just "Alla".
    const allCard = createCategoryCard({
        name: 'Alla',
        count: list.length,
        icon: config.icon // Use subject icon (dove, tree, fish)
    });
    allCard.addEventListener('click', () => selectCategory(null));
    elements.guideCategories.appendChild(allCard);

    sortedCategories.forEach(cat => {
        const card = createCategoryCard(cat);
        card.addEventListener('click', () => selectCategory(cat.name));
        elements.guideCategories.appendChild(card);
    });

    // Show categories, hide list
    elements.guideCategories.classList.remove('hidden');
    elements.guideNavigation.classList.add('hidden');
    elements.guideList.classList.add('hidden');
}

function createCategoryCard(cat) {
    const div = document.createElement('div');
    div.className = 'category-card';
    
    // Apply theme if available
    const theme = CATEGORY_THEMES[cat.name];
    if (theme) {
        div.style.backgroundColor = theme.bg;
        div.style.color = theme.text;
        // Also set a property for the count text if we want it to match
        div.style.setProperty('--cat-text', theme.text);
    }

    const subjectAllaKey = cat.name === 'Alla' ? `Alla_${state.currentSubject}` : null;
    const imgFile = (subjectAllaKey && CATEGORY_ICON_IMAGES[subjectAllaKey]) || CATEGORY_ICON_IMAGES[cat.name];
    const iconHtml = (imgFile)
        ? `<img src="images/category_icons/${imgFile}" class="category-icon-img" alt="${cat.name}" onerror="this.style.display='none';this.nextElementSibling&&this.nextElementSibling.classList.remove('hidden')">`
        : `<i class="fa-solid ${cat.icon} category-icon" ${theme ? `style="color: ${theme.text}"` : ''}></i>`;
    
    div.innerHTML = `
        ${iconHtml}
        <div class="category-name">${cat.name}</div>
        <div class="category-count">${cat.count} arter</div>
    `;
    return div;
}

function matchTimeFilter(item) {
    if (state.guideSortBy !== 'bestTime') return true;
    if (state.timeFilter === 'all') return true;

    const bt = (item.bestTime || '').toLowerCase();
    const filter = state.timeFilter.toLowerCase();

    if (filter === 'morgon') return bt.includes('morgon') || bt.includes('gryning');
    if (filter === 'dag') return bt.includes('dag');
    if (filter === 'kväll') return bt.includes('kväll') || bt.includes('skymning');
    if (filter === 'natt') return bt.includes('natt');

    return false;
}

function selectCategory(category) {
    state.activeCategory = category;
    const config = SUBJECT_CONFIG[state.currentSubject];

    // UI Update
    elements.guideCategories.classList.add('hidden');
    elements.guideNavigation.classList.remove('hidden');
    elements.guideList.classList.remove('hidden');

    if (category) {
        elements.currentCategoryTitle.textContent = category;
        const list = getCurrentSpeciesList();
        const items = list.filter(b => b.type === category && matchTimeFilter(b));
        renderGuideList(items);
    } else {
        elements.currentCategoryTitle.textContent = 'Alla ' + config.texts.itemLabel + 'er'; // Or "Alla Arter"
        if (elements.currentCategoryTitle.textContent.includes('arterer')) elements.currentCategoryTitle.textContent = 'Alla Arter'; // Fix double suffix if any

        const list = getCurrentSpeciesList();
        const items = list.filter(b => matchTimeFilter(b));
        renderGuideList(items);
    }
}
// Maps bird category names to PNG icon filenames in images/category_icons/
const CATEGORY_ICON_IMAGES = {
    'Alla': 'alla.png',
    'Alla_birds': 'alla.png',
    'Alla_fungi': 'fungi_alla.png',
    'Alkfåglar': 'alkfaglar.png',
    'Andfåglar': 'andfaglar.png',
    'Duvor': 'duvor.png',
    'Finkar': 'finkar.png',
    'Hackspettar': 'hackspettar.png',
    'Hägrar': 'hagrar.png',
    'Hönsfåglar': 'honsfaglar.png',
    'Kråkfåglar': 'krakfaglar.png',
    'Lommar & Doppingar': 'lommar_doppingar.png',
    'Mesar': 'mesar.png',
    'Måsar & Tärnor': 'masar_tarnor.png',
    'Rovfåglar': 'rovfaglar.png',
    'Sparvar': 'sparvar.png',
    'Svalor': 'svalor.png',
    'Sångare': 'sangare.png',
    'Tranor & Rallar': 'tranor_rallar.png',
    'Trastar': 'trastar.png',
    'Ugglor': 'ugglor.png',
    'Vadare': 'vadare.png',
    'Övriga': 'ovriga.png',
    // Fungi
    'Bläcksvampar':     'fungi_blacksvampar.png',
    'Flammor':          'fungi_flammor.png',
    'Flugsvampar':      'fungi_flugsvampar.png',
    'Kantareller':      'fungi_kantareller.png',
    'Murkla':           'fungi_murkla.png',
    'Ostronsvampar':    'fungi_ostronsvampar.png',
    'Piggsoppar':       'fungi_piggsoppar.png',
    'Riska':            'fungi_riska.png',
    'Rottickor':        'fungi_rottickor.png',
    'Röksvampar':       'fungi_roksvampar.png',
    'Skålsvampar':      'fungi_skalsvampar.png',
    'Soppar':           'fungi_soppar.png',
    'Svavelskivlingar': 'fungi_svavelskivlingar.png',
    'Tickor':           'fungi_tickor.png',
    'Vaxskivlingar':    'fungi_vaxskivlingar.png',
    // Fish
    'Alla_fish':        'fish_alla.png',
    'Abborrfiskar':     'fish_abborrfiskar.png',
    'Karpfiskar':       'fish_karpfiskar.png',
    'Laxfiskar':        'fish_laxfiskar.png',
    'Makrillfiskar':    'fish_makrillfiskar.png',
    'Malartade fiskar': 'fish_malartade.png',
    'Nålfiskar':        'fish_nalfiskar.png',
    'Platfiskar':       'fish_platfiskar.png',
    'Rovfisk':          'fish_rovfisk.png',
    'Sillfiskar':       'fish_sillfiskar.png',
    'Stickelfiskar':    'fish_stickelfiskar.png',
    'Torskfiskar':      'fish_torskfiskar.png',
    'Ålfiskar':         'fish_alfiskar.png',
    // Flowers
    'Hedblommor':       'flower_hedblommor.png',
    'Orkidéer':         'flower_orkideer.png',
    'Skogsblommor':     'flower_skogsblommor.png',
    'Vattenblommor':    'flower_vattenblommor.png',
    'Vårblommor':       'flower_varblommor.png',
};

// Helper for icons (used in Map view & Guide Categories)
function getCategoryIcon(type) {
    const map = {
        // Birds
        'Andfåglar': 'fa-feather-pointed',
        'Hönsfåglar': 'fa-drumstick-bite',
        'Lommar & Doppingar': 'fa-water',
        'Hägrar': 'fa-staff-snake',
        'Rovfåglar': 'fa-dragon',
        'Tranor & Rallar': 'fa-person-walking',
        'Vadare': 'fa-shoe-prints',
        'Måsar & Tärnor': 'fa-paper-plane',
        'Alkfåglar': 'fa-anchor',
        'Hackspettar': 'fa-hammer',
        'Ugglor': 'fa-glasses',
        'Duvor': 'fa-dove',
        'Mesar': 'fa-seedling',
        'Finkar': 'fa-music',
        'Sparvar': 'fa-wheat-awn',
        'Trastar': 'fa-worm',
        'Sångare': 'fa-microphone-lines',
        'Kråkfåglar': 'fa-crow',
        'Svalor': 'fa-wind',
        'Övriga': 'fa-kiwi-bird',

        // Trees
        'Lövträd': 'fa-leaf',
        'Barrträd': 'fa-tree',
        'Ädla lövträd': 'fa-crown',
        'Buskar': 'fa-seedling',

        // Fish
        'Rovfisk': 'fa-fish', // Generic or more specific if available
        'Abborrfiskar': 'fa-fish-fins',
        'Sillfiskar': 'fa-fish',
        'Torskfiskar': 'fa-fish',
        'Laxfiskar': 'fa-water',

        // Animals
        'Hovdjur': 'fa-horse',
        'Rovdjur': 'fa-dog',
        'Insektsätare': 'fa-bug',

        // Fungi
        'Kantareller': 'fa-circle-half-stroke',
        'Soppar': 'fa-circle',
        'Flugsvampar': 'fa-circle-exclamation'
    };
    return map[type] || 'fa-dove';
}

function generateHolderSvg(birdId) {
    const list = getCurrentSpeciesList();
    let item = list.find(b => b.id === birdId);

    // Fallback: Check all other lists if not found (e.g. if switching modes but image loading delayed)
    if (!item) {
        // Iterate over all subjects in config
        for (const key in SUBJECT_CONFIG) {
            const dataVar = SUBJECT_CONFIG[key].dataVar;
            const otherList = window[dataVar];
            if (otherList) {
                const found = otherList.find(b => b.id === birdId);
                if (found) {
                    item = found;
                    break;
                }
            }
        }
    }

    if (!item) return 'https://placehold.co/400x300?text=Okänd';

    const theme = CATEGORY_THEMES[item.type] || CATEGORY_THEMES['Övriga'];
    const nameDisplay = item.nameSv;
    const sciName = item.scientific;


    // Generate a unique rotation/offset from the bird id for visual variety
    const hash = birdId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const angle = (hash % 40) + 130; // gradient angle variation
    const iconSize = 48 + (hash % 16);
    const iconX = 180 + (hash % 40) - 20;
    const iconY = 85 + (hash % 30) - 15;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <defs>
    <linearGradient id="bg-${birdId}" x1="0%" y1="0%" x2="100%" y2="100%" gradientTransform="rotate(${angle}, .5, .5)">
      <stop offset="0%" stop-color="${theme.bg[0]}"/>
      <stop offset="100%" stop-color="${theme.bg[1]}"/>
    </linearGradient>
    <radialGradient id="glow-${birdId}" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="${theme.accent}" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="${theme.accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="400" height="300" fill="url(#bg-${birdId})" rx="8"/>
  <rect width="400" height="300" fill="url(#glow-${birdId})" rx="8"/>
  <circle cx="${iconX}" cy="${iconY}" r="60" fill="${theme.accent}" opacity="0.08"/>
  <circle cx="${iconX}" cy="${iconY}" r="40" fill="${theme.accent}" opacity="0.06"/>
  <text x="${iconX}" y="${iconY + 16}" text-anchor="middle" font-size="${iconSize}" opacity="0.7">${theme.icon}</text>
  <text x="200" y="200" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="700" fill="white" opacity="0.95">${nameDisplay}</text>
  <text x="200" y="228" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-style="italic" fill="${theme.accent}" opacity="0.8">${sciName}</text>
  <rect x="160" y="245" width="80" height="1.5" fill="${theme.accent}" opacity="0.3" rx="1"/>
  <text x="200" y="268" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="10" fill="white" opacity="0.4">${theme.label}</text>
</svg>`;

    return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

// Cache holder SVGs to avoid regenerating on every render
const _holderCache = {};
function getHolderImage(birdId) {
    if (!_holderCache[birdId]) {
        _holderCache[birdId] = generateHolderSvg(birdId);
    }
    return _holderCache[birdId];
}

function getBirdImageSrc(birdId) {
    // 1. Check LocalStorage for custom override
    const custom = localStorage.getItem(`custom_img_${birdId}`);
    if (custom) return custom;
    
    // Check if it's fungi
    const fungiItem = (window.swedishFungi || []).find(f => f.id === birdId);
    if (fungiItem && fungiItem.image) return fungiItem.image;

    // 2. Try the real image file (images/{bird_id}.jpg)
    //    The onerror handler on the <img> will swap to the holder if this 404s
    return `images/${birdId}.jpg`;
}

// Global handler: when an <img> fails to load, fall back to the holder SVG
window.handleImageError = function (imgEl) {
    const birdId = imgEl.dataset.birdId;
    if (birdId && imgEl.src.indexOf('data:image/svg') === -1) {
        imgEl.src = getHolderImage(birdId);
    }
};

function setupYearFilter() {
    const currentYear = new Date().getFullYear();
    const years = new Set();
    
    // Add all years from 2020 up to currentYear
    for (let y = 2020; y <= currentYear; y++) {
        years.add(y);
    }

    state.sightings.forEach(s => {
        if (s.id !== 'SYSTEM_INIT_BIRD') {
            years.add(new Date(s.date).getFullYear());
        }
    });

    const sortedYears = Array.from(years).sort((a, b) => b - a);

    let html = `<option value="all" ${state.yearFilter === 'all' ? 'selected' : ''}>Alla år</option>`;
    html += sortedYears.map(y => `<option value="${y}" ${state.yearFilter === y ? 'selected' : ''}>${y}</option>`).join('');

    elements.yearSelect.innerHTML = html;
}

// --- Interaction Functions ---
window.deleteSighting = (id) => {
    if (confirm('Är du säker på att du vill ta bort denna observation?')) {
        state.sightings = state.sightings.filter(s => s.id !== id);
        saveSightings();
        setupYearFilter(); // Refresh years in case we deleted the last one of a year
    }
};

window.triggerImageUpload = (birdId) => {
    editingBirdId = birdId;
    elements.customImageInput.click();
};

window.quickAddSighting = (birdId) => {
    // 1. Create a minimal sighting
    const newSighting = {
        id: Date.now().toString(),
        birdId: birdId,
        date: new Date().toISOString().split('T')[0], // Today
        location: 'Snabbtillägg',
        notes: '',
        photo: null
    };

    // 2. Save
    state.sightings.push(newSighting);

    // Auto-update year filter if needed (edge case where user views old year but adds for today)
    const currentYear = new Date().getFullYear();
    if (state.yearFilter !== 'all' && state.yearFilter !== currentYear) {
        // Optionally switch to current year, or just let it be added in background
        // Let's switch so they see it
        state.yearFilter = currentYear;
    }

    saveSightings();
    setupYearFilter();

    // Feedback? Not strictly needed as UI updates immediately
};

// --- Event Listeners ---

function setupEventListeners() {
    // Settings Modal Open
    if (elements.settingsBtn) {
        elements.settingsBtn.addEventListener('click', () => {
            if (elements.settingsModal) elements.settingsModal.classList.add('active');
        });
    }

    // 1. Reset App (Inside Settings)
    if (elements.resetBtn) {
        elements.resetBtn.addEventListener('click', () => {
            if (confirm('VARNING: Detta kommer att radera ALLA dina observationer och egna bilder. Är du säker?')) {
                localStorage.clear();
                location.reload();
            }
        });
    }

    // Export Data
    if (elements.exportDataBtn) {
        elements.exportDataBtn.addEventListener('click', () => {
            // Generate a backup object containing sightings and custom images
            const backup = {
                sightings: state.sightings,
                customImages: {}
            };

            // Extract all custom images
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('custom_img_')) {
                    backup.customImages[key] = localStorage.getItem(key);
                }
            }

            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "naturboken_backup_" + new Date().toISOString().split('T')[0] + ".json");
            document.body.appendChild(downloadAnchorNode); // required for firefox
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        });
    }

    // Import Data Trigger
    if (elements.importDataBtn) {
        elements.importDataBtn.addEventListener('click', () => {
            if (elements.importDataInput) elements.importDataInput.click();
        });
    }

    // Import Data Action
    if (elements.importDataInput) {
        elements.importDataInput.addEventListener('change', (e) => {
            if (e.target.files.length === 0) return;
            const file = e.target.files[0];
            const reader = new FileReader();

            reader.onload = (event) => {
                try {
                    const backup = JSON.parse(event.target.result);
                    if (backup && backup.sightings) {
                        if (confirm('Vill du skriva över din nuvarande data med denna backup? Detta går inte att ångra.')) {
                            // Clear basic storage that might conflict
                            localStorage.removeItem('birdfinder_sightings');

                            // Load custom images from backup if they exist
                            if (backup.customImages) {
                                Object.keys(backup.customImages).forEach(key => {
                                    localStorage.setItem(key, backup.customImages[key]);
                                });
                            }

                            // Overwrite sightings
                            state.sightings = backup.sightings;
                            saveSightings();
                            alert('Backup inläst! Appen laddas nu om.');
                            location.reload();
                        }
                    } else {
                        alert('Ogiltig backup-fil.');
                    }
                } catch (err) {
                    console.error('Import error', err);
                    alert('Något gick fel när filen skulle läsas. Är det verkligen en korrekt backup-fil?');
                }
            };
            reader.readAsText(file);
            // Clear input so same file can be selected again
            e.target.value = '';
        });
    }

    // View Mode Toggle (Removed, now handled by CSS per view)

    // 1b. Logo Home Click
    if (elements.logoHome) {
        elements.logoHome.addEventListener('click', () => {
            elements.navBtns.forEach(b => b.classList.remove('active'));
            // Find Log View btn
            const logBtn = document.querySelector('[data-tab="log-view"]');
            if (logBtn) logBtn.classList.add('active');

            elements.viewSections.forEach(s => s.classList.remove('active'));
            document.getElementById('log-view').classList.add('active');
            state.view = 'log-view';
            if (elements.yearFilterContainer) {
                elements.yearFilterContainer.style.display = '';
            }
        });
    }

    // 1c. Sort Change
    if (elements.sortSelect) {
        elements.sortSelect.addEventListener('change', (e) => {
            state.sortBy = e.target.value;
            renderApp();
        });
    }

    // 1d. Guide Sort Change
    if (elements.guideSortSelect) {
        elements.guideSortSelect.addEventListener('change', (e) => {
            state.guideSortBy = e.target.value;
            const term = elements.guideSearch.value.toLowerCase();

            // Show/Hide Time Filter
            if (state.guideSortBy === 'bestTime') {
                elements.timeFilterContainer.classList.remove('hidden');
            } else {
                elements.timeFilterContainer.classList.add('hidden');
                // Check if we need to reset filter? Maybe keep it but irrelevant
            }

            if (state.activeCategory) {
                selectCategory(state.activeCategory);
            } else if (term) {
                // Re-trigger search logic
                elements.guideSearch.dispatchEvent(new Event('input'));
            } else {
                // If viewing all birds (no category, no search, but list visible)
                if (!elements.guideList.classList.contains('hidden')) {
                    selectCategory(null);
                }
            }
        });
    }

    // 1e. Time Filter Buttons
    if (elements.timeFilterBtns) {
        elements.timeFilterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // UI Toggle
                elements.timeFilterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                state.timeFilter = btn.dataset.time;

                // Re-render current view
                if (state.activeCategory) {
                    selectCategory(state.activeCategory);
                } else {
                    const term = elements.guideSearch.value.toLowerCase();
                    if (term) {
                        elements.guideSearch.dispatchEvent(new Event('input'));
                    } else {
                        // Always switch to list view to show filtered results
                        selectCategory(null);
                    }
                }
            });
        });
    }

    // 2. View Switching
    elements.navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // UI Toggle
            elements.navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            elements.viewSections.forEach(s => s.classList.remove('active'));
            document.getElementById(btn.dataset.tab).classList.add('active');

            state.view = btn.dataset.tab;

            // Toggle year filter visibility (Only show in log-view)
            if (elements.yearFilterContainer) {
                elements.yearFilterContainer.style.display = (state.view === 'log-view') ? '' : 'none';
            }

            // Initialize Sweden map on first visit
            if (btn.dataset.tab === 'sweden-view' && typeof renderSwedenMap === 'function') {
                const mapRoot = document.getElementById('sweden-map-root');
                if (mapRoot && !mapRoot.dataset.initialized) {
                    renderSwedenMap('sweden-map-root');
                    mapRoot.dataset.initialized = 'true';
                }
            }

            // Render statistics tab
            if (btn.dataset.tab === 'stats-view') {
                renderStatsView();
            }

            // Render photographers view
            if (btn.dataset.tab === 'photographers-view') {
                _renderPhotographersView();
            }
        });
    });


    // 3. Modal Controls
    elements.addSightingBtn.addEventListener('click', () => {
        history.pushState({ modal: 'sighting' }, '');
        _showSightingModal();
    });

    elements.closeModal.addEventListener('click', () => {
        history.back();
    });

    if (elements.closeDetailModal) {
        elements.closeDetailModal.addEventListener('click', () => {
            history.back();
        });
    }

    // Carousel Navigation
    if (elements.carouselPrev) {
        elements.carouselPrev.addEventListener('click', (e) => {
            e.stopPropagation();
            _goToSlide(carouselIndex - 1);
        });
    }
    if (elements.carouselNext) {
        elements.carouselNext.addEventListener('click', (e) => {
            e.stopPropagation();
            _goToSlide(carouselIndex + 1);
        });
    }

    // Touch/Swipe support for carousel
    let touchStartX = 0;
    let touchEndX = 0;
    const carouselEl = document.getElementById('bird-image-carousel');
    if (carouselEl) {
        carouselEl.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].clientX;
        }, { passive: true });
        carouselEl.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].clientX;
            const diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 40) {
                _goToSlide(diff > 0 ? carouselIndex + 1 : carouselIndex - 1);
            }
        }, { passive: true });
    }

    // Fullscreen Navigation
    if (elements.fsPrev) {
        elements.fsPrev.addEventListener('click', (e) => {
            e.stopPropagation();
            _goToSlide(carouselIndex - 1);
        });
    }
    if (elements.fsNext) {
        elements.fsNext.addEventListener('click', (e) => {
            e.stopPropagation();
            _goToSlide(carouselIndex + 1);
        });
    }

    // Touch/Swipe support for fullscreen modal
    let fsTouchStartX = 0;
    let fsTouchEndX = 0;
    if (elements.fsModal) {
        elements.fsModal.addEventListener('touchstart', (e) => {
            // Ignore touch events on buttons to avoid double execution or conflicts
            if (e.target.closest('button')) return;
            fsTouchStartX = e.changedTouches[0].clientX;
        }, { passive: true });
        elements.fsModal.addEventListener('touchend', (e) => {
            if (e.target.closest('button')) return;
            fsTouchEndX = e.changedTouches[0].clientX;
            const diff = fsTouchStartX - fsTouchEndX;
            if (Math.abs(diff) > 40) {
                _goToSlide(diff > 0 ? carouselIndex + 1 : carouselIndex - 1);
            }
        }, { passive: true });
    }


    // 4. Autocomplete
    elements.birdSearchInput.addEventListener('input', function () {
        const val = this.value.toLowerCase();
        elements.autocompleteList.innerHTML = '';
        if (!val) return;

        const list = getCurrentSpeciesList();
        list.forEach(bird => {
            if (bird.nameEn.toLowerCase().includes(val) || bird.nameSv.toLowerCase().includes(val)) {
                const item = document.createElement('div');
                item.className = 'autocomplete-item';
                item.innerHTML = `<strong>${bird.nameSv}</strong> <small>(${bird.nameEn})</small>`;
                item.addEventListener('click', () => {
                    elements.birdSearchInput.value = bird.nameSv;
                    elements.selectedBirdId.value = bird.id;
                    elements.autocompleteList.innerHTML = '';
                });
                elements.autocompleteList.appendChild(item);
            }
        });
    });

    // Close autocomplete on outside click
    document.addEventListener('click', (e) => {
        if (e.target !== elements.birdSearchInput) {
            elements.autocompleteList.innerHTML = '';
        }
    });

    // 5. Form Submit
    elements.form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!elements.selectedBirdId.value) {
            alert('Vänligen välj en fågel från listan!');
            return;
        }

        const latVal = document.getElementById('sighting-lat').value;
        const lngVal = document.getElementById('sighting-lng').value;
        const dateVal = document.getElementById('sighting-date').value;
        let notesVal = document.getElementById('sighting-notes').value;

        const submitBtn = elements.form.querySelector('button[type="submit"]');
        const originalBtnHTML = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sparar...';
        submitBtn.disabled = true;

        // Automatically fetch weather data if coordinates and date exist (Request 3)
        if (latVal && lngVal && dateVal) {
            try {
                const url = `https://api.open-meteo.com/v1/forecast?latitude=${latVal}&longitude=${lngVal}&daily=temperature_2m_max,weathercode&past_days=14&forecast_days=1&timezone=Europe%2FBerlin`;
                const res = await fetch(url);
                const data = await res.json();
                if (data && data.daily && data.daily.time) {
                    const index = data.daily.time.indexOf(dateVal);
                    if (index !== -1) {
                        const temp = data.daily.temperature_2m_max[index];
                        const code = data.daily.weathercode[index];
                        let wDesc = '';
                        if (code === 0) wDesc = 'Klart';
                        else if (code >= 1 && code <= 3) wDesc = 'Växlande molnighet';
                        else if (code >= 45 && code <= 48) wDesc = 'Dimma';
                        else if (code >= 51 && code <= 67) wDesc = 'Regn';
                        else if (code >= 71 && code <= 82) wDesc = 'Snö';
                        else if (code >= 95) wDesc = 'Åska';
                        
                        if (temp !== null && temp !== undefined) {
                            const wStr = `Väder: ${Math.round(temp)}°C${wDesc ? ', ' + wDesc : ''}`;
                            notesVal = notesVal ? `${wStr}\n\n${notesVal}` : wStr;
                        }
                    }
                }
            } catch(e) {
                console.warn('Weather fetch failed', e);
            }
        }

        const newSighting = {
            id: Date.now().toString(),
            birdId: elements.selectedBirdId.value,
            date: dateVal,
            location: document.getElementById('sighting-location').value,
            notes: notesVal,
            photo: null,
            lat: latVal ? parseFloat(latVal) : null,
            lng: lngVal ? parseFloat(lngVal) : null
        };

        const finish = () => {
            state.sightings.push(newSighting);

            // Auto-switch year filter if needed
            const sYear = new Date(newSighting.date).getFullYear();
            if (state.yearFilter !== 'all' && state.yearFilter !== sYear) {
                state.yearFilter = sYear;
            }

            saveSightings();
            setupYearFilter();

            submitBtn.innerHTML = originalBtnHTML;
            submitBtn.disabled = false;
            history.back(); // Close modal via history
        };

        // Check for photo
        if (elements.sightingPhoto.files && elements.sightingPhoto.files[0]) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                newSighting.photo = ev.target.result;
                finish();
            };
            reader.readAsDataURL(elements.sightingPhoto.files[0]);
        } else {
            finish();
        }
    });

    // 6. Custom Image Upload
    elements.customImageInput.addEventListener('change', function () {
        if (this.files && this.files[0] && editingBirdId) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    localStorage.setItem(`custom_img_${editingBirdId}`, ev.target.result);
                    renderApp();
                    // Refresh guide if active
                    const list = getCurrentSpeciesList();
                    if (!elements.guideList.classList.contains('hidden')) {
                        renderGuideList(list);
                    }
                } catch (err) {
                    alert('Bilden är för stor!');
                }
                editingBirdId = null;
            };
            reader.readAsDataURL(this.files[0]);
        }
    });

    // 7. Guide Search
    elements.guideSearch.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();

        // If search term exists, switch to list view automatically
        if (term.length > 0) {
            state.activeCategory = null; // Reset category context
            elements.guideCategories.classList.add('hidden');
            elements.guideNavigation.classList.add('hidden'); // Hide back button in search mode
            elements.guideList.classList.remove('hidden');

            const list = getCurrentSpeciesList();
            const filtered = list.filter(b =>
                (b.nameEn.toLowerCase().includes(term) ||
                    b.nameSv.toLowerCase().includes(term) ||
                    (b.type && b.type.toLowerCase().includes(term)) ||
                    (b.wingspan && b.wingspan.toString().includes(term)) ||
                    (b.eggs && b.eggs.toString().includes(term)) ||
                    (b.weight && b.weight.toString().includes(term)) ||
                    (b.color && b.color.toLowerCase().includes(term))) &&
                matchTimeFilter(b)
            );
            renderGuideList(filtered);
        } else {
            // Show categories again
            if (state.activeCategory) {
                selectCategory(state.activeCategory);
            } else {
                // Show categories
                elements.guideCategories.classList.remove('hidden');
                elements.guideNavigation.classList.add('hidden');
                elements.guideList.classList.add('hidden');
            }
        }
    });

    // 9. Back to Categories
    if (elements.backToCategoriesBtn) {
        elements.backToCategoriesBtn.addEventListener('click', () => {
            renderGuideCategories();
        });
    }

    // 8. Filter Change
    elements.yearSelect.addEventListener('change', (e) => {
        const v = e.target.value;
        state.yearFilter = v === 'all' ? 'all' : parseInt(v);
        renderApp();
    });

    // Close modals when clicking outside the modal content
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            // Do not close password modal or welcome modal by clicking outside
            if (e.target.id === 'password-modal' || e.target.id === 'welcome-modal') return;

            // These modals use HTML5 history state for navigation
            if (e.target.id === 'sighting-modal' || e.target.id === 'bird-detail-modal-overlay' || e.target.id === 'fullscreen-image-modal') {
                history.back();
            } else {
                e.target.classList.remove('active');
            }
        }
    });

    const fsCloseBtn = document.getElementById('close-fullscreen-img');
    if (fsCloseBtn) {
        fsCloseBtn.addEventListener('click', () => {
            history.back();
        });
    }
}

// --- Quiz System ---

function getRandomBirds(count, excludeId, type) {
    const list = getCurrentSpeciesList();
    let pool = list.filter(b => b.id !== excludeId);
    // If type specified and enough birds of that type, filter
    if (type) {
        const sameType = pool.filter(b => b.type === type);
        if (sameType.length >= count) {
            pool = sameType;
        }
    }
    const shuffled = pool.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

function stripBirdName(text, bird) {
    // Remove the bird's Swedish name and common variations from the fun fact
    // e.g. "Knölsvanen" from "Knölsvanen är en av..."
    const nameSv = bird.nameSv;
    // Try common Swedish definite forms: append 'n', 'en', 'an', 'et', 's'
    const variants = [nameSv];
    // Also try lowercase
    variants.push(nameSv.toLowerCase());
    // Common definite article forms
    if (!nameSv.endsWith('n')) variants.push(nameSv + 'n');
    if (!nameSv.endsWith('en')) variants.push(nameSv + 'en');
    if (!nameSv.endsWith('an')) variants.push(nameSv + 'an');
    if (!nameSv.endsWith('s')) variants.push(nameSv + 's');

    let result = text;
    for (const v of variants) {
        // Case insensitive replacement
        const regex = new RegExp(v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        result = result.replace(regex, '???');
    }
    return result;
}

function getClosestBirds(bird, stat, count) {
    // Find birds with similar stat values to make harder options
    const birdValue = bird[stat] || 0;
    if (!birdValue) return getRandomBirds(count, bird.id);

    const list = getCurrentSpeciesList();
    const candidates = list
        .filter(b => b.id !== bird.id && b[stat])
        .map(b => ({
            bird: b,
            diff: Math.abs((b[stat] || 0) - birdValue)
        }))
        .sort((a, b) => a.diff - b.diff);

    // Pick from the closest candidates, with some randomness
    const top = candidates.slice(0, Math.min(count * 3, candidates.length));
    const shuffled = top.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map(c => c.bird);
}

function generateQuizQuestions(mode, count = 10) {
    let list = getCurrentSpeciesList();

    // Filter by rarity if it's birds and difficulty is set
    if (state.currentSubject === 'birds' && state.quizDifficulty) {
        const diff = state.quizDifficulty;
        if (diff === 'nyborjare') {
            list = list.filter(b => (b.rarity || 1) === 1);
        } else if (diff === 'intresserad') {
            list = list.filter(b => (b.rarity || 1) <= 2);
        } else if (diff === 'skadare') {
            list = list.filter(b => (b.rarity || 1) >= 3 && (b.rarity || 1) <= 4);
        } else if (diff === 'orakel') {
            list = list.filter(b => (b.rarity || 1) >= 3);
        }
    }

    // Safety fallback if filtered list is too small
    if (list.length < 4) {
        list = getCurrentSpeciesList();
    }

    const birds = [...list].sort(() => Math.random() - 0.5);
    const questions = [];

    const config = SUBJECT_CONFIG[state.currentSubject];
    const entityName = config.texts.itemLabel.toLowerCase().replace('art', '');

    for (let i = 0; i < Math.min(count, birds.length); i++) {
        const item = birds[i];

        if (mode === 'image') {
            const wrongItems = getRandomBirds(3, item.id, item.type);
            const options = [item, ...wrongItems].sort(() => Math.random() - 0.5);
            questions.push({
                type: 'image',
                prompt: null,
                image: item.id,
                question: `Vilken ${entityName} ser du på bilden?`,
                options: options.map(b => ({ label: b.nameSv, value: b.id })),
                correctValue: item.id,
                correctLabel: item.nameSv
            });
        } else if (mode === 'funfact') {
            const wrongItems = getRandomBirds(3, item.id);
            const options = [item, ...wrongItems].sort(() => Math.random() - 0.5);
            const cleanedFact = stripBirdName(item.funFact, item);
            questions.push({
                type: 'funfact',
                prompt: `"${cleanedFact}"`,
                image: null,
                question: `Vilken ${entityName} handlar detta om?`,
                options: options.map(b => ({ label: b.nameSv, value: b.id })),
                correctValue: item.id,
                correctLabel: item.nameSv
            });
        } else if (mode === 'stats') {
            const fields = config.fields;
            const availableStats = [];

            if (fields.size) availableStats.push({ key: fields.size.key, label: fields.size.label, unit: fields.size.unit });
            if (fields.weight && !fields.weight.hidden) availableStats.push({ key: fields.weight.key, label: fields.weight.label, unit: fields.weight.unit });
            if (fields.lifespan && !fields.lifespan.hidden) availableStats.push({ key: fields.lifespan.key, label: fields.lifespan.label, unit: fields.lifespan.unit });

            if (availableStats.length === 0) continue;

            const statObj = availableStats[Math.floor(Math.random() * availableStats.length)];
            const statKey = statObj.key;

            const wrongItems = getClosestBirds(item, statKey, 3);
            const allOptions = [item, ...wrongItems].sort(() => Math.random() - 0.5);

            questions.push({
                type: 'stats',
                prompt: item.nameSv,
                image: item.id,
                question: `Vad är ${item.nameSv}s ${statObj.label.toLowerCase()}?`,
                options: allOptions.map(b => ({
                    label: `${b[statKey] || '?'} ${statObj.unit}`,
                    value: b.id
                })),
                correctValue: item.id,
                correctLabel: `${item[statKey] || '?'} ${statObj.unit}`
            });
        }
    }
    return questions;
}

function showQuizMenu() {
    document.getElementById('quiz-menu').classList.remove('hidden');
    document.getElementById('quiz-area').classList.add('hidden');
    document.getElementById('quiz-results').classList.add('hidden');
}

function initQuiz(mode, difficulty = 'nyborjare') {
    state.quizMode = mode;
    state.quizDifficulty = difficulty;
    state.quizQuestions = generateQuizQuestions(mode);
    state.quizCurrent = 0;
    state.quizScore = 0;
    state.quizAnswered = false;

    document.getElementById('quiz-menu').classList.add('hidden');
    document.getElementById('quiz-area').classList.remove('hidden');
    document.getElementById('quiz-results').classList.add('hidden');

    document.getElementById('quiz-score').textContent = '0';
    document.getElementById('quiz-total').textContent = state.quizQuestions.length;

    renderQuizQuestion();
}

function renderQuizQuestion() {
    const q = state.quizQuestions[state.quizCurrent];
    if (!q) return;

    state.quizAnswered = false;

    // Update progress
    const progress = ((state.quizCurrent) / state.quizQuestions.length) * 100;
    document.getElementById('quiz-progress-fill').style.width = progress + '%';

    const container = document.getElementById('quiz-question-container');

    let imageHtml = '';
    if (q.image) {
        const obj = (window.swedishFungi || []).find(f => f.id === q.image);
        const imgSrc = (obj && obj.image) || getBirdImageSrc(q.image);
        imageHtml = `<div class="quiz-image-container">
            <img src="${imgSrc}" alt="Quiz bird" data-bird-id="${q.image}" onerror="handleImageError(this)" class="quiz-bird-image">
        </div>`;
    }

    let promptHtml = '';
    if (q.prompt) {
        promptHtml = `<div class="quiz-prompt">${q.prompt}</div>`;
    }

    const optionsHtml = q.options.map((opt, i) => `
        <button class="quiz-option-btn" data-value="${opt.value}" data-index="${i}">
            ${opt.label}
        </button>
    `).join('');

    container.innerHTML = `
        <div class="quiz-question-number">Fråga ${state.quizCurrent + 1} av ${state.quizQuestions.length}</div>
        ${imageHtml}
        ${promptHtml}
        <h3 class="quiz-question-text">${q.question}</h3>
        <div class="quiz-options">
            ${optionsHtml}
        </div>
    `;

    // Bind option clicks
    container.querySelectorAll('.quiz-option-btn').forEach(btn => {
        btn.addEventListener('click', () => handleQuizAnswer(btn));
    });
}

function handleQuizAnswer(btnEl) {
    if (state.quizAnswered) return;
    state.quizAnswered = true;

    const q = state.quizQuestions[state.quizCurrent];
    const selectedValue = btnEl.dataset.value;
    const isCorrect = selectedValue === q.correctValue;

    if (isCorrect) {
        state.quizScore++;
        btnEl.classList.add('correct');
    } else {
        btnEl.classList.add('incorrect');
        // Highlight correct answer
        document.querySelectorAll('.quiz-option-btn').forEach(b => {
            if (b.dataset.value === q.correctValue) {
                b.classList.add('correct');
            }
        });
    }

    document.getElementById('quiz-score').textContent = state.quizScore;

    // Auto-advance after delay
    setTimeout(() => {
        state.quizCurrent++;
        if (state.quizCurrent >= state.quizQuestions.length) {
            showQuizResults();
        } else {
            renderQuizQuestion();
        }
    }, 1200);
}

function showQuizResults() {
    document.getElementById('quiz-area').classList.add('hidden');
    document.getElementById('quiz-results').classList.remove('hidden');

    const score = state.quizScore;
    const total = state.quizQuestions.length;
    const pct = Math.round((score / total) * 100);

    document.getElementById('quiz-final-score').textContent = score;
    document.getElementById('quiz-final-total').textContent = total;
    document.getElementById('quiz-results-bar-fill').style.width = pct + '%';

    // Difficulty label
    const subjectPrefix = SUBJECT_CONFIG[state.currentSubject].name.replace('boken', '');
    const diffNames = {
        'nyborjare': 'Nybörjaren',
        'intresserad': subjectPrefix + 'intresserad',
        'skadare': subjectPrefix + 'skadare',
        'orakel': subjectPrefix + 'orakel'
    };
    const diffEl = document.getElementById('quiz-results-difficulty');
    if (diffEl) {
        diffEl.textContent = `Nivå: ${diffNames[state.quizDifficulty] || 'Standard'}`;
    }

    // Fun results
    let icon, title;
    if (pct === 100) { icon = '🏆'; title = 'Perfekt! Du är en fågelexpert!'; }
    else if (pct >= 80) { icon = '🌟'; title = 'Fantastiskt! Nästan perfekt!'; }
    else if (pct >= 60) { icon = '🎉'; title = 'Bra jobbat!'; }
    else if (pct >= 40) { icon = '🐣'; title = 'Bra försök! Öva mer!'; }
    else { icon = '📚'; title = 'Dags att studera fågelguiden!'; }

    document.getElementById('quiz-results-icon').textContent = icon;
    document.getElementById('quiz-results-title').textContent = title;
}

// --- Quiz Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    // Difficulty cards
    document.querySelectorAll('.difficulty-card').forEach(card => {
        card.addEventListener('click', () => {
            const diff = card.dataset.difficulty;
            // Since we currently only have "image" mode, we start that directly
            initQuiz('image', diff);
        });
    });

    // Quiz mode cards
    document.querySelectorAll('.quiz-mode-card').forEach(card => {
        card.addEventListener('click', () => {
            const mode = card.dataset.mode;
            initQuiz(mode, state.quizDifficulty || 'nyborjare');
        });
    });

    // Back button
    const quizBackBtn = document.getElementById('quiz-back-btn');
    if (quizBackBtn) {
        quizBackBtn.addEventListener('click', showQuizMenu);
    }

    // Quit button (end quiz early, show results)
    const quizQuitBtn = document.getElementById('quiz-quit-btn');
    if (quizQuitBtn) {
        quizQuitBtn.addEventListener('click', () => {
            // Set total to current question count for accurate results
            state.quizQuestions.length = state.quizCurrent + (state.quizAnswered ? 0 : 0);
            showQuizResults();
        });
    }

    // Retry button
    const quizRetryBtn = document.getElementById('quiz-retry-btn');
    if (quizRetryBtn) {
        quizRetryBtn.addEventListener('click', () => {
            initQuiz(state.quizMode);
        });
    }

    // Menu button (from results)
    const quizMenuBtn = document.getElementById('quiz-menu-btn');
    if (quizMenuBtn) {
        quizMenuBtn.addEventListener('click', showQuizMenu);
    }
});

// ============================================================
//  STATISTICS TAB
// ============================================================

/**
 * Rank / title system.
 * Each rank has: icon, title (sv), subtitle, minSpecies (total unique species across ALL subjects).
 * Special "specialization" titles override the generic one if the user logged ONLY birds (or mostly birds).
 */
const RANKS = [
    // Tier 0 – 0-4
    { min: 0, icon: '🥚', title: 'Naturnyböjare', subtitle: 'Välkommen till naturens värld!' },
    // Tier 1 – 5-14
    { min: 5, icon: '🐣', title: 'Naturspejare', subtitle: 'Du börjar ana naturens mönster.' },
    // Tier 2 – 15-29
    { min: 15, icon: '🔭', title: 'Naturentusiast', subtitle: 'Kikaren är alltid plockad.' },
    // Tier 3 – 30-49 BIRD FOCUS
    { min: 30, icon: '🦜', title: 'Fågelskådare', subtitle: 'Du vet vad som flyger förbi.' },
    // Tier 4 – 50-79
    { min: 50, icon: '📓', title: 'Fältbiologen', subtitle: 'Anteckningsboken är alltid framme.' },
    // Tier 5 – 80-119
    { min: 80, icon: '🦅', title: 'Rapphönsornitolog', subtitle: 'Rovfåglarna saluterar dig.' },
    // Tier 6 – 120-199
    { min: 120, icon: '🌿', title: 'Naturälskare', subtitle: 'Skogen, sjöarna och fälten är ditt hem.' },
    // Tier 7 – 200-299
    { min: 200, icon: '🔬', title: 'Naturforskare', subtitle: 'Du ser vad andra missar.' },
    // Tier 8 – 300-449
    { min: 300, icon: '🦩', title: 'Master Ornitolog', subtitle: 'Fåglarna känner igen dig.' },
    // Tier 9 – 450+
    { min: 450, icon: '🏅', title: 'Naturens Väktare', subtitle: 'Du är en levande naturencyklopedi.' },
];

const BIRD_SPECIALIZATIONS = [
    { minBirds: 5, icon: '🐦', title: 'Fågelvakt', subtitle: 'Du håller ögonen på himlen.' },
    { minBirds: 20, icon: '🦢', title: 'Fågelskådare', subtitle: 'Kikaren sitter alltid runt halsen.' },
    { minBirds: 50, icon: '🦅', title: 'Erfaren Ornitolog', subtitle: 'Du artbestämmer på sekunden.' },
    { minBirds: 100, icon: '🦉', title: 'Mäster Ornitolog', subtitle: 'Fåglarna lyssnar på dig.' },
    { minBirds: 200, icon: '🦚', title: 'Fågellegend', subtitle: 'En vandring i riksägarens sällskap.' },
];

function computeStats() {
    // Filter out ghost / system sightings
    const realSightings = state.sightings.filter(s => s.id !== 'SYSTEM_INIT_BIRD');

    // --- Per subject unique species counts ---
    const subjectCounts = {};
    for (const key in SUBJECT_CONFIG) {
        const cfg = SUBJECT_CONFIG[key];
        const list = window[cfg.dataVar] || [];
        const ids = new Set(list.map(i => i.id));
        const seen = new Set(realSightings.filter(s => ids.has(s.birdId)).map(s => s.birdId));
        subjectCounts[key] = seen.size;
    }

    const totalUniq = Object.values(subjectCounts).reduce((a, b) => a + b, 0);
    const birdUniq = subjectCounts.birds || 0;

    // --- Determine rank ---
    let rank = RANKS[0];
    for (const r of RANKS) {
        if (totalUniq >= r.min) rank = r;
    }

    // If the user is predominantly a bird person (birds > 60% of sightings), override title
    let birdSpec = null;
    const birdSightings = realSightings.filter(s => (window.swedishBirds || []).some(b => b.id === s.birdId));
    if (birdSightings.length > 0 && birdSightings.length / realSightings.length > 0.6) {
        for (const sp of BIRD_SPECIALIZATIONS) {
            if (birdUniq >= sp.minBirds) birdSpec = sp;
        }
    }

    const activeRank = birdSpec || rank;

    // Next rank threshold
    const currentRankIdx = RANKS.indexOf(rank);
    const nextRank = RANKS[currentRankIdx + 1];
    let progressPct = 100, progressLabel = 'Max rang uppnådd! 🏆';
    if (nextRank) {
        const span = nextRank.min - rank.min;
        const done = totalUniq - rank.min;
        progressPct = Math.min(100, Math.round((done / span) * 100));
        progressLabel = `${done} / ${span} till nästa rang (${nextRank.title})`;
    }

    // --- Bird-specific highlights ---
    const birdList = window.swedishBirds || [];
    const loggedBirdSightings = realSightings.filter(s => birdList.some(b => b.id === s.birdId));
    const loggedBirdIds = [...new Set(loggedBirdSightings.map(s => s.birdId))];
    const loggedBirds = loggedBirdIds.map(id => birdList.find(b => b.id === id)).filter(Boolean);

    // Rarest bird logged
    const rarestBird = loggedBirds.length
        ? loggedBirds.reduce((acc, b) => (b.rarity || 0) > (acc.rarity || 0) ? b : acc, loggedBirds[0])
        : null;

    // Largest wingspan
    const biggestWingspan = loggedBirds.length
        ? loggedBirds.reduce((acc, b) => (b.wingspan || 0) > (acc.wingspan || 0) ? b : acc, loggedBirds[0])
        : null;

    // Most logged species
    const countByBird = {};
    loggedBirdSightings.forEach(s => { countByBird[s.birdId] = (countByBird[s.birdId] || 0) + 1; });
    const mostLoggedId = Object.entries(countByBird).sort((a, b) => b[1] - a[1])[0];
    const mostLoggedBird = mostLoggedId ? birdList.find(b => b.id === mostLoggedId[0]) : null;
    const mostLoggedCount = mostLoggedId ? mostLoggedId[1] : 0;

    // Cat with most coverage
    const birdsPerCategory = {};
    birdList.forEach(b => { if (!birdsPerCategory[b.type]) birdsPerCategory[b.type] = { total: 0, seen: 0 }; birdsPerCategory[b.type].total++; });
    loggedBirds.forEach(b => { if (birdsPerCategory[b.type]) birdsPerCategory[b.type].seen++; });
    const bestCat = Object.entries(birdsPerCategory).sort((a, b) => (b[1].seen / b[1].total) - (a[1].seen / a[1].total))[0];

    // Rarity breakdown for logged birds
    const rarityNames = ['Allmän', 'Vanlig', 'Ovanlig', 'Sällsynt', 'Mycket sällsynt'];
    const rarityColors = ['#64748b', '#3b82f6', '#8b5cf6', '#f97316', '#ef4444'];
    const rarityBreakdown = [0, 0, 0, 0, 0];
    loggedBirds.forEach(b => { const idx = (b.rarity || 1) - 1; if (idx >= 0 && idx < 5) rarityBreakdown[idx]++; });

    // Rarity score: 1pt=Allmän, 2=Vanlig, 3=Ovanlig, 5=Sällsynt, 10=Mycket sällsynt
    const rarityPoints = [1, 2, 3, 5, 10];
    const rarityScore = loggedBirds.reduce((sum, b) => sum + (rarityPoints[(b.rarity || 1) - 1] || 0), 0);

    // --- Location & Time insights ---
    const locationCount = {};
    realSightings.forEach(s => {
        const loc = (s.location || '').trim();
        if (loc && loc !== 'Snabbtillägg' && loc !== 'System Init') {
            locationCount[loc] = (locationCount[loc] || 0) + 1;
        }
    });
    const topLocation = Object.entries(locationCount).sort((a, b) => b[1] - a[1])[0];

    // Best month
    const monthCount = {};
    realSightings.forEach(s => {
        if (s.date) {
            const m = new Date(s.date).getMonth(); // 0-11
            monthCount[m] = (monthCount[m] || 0) + 1;
        }
    });
    const monthNames = ['Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni', 'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'];
    const bestMonthEntry = Object.entries(monthCount).sort((a, b) => b[1] - a[1])[0];
    const bestMonth = bestMonthEntry ? monthNames[parseInt(bestMonthEntry[0])] : null;

    // Active years
    const years = new Set(realSightings.filter(s => s.date).map(s => new Date(s.date).getFullYear()));
    const yearCount = years.size;

    // First sighting date
    const firstDate = realSightings.filter(s => s.date).map(s => s.date).sort()[0] || null;

    // Total sightings (including duplicates)
    const totalSightings = realSightings.length;

    const badges = [
        { icon: '🥚', name: 'Första fågeln', desc: 'Logga din första observation', earned: totalSightings >= 1 },
        { icon: '🐣', name: '10 observationer', desc: 'Logga 10 observationer totalt', earned: totalSightings >= 10 },
        { icon: '🦅', name: '5 fågelarter', desc: 'Observera 5 unika fågelarter', earned: birdUniq >= 5 },
        { icon: '🦉', name: 'Nattjägaren', desc: 'Logga en ugglor-observation', earned: (window.swedishBirds || []).some(b => b.type === 'Ugglor' && loggedBirds.some(lb => lb.id === b.id)) },
        { icon: '👑', name: '25 fågelarter', desc: 'Observera 25 unika fågelarter', earned: birdUniq >= 25 },
        { icon: '🦢', name: '50 fågelarter', desc: 'Observera 50 unika fågelarter', earned: birdUniq >= 50 },
        { icon: '🌿', name: 'Naturälskare', desc: 'Logga i 3+ olika ämnesböcker', earned: Object.values(subjectCounts).filter(v => v > 0).length >= 3 },
        { icon: '💐', name: 'Blomstervän', desc: 'Logga 5 blommor', earned: (subjectCounts.flowers || 0) >= 5 },
        { icon: '🍄', name: 'Svampplockaren', desc: 'Logga 5 svampar', earned: (subjectCounts.fungi || 0) >= 5 },
        { icon: '🐟', name: 'Fiskaren', desc: 'Logga 5 fiskar', earned: (subjectCounts.fish || 0) >= 5 },
        { icon: '🦌', name: 'Viltvakt', desc: 'Logga 5 viltdjur', earned: (subjectCounts.animals || 0) >= 5 },
        { icon: '⭐', name: 'Sällsynthetsjägaren', desc: 'Logga 1 sällsynt fågel (nivå 4+)', earned: loggedBirds.some(b => (b.rarity || 0) >= 4) },
        { icon: '🏆', name: 'Raritetsmästare', desc: 'Uppnå 100 sällsynthetsscore', earned: rarityScore >= 100 },
        { icon: '📍', name: 'Äventyraren', desc: 'Logga på 5 olika platser', earned: Object.keys(subjectCounts).length > 0 && (() => { const locs = new Set(realSightings.filter(s => s.location && s.location !== 'Snabbtillägg' && s.location !== 'System Init' && s.id !== 'SYSTEM_INIT_BIRD').map(s => s.location)); return locs.size >= 5; })() },
        { icon: '🌟', name: '100 unika arter', desc: 'Totalt 100 unika arter loggade', earned: totalUniq >= 100 },
    ];

    return {
        totalUniq, birdUniq, subjectCounts, activeRank, progressPct, progressLabel,
        loggedBirds, rarestBird, biggestWingspan,
        mostLoggedBird, mostLoggedCount,
        bestCat, rarityBreakdown, rarityNames, rarityColors, rarityScore, rarityPoints,
        topLocation, bestMonth, yearCount, firstDate, totalSightings,
        birdSightings: loggedBirdSightings.length,
        badges
    };
}

function row(label, value, cls = '') {
    return `<div class="stats-row">
        <span class="stats-row-label">${label}</span>
        <span class="stats-row-value ${cls}">${value}</span>
    </div>`;
}

function renderStatsView() {
    const s = computeStats();

    // --- Profile card ---
    const rankTitle = s.activeRank.title;
    const isUnseenRank = localStorage.getItem(`birdfinder_unseen_rank_${rankTitle}`) === 'true';
    const profileCard = document.querySelector('.stats-profile-card');
    
    if (profileCard) {
        if (isUnseenRank) {
            profileCard.classList.add('unseen-highlight');
            profileCard.style.cursor = 'pointer';
            profileCard.onclick = () => {
                localStorage.removeItem(`birdfinder_unseen_rank_${rankTitle}`);
                profileCard.classList.remove('unseen-highlight');
                profileCard.onclick = null;
                profileCard.style.cursor = '';
            };
        } else {
            profileCard.classList.remove('unseen-highlight');
            profileCard.onclick = null;
            profileCard.style.cursor = '';
        }
    }

    document.getElementById('stats-rank-icon').textContent = s.activeRank.icon;
    document.getElementById('stats-rank-title').textContent = s.activeRank.title;
    document.getElementById('stats-rank-subtitle').textContent = s.activeRank.subtitle;
    document.getElementById('stats-rank-progress').style.width = s.progressPct + '%';
    document.getElementById('stats-rank-progress-label').textContent = s.progressLabel;

    // --- Overview numbers ---
    const overviewEl = document.getElementById('stats-overview-grid');
    const overviewCards = [
        { icon: '🔍', value: s.totalSightings, label: 'Totala observationer' },
        { icon: '🐦', value: s.birdUniq, label: 'Unika fågelarter' },
        { icon: '🌿', value: s.totalUniq, label: 'Unika arter (alla)' },
        { icon: '⭐', value: s.rarityScore, label: 'Sällsynthetsscore' },
        {
            icon: '📍', value: Object.keys(s.subjectCounts).reduce((n, k) => n, 0) || '—',
            label: 'Ämnen utforskade'
        },
        { icon: '📅', value: s.yearCount, label: s.yearCount === 1 ? 'År aktivt' : 'År aktiv' },
    ];
    // Replace 5th with years of active subjects
    const activeSubjects = Object.values(s.subjectCounts).filter(v => v > 0).length;
    overviewCards[4] = { icon: '📚', value: activeSubjects, label: 'Böcker utforskade' };
    overviewEl.innerHTML = overviewCards.map(c => `
        <div class="stats-overview-card">
            <div class="stats-overview-icon">${c.icon}</div>
            <div class="stats-overview-value">${c.value}</div>
            <div class="stats-overview-label">${c.label}</div>
        </div>
    `).join('');

    // --- Bird Stats Panel ---
    const birdsEl = document.getElementById('stats-birds-body');
    if (s.loggedBirds.length === 0) {
        birdsEl.innerHTML = `<div class="stats-empty"><i class="fa-solid fa-dove"></i><p>Logga din första fågel för att se statistik!</p></div>`;
    } else {
        const totalBirdTypes = (window.swedishBirds || []).length;
        const coverage = Math.round((s.birdUniq / totalBirdTypes) * 100);
        birdsEl.innerHTML = `
            ${row('🦅 Sällsyntaste fågeln', s.rarestBird ? `${s.rarestBird.nameSv} <small style="color:#8b5cf6">(Nivå ${s.rarestBird.rarity})</small>` : '—', 'highlight')}
            ${row('📏 Störst vingspann', s.biggestWingspan ? `${s.biggestWingspan.nameSv} (${s.biggestWingspan.wingspan} cm)` : '—')}
            ${row('🔄 Mest loggad', s.mostLoggedBird ? `${s.mostLoggedBird.nameSv} · ${s.mostLoggedCount}×` : '—', 'highlight')}
            ${row('📦 Bästa kategori', s.bestCat ? `${s.bestCat[0]} (${s.bestCat[1].seen}/${s.bestCat[1].total})` : '—')}
            ${row('📊 Artböckens täckning', `${s.birdUniq} / ${totalBirdTypes} (${coverage}%)`)}
            ${row('⭐ Sällsynthetsscore', s.rarityScore + ' poäng', 'rarity-score')}
        `;
    }

    // --- Nature Profile Panel ---
    const natureEl = document.getElementById('stats-nature-body');
    const subjects = [
        { key: 'birds', icon: '🐦', name: 'Fåglar', color: '#2E5D4B' },
        { key: 'animals', icon: '🐾', name: 'Vilt', color: '#795548' },
        { key: 'flowers', icon: '🌸', name: 'Blommor', color: '#e91e63' },
        { key: 'trees', icon: '🌲', name: 'Träd', color: '#388e3c' },
        { key: 'fish', icon: '🐟', name: 'Fisk', color: '#0288d1' },
        { key: 'fungi', icon: '🍄', name: 'Svamp', color: '#e64a19' },
    ];
    const maxCount = Math.max(1, ...subjects.map(sub => s.subjectCounts[sub.key] || 0));

    // Determine specialization label
    let specLabel = '';
    const birdPct = s.totalUniq > 0 ? (s.birdUniq / s.totalUniq) : 0;
    if (birdPct > 0.8 && s.birdUniq > 5) specLabel = `<span class="stats-specialization">Fågelspecialist</span>`;
    else if (birdPct < 0.3 && s.totalUniq > 10) specLabel = `<span class="stats-specialization">Naturalist</span>`;
    else if (s.totalUniq > 5) specLabel = `<span class="stats-specialization">Allroundare</span>`;

    natureEl.innerHTML = subjects.map(sub => {
        const cnt = s.subjectCounts[sub.key] || 0;
        const w = Math.round((cnt / maxCount) * 100);
        return `<div class="nature-subject-row">
            <span class="nature-subject-icon">${sub.icon}</span>
            <span class="nature-subject-name">${sub.name}</span>
            <div class="nature-subject-bar-wrap">
                <div class="nature-subject-bar-fill" style="width: ${w}%; background: ${sub.color}"></div>
            </div>
            <span class="nature-subject-count">${cnt}</span>
        </div>`;
    }).join('') + specLabel;

    // --- Achievements / Badges ---
    const badgesEl = document.getElementById('stats-badges-grid');
    const badges = s.badges;

    badgesEl.innerHTML = badges.map(b => {
        const isUnseen = b.earned && localStorage.getItem(`birdfinder_unseen_badge_${b.name}`) === 'true';
        return `
        <div class="stats-badge ${b.earned ? 'earned' : 'locked'} ${isUnseen ? 'unseen-highlight' : ''}" data-badge-name="${b.name}">
            ${b.earned ? '<div class="stats-badge-earned-glow"></div>' : ''}
            <span class="stats-badge-icon">${b.icon}</span>
            <div class="stats-badge-name">${b.name}</div>
            <div class="stats-badge-desc">${b.desc}</div>
        </div>
    `}).join('');

    // Add click listeners to remove highlight from unseen badges
    const unseenBadges = badgesEl.querySelectorAll('.unseen-highlight');
    unseenBadges.forEach(el => {
        el.style.cursor = 'pointer';
        el.addEventListener('click', () => {
            const badgeName = el.dataset.badgeName;
            localStorage.removeItem(`birdfinder_unseen_badge_${badgeName}`);
            el.classList.remove('unseen-highlight');
            el.style.cursor = '';
        });
    });

    // --- Time & Location ---
    const timeEl = document.getElementById('stats-time-body');
    timeEl.innerHTML = `
        ${row('📍 Favoritplats', s.topLocation ? `${s.topLocation[0]} (${s.topLocation[1]}×)` : '—', 'highlight')}
        ${row('🌸 Bästa månad', s.bestMonth || '—')}
        ${row('📅 Aktiva år', s.yearCount === 0 ? '—' : s.yearCount + ' år')}
        ${row('🗓 Första observation', s.firstDate ? new Date(s.firstDate).toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' }) : '—')}
        ${row('📋 Totala observationer', s.totalSightings)}
    `;

    // --- Rarity breakdown ---
    const rarityEl = document.getElementById('stats-rarity-body');
    const maxRarityCount = Math.max(1, ...s.rarityBreakdown);
    const totalLogged = s.loggedBirds.length;
    rarityEl.innerHTML = `
        ${row('🏅 Totalt sällsynthetsscore', s.rarityScore + ' poäng', 'rarity-score')}
        <div class="rarity-breakdown">
            ${s.rarityNames.map((name, i) => {
        const cnt = s.rarityBreakdown[i];
        const w = Math.round((cnt / maxRarityCount) * 100);
        return `<div class="rarity-bar-row">
                    <span class="rarity-bar-label">${name}</span>
                    <div class="rarity-bar-wrap">
                        <div class="rarity-bar-fill" style="width:${w}%; background:${s.rarityColors[i]}"></div>
                    </div>
                    <span class="rarity-bar-count">${cnt}</span>
                </div>`;
    }).join('')}
        </div>
        ${totalLogged > 0 ? row('📊 Snittpoäng / art', (s.rarityScore / totalLogged).toFixed(1)) : ''}
    `;
}

// --- Photographers View ---
function _renderPhotographersView() {
    const grid = document.getElementById('photographers-grid');
    const detail = document.getElementById('photographer-detail');
    if (!grid || !detail) return;
    
    grid.style.display = 'grid';
    detail.style.display = 'none';
    grid.innerHTML = '';
    
    if (window.photographers) {
        Object.values(window.photographers).forEach(photographer => {
            const card = document.createElement('div');
            card.className = 'photographer-card';
            card.onclick = () => _showPhotographer(photographer.id);
            
            card.innerHTML = `
                <img src="${photographer.image}" alt="${photographer.name}" class="photographer-avatar">
                <h3>${photographer.name}</h3>
                <p>${photographer.description}</p>
            `;
            grid.appendChild(card);
        });
    }
}

function _showPhotographer(id, returnAction = null) {
    if (!window.photographers || !window.photographers[id]) return;
    
    // Switch to tab if not already there
    const btn = document.querySelector('.nav-btn[data-tab="photographers-view"]');
    if (btn && !btn.classList.contains('active')) {
        btn.click();
    }
    
    const photographer = window.photographers[id];
    
    const grid = document.getElementById('photographers-grid');
    const detail = document.getElementById('photographer-detail');
    const nameEl = document.getElementById('photographer-name-detail');
    const descEl = document.getElementById('photographer-desc-detail');
    const imgEl = document.getElementById('photographer-profile-photo');
    const donateBtn = document.getElementById('photographer-donate-btn');
    const gallery = document.getElementById('photographer-gallery');
    
    grid.style.display = 'none';
    detail.style.display = 'block';
    detail.classList.remove('hidden'); // fail-safe if hidden class was used originally
    
    nameEl.textContent = photographer.name;
    descEl.textContent = photographer.description;
    imgEl.src = photographer.image;
    donateBtn.href = photographer.donationLink;
    
    // Back button
    const backBtn = document.getElementById('back-to-photographers');
    backBtn.onclick = () => {
        if (returnAction) {
            returnAction();
        } else {
            detail.style.display = 'none';
            grid.style.display = 'grid';
        }
    };
    
    // Find all images by this photographer in bird_images.js
    let allImages = [];
    if (window.birdImages) {
        Object.keys(window.birdImages).forEach(birdId => {
            const arr = window.birdImages[birdId];
            arr.forEach(item => {
                if (typeof item === 'object' && item.photographer === id) {
                    allImages.push({ src: item.src, birdId: birdId });
                }
            });
        });
    }
    
    gallery.innerHTML = '';
    allImages.forEach(img => {
        const imgEl = document.createElement('img');
        imgEl.className = 'photographer-gallery-item';
        imgEl.src = img.src;
        imgEl.title = 'Klicka för att visa i guiden';
        
        // When clicking an image in the gallery, switch to the bird guide for that subject
        imgEl.onclick = () => {
            const allData = [
                ...(window.swedishBirds || []),
                ...(window.swedishTrees || []),
                ...(window.swedishFish || []),
                ...(window.swedishAnimals || []),
                ...(window.swedishFungi || []),
                ...(window.swedishFlowers || [])
            ];
            const subject = allData.find(d => d.id === img.birdId);
            if (subject) {
                let subjectType = 'birds';
                if (window.swedishTrees && window.swedishTrees.some(t => t.id === subject.id)) subjectType = 'trees';
                else if (window.swedishFish && window.swedishFish.some(f => f.id === subject.id)) subjectType = 'fish';
                else if (window.swedishAnimals && window.swedishAnimals.some(a => a.id === subject.id)) subjectType = 'animals';
                else if (window.swedishFungi && window.swedishFungi.some(f => f.id === subject.id)) subjectType = 'fungi';
                else if (window.swedishFlowers && window.swedishFlowers.some(f => f.id === subject.id)) subjectType = 'flowers';
                
                if (state.currentSubject !== subjectType) {
                    switchSubject(subjectType);
                }
                
                const guideBtn = document.querySelector('.nav-btn[data-tab="guide-view"]');
                if (guideBtn) guideBtn.click();
                
                _renderBirdDetail(subject);
                elements.detailModal.classList.add('active');
            }
        };
        
        gallery.appendChild(imgEl);
    });
}


// ============================================================

// --- Sightings Overview Map ---
let _overviewMap = null;

function _openSightingsMap() {
    const modal = document.getElementById('sightings-map-modal');
    if (!modal) return;
    modal.classList.add('active');
    
    // Automatically make it large (fullscreen) as requested
    const content = modal.querySelector('.sightings-map-modal-content');
    if (content) content.classList.add('fullscreen');

    setTimeout(() => {
        _renderSightingsOverviewMap();
    }, 200);
}

function _renderSightingsOverviewMap() {
    const container = document.getElementById('sightings-overview-map');
    if (!container) return;

    // Destroy previous
    if (_overviewMap) {
        _overviewMap.remove();
        _overviewMap = null;
    }

    _overviewMap = L.map('sightings-overview-map', {
        zoomControl: true,
        attributionControl: false
    }).setView([62.0, 15.5], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18
    }).addTo(_overviewMap);

    // Collect ALL sightings with coordinates (across all subjects)
    const allSpecies = [
        ...(window.swedishBirds || []),
        ...(window.swedishTrees || []),
        ...(window.swedishFish || []),
        ...(window.swedishAnimals || []),
        ...(window.swedishFungi || []),
        ...(window.swedishFlowers || [])
    ];

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
            div.innerHTML = '<strong>Inga observationer med platsdata \u00e4n.</strong><br>Placera en n\u00e5l n\u00e4r du skapar en ny observation!';
            return div;
        };
        info.addTo(_overviewMap);
        return;
    }

    const bounds = [];

    geoSightings.forEach(s => {
        const item = allSpecies.find(sp => sp.id === s.birdId);
        if (!item) return;

        const obj = (window.swedishFungi || []).find(f => f.id === item.id);
        const imgSrc = (obj && obj.image) || getBirdImageSrc(item.id);
        const popupContent = `
            <div class="sighting-popup-square" data-bird-id="${item.id}" data-sighting-id="${s.id}">
                <img src="${imgSrc}" alt="${item.nameSv}" class="sighting-popup-img-square" data-bird-id="${item.id}" onerror="this.style.display='none'">
                <div class="sighting-popup-overlay">
                    <span class="sighting-popup-label">${item.nameSv}</span>
                </div>
            </div>
        `;

        const marker = L.marker([s.lat, s.lng]).addTo(_overviewMap);
        marker.bindPopup(popupContent, { maxWidth: 160, minWidth: 120, className: 'square-popup', closeButton: false });

        // On popup open, wire up click to detail
        marker.on('popupopen', () => {
            const popupEl = marker.getPopup().getElement();
            if (popupEl) {
                const imgEl = popupEl.querySelector('.sighting-popup-square');
                if (imgEl) {
                    imgEl.style.cursor = 'pointer';
                    imgEl.onclick = () => {
                        // Close map modal
                        const modal = document.getElementById('sightings-map-modal');
                        if (modal) modal.classList.remove('active');
                        modal.querySelector('.sightings-map-modal-content').classList.remove('fullscreen');

                        // Find the species and determine subject type
                        const allData = [
                            ...(window.swedishBirds || []), ...(window.swedishTrees || []),
                            ...(window.swedishFish || []), ...(window.swedishAnimals || []),
                            ...(window.swedishFungi || []), ...(window.swedishFlowers || [])
                        ];
                        const subject = allData.find(d => d.id === item.id);
                        if (subject) {
                            let subjectType = 'birds';
                            if (window.swedishTrees && window.swedishTrees.some(t => t.id === subject.id)) subjectType = 'trees';
                            else if (window.swedishFish && window.swedishFish.some(f => f.id === subject.id)) subjectType = 'fish';
                            else if (window.swedishAnimals && window.swedishAnimals.some(a => a.id === subject.id)) subjectType = 'animals';
                            else if (window.swedishFungi && window.swedishFungi.some(f => f.id === subject.id)) subjectType = 'fungi';
                            else if (window.swedishFlowers && window.swedishFlowers.some(f => f.id === subject.id)) subjectType = 'flowers';

                            if (state.currentSubject !== subjectType) switchSubject(subjectType);

                            // Find the sighting to pass to detail
                            const sighting = state.sightings.find(si => si.id === s.id);
                            openBirdDetail(subject, sighting || null);
                        }
                    };
                }
            }
        });

        bounds.push([s.lat, s.lng]);
    });

    // Fit bounds if we have markers
    if (bounds.length > 0) {
        _overviewMap.fitBounds(bounds, { padding: [30, 30], maxZoom: 12 });
    }
}

// Wire up map button and close button after DOM loads
function _setupMapEventListeners() {
    const mapBtn = document.getElementById('show-sightings-map-btn');
    if (mapBtn) {
        mapBtn.addEventListener('click', _openSightingsMap);
    }

    const closeMapBtn = document.getElementById('close-sightings-map');
    if (closeMapBtn) {
        closeMapBtn.addEventListener('click', () => {
            const modal = document.getElementById('sightings-map-modal');
            if (modal) modal.classList.remove('active');
            // Reset fullscreen
            const content = modal.querySelector('.sightings-map-modal-content');
            if (content) content.classList.remove('fullscreen');
        });
    }

    // Fullscreen toggle
    const expandBtn = document.getElementById('expand-sightings-map');
    if (expandBtn) {
        expandBtn.addEventListener('click', () => {
            const content = document.querySelector('.sightings-map-modal-content');
            if (!content) return;
            content.classList.toggle('fullscreen');

            // Toggle icon
            const icon = expandBtn.querySelector('i');
            if (content.classList.contains('fullscreen')) {
                icon.className = 'fa-solid fa-compress';
                expandBtn.title = 'F\u00f6rminska kartan';
            } else {
                icon.className = 'fa-solid fa-expand';
                expandBtn.title = 'F\u00f6rstora kartan';
            }

            // Leaflet needs size invalidation after resize
            if (_overviewMap) {
                setTimeout(() => _overviewMap.invalidateSize(), 200);
            }
        });
    }

    // Compact view toggle
    const compactBtn = document.getElementById('compact-view-toggle');
    if (compactBtn) {
        // Restore saved preference
        const saved = localStorage.getItem('birdfinder_compact_view');
        if (saved === 'true') {
            document.getElementById('sightings-list').classList.add('compact');
            compactBtn.classList.add('active');
            compactBtn.querySelector('i').className = 'fa-solid fa-list';
        }

        compactBtn.addEventListener('click', () => {
            const grid = document.getElementById('sightings-list');
            grid.classList.toggle('compact');
            const isCompact = grid.classList.contains('compact');

            compactBtn.classList.toggle('active', isCompact);
            const icon = compactBtn.querySelector('i');
            icon.className = isCompact ? 'fa-solid fa-list' : 'fa-solid fa-grip';

            localStorage.setItem('birdfinder_compact_view', isCompact);
        });
    }
}

// Extend init to include map event listeners
const _originalInit = init;
init = async function() {
    await _originalInit();
    _setupMapEventListeners();
};

// Start
document.addEventListener('DOMContentLoaded', init);
