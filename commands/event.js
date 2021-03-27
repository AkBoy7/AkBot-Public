const checkRole = require("./methods/checkRole.js");
const write = require("./methods/write.js");
const read = require("./methods/read.js");
const Discord = require('discord.js');
const freeEventPoints = 600;

//!event add name Of Event -> start a pol for an event
//!event accept -> give all of the users who reacted 500 AkPoints and removes last event.
module.exports = async function (msg, args) {
    if (!(checkRole("Board", msg) || checkRole("Moderator", msg))) {
        msg.channel.send("You do not have permissions for this command.");
        return;
    }
    let msgID = read("./commands/eventID.json");
    const client = msg.client;

    if (args.length >= 1) {
        if (msgID.length == 0) {
            msg.channel.send("There is no active event right now.");
            return;
        }
        let participants = read("./commands/participantsEvent.json");
        let text = ""
        for (var i = 0; i < participants.length; i++) {
            text += "<@" + participants[i] + ">\n";
        }
        text += "";

        const usersEmbed = new Discord.MessageEmbed()
        .setColor('#D9D023')
        .setTitle('Current users claiming AkPoints for the event')
        .setDescription(text)

        if (args[0].toLowerCase() === "accept") {
            let filter = m => m.author.id === msg.author.id;
            msg.channel.send("Please confirm the current people that have claimed AkPoints with `YES` or `NO`.")
            msg.channel.send(usersEmbed).then(() => {
                msg.channel.awaitMessages(filter, {
                    max: 1,
                    time: 15000,
                    errors: ['time']
                })
                    .then(async msg => {
                        msg = msg.first()
                        let command = msg.content.toUpperCase();
                        if (command.startsWith("YES")) {
                            msg.channel.send("Confirmed");

                            participants.forEach(particpant => {
                                let userScore = client.getScore.get(particpant);
                                console.log(userScore);
                                if (!userScore) {
                                    userScore = {
                                        id: `${particpant}`,
                                        user: particpant,
                                        points: 0,
                                        bids: "",
                                        amount: "",
                                        cooldown: 0
                                    }
                                }

                                userScore.points += freeEventPoints;
                                client.setScore.run(userScore);
                                msg.channel.send("Thank you for joining the Zephyr event <@" + particpant + ">, here are your free `" + freeEventPoints + "` AkPoints. Your total is now: `" + userScore.points + "`");
                            });

                            msgID = [];
                            participants = [];
                            write(msgID, "./commands/eventID.json");
                            write(participants, "./commands/participantsEvent.json");
                            return;
                        } else if (command.startsWith("NO")) {
                            msg.channel.send("Alright, you can remove the incorrect users with `!event remove @username`");
                            return;
                        }
                    })
                    .catch(collected => {
                        msg.channel.send('Timeout, Make sure to respond in time.')
                    });
            })
        } else if (args[0].toLowerCase() === "remove") {
            if (args.length == 1) {
                msg.channel.send("Please state who you would like to remove with `!event remove @username`");
                return;
            }

            let nameID = args[1].substring(3, args[1].length - 1);
            const index = participants.indexOf(nameID);
            if (index > -1) {
                participants.splice(index, 1);
                write(participants, "./commands/participantsEvent.json");
                msg.channel.send("Removed <@" + nameID + ">.");
                msg.channel.messages.fetch(msgID[0])
                .then(message => message.reactions.resolve("👍").users.remove(nameID))
                .catch(console.error);
            } else {
                msg.channel.send("Could not find user in the claiming list.");
            }
        } else if (args[0].toLowerCase() === "cancel") {
            msgID = [];
            participants = [];
            write(msgID, "./commands/eventID.json");
            write(participants, "./commands/participantsEvent.json");
            msg.channel.send("Event cancelled.");
        }
        return;
    }

    if (msgID.length >= 1) {
        msg.channel.send("AkBot only supports one active event at a time! Make sure to use `!event accept/cancel` for the current event.");
        return;
    }

    let filter = m => m.author.id === msg.author.id;
    msg.channel.send("What is the name of the event in which users can claim free AkPoints for?").then(() => {
        msg.channel.awaitMessages(filter, {
            max: 1,
            time: 20000,
            errors: ['time']
        })
            .then(async msg => {
                msg = msg.first()
                let eventName = msg.content
                if (eventName.startsWith("!event")) {
                    msg.channel.send("Please stop naming the event `!event`");
                    return;
                }

                await msg.channel.send("React to this message with 👍 to claim your AkPoints for participating in `" + eventName + "`. You will receive your free AkPoints at the end of the event.")
                    .then( function (msg) {
                        msg.react("👍")
                        msgID.push(msg.id)
                        msg.pin()
                        write(msgID, "./commands/eventID.json");
                    }).catch( function () {
                        msg.channel.send("One of the emojis failed to react.");
                    });

            })
            .catch(collected => {
                msg.channel.send('Timeout, Make sure to respond in time.')
            });
    })
}