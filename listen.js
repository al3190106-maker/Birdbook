// listen.js – BirdNET realtidsidentifiering
// Alla funktioner prefixade med listen_ för att undvika krockar med app.js

const listenEl = {
    startBtn:     document.getElementById('listen-start-btn'),
    statusText:   document.getElementById('listen-status'),
    resultsList:  document.getElementById('listen-results'),
    spinner:      document.getElementById('listen-spinner'),
    waveWrap:     document.getElementById('listen-waveform-wrap'),
    waveCanvas:   document.getElementById('listen-waveform'),
    sessionWrap:  document.getElementById('listen-session-wrap'),
    sessionList:  document.getElementById('listen-session-list'),
    simBtn:       document.getElementById('listen-sim-btn')
};

let listen_worker       = null;
let listen_audioCtx     = null;
let listen_workletNode  = null;
let listen_stream       = null;
let listen_isWorkerReady = false;
let listen_isListening  = false;
let listen_isSimulating = false;
let listen_analyser     = null;
let listen_waveAnimId   = null;
let listen_simInterval  = null;

// Session state
let listen_session = {}; // { scientificName: { name, scientificName, confidence, imgSrc, dbBird, time } }

// Audio constants
const LISTEN_SAMPLE_RATE   = 48000;
const LISTEN_WINDOW_SAMPLES = 144000; // 3 seconds
let listen_circularBuffer, listen_circularWriteIdx;

/* ---------------------------------------------------------------
   INIT WORKER
--------------------------------------------------------------- */
async function initBirdnet() {
    if (listen_worker) return;

    listenEl.statusText.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Laddar AI-modell... (10–30 sek)';
    listenEl.spinner.style.display = 'inline-block';

    try {
        listen_worker = new Worker('birdnet-worker.js?tf=tfjs-4.14.0.min.js&root=models&lang=sv');

        listen_worker.onmessage = (e) => {
            const data = e.data;
            if (['load_model','warmup','load_geomodel','load_labels'].includes(data.message)) {
                listenEl.statusText.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Laddar modell... ${data.progress || 0}%`;
            } else if (data.message === 'loaded') {
                listen_isWorkerReady = true;
                listenEl.startBtn.disabled = false;
                listenEl.spinner.style.display = 'none';
                listenEl.statusText.innerHTML = '<i class="fa-solid fa-check" style="color:green"></i> AI redo! Tryck på knappen för att börja lyssna.';
            } else if (data.message === 'pooled') {
                listen_handlePredictions(data.pooled || []);
            } else if (data.message === 'error') {
                listenEl.statusText.innerHTML = '<i class="fa-solid fa-bug" style="color:red"></i> Fel: ' + data.error;
                listenEl.spinner.style.display = 'none';
            }
        };

        listen_worker.onerror = (e) => {
            listenEl.statusText.innerHTML = '<i class="fa-solid fa-bug" style="color:red"></i> Worker-fel: ' + (e.message || 'okänt');
            listenEl.spinner.style.display = 'none';
        };
    } catch (err) {
        listenEl.statusText.innerHTML = '<i class="fa-solid fa-bug" style="color:red"></i> Kunde inte starta AI: ' + err.message;
        listenEl.spinner.style.display = 'none';
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
            if (typeof swedishBirds !== 'undefined') {
                return swedishBirds.some(b => b.scientific === p.scientificName);
            }
            return true;
        })
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5);

    // ----- Live results panel -----
    if (active.length === 0) {
        listenEl.resultsList.innerHTML = `<p style="text-align:center;color:#888;margin-top:1rem;">Lyssnar... hittade inget just nu.</p>`;
    } else {
        listenEl.resultsList.innerHTML = active.map(pred => listen_buildCard(pred)).join('');
    }

    // ----- Session log -----
    active.forEach(pred => {
        const existing = listen_session[pred.scientificName];
        if (!existing || pred.confidence > existing.confidence) {
            const dbBird = (typeof swedishBirds !== 'undefined')
                ? swedishBirds.find(b => b.scientific === pred.scientificName)
                : null;
            let imgSrc = null;
            if (dbBird && typeof window.birdImages !== 'undefined') {
                const io = window.birdImages[dbBird.id];
                if (io && io.length > 0) imgSrc = io[0].src;
            }
            listen_session[pred.scientificName] = {
                name: dbBird ? dbBird.nameSv : (pred.commonNameI18n || pred.scientificName),
                scientificName: pred.scientificName,
                confidence: pred.confidence,
                imgSrc,
                dbBird,
                time: new Date().toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            };
            listen_renderSession();
        }
    });
}

function listen_buildCard(pred) {
    const dbBird = (typeof swedishBirds !== 'undefined')
        ? swedishBirds.find(b => b.scientific === pred.scientificName)
        : null;
    const name    = dbBird ? dbBird.nameSv : (pred.commonNameI18n || pred.scientificName);
    const sci     = pred.scientificName;
    const pct     = Math.round(pred.confidence * 100);
    const clickAttr = dbBird ? `onclick="window.listen_openBird('${dbBird.id}')" style="cursor:pointer"` : '';

    let imgHtml = `<div style="width:48px;height:48px;border-radius:8px;background:#e2e8f0;margin-right:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="fa-solid fa-dove" style="color:#aaa"></i></div>`;
    if (dbBird && typeof window.birdImages !== 'undefined') {
        const io = window.birdImages[dbBird.id];
        if (io && io.length > 0) {
            imgHtml = `<img src="${io[0].src}" style="width:48px;height:48px;border-radius:8px;object-fit:cover;margin-right:14px;flex-shrink:0;">`;
        }
    }

    // Confidence bar color
    const col = pct >= 60 ? '#16a34a' : pct >= 40 ? '#f59e0b' : '#94a3b8';

    return `
    <div class="fact-card" ${clickAttr} style="animation: fade-in-card 0.3s ease-out; display:flex;align-items:center;margin-bottom:10px;padding:10px 14px;">
        ${imgHtml}
        <div style="flex:1;min-width:0;">
            <div style="font-weight:700;font-size:1rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${name}</div>
            <div style="font-size:0.78rem;color:var(--text-muted);font-style:italic;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${sci}</div>
            <div style="margin-top:5px;background:#e2e8f0;border-radius:99px;height:5px;overflow:hidden;">
                <div style="width:${pct}%;height:100%;background:${col};border-radius:99px;transition:width 0.4s;"></div>
            </div>
        </div>
        <div style="margin-left:12px;text-align:right;flex-shrink:0;">
            <div style="font-weight:900;font-size:1.1rem;color:${col};">${pct}%</div>
        </div>
    </div>`;
}

/* ---------------------------------------------------------------
   SESSION LOG
--------------------------------------------------------------- */
function listen_renderSession() {
    const entries = Object.values(listen_session).sort((a, b) => b.confidence - a.confidence);
    if (entries.length === 0) {
        listenEl.sessionWrap.style.display = 'none';
        return;
    }
    listenEl.sessionWrap.style.display = 'block';
    listenEl.sessionList.innerHTML = entries.map(e => {
        const pct = Math.round(e.confidence * 100);
        const col = pct >= 60 ? '#16a34a' : pct >= 40 ? '#f59e0b' : '#94a3b8';
        const thumb = e.imgSrc
            ? `<img src="${e.imgSrc}" style="width:40px;height:40px;border-radius:6px;object-fit:cover;margin-right:12px;flex-shrink:0;">`
            : `<div style="width:40px;height:40px;border-radius:6px;background:#e2e8f0;margin-right:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="fa-solid fa-dove" style="color:#aaa;font-size:0.9rem;"></i></div>`;
        const clickAttr = e.dbBird ? `onclick="window.listen_openBird('${e.dbBird.id}')" style="cursor:pointer"` : '';
        return `
        <div class="fact-card" ${clickAttr} style="display:flex;align-items:center;padding:8px 12px;margin-bottom:8px;">
            ${thumb}
            <div style="flex:1;min-width:0;">
                <div style="font-weight:600;font-size:0.95rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${e.name}</div>
                <div style="font-size:0.75rem;color:var(--text-muted);">${e.time} · bäst ${pct}%</div>
            </div>
            <div style="margin-left:10px;width:10px;height:10px;border-radius:50%;background:${col};flex-shrink:0;"></div>
        </div>`;
    }).join('');
}

window.listen_clearSession = function() {
    listen_session = {};
    listenEl.sessionWrap.style.display = 'none';
};

/* ---------------------------------------------------------------
   START / STOP
--------------------------------------------------------------- */
async function listen_start() {
    if (!listen_isWorkerReady) return;

    listen_isListening = true;
    listenEl.startBtn.classList.add('recording');
    listenEl.startBtn.innerHTML = '<i class="fa-solid fa-stop"></i> Sluta lyssna';
    listenEl.statusText.innerHTML = '<i class="fa-solid fa-microphone" style="color:red"></i> Lyssnar på naturen...';
    listenEl.spinner.style.display = 'inline-block';

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

        // Analyser for waveform
        listen_analyser = listen_audioCtx.createAnalyser();
        listen_analyser.fftSize = 1024;

        source.connect(listen_analyser);
        source.connect(listen_workletNode);
        listen_workletNode.connect(listen_audioCtx.destination);

        // Show waveform
        listenEl.waveWrap.style.display = 'block';
        listen_drawWaveform();

        setTimeout(listen_inferenceLoop, 2000);

    } catch (err) {
        listenEl.statusText.innerHTML = '<i class="fa-solid fa-triangle-exclamation" style="color:orange"></i> Mikrofon nekades eller stöds ej.';
        listen_stop();
    }
}

function listen_stop() {
    listen_isListening = false;
    listenEl.startBtn.classList.remove('recording');
    listenEl.startBtn.innerHTML = '<i class="fa-solid fa-microphone"></i> Lyssna';
    listenEl.spinner.style.display = 'none';
    listenEl.waveWrap.style.display = 'none';

    if (listen_isWorkerReady) {
        listenEl.statusText.innerHTML = '<i class="fa-solid fa-check" style="color:green"></i> AI redo! Tryck på knappen för att börja lyssna.';
    } else {
        listenEl.statusText.innerHTML = 'Pausad.';
    }

    if (listen_waveAnimId) { cancelAnimationFrame(listen_waveAnimId); listen_waveAnimId = null; }
    if (listen_analyser)   { listen_analyser.disconnect(); listen_analyser = null; }
    if (listen_stream)     { listen_stream.getTracks().forEach(t => t.stop()); listen_stream = null; }
    if (listen_workletNode){ listen_workletNode.disconnect(); listen_workletNode = null; }
    if (listen_audioCtx)   { listen_audioCtx.close(); listen_audioCtx = null; }
}

/* ---------------------------------------------------------------
   WAVEFORM VISUALIZER
--------------------------------------------------------------- */
function listen_drawWaveform() {
    if (!listen_analyser || !listenEl.waveCanvas) return;

    const canvas = listenEl.waveCanvas;
    canvas.width  = canvas.offsetWidth * (window.devicePixelRatio || 1);
    canvas.height = 60  * (window.devicePixelRatio || 1);
    canvas.style.height = '60px';

    const ctx = canvas.getContext('2d');
    const buf = new Uint8Array(listen_analyser.fftSize);

    function draw() {
        if (!listen_isListening) return;
        listen_waveAnimId = requestAnimationFrame(draw);

        listen_analyser.getByteTimeDomainData(buf);
        const W = canvas.width, H = canvas.height;

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, W, H);

        ctx.beginPath();
        ctx.lineWidth = 2 * (window.devicePixelRatio || 1);
        ctx.strokeStyle = '#38bdf8';

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
   SIMULATION OVERRIDE
--------------------------------------------------------------- */
function listen_toggleSimulation() {
    if (listen_isListening || listen_isSimulating) {
        listen_stop();
    } else {
        listen_startSim();
    }
}

function listen_startSim() {
    listen_isSimulating = true;
    listen_isListening = true; // Enables handlePredictions to work
    
    listenEl.startBtn.classList.add('recording');
    listenEl.startBtn.innerHTML = '<i class="fa-solid fa-stop"></i> Sluta lyssna';
    listenEl.simBtn.innerHTML = '<i class="fa-solid fa-stop"></i> Avsluta simulering';
    listenEl.statusText.innerHTML = '<i class="fa-solid fa-flask" style="color:var(--primary)"></i> Simulerar offline-läge...';
    listenEl.spinner.style.display = 'inline-block';
    
    // Fake waveform canvas since we have no mic
    listenEl.waveWrap.style.display = 'block';
    const canvas = listenEl.waveCanvas;
    canvas.width  = canvas.offsetWidth * (window.devicePixelRatio || 1);
    canvas.height = 60  * (window.devicePixelRatio || 1);
    const ctx = canvas.getContext('2d');
    
    function drawFakeWave() {
        if (!listen_isSimulating) return;
        listen_waveAnimId = requestAnimationFrame(drawFakeWave);
        
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.lineWidth = 2 * (window.devicePixelRatio || 1);
        ctx.strokeStyle = '#38bdf8';
        
        const sliceW = canvas.width / 50;
        let x = 0;
        for (let i = 0; i < 50; i++) {
            const v = 0.5 + (Math.random() * 0.3 - 0.15); // jittery line
            const y = v * canvas.height;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            x += sliceW;
        }
        ctx.stroke();
    }
    drawFakeWave();

    // Fake birds to inject
    const fakeBirds = [
        { scientificName: 'Turdus merula', commonNameI18n: 'Koltrast' },
        { scientificName: 'Erithacus rubecula', commonNameI18n: 'Rödhake' },
        { scientificName: 'Cyanistes caeruleus', commonNameI18n: 'Blåmes' },
        { scientificName: 'Fringilla coelebs', commonNameI18n: 'Bofink' },
        { scientificName: 'Parus major', commonNameI18n: 'Talgoxe' }
    ];

    listen_simInterval = setInterval(() => {
        // Generate 30 fake background noises with ~1% confidence
        const fakes = Array(30).fill(0).map(() => ({
            scientificName: 'Noisus backgroundus',
            confidence: Math.random() * 0.05
        }));
        
        // 50% chance to hear a real bird
        if (Math.random() > 0.5) {
            const numBirds = 1 + Math.floor(Math.random() * 2); // 1 or 2 birds at once
            for(let i=0; i<numBirds; i++) {
                const b = fakeBirds[Math.floor(Math.random() * fakeBirds.length)];
                fakes.push({
                    scientificName: b.scientificName,
                    commonNameI18n: b.commonNameI18n,
                    confidence: 0.35 + (Math.random() * 0.60) // 35% - 95% certainty
                });
            }
        }
        
        listen_handlePredictions(fakes);
    }, 2000);
}

// Update stop logic to also handle stopping simulation
const original_listen_stop = listen_stop;
listen_stop = function() {
    original_listen_stop();
    listen_isSimulating = false;
    listenEl.simBtn.innerHTML = '<i class="fa-solid fa-flask"></i> Simulera offline-träffar';
    if(listen_simInterval) { clearInterval(listen_simInterval); listen_simInterval = null; }
};

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
