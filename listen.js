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
                listen_setStatus('<i class="fa-solid fa-check" style="color:#8FBC8F"></i> AI redo – tryck för att börja lyssna');
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
        const imgHtml  = e.imgSrc
            ? `<img class="listen-scard-img" src="${e.imgSrc}" alt="${e.name}">`
            : `<div class="listen-scard-placeholder"><i class="fa-solid fa-dove"></i></div>`;

        const activeClass = isActive ? ' is-active' : '';

        return `
        <div class="listen-scard${activeClass}" onclick="${clickJs}">
            ${imgHtml}
            <div class="listen-scard-body">
                <div class="listen-scard-name">${e.name}</div>
                <div class="listen-scard-meta">${pct}% säkerhet</div>
            </div>
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
            audio: { channelCount: 1, sampleRate: LISTEN_SAMPLE_RATE, echoCancellation: false, noiseSuppression: false }
        });

        listen_audioCtx = new AudioContext({ sampleRate: LISTEN_SAMPLE_RATE });
        if (listen_audioCtx.state === 'suspended') await listen_audioCtx.resume();

        const source = listen_audioCtx.createMediaStreamSource(listen_stream);
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
        source.connect(listen_analyser);
        source.connect(listen_workletNode);
        listen_workletNode.connect(listen_audioCtx.destination);

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
        listen_setStatus('<i class="fa-solid fa-check" style="color:#8FBC8F"></i> AI redo – tryck för att börja lyssna');
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
    canvas.width  = canvas.offsetWidth * dpr;
    canvas.height = 56 * dpr;
    canvas.style.height = '56px';

    const ctx = canvas.getContext('2d');
    const buf = new Uint8Array(listen_analyser.fftSize);

    function draw() {
        if (!listen_isListening) return;
        listen_waveAnimId = requestAnimationFrame(draw);
        listen_analyser.getByteTimeDomainData(buf);
        const W = canvas.width, H = canvas.height;

        ctx.clearRect(0, 0, W, H);

        // Subtle centre line
        ctx.strokeStyle = 'rgba(46,93,75,0.12)';
        ctx.lineWidth   = 1;
        ctx.beginPath();
        ctx.moveTo(0, H / 2);
        ctx.lineTo(W, H / 2);
        ctx.stroke();

        // Waveform
        ctx.beginPath();
        ctx.lineWidth   = 2.5 * dpr;
        ctx.lineCap     = 'round';
        ctx.lineJoin    = 'round';
        ctx.strokeStyle = '#2E5D4B';

        const sliceW = W / buf.length;
        let x = 0;
        for (let i = 0; i < buf.length; i++) {
            const v = buf[i] / 128.0;
            const y = (v * H) / 2;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            x += sliceW;
        }
        ctx.lineTo(W, H / 2);
        ctx.stroke();
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

        ctx.clearRect(0, 0, W, H);

        ctx.strokeStyle = 'rgba(46,93,75,0.12)';
        ctx.lineWidth   = 1;
        ctx.beginPath();
        ctx.moveTo(0, H / 2);
        ctx.lineTo(W, H / 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.lineWidth   = 2.5 * dpr;
        ctx.lineCap     = 'round';
        ctx.lineJoin    = 'round';
        ctx.strokeStyle = '#2E5D4B';

        const sliceW = W / 100;
        let x = 0;
        for (let i = 0; i < 100; i++) {
            const amp = 0.15 + Math.random() * 0.15;
            const y   = H / 2 + Math.sin(i * 0.4 + phase) * amp * H + (Math.random() - 0.5) * 0.03 * H;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            x += sliceW;
        }
        ctx.stroke();
        phase += 0.08;
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
    if (typeof window.showBirdDetail === 'function') window.showBirdDetail(birdId);
};

window.listen_stopOnTabChange = listen_stop;

listenEl.startBtn.addEventListener('click', () => {
    (listen_isListening || listen_isSimulating) ? listen_stop() : listen_start();
});

listenEl.simBtn.addEventListener('click', () => {
    listen_toggleSimulation();
});
