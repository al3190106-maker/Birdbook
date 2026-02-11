// --- Configuration & State ---
const state = {
    sightings: [],
    yearFilter: new Date().getFullYear(),
    view: 'log-view', // 'log-view' or 'guide-view'
    activeCategory: null,
    guideSearchTerm: '',
    currentUser: 'Theia', // 'Theia' or 'Alexander'
    sortBy: 'date', // date, name, wingspan, eggs, rarity
    guideSortBy: 'name' // name, wingspan, eggs, weight, rarity
};

const STORAGE_KEY = 'birdfinder_sightings';

// --- DOM Elements ---
const elements = {
    totalSightings: document.getElementById('total-sightings'),
    uniqueSpecies: document.getElementById('unique-species'),
    addSightingBtn: document.getElementById('add-sighting-btn'),
    modal: document.getElementById('sighting-modal'),
    closeModal: document.getElementById('close-modal'),
    form: document.getElementById('sighting-form'),
    yearSelect: document.getElementById('year-select'),
    currentYearDisplay: document.getElementById('current-year-display'),
    sightingsList: document.getElementById('sightings-list'),
    guideList: document.getElementById('guide-list'),
    birdSearchInput: document.getElementById('bird-search-input'),
    autocompleteList: document.getElementById('autocomplete-list'),
    selectedBirdId: document.getElementById('selected-bird-id'),
    navBtns: document.querySelectorAll('.nav-btn'),
    userBtns: document.querySelectorAll('.user-btn'),
    viewSections: document.querySelectorAll('.view-section'),
    guideSearch: document.getElementById('guide-search'),
    customImageInput: document.getElementById('custom-image-upload'),
    resetBtn: document.getElementById('reset-app-btn'),
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
    detailHeroImg: document.getElementById('detail-hero-img'),
    detailNameSv: document.getElementById('detail-name-sv'),
    detailNameScEn: document.getElementById('detail-name-sc-en'),
    detailRarity: document.getElementById('detail-rarity'),
    detailColor: document.getElementById('detail-color'),
    detailWeight: document.getElementById('detail-weight'),
    detailSeasonText: document.getElementById('detail-season-text'),

    detailWingspan: document.getElementById('detail-wingspan'),
    detailEggs: document.getElementById('detail-eggs'),
    detailFunFact: document.getElementById('detail-fun-fact'),
    detailObsCount: document.getElementById('detail-obs-count'),
    detailArtportalenLink: document.getElementById('detail-artportalen-link'),
    detailAddSightingBtn: document.getElementById('detail-add-sighting-btn'),
    detailQuickAddBtn: document.getElementById('detail-quick-add-btn'),
    sortSelect: document.getElementById('sort-select'),
    guideSortSelect: document.getElementById('guide-sort-select'),
    logoHome: document.getElementById('app-logo-home')
};

let editingBirdId = null;

// --- Initialization ---
function init() {
    console.log('App Initializing...');

    // Check for data dependency
    if (!window.swedishBirds) {
        console.error('Bird data not loaded!');
        alert('Fel: Datafil saknas. Vänligen ladda om sidan.');
        return;
    }

    // Load Data
    loadSightings();

    // Setup Year Filter
    setupYearFilter();

    // Initial Render
    renderApp();
    renderApp();
    renderGuideCategories(); // Change: Start with categories

    // Event Listeners
    setupEventListeners();

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
function loadSightings() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            state.sightings = JSON.parse(stored);
        }
    } catch (e) {
        console.error('Data corruption detected', e);
        localStorage.removeItem(STORAGE_KEY);
        state.sightings = [];
    }
}

function saveSightings() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.sightings));
    renderApp();
}

// --- Rendering ---
function renderApp() {
    // 1. Apply Filters
    const filteredSightings = getFilteredSightings();

    // 2. Update Stats (Exclude Ghost)
    const validSightings = filteredSightings.filter(s => s.id !== 'SYSTEM_INIT_BIRD');

    elements.totalSightings.textContent = validSightings.length;
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

    if (sightings.length === 0) {
        elements.sightingsList.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-binoculars"></i>
                <p>Inga fåglar sedda än under <span class="highlight">${state.yearFilter === 'all' ? 'totalen' : state.yearFilter}</span>.</p>
                <button onclick="elements.addSightingBtn.click()" style="margin-top:1rem; padding:0.5rem 1rem; cursor:pointer;">Lägg till din första observation!</button>
            </div>
        `;
        return;
    }

    // Sort by Date Descending
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
        const birdA = window.swedishBirds.find(x => x.id === a.latestSighting.birdId);
        const birdB = window.swedishBirds.find(x => x.id === b.latestSighting.birdId);

        if (!birdA || !birdB) return 0;

        switch (state.sortBy) {
            case 'name':
                return birdA.nameSv.localeCompare(birdB.nameSv);
            case 'wingspan':
                return (birdB.wingspan || 0) - (birdA.wingspan || 0); // Descending
            case 'eggs':
                return (birdB.eggs || 0) - (birdA.eggs || 0); // Descending
            case 'rarity':
                return (birdB.rarity || 0) - (birdA.rarity || 0); // Descending (Rarest first)
            case 'date':
            default:
                // Default to date descending
                return new Date(b.latestSighting.date) - new Date(a.latestSighting.date);
        }
    });

    groups.forEach(group => {
        const sighting = group.latestSighting;
        const bird = window.swedishBirds.find(b => b.id === sighting.birdId);

        if (!bird) return; // Skip if bird data invalid

        const card = document.createElement('div');
        card.className = 'bird-card';

        // Image Logic
        const imgSource = sighting.photo || getBirdImageSrc(bird.id);

        card.innerHTML = `
            <div class="bird-image-container">
                <img src="${imgSource}" alt="${bird.nameEn}" data-bird-id="${bird.id}" loading="lazy" onerror="handleImageError(this)">
                ${group.count > 1 ? `<div class="sighting-count-badge">+${group.count - 1} till</div>` : ''}
                <button class="instant-add-btn" onclick="quickAddSighting('${bird.id}')" title="Lägg till +1 direkt">
                    +
                </button>
                <button class="delete-sighting-btn" onclick="deleteSighting('${sighting.id}')" title="Ta bort logg">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
            <div class="bird-info">
                <div class="bird-primary-name">${bird.nameSv}</div>
                <div class="bird-secondary-name">${bird.nameEn}</div>
                <div class="bird-scientific">${bird.scientific}</div>
                
                <div class="sighting-details">
                    <div class="detail-row"><i class="fa-regular fa-calendar"></i> ${sighting.date}</div>
                    <div class="detail-row"><i class="fa-solid fa-map-pin"></i> ${sighting.location || 'Okänd plats'}</div>
                    ${sighting.notes ? `<div class="notes-text">"${sighting.notes}"</div>` : ''}
                </div>
            </div>
            </div>
        `;

        // Add Click Listener
        card.addEventListener('click', (e) => {
            // Avoid buttons
            if (e.target.closest('button')) return;
            openBirdDetail(bird);
        });

        // Add pointer cursor style
        card.style.cursor = 'pointer';

        elements.sightingsList.appendChild(card);
    });
}

function renderGuideList(birdList) {
    if (!birdList) return;

    // Sort before rendering
    birdList.sort((a, b) => {
        switch (state.guideSortBy) {
            case 'name': return a.nameSv.localeCompare(b.nameSv);
            case 'wingspan': return (b.wingspan || 0) - (a.wingspan || 0);
            case 'eggs': return (b.eggs || 0) - (a.eggs || 0);
            case 'weight': return (b.weight || 0) - (a.weight || 0);
            case 'rarity': return (b.rarity || 0) - (a.rarity || 0);
            default: return 0;
        }
    });

    elements.guideList.innerHTML = '';

    birdList.forEach(bird => {
        const card = document.createElement('div');
        card.className = 'bird-card';
        // Make the whole card clickable for details
        card.style.cursor = 'pointer';

        const imgSource = getBirdImageSrc(bird.id);

        card.innerHTML = `
            <div class="bird-image-container">
                <img src="${imgSource}" alt="${bird.nameEn}" data-bird-id="${bird.id}" loading="lazy" onerror="handleImageError(this)">
                <button class="edit-image-btn" id="edit-btn-${bird.id}" title="Ändra bild">
                    <i class="fa-solid fa-camera"></i>
                </button>
                <button class="quick-add-btn" id="quick-add-${bird.id}" title="Lägg till observation">
                    <i class="fa-solid fa-plus"></i>
                </button>
            </div>
            <div class="bird-info">
                 <div class="bird-primary-name">${bird.nameSv}</div>
                <div class="bird-secondary-name">${bird.nameEn}</div>
                <div class="bird-scientific">${bird.scientific}</div>
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
                // Open sighting modal pre-filled with this bird
                elements.form.reset();
                document.getElementById('sighting-date').valueAsDate = new Date();
                elements.imagePreviewContainer.innerHTML = '';
                elements.selectedBirdId.value = bird.id;
                elements.birdSearchInput.value = bird.nameSv;
                elements.modal.classList.add('active');
            });
        }

        elements.guideList.appendChild(card);
    });
}

function renderGuideCategories() {
    // 1. Group birds by type
    const categories = {};
    window.swedishBirds.forEach(bird => {
        const type = bird.type || 'Övriga';
        if (!categories[type]) {
            categories[type] = {
                name: type,
                count: 0,
                // Assign icon based on type name
                icon: getCategoryIcon(type)
            };
        }
        categories[type].count++;
    });

    // 2. Clear & Render
    elements.guideCategories.innerHTML = '';
    const sortedCategories = Object.values(categories).sort((a, b) => a.name.localeCompare(b.name));

    // "All" Category
    const allCard = createCategoryCard({ name: 'Alla Fåglar', count: window.swedishBirds.length, icon: 'fa-crow' });
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
    div.innerHTML = `
        <i class="fa-solid ${cat.icon} category-icon"></i>
        <div class="category-name">${cat.name}</div>
        <div class="category-count">${cat.count} arter</div>
    `;
    return div;
}

function selectCategory(categoryName) {
    state.activeCategory = categoryName;

    // Filter Logic
    let filtered = window.swedishBirds;
    if (categoryName) {
        filtered = filtered.filter(b => b.type === categoryName);
        elements.currentCategoryTitle.textContent = categoryName;
    } else {
        elements.currentCategoryTitle.textContent = 'Alla Fåglar';
    }

    // Sort alphabetically
    filtered.sort((a, b) => a.nameSv.localeCompare(b.nameSv));

    renderGuideList(filtered);

    // Toggle Views
    elements.guideCategories.classList.add('hidden');
    elements.guideNavigation.classList.remove('hidden');
    elements.guideList.classList.remove('hidden');

    // Reset search when entering a category to avoid confusion
    elements.guideSearch.value = '';
}

function getCategoryIcon(type) {
    const map = {
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
        'Övriga': 'fa-kiwi-bird'
    };
    return map[type] || 'fa-dove';
}

function openBirdDetail(bird) {
    // Populate Modal
    if (elements.detailHeroImg) {
        elements.detailHeroImg.dataset.birdId = bird.id;
        elements.detailHeroImg.onerror = function () { handleImageError(this); };
        elements.detailHeroImg.src = getBirdImageSrc(bird.id);
    }
    if (elements.detailNameSv) elements.detailNameSv.textContent = bird.nameSv;
    if (elements.detailNameScEn) elements.detailNameScEn.textContent = `${bird.scientific} (${bird.nameEn})`;


    // Rarity Stars
    // Rarity Stars
    const rarity = bird.rarity || 3;
    let stars = '';
    for (let i = 0; i < 5; i++) {
        stars += i < rarity ? '<i class="fa-solid fa-star"></i>' : '<i class="fa-regular fa-star"></i>';
    }
    if (elements.detailRarity) elements.detailRarity.innerHTML = stars;


    // Season & Map
    // Season & Map
    if (elements.detailSeasonText) elements.detailSeasonText.textContent = bird.seasonDistribution || 'Hela året';

    // Wingspan & Eggs
    if (elements.detailWingspan) elements.detailWingspan.textContent = (bird.wingspan ? bird.wingspan + ' cm' : 'Okänt');
    if (elements.detailEggs) elements.detailEggs.textContent = (bird.eggs ? bird.eggs + ' st' : 'Okänt');

    // Weight & Color
    if (elements.detailWeight) elements.detailWeight.textContent = (bird.weight ? bird.weight + ' g' : 'Okänt');
    if (elements.detailColor) elements.detailColor.textContent = (bird.color || 'Blandad');

    // Fun Fact
    // Fun Fact
    if (elements.detailFunFact) elements.detailFunFact.textContent = bird.funFact || 'Ingen information tillgänglig än.';


    // Artportalen Link
    // Use the search link as requested
    // Try to construct a search URL if possible, otherwise generic
    const searchUrl = `https://www.artportalen.se/ViewSighting/SearchSighting`;
    if (elements.detailArtportalenLink) elements.detailArtportalenLink.href = searchUrl;
    if (elements.detailObsCount) elements.detailObsCount.textContent = `Sök efter "${bird.nameSv}" för att se årets observationer`;


    // Detail Actions
    if (elements.detailAddSightingBtn) {
        elements.detailAddSightingBtn.dataset.birdId = bird.id;
    }

    // Show Modal
    elements.detailModal.classList.add('active');
}

// Add Sighting from Detail View
if (elements.detailAddSightingBtn) {
    elements.detailAddSightingBtn.addEventListener('click', () => {
        const birdId = elements.detailAddSightingBtn.dataset.birdId;
        const bird = window.swedishBirds.find(b => b.id === birdId);

        if (!bird) return;

        // Close Detail Modal
        elements.detailModal.classList.remove('active');

        // Open Sighting Modal (simulating click resets form generally, but we want to prefill)
        elements.addSightingBtn.click();

        // Pre-fill
        setTimeout(() => {
            elements.birdSearchInput.value = bird.nameSv;
            elements.selectedBirdId.value = bird.id;
            // Trigger input event to simulate search but we already set the ID so autocomplete not strictly needed
        }, 50); // Small delay to allow modal open and form reset
    });
}

// Quick Add from Detail View
if (elements.detailQuickAddBtn) {
    elements.detailQuickAddBtn.addEventListener('click', () => {
        const birdId = elements.detailAddSightingBtn.dataset.birdId; // Borrow ID from main btn
        if (birdId) {
            window.quickAddSighting(birdId);
            elements.detailModal.classList.remove('active');
        }
    });
}

// Close Detail Modal
if (elements.closeDetailModal) {
    elements.closeDetailModal.addEventListener('click', () => {
        elements.detailModal.classList.remove('active');
    });

    // Close on outside click
    elements.detailModal.addEventListener('click', (e) => {
        if (e.target === elements.detailModal) {
            elements.detailModal.classList.remove('active');
        }
    });
}

// --- Helpers ---
function getFilteredSightings() {
    let list = state.sightings;

    // 1. Filter by User
    // defaults to 'Theia' if user is missing (legacy data)
    list = list.filter(s => (s.user || 'Theia') === state.currentUser);

    // 2. Filter by Year
    if (state.yearFilter !== 'all') {
        list = list.filter(s => new Date(s.date).getFullYear() === state.yearFilter);
    }
    return list;
}

// --- Holder Image System ---
// Color palettes and silhouettes per bird category for beautiful placeholders.
// To replace a placeholder: simply drop a .jpg file named {bird_id}.jpg into the images/ folder.
const CATEGORY_THEMES = {
    'Andfåglar': { bg: ['#0e4a6e', '#1a7ab5'], accent: '#5ec6e8', icon: '🦆', label: 'Andfåglar' },
    'Hönsfåglar': { bg: ['#5c3d1e', '#8b6914'], accent: '#d4a843', icon: '🐔', label: 'Hönsfåglar' },
    'Lommar & Doppingar': { bg: ['#0d3b4f', '#1a6b7a'], accent: '#4ec9d4', icon: '🌊', label: 'Dykare' },
    'Hägrar': { bg: ['#2d4a3e', '#3d7a5e'], accent: '#7acfa0', icon: '🪿', label: 'Hägrar' },
    'Rovfåglar': { bg: ['#5a2d0c', '#8b4513'], accent: '#e8a03e', icon: '🦅', label: 'Rovfåglar' },
    'Tranor & Rallar': { bg: ['#3a4a2e', '#5a7a3e'], accent: '#9acd5e', icon: '🦩', label: 'Tranor' },
    'Vadare': { bg: ['#4a3a2e', '#7a6a4e'], accent: '#c4b48e', icon: '🦤', label: 'Vadare' },
    'Måsar & Tärnor': { bg: ['#3a5a7a', '#5a8aaa'], accent: '#b0d8f0', icon: '🕊️', label: 'Måsar' },
    'Alkfåglar': { bg: ['#1a2a3a', '#2a4a5a'], accent: '#6aafcf', icon: '🐧', label: 'Alkfåglar' },
    'Hackspettar': { bg: ['#3a1a1a', '#6a2a2a'], accent: '#e05050', icon: '🪶', label: 'Hackspettar' },
    'Ugglor': { bg: ['#2a1a3a', '#4a2a5a'], accent: '#b080d0', icon: '🦉', label: 'Ugglor' },
    'Duvor': { bg: ['#4a4a5a', '#6a6a7a'], accent: '#b0b0d0', icon: '🕊️', label: 'Duvor' },
    'Sångare': { bg: ['#1a4a2a', '#2a7a3a'], accent: '#6ad06a', icon: '🎵', label: 'Sångare' },
    'Trastar': { bg: ['#3a2a1a', '#6a4a2a'], accent: '#c08a4a', icon: '🐦', label: 'Trastar' },
    'Mesar': { bg: ['#1a3a4a', '#2a6a7a'], accent: '#5ac0e0', icon: '🐤', label: 'Mesar' },
    'Finkar': { bg: ['#4a2a1a', '#7a4a2a'], accent: '#e0904a', icon: '🎶', label: 'Finkar' },
    'Sparvar': { bg: ['#4a3a1a', '#7a6a2a'], accent: '#d0c04a', icon: '🐦', label: 'Sparvar' },
    'Kråkfåglar': { bg: ['#1a1a2a', '#2a2a3a'], accent: '#7070a0', icon: '🐦‍⬛', label: 'Kråkfåglar' },
    'Svalor': { bg: ['#2a4a6a', '#3a6a8a'], accent: '#70b0e0', icon: '💨', label: 'Svalor' },
    'Övriga': { bg: ['#2a3a2a', '#4a6a4a'], accent: '#80c080', icon: '🐦', label: 'Övriga' }
};

function generateHolderSvg(birdId) {
    const bird = window.swedishBirds.find(b => b.id === birdId);
    if (!bird) return 'https://placehold.co/400x300?text=Okänd+fågel';

    const theme = CATEGORY_THEMES[bird.type] || CATEGORY_THEMES['Övriga'];
    const nameDisplay = bird.nameSv;
    const sciName = bird.scientific;

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
    const years = new Set([currentYear]);

    state.sightings.forEach(s => {
        const sUser = s.user || 'Theia';
        if (s.id !== 'SYSTEM_INIT_BIRD' && sUser === state.currentUser) {
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
        user: state.currentUser,
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

// 1. Reset App
if (elements.resetBtn) {
    elements.resetBtn.addEventListener('click', () => {
        if (confirm('VARNING: Detta kommer att radera ALLA dina observationer och egna bilder. Är du säker?')) {
            localStorage.clear();
            location.reload();
        }
    });
}

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

// 2. View Switching
elements.navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // UI Toggle
        elements.navBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        elements.viewSections.forEach(s => s.classList.remove('active'));
        document.getElementById(btn.dataset.tab).classList.add('active');

        state.view = btn.dataset.tab;

        // Initialize Sweden map on first visit
        if (btn.dataset.tab === 'sweden-view' && typeof renderSwedenMap === 'function') {
            const mapRoot = document.getElementById('sweden-map-root');
            if (mapRoot && !mapRoot.dataset.initialized) {
                renderSwedenMap('sweden-map-root');
                mapRoot.dataset.initialized = 'true';
            }
        }
    });
});

// 2b. User Switching
elements.userBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const newUser = btn.dataset.user;
        if (state.currentUser === newUser) return;

        state.currentUser = newUser;

        // Update UI
        elements.userBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Reset filters for new user
        state.yearFilter = new Date().getFullYear(); // Default to current year or all?
        // Check if there are sightings for this year, otherwise maybe 'all'

        setupYearFilter();
        renderApp();
    });
});

// 3. Modal Controls
elements.addSightingBtn.addEventListener('click', () => {
    elements.form.reset();
    document.getElementById('sighting-date').valueAsDate = new Date();
    elements.imagePreviewContainer.innerHTML = '';
    elements.selectedBirdId.value = '';
    elements.modal.classList.add('active');
});

elements.closeModal.addEventListener('click', () => {
    elements.modal.classList.remove('active');
});

// 4. Autocomplete
elements.birdSearchInput.addEventListener('input', function () {
    const val = this.value.toLowerCase();
    elements.autocompleteList.innerHTML = '';
    if (!val) return;

    window.swedishBirds.forEach(bird => {
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
elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!elements.selectedBirdId.value) {
        alert('Vänligen välj en fågel från listan!');
        return;
    }

    const newSighting = {
        id: Date.now().toString(),
        birdId: elements.selectedBirdId.value,
        date: document.getElementById('sighting-date').value,
        location: document.getElementById('sighting-location').value,
        notes: document.getElementById('sighting-notes').value,
        user: state.currentUser,
        photo: null
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
        elements.modal.classList.remove('active');
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
                renderGuideList(window.swedishBirds); // Refresh guide too
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

        const filtered = window.swedishBirds.filter(b =>
            b.nameEn.toLowerCase().includes(term) ||
            b.nameSv.toLowerCase().includes(term) ||
            (b.type && b.type.toLowerCase().includes(term)) ||
            (b.wingspan && b.wingspan.toString().includes(term)) ||
            (b.eggs && b.eggs.toString().includes(term)) ||
            (b.weight && b.weight.toString().includes(term)) ||
            (b.color && b.color.toLowerCase().includes(term))
        );
        renderGuideList(filtered);
    } else {
        // Empty search -> go back to categories
        renderGuideCategories();
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

// Start
document.addEventListener('DOMContentLoaded', init);
