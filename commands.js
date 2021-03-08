const BOT_PREFIX = '!';

require('dotenv').config();

//const fs = require('fs');
const write = require("./commands/methods/write.js");
const read = require("./commands/methods/read.js");
var badwordsArray = read("./badwordslist.json");
var ignoreList = read("./ignore.json");
const checkRole = require("./commands/methods/checkRole.js");

const AntiSpam = require('discord-anti-spam');
const antiSpam = new AntiSpam({
    warnThreshold: 3, // Amount of messages sent in a row that will cause a warning.
    kickThreshold: 5, // Amount of messages sent in a row that will cause a kick.
    banThreshold: 70, // Amount of messages sent in a row that will cause a ban.
    muteThreshold: 50, // Amount of messages sent in a row that will cause a mute.
    maxInterval: 4000, // Amount of time (in milliseconds) in which messages are considered spam.
    warnMessage: '{@user}, Please stop spamming with AkBot otherwise you would be added to the ignore list.', // Message that will be sent in chat upon warning a user.
    kickMessage: '{@user} has been added to the ignore list for spamming with AkBot.', // Message that will be sent in chat upon kicking a user.
    banMessage: '**{user_tag}** has been banned for spamming.', // Message that will be sent in chat upon banning a user.
    muteMessage: '**{user_tag}** has been muted for spamming.', // Message that will be sent in chat upon muting a user.
    maxDuplicatesWarning: 7, // Amount of duplicate messages that trigger a warning.
    maxDuplicatesKick: 10, // Amount of duplicate messages that trigger a warning.
    maxDuplicatesBan: 12, // Amount of duplicate messages that trigger a warning.
    maxDuplicatesMute: 9, // Amount of duplicate messages that trigger a warning.
    // Discord permission flags: https://discord.js.org/#/docs/main/master/class/Permissions?scrollTo=s-FLAGS
    exemptPermissions: ['ADMINISTRATOR'], // Bypass users with any of these permissions(These are not roles so use the flags from link above).
    ignoreBots: true, // Ignore bot messages.
    verbose: true, // Extended Logs from module.
    ignoredUsers: ignoreList, // Array of User IDs that get ignored.
});


//all the commands AkBot currently supports
const ak = require("./commands/ak.js");
const gif = require("./commands/gif.js");
const akpic = require("./commands/akpic.js");
const detect = require("./commands/detect.js");
const ignore = require("./commands/ignore.js");
const points = require("./commands/points.js");
const dm = require("./commands/dm.js");
const bet = require("./commands/bet.js");
const bids = require("./commands/bids.js");
const coinflip = require("./commands/coinflip.js");
const app = require("./commands/app.js");
const remindMe = require("./commands/remindMe.js");
const commands = { ak, gif, akpic, detect, ignore, points, dm, bet, bids, coinflip, app, remindMe};
const cron = require('cron');

module.exports = async function (msg) {
    const client = msg.client;

    let scheduledMessage = new cron.CronJob('12 04 00 * * *', () => {
      // This runs every day at 10:30:00, you can do anything you want
      let channel = client.channels.cache.get(process.env.TEST_CHANNELID);
      channel.send("test, this message is send every day at 12?");
    });
    
    // When you want to start it, use:
    scheduledMessage.start()

    if (msg.channel.id != process.env.TEST_CHANNELID) {
        return;
    }
    
    //ignore dms and send them to AkBoy
    if (msg.channel.type == "dm" && !(msg.author.username === "AkBoy" || msg.author.username === "AkBot")) {
        console.log(msg.author.username + " is dming with AkBot:");
        client.users.fetch(process.env.AKBOBID).then(user => {
            user.send(msg.author.username + " with id " + msg.author.id + " said: " + msg.content);
        });
        return;
    } 

    //Bot wont respond to ignored users
    if (!ignoreList.includes(msg.author.username)) {
        //handle the command in the message if it begins with the bot prefix
        let tokens = msg.content.split(' ');
        let command = tokens.shift();
        if (command.charAt(0) === `${BOT_PREFIX}`) {
            command = command.substring(1);
            commands[command](msg, tokens);
        }

        //Spam detection if user was warned and continues spamming he will be ignored
        tokens = msg.content.split(' ');
        command = tokens.shift();
        if (command.charAt(0) === `${BOT_PREFIX}`) {
            antiSpam.message(msg);
            if ((antiSpam.data.kickedUsers).includes(msg.author.id)) {
                if (!ignoreList.includes(msg.author.username)) {
                    ignoreList.push(msg.author.username);
                    write(ignoreList, "./ignore.json");
                    msg.channel.send(msg.author.toString() + " has been added to the ignore list for spamming.");
                }
            }
        }

        //update the lists for any possible changes
        badwordsArray = read("./badwordslist.json");
        ignoreList = read("./ignore.json");
    }
    
    //offensive word detection
    let tokens = msg.content.split(' ');
    if ((checkRole("Board", msg) || checkRole("Moderator", msg))) {
        var msgContainsBadWord = false;
        tokens.forEach(word => {
            if (badMessage(word)) {
                msgContainsBadWord = true;
            }
        });
        if (msgContainsBadWord) {
            console.log("Detected a bad word from " + msg.author.username);
            botChannel = client.channels.cache.get(process.env.BOTLOG_CHANNEL_ID);
            botChannel.send('Detected potential offensive message at: <#' + msg.channel.id + '>, from <@' + msg.author.id + ">.\n"
                + "Message content: " + '```' + msg.content + '```');
        }
    }
}

function badMessage(word) {
    if (badwordsArray.includes(word)) {
        return true;
    } else {
        badwordsArray.forEach(badWord => {
            if (word.includes(badWord)) {
                return true
            }
        });
    }
    return false;
}