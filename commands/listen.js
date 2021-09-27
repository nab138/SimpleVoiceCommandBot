const Discord = require('discord.js')
const { connectToChannel, tts, createRecieverStream } = require('../utils/voice')
module.exports = {
	names: ['listen'],
	async execute(message, client, args, isAudio) {
		const channel = message.member?.voice.channel;
		if (channel) {
			try {
				const connection = await connectToChannel(channel);
                client.listen(connection.receiver, message)
				await message.reply(`Say ${client.wakeWord(message.guild.id)[0]} to run a command!`)
			} catch (error) {
				console.error(error);
			}
		} else {
			await message.reply('Join a voice channel then try again!');
		}
	},
};