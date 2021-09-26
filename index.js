const { Client } = require('discord.js');
const config = require('./config.json')
const { token } = require('./token.json')
const discordTTS = require('discord-tts');
const { AudioPlayerStatus, getVoiceConnection } = require('@discordjs/voice');
const { startPlaying, connectToChannel, createPlayer, tts, createRecieverStream } = require('./utils/voice')
const client = new Client({ intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_VOICE_STATES'] });
const speachToText = require('./utils/speechToText')
const play = require('play-dl')
const fs = require('fs-extra');
const guildPlayers = new Map()
client.on('ready', async () => {
	console.log('Ready!');
});


client.on('messageCreate', async (message) => {
	if (!message.guild) return;
    if(message.author.bot) return;
    if(!message.content.startsWith(config.prefix)) return;
    let args = message.content.slice(config.prefix.length).split(' ')
    let command = args.shift()
    executeCommand(command, args, message)
});
async function executeCommand(command, args, message, isAudio){
    // TODO: CONVERT TO COMMAND HANDLER
    if (command === 'listen') {
		const channel = message.member?.voice.channel;
		if (channel) {
			try {
				const connection = await connectToChannel(channel);
                listen(connection.receiver, message.author.id, message)
				await message.reply(`Say ${config.wakeWord[0]} to run a command!`)
			} catch (error) {
				console.error(error);
			}
		} else {
			await message.reply('Join a voice channel then try again!');
		}
	} else if (['les', 'play', 'slay', 'clay'].includes(command)){
        try {
            let connection;
            const channel = message.member?.voice.channel;
            if (channel) {
                try {
                    if(isAudio){
                        connection = await getVoiceConnection(message.guild.id)
                        if(!connection) return message.reply("I'm not in the voice channel anymore!")
                    } else {
                        connection = await connectToChannel(channel)
                    }
                } catch (error) {
                    console.error(error);
                }
            }
            const TTSplayer = await createPlayer()
            const player = await createPlayer()
            let subscription = connection.subscribe(TTSplayer);
            let yt_info = await play.search(args.join(' '), { limit : 1 })
            let stream = await play.stream(yt_info[0].url)
            startPlaying(discordTTS.getVoiceStream(`Now playing: ${yt_info[0].title} by ${yt_info[0].channel.name} ahahahaha`), TTSplayer)
            TTSplayer.on('stateChange', (oldState, newState) => {if (newState.status === AudioPlayerStatus.Idle) {
                subscription.unsubscribe()
                TTSplayer.stop()
                let sub = connection.subscribe(player)
                startPlaying(stream.stream, player, stream.type)
                guildPlayers.set(message.guild.id, { player, sub })
                player.on('stateChange', (oldState, newState) => {if (newState.status === AudioPlayerStatus.Idle) {
                    player.stop()
                    connection.destroy()
                    guildPlayers.delete(message.guild.id)
                }});
            }});
            message.channel.send(`Playing ${yt_info[0].title} (Recieved ${args.join(' ')})`)
        } catch (e){
            console.error(e)
        }
    } else if (['disconnect', 'stop', 'dc', 'end'].includes(command)) {
        const connection = await getVoiceConnection(message.guild.id)
        if(!connection) return message.reply("I'm not even in a voice channel!")
        tts('Goodbye you little imposter nerd', message.guild, function(){connection.destroy(); guildPlayers.delete(message.guild.id); message.channel.send('disconnected!')})
	} else if(isAudio) {
        if(guildPlayers.has(message.guild.id)){
            let guildPlayer = guildPlayers.get(message.guild.id)
            guildPlayer.sub.unsubscribe()
            guildPlayer.player.pause()
            tts('Unknown Command nerd idiot stupid fat garbage man I hate you loser your mom haha funny', message.guild, function(){
                const connection = getVoiceConnection(message.guild.id)
                if(!connection) return message.reply("I'm not in a voice channel anymore!")
                guildPlayers.set(message.guild.id, { sub: connection.subscribe(guildPlayer.player), player: guildPlayer.player})
                guildPlayer.player.unpause()
            })
        } else {
            tts('Unknown Command nerd idiot stupid fat garbage man I hate you loser your mom haha funny', message.guild)
        }
    }
}
async function listen(receiver, userID, message, commandMode){
    if(!commandMode){
        let audio = await createRecieverStream(receiver, userID)
        let text = (await speachToText('.' + audio)).replace(/\n/g, '')
        fs.unlink(audio, (err) => {
            if (err) {
            console.error(err)
            }
        })
        if(config.wakeWord.includes(text.toLowerCase())){
            tts('Listening for commands imposter from am', message.guild)
            listen(receiver, userID, message, true)
        } else {
            listen(receiver, userID, message)
        }
    } else {
        let audio = await createRecieverStream(receiver, userID)
        let args = ((await speachToText('.' + audio)).replace(/\n/g, '')).split(' ')
        let command = args.shift()
        executeCommand(command, args, message, true)
        fs.unlink(audio, (err) => {
            if (err) {
               console.error(err)
             }
          })
        listen(receiver, userID, message)
    }
}

fs.emptyDir('./recordings', err => {
    if (err) return console.error(err)
    console.log('Emptied recordings')
})
fs.emptyDir('./recordingsRaw', err => {
    if (err) return console.error(err)
    console.log('Emptied recordingsRaw')
})
void client.login(token);