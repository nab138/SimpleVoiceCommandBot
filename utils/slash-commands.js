const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token, clientID } = require('../token.json');

const commands = [
	new SlashCommandBuilder().setName('listen').setDescription('The bot will join the vc and start listening for commands.'),
    new SlashCommandBuilder().setName('disconnect').setDescription('Disconnect the bot from a voice channel.'),
	new SlashCommandBuilder().setName('help').setDescription('Info on how to use the bot'),
    new SlashCommandBuilder().setName('call').setDescription('Talk to people from other guilds on the userphone!'),
    new SlashCommandBuilder().setName('hangup').setDescription('Hangup the userphone.'),
    new SlashCommandBuilder().setName('config').setDescription('Configure the bot')
    .addStringOption(option => 
        option.setName('setting')
        .setDescription('The setting to change')
        .setRequired(false)
        .addChoice('Wake Word', 'WakeWord')
        .addChoice('Mic Timeout', 'MicTimeout')
        .addChoice('Listen Permission', 'ListenPerm')
        .addChoice('Disconnect Permission', 'DisconnectPerm')
        .addChoice('Configuration Permission', 'ConfigPerm'))
    .addStringOption(option => option.setName('value')
        .setDescription('The new value for a setting')
        .setRequired(false)),
]
const rest = new REST({ version: '9' }).setToken(token);

if(process.argv[2] && process.argv[2].toLowerCase() == '--guildid' && process.argv[3]){
    rest.put(Routes.applicationGuildCommands(clientID, process.argv[3]), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);
} else {
    rest.put(Routes.applicationCommands(clientID), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);
}