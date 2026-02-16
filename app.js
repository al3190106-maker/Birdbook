// --- Configuration & State ---
// --- Configuration & State ---
const state = {
    sightings: [],
    yearFilter: new Date().getFullYear(),
    view: 'log-view',
    activeCategory: null,
    guideSearchTerm: '',
    currentUser: 'Theia',
    sortBy: 'date',
    guideSortBy: 'name',
    quizMode: null,
    quizQuestions: [],
    quizCurrent: 0,
    quizScore: 0,
    quizAnswered: false,
    timeFilter: 'all',
    currentSubject: 'birds' // Replaces appMode
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
            detailBestTimeLabel: 'På Dagen',
            emptyLog: 'Inga fåglar sedda än under',
            addFirst: 'Logga din första fågel'
        },
        fields: {
            size: { key: 'wingspan', label: 'Vingspann', unit: 'cm' },
            weight: { key: 'weight', label: 'Vikt', unit: 'g', hidden: false },
            lifespan: { key: 'eggs', label: 'Antal ägg', unit: 'st', hidden: false }
        }
    },
    trees: {
        id: 'trees',
        name: 'Träboken',
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
            addFirst: 'Logga ditt första träd'
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
            addFirst: 'Logga din första fisk'
        },
        fields: {
            size: { key: 'length', label: 'Längd', unit: 'cm' },
            weight: { key: 'weight', label: 'Vikt', unit: 'kg', hidden: false },
            lifespan: { key: 'lifespan', label: 'Livslängd', unit: 'år', hidden: false }
        }
    },
    animals: {
        id: 'animals',
        name: 'Viltboken',
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
            addFirst: 'Logga ditt första djur'
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
            addFirst: 'Logga din första svamp'
        },
        fields: {
            size: { key: 'size', label: 'Hattbredd', unit: 'cm' },
            weight: { key: 'edibility', label: 'Ätlighet', unit: '', hidden: false },
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
    'Lövträd': { bg: ['#4caf50', '#8bc34a'], accent: '#cddc39', icon: '🍃' },
    'Barrträd': { bg: ['#1b5e20', '#2e7d32'], accent: '#4caf50', icon: '🌲' },
    'Ädla lövträd': { bg: ['#3e2723', '#5d4037'], accent: '#8d6e63', icon: '🌳' },
    'Buskar': { bg: ['#558b2f', '#7cb342'], accent: '#aed581', icon: '🌿' },
    // Generic Themes
    'Fisk': { bg: ['#0288d1', '#03a9f4'], accent: '#b3e5fc', icon: '🐟' },
    'Djur': { bg: ['#795548', '#8d6e63'], accent: '#d7ccc8', icon: '🐾' },
    'Svamp': { bg: ['#e64a19', '#ff5722'], accent: '#ffccbc', icon: '🍄' }
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
    detailBestTime: document.getElementById('detail-best-time'),

    detailWingspan: document.getElementById('detail-wingspan'),
    detailEggs: document.getElementById('detail-eggs'),
    detailFunFact: document.getElementById('detail-fun-fact'),
    detailObsCount: document.getElementById('detail-obs-count'),
    detailArtportalenLink: document.getElementById('detail-artportalen-link'),
    detailAddSightingBtn: document.getElementById('detail-add-sighting-btn'),
    detailQuickAddBtn: document.getElementById('detail-quick-add-btn'),
    sortSelect: document.getElementById('sort-select'),
    guideSortSelect: document.getElementById('guide-sort-select'),
    timeFilterContainer: document.getElementById('time-filter-container'),
    timeFilterBtns: document.querySelectorAll('.time-filter-btn'),
    logoHome: document.getElementById('app-logo-home')
};

let editingBirdId = null;
let currentRecordingBase64 = null;
let mediaRecorder = null;
let audioChunks = [];
let recordingTimerInterval = null;

// --- History State Handler ---
window.addEventListener('popstate', (event) => {
    // 1. Close all modals visually first
    elements.modal.classList.remove('active');
    elements.detailModal.classList.remove('active');

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

function _showSightingModal(prefillBirdId = null, prefillBirdName = null) {
    elements.form.reset();
    document.getElementById('sighting-date').valueAsDate = new Date();
    elements.imagePreviewContainer.innerHTML = '';

    if (prefillBirdId) {
        elements.selectedBirdId.value = prefillBirdId;
        elements.birdSearchInput.value = prefillBirdName || '';
    } else {
        elements.selectedBirdId.value = '';
    }

    elements.modal.classList.add('active');
}

function _renderBirdDetail(item) {
    const config = SUBJECT_CONFIG[state.currentSubject];
    const fields = config.fields;

    elements.detailHeroImg.src = getBirdImageSrc(item.id);
    elements.detailNameSv.textContent = item.nameSv;
    elements.detailNameScEn.textContent = `${item.scientific} (${item.nameEn})`;
    elements.detailRarity.innerHTML = '★'.repeat(item.rarity || 1) + '☆'.repeat(5 - (item.rarity || 1));
    elements.detailColor.textContent = item.color || (item.trunkColor ? item.trunkColor : 'Okänd');

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
    if (subLabelSize) subLabelSize.textContent = fields.size.label;

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
        if (subLabelLife) subLabelLife.textContent = fields.lifespan.label;
    }

    if (elements.detailFunFact) elements.detailFunFact.textContent = item.funFact || 'Ingen fakta tillgänglig.';

    // Obs Count
    const count = getFilteredSightings().filter(s => s.birdId === item.id).length;
    if (elements.detailObsCount) {
        elements.detailObsCount.textContent = `${count} observationer (filtrerat)`;
    }

    // Setup Actions
    if (elements.detailAddSightingBtn) {
        elements.detailAddSightingBtn.onclick = () => {
            history.pushState({ modal: 'sighting', birdId: item.id }, '');
            elements.detailModal.classList.remove('active');
            _showSightingModal(item.id, item.nameSv);
        };
    }
    if (elements.detailQuickAddBtn) {
        elements.detailQuickAddBtn.onclick = () => {
            quickAddSighting(item.id);
            history.back();
        };
    }
    if (elements.detailArtportalenLink) {
        elements.detailArtportalenLink.href = `https://www.artportalen.se/search/sightings/site/days/30/taxon/${encodeURIComponent(item.nameSv)}`;
    }
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
    const passwordModal = document.getElementById('password-modal');
    const passwordForm = document.getElementById('password-form');
    const passwordInput = document.getElementById('password-input');
    const passwordError = document.getElementById('password-error');

    if (!isAuthenticated) {
        // Show modal
        passwordModal.classList.add('active');
        passwordModal.style.display = 'flex'; // Ensure flex for centering

        // Handle Submit
        passwordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = passwordInput.value.trim();
            if (input === 'apa') {
                // Correct
                localStorage.setItem('birdfinder_auth_token', 'valid');
                passwordModal.style.display = 'none';
                passwordModal.classList.remove('active');
            } else {
                // Incorrect
                passwordError.style.display = 'block';
                passwordInput.value = '';
                passwordInput.focus();
            }
        });
    } else {
        // Already authenticated
        if (passwordModal) passwordModal.style.display = 'none';
    }

    // 0. Load Preserved User
    const savedUser = localStorage.getItem('birdfinder_currentUser');
    if (savedUser && (savedUser === 'Theia' || savedUser === 'Alexander')) {
        state.currentUser = savedUser;
    }

    // Update active class on buttons to match state
    if (state.currentUser === 'Alexander') {
        document.querySelector('[data-user="Theia"]').classList.remove('active');
        document.querySelector('[data-user="Alexander"]').classList.add('active');
    } else {
        document.querySelector('[data-user="Alexander"]').classList.remove('active');
        document.querySelector('[data-user="Theia"]').classList.add('active');
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

    // Audio Recording Setup
    setupRecordingLogic();

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
    // Actually, we should probably render the current subject correctly on init.
    // switchSubject(state.currentSubject); // Ensure UI matches state

    // --- Cloud Real-Time Listener (Removed) ---

    // --- PWA Install Logic ---
    let deferredPrompt;
    const installBtn = document.getElementById('install-btn');

    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        // Stash the event so it can be triggered later.
        deferredPrompt = e;
        // Update UI notify the user they can install the PWA
        installBtn.style.display = 'block';

        console.log('Use can install app');
    });

    installBtn.addEventListener('click', async () => {
        // Hide the app provided install promotion
        installBtn.style.display = 'none';
        // Show the install prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        // We've used the prompt, and can't use it again, throw it away
        deferredPrompt = null;
    });

    window.addEventListener('appinstalled', () => {
        // Hide the app-provided install promotion
        installBtn.style.display = 'none';
        // Clear the deferredPrompt so it can be garbage collected
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

function saveSightings() {
    // 1. Always save to localStorage (instant)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.sightings));

    // Cloud save removed.
    renderApp();
}

// --- Logic Helpers ---

function getBirdImageSrc(birdId) {
    // 1. Check LocalStorage for custom override
    const custom = localStorage.getItem(`custom_img_${birdId}`);
    if (custom) return custom;
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
        if (s.user !== state.currentUser) return false;

        // Filter by Current Mode (Bird vs Tree)
        // Check if the ID belongs to the current list
        const belongsToMode = currentList.some(item => item.id === s.birdId);
        if (!belongsToMode) return false;

        if (state.yearFilter !== 'all') {
            const y = new Date(s.date).getFullYear();
            if (y !== state.yearFilter) return false;
        }
        return true;
    });
}

function openBirdDetail(item) {
    _renderBirdDetail(item);
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
        user: state.currentUser,
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
        card.className = 'bird-card'; // Keep generic styling

        const imgSource = sighting.photo || getBirdImageSrc(item.id);

        card.innerHTML = `
            <div class="bird-image-container">
                <img src="${imgSource}" alt="${item.nameEn}" data-bird-id="${item.id}" loading="lazy" onerror="handleImageError(this)">
                ${group.count > 1 ? `<div class="sighting-count-badge">+${group.count - 1} till</div>` : ''}
                <button class="instant-add-btn" onclick="quickAddSighting('${item.id}')" title="Lägg till +1 direkt">
                    +
                </button>
                <button class="delete-sighting-btn" onclick="deleteSighting('${sighting.id}')" title="Ta bort logg">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
            <div class="bird-info">
                <div class="bird-primary-name">${item.nameSv}</div>
                <div class="bird-secondary-name">${item.nameEn}</div>
                <div class="bird-scientific">${item.scientific}</div>
                
                <div class="sighting-details">
                    <div class="detail-row"><i class="fa-regular fa-calendar"></i> ${sighting.date}</div>
                    <div class="detail-row"><i class="fa-solid fa-map-pin"></i> ${sighting.location || 'Okänd plats'}</div>
                    ${sighting.notes ? `<div class="notes-text">"${sighting.notes}"</div>` : ''}
                    ${sighting.sound ? `<div style="margin-top:0.5rem;"><audio controls src="${sighting.sound}" style="width:100%; height:32px;"></audio></div>` : ''}
                </div>
            </div>
            </div>
        `;

        card.addEventListener('click', (e) => {
            if (e.target.closest('button')) return;
            openBirdDetail(item);
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
                // Open sighting modal pre-filled with this bird
                history.pushState({ modal: 'sighting', birdId: bird.id }, '');
                _showSightingModal(bird.id, bird.nameSv);
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
    div.innerHTML = `
        <i class="fa-solid ${cat.icon} category-icon"></i>
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
// Helper for icons (used in Map view)
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

// --- Audio Recording Logic ---
function setupRecordingLogic() {
    const startBtn = document.getElementById('start-recording-btn');
    const stopBtn = document.getElementById('stop-recording-btn');
    const statusEl = document.getElementById('recording-status');
    const timerEl = document.getElementById('recording-timer');
    const audioPreview = document.getElementById('audio-preview');
    const deleteBtn = document.getElementById('delete-recording-btn');

    if (!startBtn || !stopBtn) return;

    startBtn.addEventListener('click', async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(audioBlob);
                audioPreview.src = audioUrl;

                // Convert to Base64 for storage
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = () => {
                    currentRecordingBase64 = reader.result;
                    console.log('Audio converted to base64, length:', currentRecordingBase64.length);
                };

                // UI Updates
                audioPreview.classList.remove('hidden');
                deleteBtn.classList.remove('hidden');
                startBtn.classList.remove('hidden');
                stopBtn.classList.add('hidden');
                statusEl.classList.add('hidden');

                // Stop all tracks to release microphone
                stream.getTracks().forEach(track => track.stop());
                clearInterval(recordingTimerInterval);
            };

            mediaRecorder.start();

            // UI Updates
            startBtn.classList.add('hidden');
            stopBtn.classList.remove('hidden');
            statusEl.classList.remove('hidden');
            audioPreview.classList.add('hidden');
            deleteBtn.classList.add('hidden');

            // Timer
            let seconds = 0;
            timerEl.textContent = "00:00";
            clearInterval(recordingTimerInterval);
            recordingTimerInterval = setInterval(() => {
                seconds++;
                const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
                const secs = (seconds % 60).toString().padStart(2, '0');
                timerEl.textContent = `${mins}:${secs}`;
            }, 1000);

        } catch (err) {
            console.error('Error accessing microphone:', err);
            alert('Kunde inte komma åt mikrofonen. Kontrollera behörigheter.');
        }
    });

    stopBtn.addEventListener('click', () => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
        }
    });

    deleteBtn.addEventListener('click', () => {
        if (confirm('Vill du ta bort inspelningen?')) {
            currentRecordingBase64 = null;
            audioPreview.src = '';
            audioPreview.classList.add('hidden');
            deleteBtn.classList.add('hidden');
        }
    });
}

function setupEventListeners() {
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
            localStorage.setItem('birdfinder_currentUser', newUser);

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
            sound: currentRecordingBase64,
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

            // Reset Recording
            currentRecordingBase64 = null;
            document.getElementById('recording-status').classList.add('hidden');
            document.getElementById('start-recording-btn').classList.remove('hidden');
            document.getElementById('stop-recording-btn').classList.add('hidden');
            document.getElementById('audio-preview').classList.add('hidden');
            document.getElementById('delete-recording-btn').classList.add('hidden');

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
    const list = getCurrentSpeciesList();
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

function initQuiz(mode) {
    state.quizMode = mode;
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
        const imgSrc = getBirdImageSrc(q.image);
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
    // Quiz mode cards
    document.querySelectorAll('.quiz-mode-card').forEach(card => {
        card.addEventListener('click', () => {
            const mode = card.dataset.mode;
            initQuiz(mode);
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

// Start
document.addEventListener('DOMContentLoaded', init);
