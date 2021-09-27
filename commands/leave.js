const Discord = require('discord.js')
const { tts } = require('../utils/voice')
const { getVoiceConnection } = require('@discordjs/voice');
module.exports = {
	names: ['disconnect', 'stop', 'dc', 'end', 'leave'],
	async execute(message, client, args, isAudio) {
        const connection = await getVoiceConnection(message.guild.id)
        if(!connection) return message.reply("I'm not even in a voice channel!")
        tts('Goodbye!', message.guild, function(){connection.destroy(); client.guildPlayers.delete(message.guild.id); message.channel.send('Disconnected!')})
	},
};