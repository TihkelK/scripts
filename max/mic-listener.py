# --- IMPORT MODULES ---
import os
import sys
import sounddevice as sd
import queue
import json
import numpy as np
from vosk import Model, KaldiRecognizer

# --- SETTINGS ---
MODEL_PATH = os.path.expanduser("~/model")
MIC = "AT2020USB+"
MIC_RATE = 44100
VOSK_RATE = 16000

q = queue.Queue()
def callback(indata, frames, time, status):
    if status:
        print(status, file=sys.stderr)
    q.put(indata.copy())

# --- FIND MIC ---
def find_device(name_hint=MIC):
    """Find input device index matching name_hint, else return default."""
    devices = sd.query_devices()
    for idx, dev in enumerate(devices):
        if name_hint.lower() in dev["name"].lower() and dev["max_input_channels"] > 0:
            return idx
    return sd.default.device[0]

def resample(audio, in_rate, out_rate):
    """Resample numpy int16 audio array from in_rate to out_rate."""
    if in_rate == out_rate:
        return audio
    ratio = out_rate / in_rate
    new_length = int(len(audio) * ratio)
    resampled = np.interp(
        np.linspace(0, len(audio), new_length, endpoint=False),
        np.arange(len(audio)),
        audio
    )
    return resampled.astype(np.int16)

# --- MAIN FUNCTION ---
def main():
    print("Loading model...")
    model = Model(MODEL_PATH)
    rec = KaldiRecognizer(model, VOSK_RATE)

    device_index = find_device()
    print(f"Using input device: {sd.query_devices(device_index)['name']} (index {device_index})")

    with sd.InputStream(samplerate=MIC_RATE, blocksize=4000,
                        dtype="int16", channels=1,
                        callback=callback, device=device_index):
        print("Listening... (Ctrl+C to stop)")
        while True:
            indata = q.get()
            audio = resample(indata[:, 0], MIC_RATE, VOSK_RATE).tobytes()
            if rec.AcceptWaveform(audio):
                result = json.loads(rec.Result())
                if "text" in result and result["text"].strip():
                    print(f"HEARD: {result['text']}", flush=True)

# --- MAIN LOOP ---
if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nExiting...")
