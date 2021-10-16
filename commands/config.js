const Discord = require('discord.js')
const checkWord = require('check-word'),
words = checkWord('en');
module.exports = {
	names: ['config', 'configure', 'settings'],
    textOnly: true,
	async execute(message, client, args, isAudio) {
        if(!args[0]){
            let curConfig = client.currentGuildSettings(message.guild.id)
            client.guildSettings.set(message.guild.id, curConfig)   
        const embed = new Discord.MessageEmbed()
        .setAuthor(client.user.tag, client.user.displayAvatarURL({dynamic: true}))
        .setColor(client.config.embedColor)
        .setTitle(`${client.config.botName} Config`)
        .setDescription(`Hi! I'm BetterGroovy, a voice controlled music bot.\nTo change an option, run \`${client.config.prefix}config <setting> <value>\`\nOptions you can configure:`)
        .addField(`WakeWord`, `The word that will make me listen\nCurrent: ${curConfig.wakeWord[0]}\nType: English Word`, true)
        .addField(`MicTimeout`, `The amount of silence that I hear before trying to proccess your voice.\nDefault: Current: ${curConfig.micTimeout}ms\nType: Milliseconds`, true)
        .addField(`ListenPerm`, `The permission required for someone to use the listen command\nCurrent: ${curConfig.permissions.listen}\nType: [Permission](https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags)`, true)
        .addField(`DisconnectPerm`, `The permission required for someone to disconnect me from a voice channel.\nCurrent: ${curConfig.permissions.disconnect}\nType: [Permission](https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags)`, true)
        .addField(`ConfigPerm`, `The permission required for someone to change this config.\nCurrent: ${curConfig.permissions.config}\nType: [Permission](https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags)`, true)
        message.reply({embeds:[embed]})
        } else {
            let curConfig = client.currentGuildSettings(message.guild.id)
            if(curConfig.permissions.config != "NONE" && !message.member.permissions.has(curConfig.permissions.config)) return message.reply("You don't have permission to do that!")
            if(!args[1]) return message.reply("Please provide a value!")
            let option = args[0].toLowerCase()
            let value = args[1].toLowerCase()
            if(!value) return message.reply('Please provide a value!')
            switch(option){
                case 'wakeword':
                    if(!words.check(value)) return message.reply(`I won't be able to understand that!`)
                    curConfig.wakeWord = [ value ]
                    client.guildSettings.set(message.guild.id, curConfig)
                    message.reply(`Succesfully set the wake word to ${value}`)
                    break;
                case 'mictimeout':
                    if(isNaN(value)) return message.reply(`Please provide a valid milisecond value (without ms at the end)`)
                    if(parseInt(value) < 100) return message.reply(`Please use a bigger value!`)
                    if(parseInt(value) > 1500) return message.reply(`Please use a smaller value!`)
                    curConfig.micTimeout = value
                    client.guildSettings.set(message.guild.id, curConfig)
                    message.reply(`Succesfully set the mic timeout to ${value}ms`)
                    break;
                case 'listenperm':
                    if(value.toUpperCase() != "NONE" && !Discord.Permissions.FLAGS[value.toUpperCase()]) return message.reply("Please provide a valid Permission! You can pick one from the list at <https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags> (e.g. KICK_MEMBERS)")
                    if(message.member.permissions.has(value.toUpperCase())){
                        curConfig.permissions.config = value.toUpperCase()
                        client.guildSettings.set(message.guild.id, curConfig)
                        message.reply(`Succesfully set ListenPerm to ${value.toUpperCase()}`)
                    } else {
                        const row = new Discord.MessageActionRow()
                        .addComponents(
                            new Discord.MessageButton()
                                .setCustomId('continue')
                                .setLabel('Continue')
                                .setStyle('SUCCESS'),
                            new Discord.MessageButton()
                                .setCustomId('cancel')
                                .setLabel('Cancel')
                                .setStyle('DANGER'),
                        );
                        let msg = await message.reply({content: ":raised_hand: Hold Up! You don't have this permission, which means you won't be able to disconnect the bot. If you would still like to do this, press continue.", components: [row], fetchReply: true})
                        const filter = i => i.user.id === message.author.id;
                        const collector = msg.createMessageComponentCollector({ filter, time: 10000, max: 1, componentType: 'BUTTON' });
                        collector.on('collect', async i => {
                            try {await i.deferUpdate()}catch(e){return};
                            if (i.customId === 'continue') {
                                curConfig.permissions.listen = value.toUpperCase()
                                client.guildSettings.set(message.guild.id, curConfig)
                                message.channel.send(`Succesfully set ListenPerm to ${value.toUpperCase()}`)
                            } else {
                                message.channel.send("Cancelled.")
                            }
                        });
                        collector.on('end', async i => {
                            if(i.size < 1){
                                message.channel.send("Cancelled.")
                            }
                        })
                    }
                    break
                case 'disconnectperm':
                    if(value.toUpperCase() != "NONE" && !Discord.Permissions.FLAGS[value.toUpperCase()]) return message.reply("Please provide a valid Permission! You can pick one from the list at <https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags> (e.g. KICK_MEMBERS)")
                    if(message.member.permissions.has(value.toUpperCase())){
                        curConfig.permissions.disconnect = value.toUpperCase()
                        client.guildSettings.set(message.guild.id, curConfig)
                        message.reply(`Succesfully set DisconnectPerm to ${value.toUpperCase()}`)
                    } else {
                        const row = new Discord.MessageActionRow()
                        .addComponents(
                            new Discord.MessageButton()
                                .setCustomId('continue')
                                .setLabel('Continue')
                                .setStyle('SUCCESS'),
                            new Discord.MessageButton()
                                .setCustomId('cancel')
                                .setLabel('Cancel')
                                .setStyle('DANGER'),
                        );
                        let msg = await message.reply({content: ":raised_hand: Hold Up! You don't have this permission, which means you won't be able to disconnect the bot. If you would still like to do this, press continue.", components: [row], fetchReply: true})
                        const filter = i => i.user.id === message.author.id;
                        const collector = msg.createMessageComponentCollector({ filter, time: 10000, max: 1, componentType: "BUTTON" });
                        collector.on('collect', async i => {
                            try {await i.deferUpdate()}catch(e){return};
                            if (i.customId === 'continue') {
                                curConfig.permissions.disconnect = value.toUpperCase()
                                client.guildSettings.set(message.guild.id, curConfig)
                                message.channel.send(`Succesfully set DisconnectPerm to ${value.toUpperCase()}`)
                            } else {
                                message.channel.send("Cancelled.")
                            }
                        });
                        collector.on('end', async i => {
                            if(i.size < 1){
                                message.channel.send("Cancelled.")
                            }
                        })
                    }
                    break
                case 'configperm':
                    if(value.toUpperCase() != "NONE" && !Discord.Permissions.FLAGS[value.toUpperCase()]) return message.reply("Please provide a valid Permission! You can pick one from the list at <https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags> (e.g. KICK_MEMBERS)")
                    if(message.member.permissions.has(value.toUpperCase())){
                        curConfig.permissions.config = value.toUpperCase()
                        client.guildSettings.set(message.guild.id, curConfig)
                        message.reply(`Succesfully set ConfigPerm to ${value.toUpperCase()}`)
                    } else {
                        const row = new Discord.MessageActionRow()
                        .addComponents(
                            new Discord.MessageButton()
                                .setCustomId('continue')
                                .setLabel('Continue')
                                .setStyle('SUCCESS'),
                            new Discord.MessageButton()
                                .setCustomId('cancel')
                                .setLabel('Cancel')
                                .setStyle('DANGER'),
                        );
                        let msg = await message.reply({content: ":raised_hand: Hold Up! If you do this, you won't be able to change the config anymore. If you would still like to do this, press continue.", components: [row], fetchReply: true})
                        const filter = i => i.user.id === message.author.id;
                        const collector = msg.createMessageComponentCollector({ filter, time: 10000, max: 1, componentType: 'BUTTON' });
                        collector.on('collect', async i => {
                            try {await i.deferUpdate()}catch(e){return};
                            if (i.customId === 'continue') {
                                curConfig.permissions.config = value.toUpperCase()
                                client.guildSettings.set(message.guild.id, curConfig)
                                message.channel.send(`Succesfully set ConfigPerm to ${value.toUpperCase()}`)
                            } else {
                                message.channel.send("Cancelled.")
                            }
                        });
                        collector.on('end', async i => {
                            if(i.size < 1){
                                message.channel.send("Cancelled.")
                            }
                        })
                    }
                    break
                default:
                    message.reply("Unkown Option")
                    break
            }
        }
    },
};