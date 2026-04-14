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
let listen_hpfNode  = null;
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
        } else {
            if (pred.confidence > existing.confidence) existing.confidence = pred.confidence;
        }
        listen_session[pred.scientificName].isActive = true;
    });

    Object.keys(listen_session).forEach(sci => {
        if (!newActiveSet.has(sci)) listen_session[sci].isActive = false;
    });

    listen_currentlyActive = newActiveSet;
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
            actionsEl.innerHTML = `<button class="listen-scard-add-btn" onclick="event.stopPropagation(); window.listen_reportSighting('${e.dbBird.id}', '${e.name}')" title="Rapportera observation"><i class="fa-solid fa-plus"></i></button>`;
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
        listen_hpfNode.frequency.setValueAtTime(400, listen_audioCtx.currentTime); // Start low
        
        // 2. Compressor for quiet sounds
        const compressor = listen_audioCtx.createDynamicsCompressor();
        compressor.threshold.setValueAtTime(-50, listen_audioCtx.currentTime); 
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
        
        // Connect track 0: Filtered
        source.connect(listen_hpfNode);
        listen_hpfNode.connect(compressor);
        compressor.connect(listen_workletNode, 0, 0);

        // Connect track 1: Raw
        source.connect(listen_workletNode, 0, 1);

        // Connect analyser to source (raw) for better calibration scanning
        source.connect(listen_analyser);
        
        // We don't want to hear the mic output (feedback)
        // listen_workletNode.connect(listen_audioCtx.destination);

        listenEl.waveWrap.style.display = 'block';
        listen_drawWaveform();
        setTimeout(listen_inferenceLoop, 2000);

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

    if (listen_isWorkerReady) {
        listen_setStatus('');
        listen_results_proc = [];
        listen_results_raw  = [];
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

    if (listen_waveAnimId)  { cancelAnimationFrame(listen_waveAnimId); listen_waveAnimId = null; }
    if (listen_simInterval) { clearInterval(listen_simInterval); listen_simInterval = null; }
    if (listen_analyser)    { listen_analyser.disconnect(); listen_analyser = null; }
    if (listen_stream)      { listen_stream.getTracks().forEach(t => t.stop()); listen_stream = null; }
    if (listen_workletNode) { listen_workletNode.disconnect(); listen_workletNode = null; }
    if (listen_audioCtx)    { listen_audioCtx.close(); listen_audioCtx = null; }
}

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
        sensitivity: 1.0 // Automatic
    }, [windowed_proc.buffer]);

    listen_worker.postMessage({ 
        message: 'predict', 
        pcmAudio: windowed_raw, 
        track: 'raw',
        sensitivity: 1.0 // Automatic
    }, [windowed_raw.buffer]);

    if (listen_isListening) setTimeout(listen_inferenceLoop, 2000);
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
    if (max > 0.01 && max < 0.8) {
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
    canvas.width  = canvas.offsetWidth * dpr;
    canvas.height = 56 * dpr;
    const ctx    = canvas.getContext('2d');
    let phase    = 0;

    function drawFakeWave() {
        if (!listen_isSimulating) return;
        listen_waveAnimId = requestAnimationFrame(drawFakeWave);
        const W = canvas.width, H = canvas.height;

        // Shift and draw random noise columns for simulation
        ctx.drawImage(canvas, -2 * dpr, 0);
        ctx.fillStyle = '#0a1410';
        ctx.fillRect(W - 2 * dpr, 0, 2 * dpr, H);

        for (let i = 0; i < H; i += 4 * dpr) {
            const val = Math.random() < 0.1 ? Math.random() * 255 : Math.random() * 50;
            if (val > 40) {
                ctx.fillStyle = `rgb(${val}, ${val/2}, ${255-val})`;
                ctx.fillRect(W - 2 * dpr, H - i, 2 * dpr, 4 * dpr);
            }
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

window.listen_stopOnTabChange = listen_stop;

listenEl.startBtn.addEventListener('click', () => {
    (listen_isListening || listen_isSimulating) ? listen_stop() : listen_start();
});

listenEl.simBtn.addEventListener('click', () => {
    listen_toggleSimulation();
});
