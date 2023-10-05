const cooldown = 172800000; //2 days
const db = require('quick.db');
const humanizeDuration = require('humanize-duration');
const generateScore = require('./methods/generateScore');

const checkRole = require("./methods/checkRole.js");
const read = require('./methods/read');
const write = require('./methods/write');
require('dotenv').config();

module.exports = async function (msg, args) {
    const client = msg.client;
    let score = client.getScore.get(msg.author.id);
    //creates mew table if user does not have one yet
    if (!score) {
        score = generateScore(msg);
    }

    if (msg.channel.id != process.env.AKBOT_CHANNEL_ID && msg.channel.id != process.env.TEST_CHANNELID) {
        msg.channel.send('Please use <#' + process.env.AKBOT_CHANNEL_ID + '> for this command.');
        return;
    }

    // Increment the score by a set amount, has a cooldown for each user
    if (args.length == 0) {
        msg.reply(`You currently have ${score.points} AkPoints! ` + "For more information use: ```!points help```");
        return;
    } else if (args[0] === "help") {
        msg.channel.send("AkPoints do not have any value or meaning other then to flex on your friends on the leaderboard.\nYou get AkPoints through various means: joining our activities, solving wordles and being active.");
        msg.channel.send("```900 AkPoints for joining events.\n250-2200 Possible AkPoints for solving wordles.\n+10% more AkPoints per committee you are in.```")
    } else if (args[0] === "get") {
        console.log("AkPoints requested by " + msg.author.username);

        msg.channel.send("`!points get` is no longer a command. How do you get akpoints now? You get AkPoints by being active! The main ways of receiving akpoints are now through the following ways:\n" +
            "```" + "- Joining events and reacting to the message.\n- Solving wordles together with !wordle\n- Joining committees (+10% bonus in AkPoints generation per committee)```\n" +
            "If you want to know the specific point total use `!points help`.");
        
    } else if (checkRole("Board", msg) || checkRole("Moderator", msg)) {
        //Moderator specific messages
        const mentioneduser = msg.mentions.users.first();
        if (!mentioneduser) {
            msg.channel.send("WHO??? I dont know that person. Make sure you do `!points remove/add @user pointsAmount`");
            return;
        }
        const nameID = mentioneduser.id
        //let nameID = args[1].substring(3, args[1].length - 1);
        if (nameID != null) {
            let userScore = client.getScore.get(nameID);
            console.log(userScore);
            if (!userScore) {
                score = generateScore(msg);
            }

            let pointReq = parseInt(args[2], 10);
            if (args.length > 2 && Number.isSafeInteger(userScore.points + pointReq)) {
                if (args[0] === "add") {
                    userScore.points += pointReq;
                    client.setScore.run(userScore);
                    msg.channel.send("Added " + pointReq + " AkPoints to <@" + nameID + `> bringing his total to ${userScore.points}.`);
                } else if (args[0] === "remove") {
                    userScore.points -= pointReq;
                    client.setScore.run(userScore);
                    msg.channel.send("Removed " + pointReq + " AkPoints from <@" + nameID + `> bringing his total to ${userScore.points}.`);
                } else if (args[0] === "set") {
                    userScore.points = pointReq;
                    client.setScore.run(userScore);
                    msg.channel.send("Total AkPoints setted to " + pointReq + " for <@" + nameID + ">.");
                }
            }
        } else {
            msg.channel.send("User not found.");
        }

    } else {
        msg.channel.send("You do not have permissions for this command.");
    }
}