# SimpleVoiceCommandBot
A bot that responds to voice commands in discord!

This bot is undergoing active development and is not done.

This bot is customizable within discord, using -config, but you can change some settings in config.json aswell.

## How to run:
You run this bot like literally any other discord bot ever but heres the instructions anyway.

You have to have nodejs v16 or above installed, as well as python3 (might work with python2, haven't tested, let me know if you try to use it).

Step one: Clone the repository and `cd` into it. `git clone https://github.com/nab138/SimpleVoiceCommandBot.git && cd SimpleVoiceCommandBot`

Step two: Install dependencies. `yarn install` (You can use npm if you want but delete yarn.lock and node_modules first) `pip install vosk` (dont ask why I'm using the python version of a nodejs compatible library, its a long story)

Step three: Create an application on the [Discord Developer Portal](https://discord.com/developers/applications/), then create a bot, and copy the token.

Step three and a half: Invite the bot to your server of choice so you can actually use the bot.

Step four: In token.json, put your token from the discord developer portal in the token field. `echo {"token":"token from discord developer portal"} >> storage/token.json`

Step five: Start the bot. `node .`
