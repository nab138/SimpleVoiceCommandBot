const Discord = require('discord.js')
const Chat = require("clever-chat");
const { tts } = require('../utils/voice')
const { getVoiceConnection } = require('@discordjs/voice');
module.exports = {
	names: ['chat', 'chad', 'say'],
	async execute(message, client, args, isAudio) {
        if(!isAudio) return message.reply("bruh use voice commands for this")
        const connection = await getVoiceConnection(message.guild.id)
        if(!connection) return message.reply("I'm not even in a voice channel!")
        const chat = new Chat({ name: "BetterGroovy", gender: "Female", developer_name: "nab138", user: message.author.id, language: "English", age: '11' });
        chat.chat(args.join(' ')).then(reply => {
            tts(reply, message)
        })
	},
};