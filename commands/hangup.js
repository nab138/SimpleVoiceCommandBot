const Discord = require('discord.js')
const { tts } = require('../utils/voice')
module.exports = {
	names: ['hangup'],
	async execute(message, client, args, isAudio) {
        for (const waiter in client.userphoneQueue){
            if(client.userphoneQueue[waiter].message.guild.id == message.guild.id){
                if(client.userphoneQueue[waiter].message.author.id == message.author.id){
                    client.userphoneQueue[waiter].connection.destroy()
                    client.userphoneQueue.splice(waiter, 1)
                    return message.reply("Left the userphone queue.")
                } else {
                    return message.reply("You didn't start the call!")
                }
            }
        }
        if(client.userphonesActive.has(message.guild.id)){
            let con = client.userphonesActive.get(message.guild.id)
            let otherCon = client.userphonesActive.get(con.otherID)
            if (con.message.author.id != message.author.id) return message.reply('You didn\'t start this call!')
            con.connection.destroy()
            tts('The other party hung up the user phone.', otherCon.message, otherCon.connection.destroy)
            client.userphonesActive.delete(message.guild.id)
            client.userphonesActive.delete(otherCon.message.guild.id)
            return message.reply("Disconnected the userphone!")
        }
        message.reply("There is no ongoing userphone session here. Maybe you meant to use disconnect?")
	},
};