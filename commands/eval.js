const Discord = require('discord.js')
module.exports = {
	names: ['eval'],
    textOnly: true,
    devOnly: true,
	async execute(message, client, args) {
        try {
            message.channel.send(`Result: \n\`\`\`${eval(args.join(' '))}\`\`\``)
        } catch (e) {
            message.channel.send(`Error: \n\`\`\`${e.stack}\`\`\``)
        }
	},
};