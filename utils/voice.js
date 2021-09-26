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
    getVoiceConnection
} = require('@discordjs/voice');
const fs = require('fs-extra');
const { opus } = require('prism-media');
const { pipeline } = require('stream');
const convert = require('./convert')
const config = require('../config.json')
const discordTTS = require('discord-tts');
module.exports = {
    startPlaying,
    connectToChannel,
    createPlayer,
    tts,
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
async function tts(message, guild, callback){
    const connection = await getVoiceConnection(guild.id)
    if(!connection) return message.reply("I'm not in the voice channel anymore!")
    const player = await createPlayer()
    const subscription = connection.subscribe(player);
    startPlaying(discordTTS.getVoiceStream(message), player)
    player.on('stateChange', (oldState, newState) => {if (newState.status === AudioPlayerStatus.Idle) {subscription.unsubscribe(); player.stop(); if(callback != null || callback != undefined){callback()}}});
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
    let filename = `./recordingsRaw/${date}.ogg`
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

	pipeline(opusStream, oggStream, out, (err) => {
		if (err) {
			console.log(err)
		} else {
            convert(filename, `./recordings/${date}.wav`, function(err){
                if(!err) {
                    fs.unlink(filename, (err) => {
                       if (err) {
                          console.log(err)
                        }
                        resolve(`./recordings/${date}.wav`)
                     })
                } else {
                    console.log(err)
                }
             });
		}
	});
})
}