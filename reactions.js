require('dotenv').config();

const write = require("./commands/methods/write.js");
const read = require("./commands/methods/read.js");

exports.gotReaction = function (reaction, user) {
    console.log("got");
    const msgID = read("./commands/eventID.json");
    if (msgID.length == 0) {
        console.log("reaction on a non event post.");
    } else if (reaction.emoji.name === '👍' && reaction.message.id === msgID[0] && user.id != process.env.AKBOTID) {
        let users = read("./commands/participantsEvent.json");
        if (!users.includes(user.id)) {
            users.push(user.id);
            write(users, "./commands/participantsEvent.json");
            console.log(`${user} is claiming akpoints for an event.`);
        }
    }
}

exports.removeReaction = function (reaction, user) {
    const msgID = read("./commands/eventID.json");
    if (msgID.length == 0) {
        console.log("reaction on a non event post.");
    } else if (reaction.emoji.name === '👍' && reaction.message.id === msgID[0] && user.id != process.env.AKBOTID) {
        let users = read("./commands/participantsEvent.json");
        const index = users.indexOf(user.id);
        if (index > -1) {
            users.splice(index, 1);
            write(users, "./commands/participantsEvent.json");
        }
        console.log(`${user} is no longer claiming akpoints for an event.`);
    }
}