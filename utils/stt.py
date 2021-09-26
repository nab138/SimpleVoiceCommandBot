from vosk import Model, KaldiRecognizer, SetLogLevel
import sys
import json
from os import path
import wave

SetLogLevel(-1)

if not path.exists("model"):
    print ("Please download the model from https://alphacephei.com/vosk/models and unpack as 'model' in the current folder.")
    exit (1)

wf = wave.open(path.join(path.dirname(path.realpath(__file__)), sys.argv[1]), "rb")
if wf.getnchannels() != 1 or wf.getsampwidth() != 2 or wf.getcomptype() != "NONE":
    print ("Audio file must be WAV format mono PCM.")
    exit (1)

model = Model("model")
rec = KaldiRecognizer(model, wf.getframerate())
rec.SetWords(True)

while True:
    data = wf.readframes(4000)
    if len(data) == 0:
        break
    rec.AcceptWaveform(data)

res = json.loads(rec.FinalResult())
print (res['text'])