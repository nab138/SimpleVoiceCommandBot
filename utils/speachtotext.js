const vosk = require('vosk')
vosk.setLogLevel(-1)
const fs = require("fs");
const { Readable } = require("stream");
const wav = require("wav");
module.exports = speachToText;
function speachToText(FILE_NAME, MODEL_PATH){
    return new Promise((resolve, reject) => {
    console.log(FILE_NAME)
if (!fs.existsSync(MODEL_PATH)) {
    console.log("Please download the model from https://alphacephei.com/vosk/models and unpack as " + MODEL_PATH + " in the current folder.")
    process.exit()
}

if (process.argv.length > 2)
    FILE_NAME = process.argv[2]

vosk.setLogLevel(0);
const model = new vosk.Model(MODEL_PATH);

const wfReader = new wav.Reader();
const wfReadable = new Readable().wrap(wfReader);

wfReader.on('format', async ({ audioFormat, sampleRate, channels }) => {
    if (audioFormat != 1 || channels != 1) {
        console.error("Audio file must be WAV format mono PCM.");
        process.exit(1);
    }
    const rec = new vosk.Recognizer({model: model, sampleRate: sampleRate});
    rec.setMaxAlternatives(10);
    rec.setWords(true);
    for await (const data of wfReadable) {
        const end_of_speech = rec.acceptWaveform(data);
        if (end_of_speech) {
              console.log(JSON.stringify(rec.result(), null, 4));
        }
    }
    let res = rec.finalResult(rec)
    rec.free();
    console.log(res['alternatives'][0])
    resolve((res['alternatives'][0].text ?? 'nothing').trim())
});

fs.createReadStream(FILE_NAME, {'highWaterMark': 4096}).pipe(wfReader).on('finish', 
    function (err) {
        model.free();
});
    })
}