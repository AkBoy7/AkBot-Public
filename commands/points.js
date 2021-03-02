const cooldown = 172800000; //2 days
const db = require('quick.db');
const humanizeDuration = require('humanize-duration');

const freePoints = 300;

const checkRole = require("./methods/checkRole.js");
require('dotenv').config();

module.exports = async function (msg, args) {
    const client = msg.client;
    let score = client.getScore.get(msg.author.id);
    //creates mew table if user does not have one yet
    if (!score) {
        score = {
            id: `${msg.author.id}`,
            user: msg.author.id,
            points: 0,
            bids: "",
            amount: "",
            cooldown: 0
        }
    }

    if (msg.channel.id != process.env.AKBOT_CHANNEL_ID && msg.channel.id != process.env.TEST_CHANNELID) {
        msg.channel.send('Please use <#' + process.env.AKBOT_CHANNEL_ID + '> for this command.');
        return;
    }

    // Increment the score by a set amount, has a cooldown for each user
    if (args.length == 0) {
        msg.reply(`You currently have ${score.points} points! `+ "For more information use: ```!points help```");
        return;
    } else if (args[0] === "help") {
        msg.channel.send("Points do not have any value or meaning other then to flex on your friends on the leaderboard.\nYou get points by typing `!points get` and also by joining our acitivities.\nYou can also get more points by betting them on your favorite teams, use `!bet` command for more information.");
    } else if (args[0] === "get") {
        console.log("points requested by " + msg.author.username);

        if (score.cooldown !== 0 && cooldown - (Date.now() - score.cooldown) > 0) {
            // If user still has a cooldown
            const remaining = humanizeDuration(cooldown - (Date.now() - score.cooldown), { delimiter: " and ", round: true, units: ["d", "h", "m"]});
            msg.channel.send(`Wait ${remaining} before typing this command again. ` + "<@" + msg.author.id + ">.");
        } else {
            score.points += freePoints;
            score.cooldown = Date.now();
            client.setScore.run(score);
            const remaining = humanizeDuration(cooldown - (Date.now() - score.cooldown), { delimiter: " and ", round: true, units: ["d", "h", "m"]});
            msg.reply("You have gained " + freePoints + ` points and currently you have ${score.points} points! You can use this command again after ${remaining}`);
        }
    } else if (checkRole("Board", msg) || checkRole("Moderator", msg)) {
        //Moderator specific messages
        let nameID = args[1].substring(3, args[1].length - 1);
        console.log(nameID);
        if (nameID != null) {
            let userScore = client.getScore.get(nameID);
            console.log(userScore);
            if (!userScore) {
                userScore = {
                    id: `${nameID}`,
                    user: nameID,
                    points: 0,
                    bids: "",
                    amount: ""
                }
            }

            let pointReq = parseInt(args[2], 10);
            if (args.length > 2 && Number.isSafeInteger(userScore.points + pointReq)) {
                if (args[0] === "add") {
                    userScore.points += pointReq;
                    client.setScore.run(userScore);
                    msg.channel.send("Added " + pointReq + " points to <@" + nameID + `> bringing his total to ${userScore.points}.`);
                } else if (args[0] === "remove") {
                    userScore.points -= pointReq;
                    client.setScore.run(userScore);
                    msg.channel.send("Removed " + pointReq + " points from <@" + nameID + `> bringing his total to ${userScore.points}.`);
                } else if (args[0] === "set") {
                    userScore.points = pointReq;
                    client.setScore.run(userScore);
                    msg.channel.send("Total points setted to " + pointReq + " for <@" + nameID + ">.");
                }
            }
        } else {
            msg.channel.send("User not found.");
        }

    } else {
        msg.channel.send("You do not have permissions for this command.");
    }
}