const Discord = require('discord.js');

module.exports = function (msg, args) {
    const helpEmbed = new Discord.MessageEmbed()
        .setColor('#D9D023')
        .setTitle('Akbot Commands')
        .setAuthor('AkBot', 'https://i.imgur.com/y21mVd6.png')
        .setDescription('Made by Akam\nIf you experience any issues with this bot please contact AkBob')
        .setThumbnail('https://i.imgur.com/mXodbnH.png')
        .addFields(
            { name: 'User commands', value: '!ak \n!gif \n!akpic \n!points \n!bet\n', inline: true },
            { name: 'Description', value: 'Gives a list of commands \nSearches and sends a gif \nGet a random picture of Akam \nRecieve points to bet with \nBet on DCL teams with points\n', inline: true },
            { name: '\u200B', value: '\u200B' },
        )
        .addFields(
            { name: 'Mod commands', value: '!detect \n!ignore \n!bids\n', inline: true },
            { name: 'Description', value: 'Offensive words detecter \nDisable akbot for spamming users \nBetting system manager\n', inline: true },
        )
        .setTimestamp()

    msg.channel.send(helpEmbed);
};
