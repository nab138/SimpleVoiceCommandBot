const Discord = require('discord.js')
const { connectToChannel } = require('../utils/voice')
const { VoiceConnectionStatus, entersState } = require('@discordjs/voice');
module.exports = {
	names: ['listen'],
	textOnly: true,
	async execute(message, client, args, isAudio) {
		if(!client.activeListening.has(message.guild.id)){
			const channel = message.member?.voice.channel;
			if (channel) {
				try {
					const connection = await connectToChannel(channel);
					connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
						try {
							await Promise.race([
								entersState(connection, VoiceConnectionStatus.Signalling, 3_000),
								entersState(connection, VoiceConnectionStatus.Connecting, 3_000),
							]);
							// Seems to be reconnecting to a new channel - ignore disconnect
						} catch (error) {
							message.channel.send("Goodbye!")
							client.activeListening.delete(message.guild.id)
							connection.destroy();
						}
					});
					client.listen(connection.receiver, message)
					client.activeListening.set(message.guild.id, {channel})
					await message.reply(`Say ${client.wakeWord(message.guild.id)[0]} to run a command!`)
				} catch (error) {
					console.error(error);
				}
			} else {
				await message.reply('Join a voice channel then try again!');
			}
		} else {
			message.reply("I'm already listening somewhere here!")
		}
	},
};