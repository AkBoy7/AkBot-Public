const BOT_PREFIX = '!';

require('dotenv').config();

//const fs = require('fs');
const write = require("./commands/methods/write.js");
const read = require("./commands/methods/read.js");
var badwordsArray = read("./badwordslist.json");
var ignoreList = read("./ignore.json");
const checkRole = require("./commands/methods/checkRole.js");

//all the commands AkBot currently supports
const ak = require("./commands/ak.js");
const help = require("./commands/ak.js");
const gif = require("./commands/gif.js");
//const akpic = require("./commands/akpic.js");
const detect = require("./commands/detect.js");
const ignore = require("./commands/ignore.js");
const points = require("./commands/points.js");
const dm = require("./commands/dm.js");
const bids = require("./commands/bids.js");
const coinflip = require("./commands/coinflip.js");
const app = require("./commands/app.js");
const remindMe = require("./commands/remindMe.js");
//const music = require("./commands/music.js");
const event = require("./commands/event.js");
const bet = require("./commands/newbet.js");
const wordle = require("./commands/wordleGuess.js")
const commands = { ak, help, gif, detect, ignore, points, dm, bet, bids, coinflip, app, remindMe, event, wordle};

module.exports = async function (msg) {
    const client = msg.client;

    //for testing in specific channel
    if (msg.channel.id != process.env.TEST_CHANNELID) {
        return;
    }

    //Deletes pins created message when a message of Akbot is pinned
    if(msg.type === "PINS_ADD" && msg.author.bot) {
        msg.delete();
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

        //update the list for any possible changes
        ignoreList = read("./ignore.json");
    }

    //update the list for any possible changes
    badwordsArray = read("./badwordslist.json");
    
    //offensive word detection
    let tokens = msg.content.split(' ');
    if (!(checkRole("Board", msg) || checkRole("Moderator", msg)) && !msg.author.bot) {
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