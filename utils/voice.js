require('module-alias/register');
const gtts = require('node-gtts')('en');
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
const { pipeline, Stream } = require('stream');
const convert = require('./convert')
const config = require('../config.json')
module.exports = {
    startPlaying,
    connectToChannel,
    createPlayer,
    tts,
    createRecieverStream,
    pipeToOtherGuild
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
async function tts(text, message, callback){
    const connection = await getVoiceConnection(message.guild.id)
    if(!connection) return message.reply("I'm not in the voice channel anymore!")
    const player = await createPlayer()
    const subscription = connection ? connection.subscribe(player) : null;
    if(connection) startPlaying(gtts.stream(text), player)
    if(connection) player.on('stateChange', (oldState, newState) => {try {if (newState.status === AudioPlayerStatus.Idle) {subscription.unsubscribe(); player.stop(); if(callback != null && callback != undefined){callback()}}}catch(e){void e; connection.destroy()}});
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
async function pipeToOtherGuild(receiver, userID, targetPlayer){
    const opusStream = receiver.subscribe(userID)
    startPlaying(opusStream, targetPlayer, StreamType.Opus)
}
function createRecieverStream(receiver, userID, guildID, client){
    return new Promise((resolve, reject) => {
    let date = Date.now()
    let silencePeriod;
    if(client.guildSettings.has(guildID)){
        silencePeriod = client.guildSettings.get(guildID).micTimeout ?? client.config.silencePeriod
    } else {
        silencePeriod = client.config.silencePeriod
    }
    const opusStream = receiver.subscribe(userID, {
		end: {
			behavior: EndBehaviorType.AfterSilence,
			duration: silencePeriod,
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