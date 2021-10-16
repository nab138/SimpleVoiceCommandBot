# SimpleVoiceCommandBot
A bot that responds to voice commands in discord!

This bot is undergoing active development and is not done. Contributions are welcome.

This bot is customizable within discord, using -config, but you can change some settings in config.json aswell.

## How to run:
You run this bot like literally any other discord bot ever but heres the instructions anyway.

You have to have nodejs v16 or above installed, as well as python3 (might work with python2, haven't tested, let me know if you try to use it).

Step one: Clone the repository and `cd` into it. `git clone https://github.com/nab138/SimpleVoiceCommandBot.git && cd SimpleVoiceCommandBot`

Step two: Install dependencies. `yarn install` (You can use npm if you want but delete yarn.lock and node_modules first) `pip install vosk` (dont ask why I'm using the python version of a nodejs compatible library, its a long story)

Step three: Create an application on the [Discord Developer Portal](https://discord.com/developers/applications/), then create a bot, and copy the token.

Step three and a half: Invite the bot to your server of choice so you can actually use the bot.

Step four: Grab your token and client ID from the Discord Developer Portal and plug them into token.json.

Step five: Publish slash commands. `node utils/slash-commands.js` (Tip: Global Slash commands take up to an hour to propogate. If you want to test slash commands without waiting, publish them to one guild which is instant by adding `--guildID <guildid>` to the command.)

Step five: Start the bot. `node .`

## Contributors

In the future, contributors **may** recieve perks such as increasing the listeners per guild.

If you want to contribute, please open a Pull Request. If I don't review it within a week, message me on discord `nab138#2035`

Don't know how to code, but still want to help? You can work on improving the README, updating the help command, or changing strings/words.

Thank's for contributing!
