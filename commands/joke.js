const Memer = require("random-jokes-api");
const Discord = require('discord.js')
const { tts } = require('../utils/voice')
const { getVoiceConnection } = require('@discordjs/voice');
module.exports = {
	names: ['joke', 'tell me a joke', 'tell me a joke please', 'please tell me a joke', 'give me a joke', 'make me laugh'],
	async execute(message, client, args, isAudio) {
        if(!isAudio) return message.reply(Memer.joke())
        let connection = await getVoiceConnection(message.guild.id)
        if(!connection){
            const channel = message.member?.voice.channel;
            if (channel) {
                try {
                    connection = await connectToChannel(channel)
                } catch (error) {
                    console.error(error);
                }
            } else {
                return message.channel.send(Memer.joke())
            }
        }
        tts(Memer.joke().replace(/"/g, '').replace(/“/g, '').replace(/”/g, ''), message)
    }
};