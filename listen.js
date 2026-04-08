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
let listen_circularBuffer, listen_circularWriteIdx;

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
                listen_handlePredictions(data.pooled || []);
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
function listen_handlePredictions(preds) {
    if (!listen_isListening) return;

    const threshold = 0.30;
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
    // Sortera efter när de först dök upp, så de behåller sin plats i listan
    const entries = Object.values(listen_session).sort((a, b) => b.firstHeardAt - a.firstHeardAt);

    // Show/hide placeholder
    if (listenEl.sessionEmpty) {
        listenEl.sessionEmpty.style.display = entries.length === 0 ? 'flex' : 'none';
    }

    const cards = entries.map(e => {
        const pct      = Math.round(e.confidence * 100);
        const isActive = e.isActive;
        const clickJs  = e.dbBird ? `window.listen_openBird('${e.dbBird.id}')` : '';
        
        // Check if bird is already in log
        const isObserved = e.dbBird && (window.state && window.state.sightings && window.state.sightings.some(s => s.birdId === e.dbBird.id));
        const observedClass = isObserved ? ' is-observed' : '';

        const imgHtml  = e.imgSrc
            ? `<img class="listen-scard-img${observedClass}" src="${e.imgSrc}" alt="${e.name}">`
            : `<div class="listen-scard-placeholder${observedClass}"><i class="fa-solid fa-dove"></i></div>`;

        const activeClass = isActive ? ' is-active' : '';
        const addBtnHtml = e.dbBird 
            ? `<button class="listen-scard-add-btn" onclick="event.stopPropagation(); window.listen_reportSighting('${e.dbBird.id}', '${e.name}')" title="Rapportera observation"><i class="fa-solid fa-plus"></i></button>`
            : '';

        return `
        <div class="listen-scard${activeClass}" onclick="${clickJs}">
            ${imgHtml}
            <div class="listen-scard-body">
                <div class="listen-scard-name">${e.name}</div>
                <div class="listen-scard-meta">${pct}% säkerhet</div>
            </div>
            ${addBtnHtml}
        </div>`;


    }).join('');

    // Inject cards without clobbering the empty placeholder
    const existing = listenEl.sessionList.querySelectorAll('.listen-scard');
    existing.forEach(el => el.remove());
    listenEl.sessionList.insertAdjacentHTML('beforeend', cards);
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
                echoCancellation: false, 
                noiseSuppression: false,
                autoGainControl: true
            }
        });

        listen_audioCtx = new AudioContext({ sampleRate: LISTEN_SAMPLE_RATE });
        if (listen_audioCtx.state === 'suspended') await listen_audioCtx.resume();

        const source = listen_audioCtx.createMediaStreamSource(listen_stream);
        
        // --- Compressor for quiet sounds ---
        // Just like in a music mix, we lift the quiet parts to help the AI "hear" better.
        const compressor = listen_audioCtx.createDynamicsCompressor();
        compressor.threshold.setValueAtTime(-50, listen_audioCtx.currentTime); // Boost starts at -50dB
        compressor.knee.setValueAtTime(40, listen_audioCtx.currentTime);      // Soft knee
        compressor.ratio.setValueAtTime(12, listen_audioCtx.currentTime);     // 12:1 compression
        compressor.attack.setValueAtTime(0, listen_audioCtx.currentTime);
        compressor.release.setValueAtTime(0.25, listen_audioCtx.currentTime);

        listen_circularBuffer   = new Float32Array(LISTEN_WINDOW_SAMPLES);
        listen_circularWriteIdx = 0;

        await listen_audioCtx.audioWorklet.addModule('audio-processor.js');
        listen_workletNode = new AudioWorkletNode(listen_audioCtx, 'audio-processor');
        listen_workletNode.port.onmessage = (e) => {
            const input = e.data;
            for (let i = 0; i < input.length; i++) {
                listen_circularBuffer[listen_circularWriteIdx] = input[i];
                listen_circularWriteIdx = (listen_circularWriteIdx + 1) % listen_circularBuffer.length;
            }
        };

        listen_analyser = listen_audioCtx.createAnalyser();
        listen_analyser.fftSize = 1024;
        
        // Connect: source -> compressor -> (analyser & worklet)
        source.connect(compressor);
        compressor.connect(listen_analyser);
        compressor.connect(listen_workletNode);
        
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
    tempCtx.fillStyle = '#000';
    tempCtx.fillRect(0, 0, W, H);

    function getSpectrogramColor(v) {
        if (v < 20)  return `rgb(0,0,${v/4})`;
        if (v < 80)  return `rgb(${v-20}, 0, ${100-v})`;
        if (v < 180) return `rgb(${v}, ${v/4}, 0)`;
        return `rgb(255, ${v}, ${v/2})`;
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
    if (!listen_isListening || !listen_isWorkerReady || !listen_circularBuffer) return;

    const windowed = new Float32Array(LISTEN_WINDOW_SAMPLES);
    let idx = listen_circularWriteIdx;
    for (let i = 0; i < LISTEN_WINDOW_SAMPLES; i++) {
        windowed[i] = Math.max(-1, Math.min(1, listen_circularBuffer[idx]));
        idx = (idx + 1) % listen_circularBuffer.length;
    }

    listen_worker.postMessage(
        { message: 'predict', pcmAudio: windowed, overlapSec: 0, sensitivity: 1.0 },
        [windowed.buffer]
    );

    if (listen_isListening) setTimeout(listen_inferenceLoop, 2000);
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
        ctx.fillStyle = '#000';
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
