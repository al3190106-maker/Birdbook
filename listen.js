// listen.js – BirdNET realtidsidentifiering
// OBS: Alla funktionsnamn är prefixade med "listen_" för att undvika krockar med app.js

const listenEl = {
    startBtn: document.getElementById('listen-start-btn'),
    statusText: document.getElementById('listen-status'),
    resultsList: document.getElementById('listen-results'),
    spinner: document.getElementById('listen-spinner')
};

let listen_worker = null;
let listen_audioCtx = null;
let listen_workletNode = null;
let listen_stream = null;
let listen_isWorkerReady = false;
let listen_isListening = false;

// Audio constants
const LISTEN_SAMPLE_RATE = 48000;
const LISTEN_WINDOW_SAMPLES = 144000; // 3 seconds at 48kHz
let listen_circularBuffer, listen_circularWriteIdx;

async function initBirdnet() {
    if (listen_worker) return; // Redan startad

    listenEl.statusText.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Laddar AI-modell... (detta tar ca 10-30 sek)';
    listenEl.spinner.style.display = 'inline-block';

    try {
        // Använd lokal TF-fil, undviker CDN-blockering
        const workerUrl = 'birdnet-worker.js?tf=tfjs-4.14.0.min.js&root=models&lang=sv';
        listen_worker = new Worker(workerUrl);

        listen_worker.onmessage = (e) => {
            const data = e.data;
            if (data.message === 'load_model' || data.message === 'warmup' || data.message === 'load_geomodel' || data.message === 'load_labels') {
                const pct = data.progress || 0;
                listenEl.statusText.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Laddar modell... ${pct}%`;
            } else if (data.message === 'loaded') {
                listen_isWorkerReady = true;
                listenEl.statusText.innerHTML = '<i class="fa-solid fa-check" style="color:green"></i> AI redo! Tryck på knappen för att lyssna.';
                listenEl.startBtn.disabled = false;
                listenEl.spinner.style.display = 'none';
            } else if (data.message === 'pooled') {
                listen_handlePredictions(data.pooled || []);
            } else if (data.message === 'error') {
                listenEl.statusText.innerHTML = '<i class="fa-solid fa-bug" style="color:red"></i> Fel: ' + data.error;
                listenEl.spinner.style.display = 'none';
                console.error('BirdNET worker error:', data.error);
            }
        };

        listen_worker.onerror = (e) => {
            const msg = e.message || 'okänt worker-fel';
            listenEl.statusText.innerHTML = '<i class="fa-solid fa-bug" style="color:red"></i> Worker-fel: ' + msg;
            listenEl.spinner.style.display = 'none';
            console.error('Worker error event:', e);
        };
    } catch(err) {
        listenEl.statusText.innerHTML = '<i class="fa-solid fa-bug" style="color:red"></i> Kunde inte starta AI: ' + err.message;
        listenEl.spinner.style.display = 'none';
        console.error(err);
    }
}

function listen_handlePredictions(preds) {
    if (!listen_isListening) return;

    // Only show results above 30% confidence AND that exist in our Swedish bird database
    const threshold = 0.30;
    const active = preds
        .filter(p => {
            if (p.confidence < threshold) return false;
            // Only show if the bird exists in our Swedish database
            if (typeof swedishBirds !== 'undefined') {
                return swedishBirds.some(b => b.scientific === p.scientificName);
            }
            return true;
        })
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5);

    if (active.length === 0) {
        listenEl.resultsList.innerHTML = `<p style="text-align:center; color:#888; margin-top:2rem;">Lyssnar... hittade inget just nu.</p>`;
        return;
    }

    let html = '';
    active.forEach(pred => {
        const dbBird = (typeof swedishBirds !== 'undefined')
            ? swedishBirds.find(b => b.scientific === pred.scientificName)
            : null;

        const nameToUse = dbBird ? dbBird.name : (pred.commonNameI18n || pred.commonName || pred.scientificName);
        const subToUse  = pred.scientificName;
        const pct = Math.round(pred.confidence * 100);

        let imgHtml = `<div style="width:50px;height:50px;border-radius:8px;background:#e2e8f0;margin-right:15px;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="fa-solid fa-dove" style="color:#aaa"></i></div>`;
        if (dbBird && typeof localBirdImages !== 'undefined') {
            const imageObj = localBirdImages[dbBird.id];
            const imgSrc = imageObj && imageObj.images && imageObj.images.length > 0
                ? imageObj.images[0].src
                : null;
            if (imgSrc) {
                imgHtml = `<img src="${imgSrc}" style="width:50px;height:50px;border-radius:8px;object-fit:cover;margin-right:15px;flex-shrink:0;">`;
            }
        }

        const clickAttr = dbBird ? `onclick="window.listen_openBird('${dbBird.id}')" style="cursor:pointer"` : '';

        html += `
        <div class="fact-card" ${clickAttr} style="display:flex;align-items:center;margin-bottom:10px;">
            ${imgHtml}
            <div style="flex:1;min-width:0;">
                <div style="font-weight:700;font-size:1rem;color:var(--text-main);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${nameToUse}</div>
                <div style="font-size:0.8rem;color:var(--text-muted);font-style:italic;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${subToUse}</div>
            </div>
            <div style="text-align:right;margin-left:10px;flex-shrink:0;">
                <div style="font-weight:900;font-size:1.1rem;color:var(--primary);">${pct}%</div>
            </div>
        </div>`;
    });

    listenEl.resultsList.innerHTML = html;
}

window.listen_openBird = function(birdId) {
    // Delegate to the main app's bird detail function if available
    if (typeof window.showBirdDetail === 'function') {
        window.showBirdDetail(birdId);
    }
};

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
        listen_circularBuffer = new Float32Array(LISTEN_WINDOW_SAMPLES);
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

        source.connect(listen_workletNode);
        listen_workletNode.connect(listen_audioCtx.destination);

        setTimeout(listen_inferenceLoop, 2000); // Vänta 2 sek innan första analys

    } catch (err) {
        console.error(err);
        listenEl.statusText.innerHTML = '<i class="fa-solid fa-triangle-exclamation" style="color:orange"></i> Mikrofon nekades eller stöds ej.';
        listen_stop();
    }
}

function listen_stop() {
    listen_isListening = false;
    listenEl.startBtn.classList.remove('recording');
    listenEl.startBtn.innerHTML = '<i class="fa-solid fa-microphone"></i> Lyssna';
    if (!listen_isWorkerReady) {
        listenEl.statusText.innerHTML = 'Pausad.';
    } else {
        listenEl.statusText.innerHTML = '<i class="fa-solid fa-check" style="color:green"></i> AI redo! Tryck på knappen för att lyssna.';
    }
    listenEl.spinner.style.display = 'none';

    if (listen_stream) {
        listen_stream.getTracks().forEach(t => t.stop());
        listen_stream = null;
    }
    if (listen_workletNode) {
        listen_workletNode.disconnect();
        listen_workletNode = null;
    }
    if (listen_audioCtx) {
        listen_audioCtx.close();
        listen_audioCtx = null;
    }
}

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

// Koppla knappen
listenEl.startBtn.addEventListener('click', () => {
    if (listen_isListening) {
        listen_stop();
    } else {
        listen_start();
    }
});

// Exportera stop-funktion med nytt namn för tab-switcher
window.listen_stopOnTabChange = listen_stop;
