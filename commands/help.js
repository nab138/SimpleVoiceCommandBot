const Discord = require('discord.js')
module.exports = {
	names: ['help'],
    textOnly: true,
	async execute(message, client, args, isAudio, isSlash) {
        // Embeds
        const helpEmbed = new Discord.MessageEmbed()
            .setAuthor(client.user.tag, client.user.displayAvatarURL({dynamic: true}))
            .setColor(client.config.embedColor)
            .setTitle(`${client.config.botName} Help`)
            .setDescription(`Hi! I'm ${client.config.botName}. I'm a voice controlled bot that can do many things, like play music or tell you a joke. Here's how I work: \nWhen you run the listen command, I will join your current voice channel and listen to you. When my wake word is said, I will let you know I heard you and start listening for a command. \n\nTips: \n• Make sure your mic sensitivity is up high enough that it turns off when you aren't talking. I listen for silence before proccessing your voice.\n• Talk clearly and slowly, and use the feedback provided in chat to tune what you say and make it easier for me to understand. \n• Take a minute in mic test or with friends to make sure you are easily understandable. If people can't understand you, I can't either!\n\nUse the buttons to see my commands.`)
            .setFooter(`Helping ${message.author.tag}`, message.author.displayAvatarURL({dynamic: true}))
        const textEmbed = new Discord.MessageEmbed()
            .setAuthor(client.user.tag, client.user.displayAvatarURL({dynamic: true}))
            .setColor(client.config.embedColor)
            .setTitle(`${client.config.botName} Text Commands`)
            .setDescription(`Here is a list of the commands you type into discord. Some of these are also available as slash commands.\n<parameter> = optional parameter\n[parameter] = required parameter`)
            .addField(`${client.config.prefix}config <setting> <value>`, `Configure the bot`, true)
            .addField(`${client.config.prefix}listen`, `Tell the bot to you join your voice channel and start listening to you`, true)
            .addField(`${client.config.prefix}call`, `Talk to people from other guilds! It will place you in a queue until someone else uses the call command, in which case you will be connected.`, true)
            .addField(`Theres more!`, `There's a lot more offered by this bot! However, the help command is incomplete. If you want to help finish the help command, check out the [Github Repo!](https://github.com/nab138/SimpleVoiceCommandsBot)`)
            .setFooter(`Helping ${message.author.tag}`, message.author.displayAvatarURL({dynamic: true}))
        const voiceEmbed = new Discord.MessageEmbed()
            .setAuthor(client.user.tag, client.user.displayAvatarURL({dynamic: true}))
            .setColor(client.config.embedColor)
            .setTitle(`${client.config.botName} Voice Commands`)
            .setDescription(`Here is a list of the commands you say in a voice chat (All voice commands, except for the chat command, work with text too):`)
            .addField(`Chat`, `Talk with a chatbot (powered by cleverbot).`)
            .addField(`Theres more!`, `There's a lot more offered by this bot! However, the help command is incomplete. If you want to help finish the help command, check out the [Github Repo!](https://github.com/nab138/SimpleVoiceCommandsBot)`)
            .setFooter(`Helping ${message.author.tag}`, message.author.displayAvatarURL({dynamic: true}))
        // All beyond this point - Boring code, does not need changing
        const mainRow = new Discord.MessageActionRow()
            .addComponents(
                new Discord.MessageButton()
                    .setCustomId('text')
                    .setLabel('Text Commands')
                    .setStyle('PRIMARY'),
                new Discord.MessageButton()
                    .setCustomId('voice')
                    .setLabel('Voice Commands')
                    .setStyle('SUCCESS'),
            );
        if(!isSlash){
            let msg = await message.reply({embeds: [helpEmbed], components: [mainRow]});
            const filter = i => i.user.id === message.author.id;
            const collector = msg.createMessageComponentCollector({ filter, time: 60000, max: 1 });
            collector.on('collect', async i => {
                try {await i.deferUpdate()}catch(e){return};
                if (i.customId === 'text') {
                    messageEdit(msg, message.author, client, true, textEmbed, voiceEmbed)
                } else if (i.customId === 'voice'){
                    messageEdit(msg, message.author, client, false, textEmbed, voiceEmbed)
                }
            });
        } else {
            let int = await message.reply({embeds: [helpEmbed], components: [mainRow], fetchReply: true});
            const filter = i => i.user.id === message.author.id;
            const collector = int.createMessageComponentCollector({ filter, time: 60000, max: 1 });
            collector.on('collect', async i => {
                try {await i.deferUpdate()}catch(e){return};
                if (i.customId === 'text') {
                    interactionEdit(message, client, true, textEmbed, voiceEmbed)
                } else if (i.customId === 'voice'){
                    interactionEdit(message, client, false, textEmbed, voiceEmbed)
                }
            });
        }
    }
}
async function messageEdit(message, author, client, text, textEmbed, voiceEmbed){
    if(text){
        const textRow = new Discord.MessageActionRow()
        .addComponents(
            new Discord.MessageButton()
                .setCustomId('voice')
                .setLabel('Voice Commands')
                .setStyle('SUCCESS'),
        );
        message.edit({embeds: [textEmbed], components: [textRow]})
        const filter = i => i.user.id === author.id;
        const collector = message.createMessageComponentCollector({ filter, time: 120000, max: 1, componentType: 'BUTTON' });
        collector.on('collect', async i => {
            try {await i.deferUpdate()}catch(e){return};
            if (i.customId === 'voice'){
                messageEdit(message, author, client, false, textEmbed, voiceEmbed)
            }
        });
    } else {
        const voiceRow = new Discord.MessageActionRow()
        .addComponents(
            new Discord.MessageButton()
                .setCustomId('text')
                .setLabel('Text Commands')
                .setStyle('PRIMARY'),
        );
        message.edit({embeds: [voiceEmbed], components: [voiceRow]})
        const filter = i => i.user.id === author.id;
        const collector = message.createMessageComponentCollector({ filter, time: 120000, max: 1, componentType: 'BUTTON' });
        collector.on('collect', async i => {
            try {await i.deferUpdate()}catch(e){return};
            if (i.customId === 'text'){
                messageEdit(message, author, client, true, textEmbed, voiceEmbed)
            }
        });
    }
}
async function interactionEdit(interaction, client, text, textEmbed, voiceEmbed){
    if(text){
        const textRow = new Discord.MessageActionRow()
        .addComponents(
            new Discord.MessageButton()
                .setCustomId('voice')
                .setLabel('Voice Commands')
                .setStyle('SUCCESS'),
        );
        let msg = await interaction.editReply({embeds: [textEmbed], components: [textRow], fetchReply: true})
        const filter = i => i.user.id === interaction.user.id;
        const collector = msg.createMessageComponentCollector({ filter, time: 120000, max: 1, componentType: 'BUTTON' });
        collector.on('collect', async i => {
            try {await i.deferUpdate()}catch(e){return};
            if (i.customId === 'voice'){
                interactionEdit(interaction, client, false, textEmbed, voiceEmbed)
            }
        });
    } else {
        const voiceRow = new Discord.MessageActionRow()
        .addComponents(
            new Discord.MessageButton()
                .setCustomId('text')
                .setLabel('Text Commands')
                .setStyle('PRIMARY'),
        );
        let msg = await interaction.editReply({embeds: [voiceEmbed], components: [voiceRow], fetchReply: true})
        const filter = i => i.user.id === interaction.user.id;
        const collector = msg.createMessageComponentCollector({ filter, time: 120000, max: 1, componentType: 'BUTTON' });
        collector.on('collect', async i => {
            try {await i.deferUpdate()}catch(e){return};
            if (i.customId === 'text'){
                interactionEdit(interaction, client, true, textEmbed, voiceEmbed)
            }
        });
    }
}