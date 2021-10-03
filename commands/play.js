const Discord = require('discord.js')
const { connectToChannel, startPlaying, createPlayer } = require('../utils/voice')
const { AudioPlayerStatus, getVoiceConnection } = require('@discordjs/voice');
const play = require('play-dl')
const gtts = require('node-gtts')('en');
module.exports = {
	names: ['les', 'play', 'slay', 'clay', 'played'],
	async execute(message, client, args, isAudio) {
        try {
            let connection = await getVoiceConnection(message.guild.id);
            const channel = message.member?.voice.channel;
            if (!connection) {
                try {
                    connection = await connectToChannel(channel)
                } catch (error) {
                    console.error(error);
                }
            }
            const TTSplayer = await createPlayer()
            const player = await createPlayer()
            let subscription = connection.subscribe(TTSplayer);
            let yt_info = await play.search(args.join(' '), { limit : 1 })
            let stream = await play.stream(yt_info[0].url)
            startPlaying(gtts.stream(`Ok. Here's - ${yt_info[0].title} by ${yt_info[0].channel.name}`), TTSplayer)
            TTSplayer.on('stateChange', (oldState, newState) => {if (newState.status === AudioPlayerStatus.Idle) {
                subscription.unsubscribe()
                TTSplayer.stop()
                let sub = connection.subscribe(player)
                startPlaying(stream.stream, player, stream.type)
                client.guildPlayers.set(message.guild.id, { player, sub })
                player.on('stateChange', (oldState, newState) => {if (newState.status === AudioPlayerStatus.Idle) {
                    player.stop()
                    try {
                    connection.destroy()
                    } catch (e){
                        void e
                    }
                    client.guildPlayers.delete(message.guild.id)
                }});
            }});
            message.channel.send(`Playing ${yt_info[0].title} (Recieved ${args.join(' ')})`)
        } catch (e){
            console.error(e)
        }
	},
};