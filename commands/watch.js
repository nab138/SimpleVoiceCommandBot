const Discord = require('discord.js')
const { tts, connectToChannel } = require('../utils/voice')
const { getVoiceConnection  } = require('@discordjs/voice');
module.exports = {
	names: ['youtube', 'watch', 'video', 'netflix', 'watchparty', 'youtube_together'],
	async execute(message, client, args, isAudio) {
        const channel = message.member?.voice.channel;
        if(channel){
            client.discordTogether.createTogetherCode(message.member.voice.channel.id, 'youtube').then(async invite => {
                return message.channel.send(`Click the **link** if the join button isnt working:  ${invite.code}`);
            });
            if(isAudio && await getVoiceConnection(message.guild.id)){
                tts(`Click the link sent in the channel you ran the listen command in.`, message.guild)
            }
        }
	},
};