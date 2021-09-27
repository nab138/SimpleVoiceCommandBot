const Discord = require('discord.js')
const checkWord = require('check-word'),
words = checkWord('en');
module.exports = {
	names: ['config', 'configure', 'settings'],
    textOnly: true,
	async execute(message, client, args, isAudio) {
        if(!args[0]){
        let curConfig = client.guildSettings.has(message.guild.id) ? client.guildSettings.get(message.guild.id) : { wakeWord: client.config.wakeWord, micTimeout: client.config.silencePeriod }
        const embed = new Discord.MessageEmbed()
        .setAuthor(client.user.tag, client.user.displayAvatarURL({dynamic: true}))
        .setColor(client.config.embedColor)
        .setTitle("BetterGroovy Config")
        .setDescription(`Hi! I'm BetterGroovy, a voice controlled music bot.\nTo change an option, run \`${client.config.prefix}config <setting> <value>\`\nOptions you can configure:`)
        .addField(`WakeWord`, `The word that will make me listen\nCurrent: ${curConfig.wakeWord[0]}\nType: English Word`, true)
        //.addField(`ListenPerm`, `The permission required for someone to use the listen command\nDefault: None\nType: Permission`, true)
        //.addField(`DisconnectPerm`, `The permission required for someone to disconnect me.\nDefault: None\nType: Permission`, true)
        .addField(`MicTimeout`, `The amount of silence that I hear before trying to proccess your voice.\nDefault: Current: ${curConfig.micTimeout}ms\nType: Milliseconds`, true)
        message.channel.send({embeds:[embed]})
        } else {
            let option = args[0].toLowerCase()
            let value = args[1].toLowerCase()
            if(!value) return message.reply('Please provide a value!')
            let curConfig = client.guildSettings.has(message.guild.id) ? client.guildSettings.get(message.guild.id) : { wakeWord: client.config.wakeWord, micTimeout: client.config.silencePeriod }
            switch(option){
                case 'wakeword':
                    if(!words.check(value)) return message.channel.send(`I won't be able to understand that!`)
                    curConfig.wakeWord = [ value ]
                    client.guildSettings.set(message.guild.id, curConfig)
                    message.channel.send(`Succesfully set the wake word to ${value}`)
                    break;
                /*case 'listenperm':
                    message.channel.send("ListenPerm")
                    break
                case 'disconnectperm':
                    message.channel.send("ListenPerm")
                    break*/
                case 'mictimeout':
                    if(isNaN(value)) return message.channel.send(`Please provide a valid milisecond value (without ms at the end)`)
                    curConfig.micTimeout = value
                    client.guildSettings.set(message.guild.id, curConfig)
                    message.channel.send(`Succesfully set the mic timeout to ${value}ms`)
                    break;
                default:
                    message.channel.send("Unkown Option")
                    break
            }
        }
    },
};