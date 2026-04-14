/**
 * BirdNET Live - Audio Processor Worklet
 * Replaces the deprecated ScriptProcessorNode.
 * Buffers audio frames and sends them to the main thread via MessagePort.
 */

class AudioProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.bufferSize = 2048;
        this._buffer = new Float32Array(this.bufferSize);
        this._bufferRaw = new Float32Array(this.bufferSize);
        this._index = 0;
    }

    process(inputs, outputs, parameters) {
        // inputs[0] is the processed stream (HPF, etc.)
        // inputs[1] is the raw stream
        const processedInput = inputs[0];
        const rawInput = inputs[1];

        if (processedInput && processedInput.length > 0 && rawInput && rawInput.length > 0) {
            const procData = processedInput[0];
            const rawData = rawInput[0];

            for (let i = 0; i < procData.length; i++) {
                this._buffer[this._index] = procData[i];
                this._bufferRaw[this._index] = rawData[i];
                this._index++;

                if (this._index >= this.bufferSize) {
                    this.port.postMessage({
                        processed: this._buffer,
                        raw: this._bufferRaw
                    });
                    this._index = 0;
                }
            }
        }
        return true;
    }
}

registerProcessor('audio-processor', AudioProcessor);
