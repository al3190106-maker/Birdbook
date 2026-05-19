// listen.js – BirdNET realtidsidentifiering
// Alla funktioner prefixade med listen_ för att undvika krockar med app.js



const listenEl = {
    startBtn:     document.getElementById('listen-start-btn'),
    statusText:   document.getElementById('listen-status'),
    spinner:      document.getElementById('listen-spinner'),
    waveWrap:     document.getElementById('listen-waveform-wrap'),
    waveCanvas:   document.getElementById('listen-waveform'),
    sessionWrap:  document.getElementById('listen-session-wrap'),
    sessionList:  document.getElementById('listen-session-list'),
    simBtn:       document.getElementById('listen-sim-btn'),
    sessionEmpty: document.getElementById('listen-session-empty'),
};

let listen_worker        = null;
let listen_audioCtx      = null;
let listen_workletNode   = null;
let listen_stream        = null;
let listen_isWorkerReady = false;
let listen_isListening   = false;
let listen_isSimulating  = false;
let listen_analyser      = null;
let listen_waveAnimId    = null;
let listen_simInterval   = null;

// Session state: scientificName → entry
let listen_session = {};
// Track which birds are "active" right now
let listen_currentlyActive = new Set();

// Audio constants
const LISTEN_SAMPLE_RATE    = 48000;
const LISTEN_WINDOW_SAMPLES = 144000; // 3 seconds
let listen_circularBuffer_proc, listen_circularBuffer_raw, listen_circularWriteIdx;

// Settings State
let listen_settings = {
    threshold: 0.50
};
let listen_hpfNode    = null;
let listen_preAmpNode = null;   // AGC gain node
let listen_agcInterval = null;  // AGC update timer
let listen_wakeLock   = null;   // Wake Lock (håller skärmen tänd)
let listen_keepAlive  = null;   // Silent audio node (håller AudioContext vid liv vid låst skärm)
let listen_results_proc = [];
let listen_results_raw  = [];
let listen_isCalibrated = false;
let listen_consecutiveSilence = 0;

/* ---------------------------------------------------------------
   HELPERS
--------------------------------------------------------------- */
function listen_colFor(pct) {
    if (pct >= 60) return '#16a34a';
    if (pct >= 40) return '#f59e0b';
    return '#94a3b8';
}

function listen_imgFor(dbBird) {
    if (!dbBird || typeof window.birdImages === 'undefined') return null;
    const io = window.birdImages[dbBird.id];
    return io && io.length > 0 ? io[0].src : null;
}

function listen_setStatus(html) {
    listenEl.statusText.innerHTML = html;
}

/* ---------------------------------------------------------------
   INIT WORKER
--------------------------------------------------------------- */
async function initBirdnet() {
    if (listen_worker) return;

    listen_setStatus('<i class="fa-solid fa-spinner fa-spin"></i> Laddar AI-modell... (10–30 sek)');

    try {
        listen_worker = new Worker('birdnet-worker.js?tf=tfjs-4.14.0.min.js&root=models&lang=sv');

        listen_worker.onmessage = (e) => {
            const data = e.data;
            if (['load_model','warmup','load_geomodel','load_labels'].includes(data.message)) {
                listen_setStatus(`<i class="fa-solid fa-spinner fa-spin"></i> Laddar modell... ${data.progress || 0}%`);
            } else if (data.message === 'loaded') {
                listen_isWorkerReady = true;
                listenEl.startBtn.disabled = false;
                listen_setStatus('');
            } else if (data.message === 'pooled') {
                if (data.track === 'proc') listen_results_proc = data.pooled;
                if (data.track === 'raw')  listen_results_raw  = data.pooled;
                listen_mergeAndHandle();
            } else if (data.message === 'error') {
                listen_setStatus('<i class="fa-solid fa-bug" style="color:#f87171"></i> Fel: ' + data.error);
            }
        };

        listen_worker.onerror = (e) => {
            listen_setStatus('<i class="fa-solid fa-bug" style="color:#f87171"></i> Worker-fel: ' + (e.message || 'okänt'));
        };
    } catch (err) {
        listen_setStatus('<i class="fa-solid fa-bug" style="color:#f87171"></i> Kunde inte starta AI: ' + err.message);
    }
}

/* ---------------------------------------------------------------
   HANDLE PREDICTIONS
--------------------------------------------------------------- */
function listen_mergeAndHandle() {
    const mergedMap = new Map();
    // Merge processed and raw tracks by taking the max confidence for each bird
    [...listen_results_proc, ...listen_results_raw].forEach(p => {
        const existing = mergedMap.get(p.scientificName);
        if (!existing || p.confidence > existing.confidence) {
            mergedMap.set(p.scientificName, p);
        }
    });
    const merged = Array.from(mergedMap.values());

    // --- Adaptive Calibration Logic ---
    // If no birds are detected across tracks for multiple intervals, we recalibrate the filter
    if (merged.length === 0) {
        listen_consecutiveSilence++;
        if (listen_consecutiveSilence >= 3) { // After ~6 seconds of silence
            listen_autoCalibrate();
            listen_consecutiveSilence = 0;
        }
    } else {
        listen_consecutiveSilence = 0;
    }

    listen_handlePredictions(merged);
}

function listen_handlePredictions(preds) {
    if (!listen_isListening) return;

    const threshold = listen_settings.threshold;
    const active = preds
        .filter(p => {
            if (p.confidence < threshold) return false;
            return typeof swedishBirds === 'undefined' || swedishBirds.some(b => b.scientific === p.scientificName);
        })
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5);

    // track which birds are active this round
    const newActiveSet = new Set(active.map(p => p.scientificName));

    // ---- Session log: add/update + glow if re-heard ----
    active.forEach(pred => {
        const existing = listen_session[pred.scientificName];
        const dbBird   = (typeof swedishBirds !== 'undefined')
            ? swedishBirds.find(b => b.scientific === pred.scientificName) : null;
        const imgSrc   = listen_imgFor(dbBird);
        const name     = dbBird ? dbBird.nameSv : (pred.commonNameI18n || pred.scientificName);

        if (!existing) {
            listen_session[pred.scientificName] = { name, scientificName: pred.scientificName, confidence: pred.confidence, imgSrc, dbBird, time: new Date().toLocaleTimeString('sv-SE', { hour:'2-digit', minute:'2-digit' }), isNew: true, firstHeardAt: Date.now() };
            // ---- Push-notifikation: ny fågel hörd ----
            listen_notifyNewBird(name, pred.confidence, imgSrc);
        } else {
            if (pred.confidence > existing.confidence) existing.confidence = pred.confidence;
        }
        listen_session[pred.scientificName].isActive = true;

        // --- Spectrogram bird label ---
        if (pred.confidence > 0.1 && listenEl.waveCanvas) {
            const dpr = window.devicePixelRatio || 1;
            const canvasW = listenEl.waveCanvas.offsetWidth * dpr;
            const canvasH = listenEl.waveCanvas.offsetHeight * dpr;
            const jitter = (name.length * 7) % Math.max(10, (canvasH - 40));
            
            // Prevent spamming the same bird on the right edge
            const recentlyAdded = listen_spectrogram_labels.some(lbl => lbl.text === name && lbl.x > canvasW - (100 * dpr));
            if (!recentlyAdded) {
                listen_spectrogram_labels.push({
                    text: name,
                    x: canvasW,
                    y: 20 * dpr + jitter
                });
            }
        }
    });

    Object.keys(listen_session).forEach(sci => {
        if (!newActiveSet.has(sci)) listen_session[sci].isActive = false;
    });

    listen_currentlyActive = newActiveSet;

    // ---- Uppdatera Media Session med aktiva fåglar (låst skärm) ----
    listen_updateMediaSession();

    listen_renderSession();
}

function listen_buildNowCard(pred) {
    const dbBird = (typeof swedishBirds !== 'undefined')
        ? swedishBirds.find(b => b.scientific === pred.scientificName) : null;
    const name   = dbBird ? dbBird.nameSv : (pred.commonNameI18n || pred.scientificName);
    const sci    = pred.scientificName;
    const pct    = Math.round(pred.confidence * 100);
    const col    = listen_colFor(pct);
    const imgSrc = listen_imgFor(dbBird);
    const clickJs = dbBird ? `window.listen_openBird('${dbBird.id}')` : '';

    const imgHtml = imgSrc
        ? `<img class="listen-nowcard-img" src="${imgSrc}" alt="${name}">`
        : `<div class="listen-nowcard-placeholder"><i class="fa-solid fa-dove"></i></div>`;

    return `
    <div class="listen-nowcard" onclick="${clickJs}">
        ${imgHtml}
        <div class="listen-nowcard-body">
            <div class="listen-nowcard-name">${name}</div>
            <div class="listen-nowcard-sci">${sci}</div>
            <div class="listen-bar-wrap">
                <div class="listen-bar" style="width:${pct}%;background:${col};"></div>
            </div>
        </div>
        <div class="listen-nowcard-pct" style="color:${col};">${pct}%</div>
    </div>`;
}

/* ---------------------------------------------------------------
   SESSION LOG
--------------------------------------------------------------- */
function listen_renderSession() {
    const list = listenEl.sessionList;
    if (!list) return;

    const entries = Object.values(listen_session).sort((a, b) => b.firstHeardAt - a.firstHeardAt);

    if (listenEl.sessionEmpty) {
        listenEl.sessionEmpty.style.display = entries.length === 0 ? 'flex' : 'none';
    }

    entries.forEach(e => {
        const pct        = Math.round(e.confidence * 100);
        const isActive   = e.isActive;
        const isObserved = e.dbBird && (window.state && window.state.sightings && window.state.sightings.some(s => s.birdId === e.dbBird.id));
        const isFirst    = !isObserved;
        
        const cardId = e.scientificName;
        let cardEl   = list.querySelector(`.listen-scard[data-id="${cardId}"]`);
        const isNewEntry = !cardEl;

        if (isNewEntry) {
            const temp = document.createElement('div');
            const clickJs = e.dbBird ? `window.listen_openBird('${e.dbBird.id}')` : '';
            temp.innerHTML = `
                <div class="listen-scard new-entry" onclick="${clickJs}" data-id="${cardId}">
                    <div class="listen-scard-img-wrap"></div>
                    <div class="listen-scard-body">
                        <div class="listen-scard-name">${e.name}</div>
                        <div class="listen-scard-meta"></div>
                    </div>
                    <div class="listen-scard-actions"></div>
                </div>`;
            cardEl = temp.firstElementChild;
            
            const imgWrap = cardEl.querySelector('.listen-scard-img-wrap');
            imgWrap.innerHTML = e.imgSrc
                ? `<img class="listen-scard-img" src="${e.imgSrc}" alt="${e.name}">`
                : `<div class="listen-scard-placeholder"><i class="fa-solid fa-dove"></i></div>`;
        } else {
            // Remove animation class for existing elements to prevent re-triggering
            cardEl.classList.remove('new-entry');
        }

        // Update state
        cardEl.classList.toggle('is-active', isActive);
        cardEl.classList.toggle('is-observed', isObserved);
        cardEl.classList.toggle('is-first-time', isFirst);

        const metaEl = cardEl.querySelector('.listen-scard-meta');
        const badgeHtml = isFirst ? `<div class="listen-scard-badge">Ny</div>` : '';
        metaEl.innerHTML = `${pct}% säkerhet ${badgeHtml}`;

        const actionsEl = cardEl.querySelector('.listen-scard-actions');
        if (e.dbBird && !actionsEl.innerHTML) {
            actionsEl.innerHTML = `
                <button class="listen-scard-add-btn" onclick="event.stopPropagation(); window.listen_quickAddSighting('${e.dbBird.id}', '${e.name.replace(/'/g, '')}')" title="Snabbtillägg med automatisk plats och väder">
                    <i class="fa-solid fa-plus"></i>
                </button>`;
        }

        list.appendChild(cardEl);
    });
}




window.listen_clearSession = function() {
    listen_session = {};
    listen_currentlyActive = new Set();
    // Restore empty state placeholder
    const sessionList = listenEl.sessionList;
    sessionList.querySelectorAll('.listen-scard').forEach(el => el.remove());
    if (listenEl.sessionEmpty) listenEl.sessionEmpty.style.display = 'flex';
};

/* ---------------------------------------------------------------
   START / STOP
--------------------------------------------------------------- */
async function listen_start() {
    if (!listen_isWorkerReady) return;
    
    // Ensure settings listeners are ready
    if (!window.listen_settings_init) listen_initSettingsUI();

    listen_isListening = true;
    listenEl.startBtn.classList.add('is-listening');
    const micImg = document.getElementById('listen-mic-img');
    if (micImg) micImg.style.display = 'none';
    listenEl.startBtn.innerHTML = '<i class="fa-solid fa-stop" style="font-size:1.6rem"></i>';
    listen_setStatus('<i class="fa-solid fa-circle" style="color:#f87171;font-size:0.7em;"></i> Lyssnar aktivt...');

    // --- Wake Lock (håll skärmen tänd) ---
    if (typeof window.listen_checkWakeLock === 'function') window.listen_checkWakeLock();

    // --- Notifikationsrättigheter ---
    listen_requestNotificationPermission();

    // --- Media Session (låst skärm) ---
    listen_setupMediaSession();

    try {
        listen_stream = await navigator.mediaDevices.getUserMedia({
            audio: { 
                channelCount: 1, 
                sampleRate: LISTEN_SAMPLE_RATE, 
                // Disable browser filters to prevent them from suppressing distant bird calls
                echoCancellation: false, 
                noiseSuppression: false,
                autoGainControl: false
            }
        });

        listen_audioCtx = new AudioContext({ sampleRate: LISTEN_SAMPLE_RATE });
        if (listen_audioCtx.state === 'suspended') await listen_audioCtx.resume();

        const source = listen_audioCtx.createMediaStreamSource(listen_stream);
        
        // 1. High Pass Filter (Adaptive Noise reduction)
        listen_hpfNode = listen_audioCtx.createBiquadFilter();
        listen_hpfNode.type = 'highpass';
        listen_hpfNode.frequency.setValueAtTime(400, listen_audioCtx.currentTime);

        // 1.5 AGC (Automatic Gain Control) – adaptiv förstärkning
        listen_preAmpNode = listen_audioCtx.createGain();
        listen_preAmpNode.gain.setValueAtTime(2.0, listen_audioCtx.currentTime); // Startvärde

        // 2. Kompressor som skyddar mot klippning efter AGC
        const compressor = listen_audioCtx.createDynamicsCompressor();
        compressor.threshold.setValueAtTime(-55, listen_audioCtx.currentTime);
        compressor.knee.setValueAtTime(40, listen_audioCtx.currentTime);
        compressor.ratio.setValueAtTime(12, listen_audioCtx.currentTime);
        compressor.attack.setValueAtTime(0, listen_audioCtx.currentTime);
        compressor.release.setValueAtTime(0.25, listen_audioCtx.currentTime);

        listen_circularBuffer_proc = new Float32Array(LISTEN_WINDOW_SAMPLES);
        listen_circularBuffer_raw  = new Float32Array(LISTEN_WINDOW_SAMPLES);
        listen_circularWriteIdx = 0;

        await listen_audioCtx.audioWorklet.addModule('audio-processor.js');
        listen_workletNode = new AudioWorkletNode(listen_audioCtx, 'audio-processor', {
            numberOfInputs: 2,
            numberOfOutputs: 1
        });
        
        listen_workletNode.port.onmessage = (e) => {
            const { processed, raw } = e.data;
            for (let i = 0; i < processed.length; i++) {
                listen_circularBuffer_proc[listen_circularWriteIdx] = processed[i];
                listen_circularBuffer_raw[listen_circularWriteIdx] = raw[i];
                listen_circularWriteIdx = (listen_circularWriteIdx + 1) % LISTEN_WINDOW_SAMPLES;
            }
        };

        listen_analyser = listen_audioCtx.createAnalyser();
        listen_analyser.fftSize = 1024;
        
        // Connect track 0: Filtered & AGC-boosted
        source.connect(listen_hpfNode);
        listen_hpfNode.connect(listen_preAmpNode);
        listen_preAmpNode.connect(compressor);
        compressor.connect(listen_workletNode, 0, 0);

        // Connect track 1: Raw (ingen boost, för jämförelse)
        source.connect(listen_workletNode, 0, 1);

        // Connect analyser to source (raw)
        source.connect(listen_analyser);

        // Starta AGC-loopen
        listen_startAGC();

        // --- Silent keepalive: spelar tyst ljud så att AudioContext inte pausas vid låst skärm (Android) ---
        const silentBuf = listen_audioCtx.createBuffer(1, 1, listen_audioCtx.sampleRate);
        listen_keepAlive = listen_audioCtx.createBufferSource();
        listen_keepAlive.buffer = silentBuf;
        listen_keepAlive.loop = true;
        const muteGain = listen_audioCtx.createGain();
        muteGain.gain.setValueAtTime(0.001, listen_audioCtx.currentTime); // Nästan inhörbart
        listen_keepAlive.connect(muteGain);
        muteGain.connect(listen_audioCtx.destination);
        listen_keepAlive.start();

        // --- Geolokation → sänd till Area Model i workern ---
        listen_sendGeoToWorker();

        // We don't want to hear the mic output (feedback)
        // listen_workletNode.connect(listen_audioCtx.destination);

        listenEl.waveWrap.style.display = 'block';
        listen_drawWaveform();
        setTimeout(listen_inferenceLoop, 1000); // Starta loopen snabbare för mer överlappning

        const listenNavBtn = document.querySelector('.nav-btn[data-tab="listen-view"]');
        if (listenNavBtn) listenNavBtn.classList.add('is-recording');

        if (typeof window.resetListenIdleTimer === 'function') window.resetListenIdleTimer();

    } catch (err) {
        listen_setStatus('<i class="fa-solid fa-triangle-exclamation" style="color:#f59e0b"></i> Mikrofon nekades eller stöds ej.');
        listen_stop();
    }
}

function listen_stop() {
    listen_isListening  = false;
    listen_isSimulating = false;
    listenEl.startBtn.classList.remove('is-listening');
    listenEl.startBtn.innerHTML = '<img src="images/ovriga_ikoner/bird_mic_icon.png" style="width:46px;height:46px;object-fit:contain;" id="listen-mic-img">';
    if (listenEl.simBtn) listenEl.simBtn.innerHTML = '<i class="fa-solid fa-flask"></i>';

    listenEl.waveWrap.style.display = 'none';

    const listenNavBtn = document.querySelector('.nav-btn[data-tab="listen-view"]');
    if (listenNavBtn) listenNavBtn.classList.remove('is-recording');

    if (listen_isWorkerReady) {
        listen_setStatus('');
        listen_results_proc = [];
        listen_results_raw  = [];
        listen_spectrogram_labels = [];
        listen_isCalibrated = false;
        listen_consecutiveSilence = 0;
        const calibEl = document.getElementById('listen-calib-status');
        if (calibEl) calibEl.style.display = 'none';
    } else {
        listen_setStatus('Pausad.');
    }

    // Mark all session birds inactive
    Object.values(listen_session).forEach(e => e.isActive = false);
    listen_currentlyActive = new Set();
    listen_renderSession();

    if (typeof window.resetListenIdleTimer === 'function') window.resetListenIdleTimer();

    // --- Kontrollera Wake Lock (behålls om vi stannar på identifieringsfliken) ---
    if (typeof window.listen_checkWakeLock === 'function') window.listen_checkWakeLock();

    // --- återställ Media Session ---
    if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'none';
        navigator.mediaSession.metadata = null;
    }

    if (listen_waveAnimId)  { cancelAnimationFrame(listen_waveAnimId); listen_waveAnimId = null; }
    if (listen_simInterval) { clearInterval(listen_simInterval); listen_simInterval = null; }
    if (listen_agcInterval) { clearInterval(listen_agcInterval); listen_agcInterval = null; }
    if (listen_analyser)    { listen_analyser.disconnect(); listen_analyser = null; }
    if (listen_stream)      { listen_stream.getTracks().forEach(t => t.stop()); listen_stream = null; }
    if (listen_workletNode) { listen_workletNode.disconnect(); listen_workletNode = null; }
    if (listen_audioCtx)    { listen_audioCtx.close(); listen_audioCtx = null; }
    listen_preAmpNode = null;
}

/* ---------------------------------------------------------------
   WAKE LOCK – håller skärmen tänd under lyssning
--------------------------------------------------------------- */
window.listen_requestWakeLock = async function() {
    if (!('wakeLock' in navigator)) return;
    if (listen_wakeLock) return; // Redan aktiv
    try {
        listen_wakeLock = await navigator.wakeLock.request('screen');
        listen_wakeLock.addEventListener('release', () => {
            listen_wakeLock = null;
        });
    } catch (e) {
        console.warn('Wake Lock nekades:', e.message);
    }
};

window.listen_releaseWakeLock = function() {
    if (listen_wakeLock) {
        listen_wakeLock.release().catch(() => {});
        listen_wakeLock = null;
    }
};

window.listen_checkWakeLock = function() {
    const isListenTab = document.querySelector('.nav-btn[data-tab="listen-view"]')?.classList.contains('active');
    if (isListenTab || listen_isListening) {
        window.listen_requestWakeLock();
    } else {
        window.listen_releaseWakeLock();
    }
};

// Återta wake lock om skärmen låstes upp eller webbläsaren minimerades
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        window.listen_checkWakeLock();
    }
});

/* ---------------------------------------------------------------
   MEDIA SESSION – visas på låst skärm
--------------------------------------------------------------- */
function listen_setupMediaSession() {
    if (!('mediaSession' in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
        title: 'Fågelidentifiering aktiv',
        artist: 'Lyssnar efter fåglar...',
        album: 'Naturboken',
        artwork: [
            { src: 'images/ovriga_ikoner/bird_mic_icon.png', sizes: '512x512', type: 'image/png' }
        ]
    });
    navigator.mediaSession.playbackState = 'playing';

    // Hantera paus/spela-knappar på headset och låst skärm
    navigator.mediaSession.setActionHandler('pause', () => listen_stop());
    navigator.mediaSession.setActionHandler('stop',  () => listen_stop());
    navigator.mediaSession.setActionHandler('play',  () => {
        if (!listen_isListening && listen_isWorkerReady) listen_start();
    });
}

function listen_updateMediaSession() {
    if (!('mediaSession' in navigator) || !navigator.mediaSession.metadata) return;

    const activeNames = Object.values(listen_session)
        .filter(e => e.isActive)
        .map(e => e.name);

    const sessionCount = Object.keys(listen_session).length;

    if (activeNames.length > 0) {
        navigator.mediaSession.metadata.artist = '🐦 Hör just nu: ' + activeNames.join(', ');
    } else if (sessionCount > 0) {
        const names = Object.values(listen_session).slice(0, 3).map(e => e.name);
        navigator.mediaSession.metadata.artist = `Hittade ${sessionCount} fåglar: ${names.join(', ')}`;
    } else {
        navigator.mediaSession.metadata.artist = 'Lyssnar efter fåglar...';
    }
}

/* ---------------------------------------------------------------
   PUSH-NOTIFIKATIONER – ny fågel hörd
--------------------------------------------------------------- */
async function listen_requestNotificationPermission() {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
        await Notification.requestPermission();
    }
}

function listen_notifyNewBird(name, confidence, imgSrc) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    // Skicka inte notis om appen är i förgrunden och skärmen är aktiv
    if (document.visibilityState === 'visible' && listen_wakeLock) return;

    const pct = Math.round(confidence * 100);
    const body = `${pct}% säkerhet · Tryck för att se mer`;

    try {
        const n = new Notification(`🐦 Ny fågel: ${name}`, {
            body,
            icon: imgSrc || 'images/ovriga_ikoner/bird_mic_icon.png',
            tag:  `bird-${name}`, // Ersätter föregående notis för samma fågel
            renotify: false,
            silent: true
        });
        n.onclick = () => { window.focus(); n.close(); };
    } catch (e) {
        console.warn('Notifikation misslyckades:', e);
    }
}

/* ---------------------------------------------------------------
   GEOLOKATION → AREA MODEL
--------------------------------------------------------------- */
function listen_sendGeoToWorker() {
    if (!listen_worker || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            listen_worker.postMessage({
                message:   'area-scores',
                latitude:  pos.coords.latitude,
                longitude: pos.coords.longitude
            });
            console.log(`Geo skickat till AI: ${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)}`);
        },
        (err) => console.warn('Geolokation misslyckades:', err.message),
        { timeout: 8000, maximumAge: 300000 } // Cachelagra position 5 min
    );
}

let listen_spectrogram_labels = [];

/* ---------------------------------------------------------------
   WAVEFORM VISUALIZER
--------------------------------------------------------------- */
function listen_drawWaveform() {
    if (!listen_analyser || !listenEl.waveCanvas) return;

    const canvas = listenEl.waveCanvas;
    const dpr    = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth * dpr;
    const H = 120 * dpr;
    
    canvas.width  = W;
    canvas.height = H;
    canvas.style.height = '120px';

    const ctx = canvas.getContext('2d', { alpha: false });
    const freqData = new Uint8Array(listen_analyser.frequencyBinCount);
    
    // Create an offscreen canvas to hold the history for smooth scrolling
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = W;
    tempCanvas.height = H;
    const tempCtx = tempCanvas.getContext('2d', { alpha: false });
    tempCtx.fillStyle = '#0a1410';
    tempCtx.fillRect(0, 0, W, H);

    function getSpectrogramColor(v) {
        if (v < 20)  return `rgb(10, ${20 + v/2}, 16)`;
        if (v < 80)  return `rgb(${10 + (v-20)}, ${20 + (v-20)}, ${16 + (v-20)/2})`;
        if (v < 180) return `rgb(${46 + (v-80)}, ${93 + (v-80)/2}, ${75})`;
        return `rgb(${143 + (v-180)}, ${188 + (v-180)/3}, ${143 + (v-180)/2})`;
    }

    function draw() {
        if (!listen_isListening) return;
        listen_waveAnimId = requestAnimationFrame(draw);
        
        listen_analyser.getByteFrequencyData(freqData);
        
        // 1. Shift existing visualization left
        tempCtx.drawImage(tempCanvas, -2 * dpr, 0);
        
        // 2. Draw new frequency column on the right
        // Bird range focus: ~500Hz to ~12kHz
        // With 48kHz SR and 2048 FFT, bins are ~23Hz each.
        // Bin 20 (~460Hz) to Bin 500 (~11.5kHz)
        const startBin = 15;
        const endBin   = 450;
        const numBins  = endBin - startBin;
        const binH     = H / numBins;

        for (let i = 0; i < numBins; i++) {
            const val = freqData[startBin + i];
            // Invert Y so high freq is at top
            tempCtx.fillStyle = getSpectrogramColor(val);
            tempCtx.fillRect(W - (2 * dpr), H - (i * binH) - binH, 2 * dpr, binH + 1);
        }
        
        // 3. Render offscreen to main
        ctx.drawImage(tempCanvas, 0, 0);
        
        // 4. Draw bird names rolling with the spectrogram
        ctx.font = 'bold ' + (11 * dpr) + 'px "Inter", sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        
        for (let i = listen_spectrogram_labels.length - 1; i >= 0; i--) {
            let label = listen_spectrogram_labels[i];
            label.x -= (2 * dpr); // Move left at same speed as spectrogram
            
            // Draw a subtle shadow/glow for readability
            ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            ctx.shadowBlur = 4 * dpr;
            ctx.fillText(label.text, label.x, label.y);
            ctx.shadowBlur = 0; // reset
            
            // Remove if off screen
            if (label.x < -100 * dpr) {
                listen_spectrogram_labels.splice(i, 1);
            }
        }
    }

    draw();
}

/* ---------------------------------------------------------------
   INFERENCE LOOP
--------------------------------------------------------------- */
function listen_inferenceLoop() {
    if (!listen_isListening || !listen_isWorkerReady || !listen_circularBuffer_proc) return;

    const windowed_proc = new Float32Array(LISTEN_WINDOW_SAMPLES);
    const windowed_raw  = new Float32Array(LISTEN_WINDOW_SAMPLES);
    let idx = listen_circularWriteIdx;
    
    for (let i = 0; i < LISTEN_WINDOW_SAMPLES; i++) {
        windowed_proc[i] = Math.max(-1, Math.min(1, listen_circularBuffer_proc[idx]));
        windowed_raw[i]  = Math.max(-1, Math.min(1, listen_circularBuffer_raw[idx]));
        idx = (idx + 1) % LISTEN_WINDOW_SAMPLES;
    }

    // 3. Normalization: Scale audio so peak reaches 0.9
    // This dramatically improves detection for distant birds.
    listen_normalizeBuffer(windowed_proc);
    listen_normalizeBuffer(windowed_raw);

    // Run both tracks
    listen_worker.postMessage({ 
        message: 'predict', 
        pcmAudio: windowed_proc, 
        track: 'proc',
        sensitivity: 1.25 // Ökad känslighet för tysta/avlägsna fåglar
    }, [windowed_proc.buffer]);

    listen_worker.postMessage({ 
        message: 'predict', 
        pcmAudio: windowed_raw, 
        track: 'raw',
        sensitivity: 1.25 // Ökad känslighet för tysta/avlägsna fåglar
    }, [windowed_raw.buffer]);

    if (listen_isListening) setTimeout(listen_inferenceLoop, 1000); // 1 sek intervall för max överlappning och snabbhet
}

/* ---------------------------------------------------------------
   SETTINGS UI
--------------------------------------------------------------- */
window.listen_settings_init = false;
function listen_initSettingsUI() {
    const toggle = document.getElementById('listen-settings-toggle');
    const overlay = document.getElementById('listen-settings-overlay');
    const close = document.getElementById('listen-settings-close');
    if (!toggle || !overlay || !close) return;

    toggle.onclick = () => overlay.classList.add('active');
    close.onclick  = () => overlay.classList.remove('active');
    overlay.onclick = (e) => { if (e.target === overlay) overlay.classList.remove('active'); };

    const ctrls = [
        { id: 'set-threshold',   val: 'val-threshold',   key: 'threshold',   unit: '%',   mult: 0.01 }
    ];

    ctrls.forEach(c => {
        const input = document.getElementById(c.id);
        const label = document.getElementById(c.val);
        if (!input || !label) return;

        input.oninput = () => {
            let v = parseFloat(input.value);
            listen_settings[c.key] = v * c.mult;
            label.textContent = v + c.unit;
        };
    });

    window.listen_settings_init = true;
}

/**
 * AGC – Automatic Gain Control
 * Mäter RMS (energinivå) i den råa cirkulärbufferten var 500ms och
 * justerar förstärkarnodens gain smidigt baserat på hur tyst/högt det är.
 *
 * Gain-tabell:
 *   RMS < 0.005  → gain 5.0  (extremt tyst, avlägsen fågel)
 *   RMS < 0.02   → gain 3.5  (tyst)
 *   RMS < 0.06   → gain 2.0  (normalt)
 *   RMS < 0.15   → gain 1.2  (lite högt)
 *   RMS >= 0.15  → gain 0.7  (högt – skydda mot klippning)
 */
function listen_startAGC() {
    if (listen_agcInterval) clearInterval(listen_agcInterval);

    listen_agcInterval = setInterval(() => {
        if (!listen_isListening || !listen_preAmpNode || !listen_circularBuffer_raw || !listen_audioCtx) return;

        // Beräkna RMS på de senaste 0.5 sekunderna av råbufferten
        const lookback = Math.min(listen_circularBuffer_raw.length, Math.round(LISTEN_SAMPLE_RATE * 0.5));
        let sumSq = 0;
        let idx = (listen_circularWriteIdx - lookback + listen_circularBuffer_raw.length) % listen_circularBuffer_raw.length;
        for (let i = 0; i < lookback; i++) {
            const s = listen_circularBuffer_raw[idx];
            sumSq += s * s;
            idx = (idx + 1) % listen_circularBuffer_raw.length;
        }
        const rms = Math.sqrt(sumSq / lookback);

        // Välj mål-gain baserat på RMS-nivå
        let targetGain;
        if      (rms < 0.005) targetGain = 5.0;
        else if (rms < 0.02)  targetGain = 3.5;
        else if (rms < 0.06)  targetGain = 2.0;
        else if (rms < 0.15)  targetGain = 1.2;
        else                  targetGain = 0.7;

        // Mjuk övergång (ramp 300ms) för att undvika knastrande artefakter
        listen_preAmpNode.gain.setTargetAtTime(targetGain, listen_audioCtx.currentTime, 0.3);

        console.log(`AGC: RMS=${rms.toFixed(4)} → Gain=${targetGain}`);
    }, 500);
}

/**
 * Automatically adjusts the high-pass filter based on ambient noise
 */
function listen_autoCalibrate() {
    if (!listen_analyser || !listen_hpfNode) return;

    const dataArray = new Uint8Array(listen_analyser.frequencyBinCount);
    listen_analyser.getByteFrequencyData(dataArray);

    // Find the highest noise peak in the low-frequency range (up to 2000Hz)
    // 48000Hz / 1024 bins = ~47Hz per bin
    let maxBin = 0;
    let maxVal = 0;
    for (let i = 0; i < 40; i++) { // Check up to ~1800Hz
        if (dataArray[i] > maxVal) {
            maxVal = dataArray[i];
            maxBin = i;
        }
    }

    // Set filter just above the noise peak
    const newFreq = Math.min(1200, Math.max(300, maxBin * 47 + 100));
    
    listen_hpfNode.frequency.setTargetAtTime(newFreq, listen_audioCtx.currentTime, 0.5);
    
    // UI Feedback
    const calibEl = document.getElementById('listen-calib-status');
    if (calibEl && !listen_isCalibrated) {
        calibEl.style.display = 'flex';
        setTimeout(() => { if (calibEl) calibEl.style.opacity = '0.6'; }, 3000);
    }
    listen_isCalibrated = true;
    console.log("Auto-calibrated filter to:", newFreq, "Hz (Noise peak at bin", maxBin, ")");
}

/**
 * Peak Normalization: Scales the buffer so the loudest point hits 0.9.
 * This helps the AI see patterns in quiet recordings.
 */
function listen_normalizeBuffer(buf) {
    let max = 0;
    for (let i = 0; i < buf.length; i++) {
        const abs = Math.abs(buf[i]);
        if (abs > max) max = abs;
    }
    // Only normalize if there's a signal but it's not already loud
    // Sänkt från 0.01 till 0.003 för att förstärka extremt avlägsna ljud
    if (max > 0.003 && max < 0.9) {
        const factor = 0.9 / max;
        for (let i = 0; i < buf.length; i++) {
            buf[i] *= factor;
        }
    }
}

/* ---------------------------------------------------------------
   SIMULATION
--------------------------------------------------------------- */
function listen_toggleSimulation() {
    (listen_isListening || listen_isSimulating) ? listen_stop() : listen_startSim();
}

function listen_startSim() {
    listen_isSimulating = true;
    listen_isListening  = true;

    listenEl.startBtn.classList.add('is-listening');
    listenEl.startBtn.innerHTML = '<i class="fa-solid fa-stop"></i>';
    if (listenEl.btnLabel) listenEl.btnLabel.textContent = 'Stoppa';
    if (listenEl.simBtn)   listenEl.simBtn.innerHTML = '<i class="fa-solid fa-stop"></i> Avsluta simulering';
    listen_setStatus('<i class="fa-solid fa-flask" style="color:#D4A373"></i> Simulerar offline-läge...');

    // Fake waveform
    listenEl.waveWrap.style.display = 'block';
    const canvas = listenEl.waveCanvas;
    const dpr    = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth * dpr;
    const H = 120 * dpr;
    canvas.width  = W;
    canvas.height = H;
    canvas.style.height = '120px';
    const ctx    = canvas.getContext('2d', { alpha: false });
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = W;
    tempCanvas.height = H;
    const tempCtx = tempCanvas.getContext('2d', { alpha: false });
    tempCtx.fillStyle = '#0a1410';
    tempCtx.fillRect(0, 0, W, H);

    function drawFakeWave() {
        if (!listen_isSimulating) return;
        listen_waveAnimId = requestAnimationFrame(drawFakeWave);

        // Shift temp left
        tempCtx.drawImage(tempCanvas, -2 * dpr, 0);
        
        // Draw new column
        tempCtx.fillStyle = '#0a1410';
        tempCtx.fillRect(W - 2 * dpr, 0, 2 * dpr, H);

        for (let i = 0; i < H; i += 4 * dpr) {
            const val = Math.random() < 0.1 ? Math.random() * 255 : Math.random() * 50;
            if (val > 40) {
                tempCtx.fillStyle = `rgb(${val}, ${val/2}, ${255-val})`;
                tempCtx.fillRect(W - 2 * dpr, H - i, 2 * dpr, 4 * dpr);
            }
        }
        
        // Render to main
        ctx.drawImage(tempCanvas, 0, 0);
        
        // Draw labels
        ctx.font = 'bold ' + (11 * dpr) + 'px "Inter", sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        
        for (let i = listen_spectrogram_labels.length - 1; i >= 0; i--) {
            let label = listen_spectrogram_labels[i];
            label.x -= (2 * dpr);
            
            ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            ctx.shadowBlur = 4 * dpr;
            ctx.fillText(label.text, label.x, label.y);
            ctx.shadowBlur = 0;
            
            if (label.x < -100 * dpr) listen_spectrogram_labels.splice(i, 1);
        }
    }
    drawFakeWave();

    const fakeBirds = [
        { scientificName: 'Turdus merula',       commonNameI18n: 'Koltrast' },
        { scientificName: 'Erithacus rubecula',   commonNameI18n: 'Rödhake' },
        { scientificName: 'Cyanistes caeruleus',  commonNameI18n: 'Blåmes' },
        { scientificName: 'Fringilla coelebs',    commonNameI18n: 'Bofink' },
        { scientificName: 'Parus major',          commonNameI18n: 'Talgoxe' },
        { scientificName: 'Sylvia atricapilla',   commonNameI18n: 'Svarthätta' },
    ];

    listen_simInterval = setInterval(() => {
        const fakes = Array(20).fill(0).map(() => ({
            scientificName: 'Noisus backgroundus',
            confidence: Math.random() * 0.05
        }));

        if (Math.random() > 0.45) {
            const numBirds = 1 + Math.floor(Math.random() * 2);
            for (let i = 0; i < numBirds; i++) {
                const b = fakeBirds[Math.floor(Math.random() * fakeBirds.length)];
                fakes.push({
                    scientificName: b.scientificName,
                    commonNameI18n: b.commonNameI18n,
                    confidence: 0.35 + Math.random() * 0.60
                });
            }
        }

        listen_handlePredictions(fakes);
    }, 2000);
}

/* ---------------------------------------------------------------
   MISC
--------------------------------------------------------------- */
window.listen_openBird = function(birdId) {
    if (typeof window.openBirdDetail === 'function') {
        const list = (typeof getCurrentSpeciesList === 'function') ? getCurrentSpeciesList() : swedishBirds;
        const b = list.find(x => x.id === birdId);
        if (b) window.openBirdDetail(b);
    }
};

window.listen_reportSighting = function(birdId, birdName) {
    if (typeof window.showSightingModal === 'function') {
        window.showSightingModal(birdId, birdName);
    }
};

/**
 * Snabbtillägg: sparar observationen direkt med automatisk plats och väder.
 * Ingen modal behövs – användaren får en bekräftelse-toast.
 */
window.listen_quickAddSighting = async function(birdId, birdName) {
    if (!birdId || typeof window.state === 'undefined') return;

    listen_showToast(`⏳ Sparar ${birdName}...`, 'info');

    const today = new Date().toISOString().split('T')[0];
    let lat = '', lng = '', location = '', weather = '';

    // Hämta GPS och plats
    try {
        const pos = await new Promise((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 6000, maximumAge: 60000 })
        );
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;

        // Platsnamn (Nominatim)
        try {
            const r    = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`, { headers: { 'Accept-Language': 'sv' } });
            const data = await r.json();
            if (data && data.address) {
                const a     = data.address;
                const parts = [a.village || a.town || a.city || a.municipality, a.county || a.state].filter(Boolean);
                location = parts.join(', ') || '';
            }
        } catch (_) {}

        // Väder – tim-precision via den delade hjälpfunktionen i app.js
        try {
            const hour = new Date().getHours();
            if (typeof window._fetchWeatherForCoords === 'function') {
                weather = await window._fetchWeatherForCoords(lat, lng, today, hour) || '';
            } else {
                const url  = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=temperature_2m,weathercode,windspeed_10m&past_days=1&forecast_days=1&timezone=Europe%2FBerlin`;
                const res  = await fetch(url);
                const data = await res.json();
                if (data && data.hourly && data.hourly.time) {
                    const target = `${today}T${String(hour).padStart(2,'0')}:00`;
                    const idx    = data.hourly.time.indexOf(target);
                    if (idx !== -1) {
                        const temp = data.hourly.temperature_2m[idx];
                        const code = data.hourly.weathercode[idx];
                        const wind = data.hourly.windspeed_10m[idx];
                        let wDesc = 'Molnigt';
                        if (code === 0) wDesc = 'Klart';
                        else if (code <= 2) wDesc = 'Delvis molnigt';
                        else if (code <= 48) wDesc = 'Dimma';
                        else if (code <= 65) wDesc = 'Regn';
                        else if (code <= 75) wDesc = 'Snöfall';
                        else if (code >= 95) wDesc = 'Åska';
                        const parts = [];
                        if (temp != null) parts.push(`${Math.round(temp)}°C`);
                        parts.push(wDesc);
                        if (wind > 3) parts.push(`vind ${Math.round(wind)} m/s`);
                        weather = parts.join(', ');
                    }
                }
            }
        } catch (_) {}

    } catch (_) {
        // Ingen GPS – spara ändå utan plats
    }

    // Bygg observation och spara
    const sighting = {
        id:       Date.now().toString(),
        birdId,
        date:     today,
        location,
        weather,
        notes:    'Identifierad via lyssningsfunktionen',
        lat:      lat ? String(lat) : '',
        lng:      lng ? String(lng) : '',
        customImage: null
    };

    if (typeof window.addSightingDirect === 'function') {
        window.addSightingDirect(sighting);
    } else {
        // Fallback: lägg direkt i state
        window.state.sightings.push(sighting);
        if (typeof window.saveState === 'function') window.saveState();
        if (typeof window.renderSightings === 'function') window.renderSightings();
    }

    listen_showToast(`✅ ${birdName} sparad!${location ? ' · ' + location : ''}`, 'success');
    listen_renderSession(); // Uppdatera badges (is-observed)
};

/**
 * Visar en liten toast-notis längst ner på skärmen.
 */
function listen_showToast(message, type = 'info') {
    let toast = document.getElementById('listen-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'listen-toast';
        toast.style.cssText = `
            position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%) translateY(20px);
            background: #1e3a2f; color: white; padding: 0.65rem 1.2rem;
            border-radius: 99px; font-size: 0.9rem; font-weight: 600;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3); z-index: 9999;
            opacity: 0; transition: all 0.3s ease; pointer-events: none;
            max-width: 90vw; text-align: center;
        `;
        document.body.appendChild(toast);
    }
    if (type === 'success') toast.style.background = '#16a34a';
    else if (type === 'error') toast.style.background = '#dc2626';
    else toast.style.background = '#1e3a2f';

    toast.textContent = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
    }, 3500);
}

window.listen_stopOnTabChange = listen_stop;

listenEl.startBtn.addEventListener('click', () => {
    (listen_isListening || listen_isSimulating) ? listen_stop() : listen_start();
});

listenEl.simBtn.addEventListener('click', () => {
    listen_toggleSimulation();
});

// --- Idle Dark Mode (Power Saver) ---
let listen_idleTimer = null;

window.resetListenIdleTimer = function() {
    clearTimeout(listen_idleTimer);
    document.body.classList.remove('idle-dark-mode');
    
    // Starta bara timern om vi lyssnar OCH är på identifiera-fliken
    const isActiveTab = document.querySelector('.nav-btn[data-tab="listen-view"]')?.classList.contains('active');
    if ((listen_isListening || listen_isSimulating) && isActiveTab) {
        listen_idleTimer = setTimeout(() => {
            document.body.classList.add('idle-dark-mode');
        }, 60000); // 1 minut
    }
};

// Återställ timer vid all interaktion i appen
['touchstart', 'click', 'mousemove', 'scroll'].forEach(evt => {
    document.addEventListener(evt, window.resetListenIdleTimer, { passive: true });
});

// Testknapp för mörkläge
const darkBtn = document.getElementById('listen-dark-btn');
if (darkBtn) {
    darkBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Förhindra att document-klick direkt tar bort det igen
        document.body.classList.toggle('idle-dark-mode');
        if (document.body.classList.contains('idle-dark-mode')) {
            clearTimeout(listen_idleTimer);
        } else {
            window.resetListenIdleTimer();
        }
    });
}
