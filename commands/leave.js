const Discord = require('discord.js')
const { tts } = require('../utils/voice')
const { getVoiceConnection } = require('@discordjs/voice');
module.exports = {
	names: ['disconnect', 'stop', 'dc', 'end', 'leave'],
	async execute(message, client, args, isAudio) {
                const connection = getVoiceConnection(message.guild.id)
                if(!connection) return message.reply("I'm not even in a voice channel!")
                for (const waiter in client.userphoneQueue){
                        if(client.userphoneQueue[waiter].message.guild.id == message.guild.id){
                            return message.reply("Please use the hangup command when using the userphone.")
                        }
                    }
                if(client.userphonesActive.has(message.guild.id)) return message.reply("Please use the hangup command when using the userphone.")
                let channel = await message.guild.channels.fetch(connection.joinConfig.channelId)
                let isAlone = true;
                for (const member of channel.members){
                        if(member[0] != message.author.id && member[0] != client.user.id) {isAlone = false;}
                }
                let curConfig = client.currentGuildSettings(message.guild.id)
                if(isAlone || (curConfig.permissions.disconnect == "NONE" || message.member.permissions.has(curConfig.permissions.disconnect))){
                        tts('Goodbye!', message, function(){connection.destroy(); client.guildPlayers.delete(message.guild.id); if(client.activeListening.has(message.guild.id)){client.activeListening.delete(message.guild.id)}; if(!isAudio){message.reply("Disconnected!")}else{message.channel.send('Disconnected!')}})
                } else {
                        if(isAudio){
                                tts('You do not have permission to do this.', message)
                        } else {
                                message.reply("You do not have permission to do this.")
                        }
                }
        },
};