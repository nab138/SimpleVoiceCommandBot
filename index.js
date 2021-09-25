const { Client } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
const config = require('./config.json')
const { token } = require('./token.json')
const { startPlaying, connectToChannel, createPlayer, handleStateChange, createRecieverStream } = require('./utils/voice')
const client = new Client({ intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_VOICE_STATES'] });
const speachToText = require('./utils/speachtotext')
const play = require('play-dl')
const fs = require('fs')
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
async function executeCommand(command, args, message){
    // TODO: CONVERT TO COMMAND HANDLER
    if (command === 'listen') {
		const channel = message.member?.voice.channel;
		if (channel) {
			try {
				const connection = await connectToChannel(channel);
                listen(connection.receiver, message.author.id, message)
				await message.reply(`Say ${config.wakeWord} to run a command!`)
			} catch (error) {
				console.error(error);
			}
		} else {
			await message.reply('Join a voice channel then try again!');
		}
	} else if (['les', 'play', 'slay', 'clay'].includes){
        try {
            const connection = getVoiceConnection(message.guild.id);
            const player = await createPlayer()
            connection.subscribe(player);
            let yt_info = await play.search(args.join(' '), { limit : 1 })
            let stream = await play.stream(yt_info[0].url)
            startPlaying(stream.stream, player, stream.type)
        } catch (e){
            console.error(e)
        }
    } else {
        message.channel.send("Unkown command!")
    }
}
async function listen(receiver, userID, message, commandMode){
    if(!commandMode){
        let audio = await createRecieverStream(receiver, userID)
        let text = await speachToText(audio, 'smallmodel')
        setTimeout(function(){fs.unlinkSync(audio)}, 500)
        console.log(text)
        if(text.toLowerCase() == config.wakeWord){
            message.channel.send("Listening to command...")
            listen(receiver, userID, message, true)
        } else {
            listen(receiver, userID, message)
        }
    } else {
        let audio = await createRecieverStream(receiver, userID)
        let args = (await speachToText(audio, 'smallmodel')).split(' ')
        let command = args.shift()
        executeCommand(command, args, message)
        setTimeout(function(){fs.unlinkSync(audio)}, 500)
        listen(receiver, userID, message)
    }
}
void client.login(token);