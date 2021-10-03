const { Collection, Client } = require('discord.js');
const config = require('./config.json')
const { token } = require('./token.json')
const { getVoiceConnection } = require('@discordjs/voice');
const { tts, createRecieverStream } = require('./utils/voice')
const client = new Client({ intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_VOICE_STATES'] });
const speachToText = require('./utils/speechToText')
const fs = require('fs-extra');
const enmap = require('enmap')
const { DiscordTogether } = require('discord-together');
client.discordTogether = new DiscordTogether(client);
client.guildSettings = new enmap({
    name: "guildSettings"
})
client.guildPlayers = new Map();
client.config = config
client.listen = listen
client.commands = new Collection();
client.wakeWord = wakeWord;
client.userphoneQueue = []
client.userphonesActive = new Map()
client.activeListening = new Map()
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	for(const name of command.names){
        client.commands.set(name, command)
    }
}
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
    if(client.commands.has(command)){
        let cmd = client.commands.get(command)
        if(isAudio && cmd.textOnly) return
        if(cmd.devOnly && message.author.id != '526776599505403904') return
        cmd.execute(message, client, args, isAudio)
    } else if(isAudio) {
        message.channel.send(`Hmm.. I couldn't understand you. I heard: "${command + ' ' + args.join(' ')}". Make sure to talk clearly and slowly.`)
        if(client.guildPlayers.has(message.guild.id)){
            let guildPlayer = client.guildPlayers.get(message.guild.id)
            guildPlayer.sub.unsubscribe()
            guildPlayer.player.pause()
            tts('Unknown Command', message, function(){
                const connection = getVoiceConnection(message.guild.id)
                if(!connection) return message.reply("I'm not in a voice channel anymore!")
                client.guildPlayers.set(message.guild.id, { sub: connection.subscribe(guildPlayer.player), player: guildPlayer.player})
                guildPlayer.player.unpause()
            })
        } else {
            tts('Unknown Command', message)
        }
    }
}
async function listen(receiver, message, commandMode){
    if(!commandMode){
        let audio = await createRecieverStream(receiver, message.author.id, message.guild.id, client)
        let text = (await speachToText('.' + audio)).replace(/\n/g, '')
        fs.unlink(audio, (err) => {
            if (err) {
            console.error(err)
            }
        })
        let WakeWord = client.wakeWord(message.guild.id)
        if(WakeWord.includes(text.toLowerCase())){
            tts('Listening for commands', message)
            listen(receiver, message, true)
        } else {
            listen(receiver, message)
        }
    } else {
        let audio = await createRecieverStream(receiver, message.author.id, message.guild.id, client)
        tts('Processing...', message)
        let args = ((await speachToText('.' + audio)).replace(/\n/g, '')).split(' ')
        let command = args.shift()
        executeCommand(command, args, message, true)
        fs.unlink(audio, (err) => {
            if (err) {
               console.error(err)
             }
          })
        listen(receiver, message)
    }
}
function wakeWord(guildid){
    if(client.guildSettings.has(guildid)){
        let word = client.guildSettings.get(guildid).wakeWord
        if(word){
            return word
        } else {
            return client.config.wakeWord
        }
    } else {
        return client.config.wakeWord
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