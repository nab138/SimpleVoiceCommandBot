require('module-alias/register');
const {
	NoSubscriberBehavior,
	StreamType,
	createAudioPlayer,
	createAudioResource,
	entersState,
	AudioPlayerStatus,
	VoiceConnectionStatus,
	joinVoiceChannel,
    EndBehaviorType,
} = require('@discordjs/voice');
const fs = require('fs');
const { opus } = require('prism-media');
const { pipeline } = require('stream');
const convert = require('./convert')
const config = require('../config.json')
module.exports = {
    startPlaying,
    connectToChannel,
    createPlayer,
    handleStateChange,
    createRecieverStream
}
function createPlayer(){
    return new Promise((resolve, reject) => {
        try {
            let player = createAudioPlayer({
                behaviors: {
                    noSubscriber: NoSubscriberBehavior.Play,
                    maxMissedFrames: Math.round(5000 / 20),
                },
            });
            resolve(player)
        } catch(e) {
            reject(e)
        }
})
}
function handleStateChange(oldState, newState, connection, type) {
    switch(type){
        case 'infinite':
            if (newState.status === AudioPlayerStatus.Idle) {
                // Implement later
                console.log('Not implemented yet, I probably wont do it either so do it yourself');
                connection.destroy();
            }
            break;
        case 'once':
            if (newState.status === AudioPlayerStatus.Idle) {
                connection.destroy();
                console.log("Playback finished")
            }
            break;
    }
}


function startPlaying(url, player, type) {
	const resource = createAudioResource(url, {
		inputType: type ?? StreamType.Arbitrary,
	});

	player.play(resource);
}

async function connectToChannel(channel) {
	const connection = joinVoiceChannel({
		channelId: channel.id,
		guildId: channel.guild.id,
		adapterCreator: channel.guild.voiceAdapterCreator,
	});
	try {
		await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
		return connection;
	} catch (error) {
		connection.destroy();
		console.error(error)
	}
}
function createRecieverStream(receiver, userID){
    return new Promise((resolve, reject) => {
    let date = Date.now()
    const opusStream = receiver.subscribe(userID, {
		end: {
			behavior: EndBehaviorType.AfterSilence,
			duration: config.silencePeriod,
		},
	});
    let filename = `recordingsRaw/${date}.ogg`
    const out = fs.createWriteStream(filename);
	const oggStream = new opus.OggLogicalBitstream({
		opusHead: new opus.OpusHead({
			channelCount: 2,
			sampleRate: 48000,
		}),
		pageSizeControl: {
			maxPackets: 10,
		},
	});
	console.log(`Started recording ${filename}`);

	pipeline(opusStream, oggStream, out, (err) => {
		if (err) {
			reject(err);
		} else {
            convert(`./recordingsRaw/${date}.ogg`, `./recordings/${date}.wav`, function(err){
                if(!err) {
                    fs.unlink(`./recordingsRaw/${date}.ogg`, (err) => {
                       if (err) {
                          reject(err)
                        }
                        console.log(`Recorded ${filename}`);
                        resolve(`./recordings/${date}.wav`)
                     })
                } else {
                    reject(err)
                }
             });
		}
	});
})
}