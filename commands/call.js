const Discord = require('discord.js')
const { pipeToOtherGuild, connectToChannel, createPlayer, tts } = require('../utils/voice')
const { getVoiceConnection, VoiceConnectionStatus } = require('@discordjs/voice');
module.exports = {
	names: ['call', 'userphone'],
	async execute(message, client, args, isAudio) {
        
        message.reply("Connecting to userphone...")
        if(client.userphoneQueue.length > 0){
            let SecondConnection = client.userphoneQueue.shift()
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
                    return message.reply('Join a voicechat first!')
                }
            }
            connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
                try {
                    await Promise.race([
                        entersState(connection, VoiceConnectionStatus.Signalling, 3_000),
                        entersState(connection, VoiceConnectionStatus.Connecting, 3_000),
                    ]);
                } catch (error) {
                    tts('The other party hung up the user phone.', SecondConnection.message, SecondConnection.connection.destroy)
                    client.userphonesActive.delete(message.guild.id)
                    client.userphonesActive.delete(SecondConnection.message.guild.id)
                    message.channel.send("Hung up the userphone")
                    connection.destroy();
                }
            });
            let player = await createPlayer()
            connection.subscribe(player)
            let con = {
                connection,
                message,
                player,
                otherID: SecondConnection.message.guild.id
            }
            SecondConnection.otherID = message.guild.id
            client.userphonesActive.set(SecondConnection.message.guild.id, SecondConnection)
            client.userphonesActive.set(message.guild.id, con)
            pipeToOtherGuild(connection.receiver, message.author.id, SecondConnection.player)
            pipeToOtherGuild(SecondConnection.connection.receiver, SecondConnection.message.author.id, player)
            SecondConnection.message.channel.send("Partner found! Say hi!")
            message.channel.send("Partner found! Say hi!")
        } else {
            message.channel.send("Searching for a partner...")
            // Join userphone queue
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
                    return message.reply('Join a voicechat first!')
                }
            }
            connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
                try {
                    await Promise.race([
                        entersState(connection, VoiceConnectionStatus.Signalling, 3_000),
                        entersState(connection, VoiceConnectionStatus.Connecting, 3_000),
                    ]);
                    // Seems to be reconnecting to a new channel - ignore disconnect
                } catch (error) {
                    for (const waiter in client.userphoneQueue){
                        if(client.userphoneQueue[waiter].message.guild.id == message.guild.id){
                            client.userphoneQueue[waiter].connection.destroy()
                            client.userphoneQueue.splice(waiter, 1)
                            return message.channel.send("Left the userphone queue.")
                        }
                    }
                    if(!client.userphonesActive.has(message.guild.id)) return
                    let otherCon = client.userphonesActive.get(client.userphonesActive.get(message.guild.id).otherID)
                    tts('The other party hung up the user phone.', otherCon.message, otherCon.connection.destroy)
                    client.userphonesActive.delete(message.guild.id)
                    client.userphonesActive.delete(otherCon.message.guild.id)
                    message.channel.send("Hung up the userphone")
                    connection.destroy();
                }
            });
            let player = await createPlayer()
            connection.subscribe(player)
            let con = {
                connection,
                message,
                player
            }
            client.userphoneQueue.push(con)
        }
	},
};