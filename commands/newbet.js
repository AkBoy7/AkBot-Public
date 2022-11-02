const generateBetEntry = require("./methods/generateBetEntry.js");
const checkRole = require("./methods/checkRole");
const validAmount = require("./methods/validAmount.js");
const parsePoints = require("./methods/parsePoints");
const generateScore = require("./methods/generateScore");
require('dotenv').config();
const Discord = require('discord.js');

module.exports = async function (msg, args) {
    const { EmbedBuilder } = require('discord.js');
    if (args.length == 0) {
        const client = msg.client;
        //get a list of bets formatted for the message
        let allBets = client.getBets.all();
        let formattedBets = [];
        allBets.forEach(bet => {
            const dateObject = new Date(bet.lockin);
            const humanDate = dateObject.toLocaleString();
            formattedBets.push("------------\n```" + bet.title + ": (" + bet.odds1 + ") " + bet.option1 + " vs " + bet.option2 + " (" + bet.odds2 + "). ID: " + bet.id + " Lockin: " + humanDate + "```");
        });
        formattedBets = formattedBets.join(" \n");
        console.log(formattedBets);

        //get list of all users who have akpoints
        users = client.getUsers.all();
        if (users.length == 0 || users == null) {
            msg.channel.send("This error is not supposed to happen...");
            return;
        }

        users.sort(function(a, b) {
            return ((a.points > b.points) ? -1 : ((a.points == b.points) ? 0 : 1));
        });

        //create leaderboard of the users, only top 10 is shown.
        let userLeaderboard = [];
        for (var i = 0; i < users.length; i++) {
            
            if (i == 0) {
                userLeaderboard.push(":first_place: <@" + users[i].id + "> - " + users[i].points);
            } else if (i == 1) {
                userLeaderboard.push(":second_place: <@" + users[i].id + "> - " + users[i].points);
            } else if (i == 2) {
                userLeaderboard.push(":third_place: <@" + users[i].id + "> - " + users[i].points);
            } else if (i <= 9){
                userLeaderboard.push(" <@" + users[i].id + "> - " + users[i].points);
            } else {
                break;
            }
        }
        userLeaderboardMsg = userLeaderboard.join(" \n");

        const betEmbed = new EmbedBuilder()
            .setColor('#D9D023')
            .setTitle('Current possible bets')
            .setAuthor({name: 'AkBot', iconURL: 'https://i.imgur.com/y21mVd6.png'})
            .setDescription("You can bet by typing in the command !bet followed with the id of the bet, then the team/option written as 1 or 2. Finally, at the end of the command the amount of points. Example betting on a bet with an id on option 1 for 100 Akpoints: `!bet id 1 100` \nIf there are no bets, try make your own with `!bet create`")
            .setThumbnail('https://i.imgur.com/mXodbnH.png')
            .addFields(
                { name: 'Current bets', value: formattedBets + "------------"},
            )
            .addFields(
                { name: 'Leaderboard', value: '' + userLeaderboardMsg + '' },
            )
            .setTimestamp()
        
        msg.channel.send({embeds: [betEmbed]});
        return;
    }

    if ((args[0].toLowerCase()).startsWith("akb7") & args.length != 2) {
        bet(msg, args);
        return;
    }

    if (args[0].toLowerCase() === "win") {
        applyResults(msg, args);
        return;
    }

    if (args[0].toLowerCase() == "cancel") {
        cancelBet(msg, args);
        return;
    }

    if (args[0].toLowerCase() === "create") {
        //user creates a bet with a title, two options, two odds, and lockin time.
        const client = msg.client;
        let complete = false;
        let betEntry;
        let authorID = msg.author.id;
        let filter = m => m.author.id === msg.author.id;

        const creationSetup1 = new EmbedBuilder()
            .setColor('#D9D023')
            .setTitle("Bet Creation Step 1")
            .addFields(
                { name: 'Type the name or title of the bet', value: 'you have 25 seconds until the bet creation will be canceled' },
            )
            .setTimestamp();
        msg.channel.send({embeds: [creationSetup1]}).then(() => {
            msg.channel.awaitMessages({ filter: filter, max: 1, time: 25000, errors: ['time']})
                .then(async msg => {
                    msg = msg.first()
                    let title = msg.content
                    if (title.startsWith("!") || (msg.content).includes(")")) {
                        msg.channel.send("Please do not start with !");
                        return;
                    }

                    const creationSetup2 = new EmbedBuilder()
                    .setColor('#D9D023')
                    .setTitle("Bet Creation Step 2")
                    .setDescription("Alright the name of your bet is: " + title)
                    .addFields(
                        { name: 'What is the first option a user can bet on?', value: 'you have 25 seconds until the bet creation will be canceled' },
                    )
                    .setTimestamp();
                    await msg.channel.send({embeds: [creationSetup2]})
                        .then(function (msg) {
                            msg.channel.send("Option 1:").then(() => {
                                msg.channel.awaitMessages({ filter: filter, max: 1, time: 25000, errors: ['time']})
                                    .then(async msg => {
                                        msg = msg.first()
                                        let option1 = msg.content
                                        if (option1.startsWith("!") || (msg.content).includes(")")) {
                                            msg.channel.send("Please do not name an option starting with !");
                                            return;
                                        }
                                        await msg.channel.send("Option 2:").then(() => {
                                            msg.channel.awaitMessages({ filter: filter, max: 1, time: 25000, errors: ['time']})
                                                .then(async msg => {
                                                    msg = msg.first()
                                                    let option2 = msg.content
                                                    if (option2.startsWith("!") || (msg.content).includes(")")) {
                                                        msg.channel.send("Please do not name an option starting with !");
                                                        return;
                                                    }

                                                    const creationSetup3 = new EmbedBuilder()
                                                    .setColor('#D9D023')
                                                    .setTitle("Bet Creation Step 3")
                                                    .setDescription("The two options of your bet are: " + option1 + " vs " + option2)
                                                    .addFields(
                                                        { name: 'What are the odds of the bet? Please seperate them with - and use dots for decimals', value: 'you have 25 seconds until the bet creation will be canceled' },
                                                    )
                                                    .setTimestamp();

                                                    await msg.channel.send({embeds: [creationSetup3]}).then(() => {
                                                        msg.channel.awaitMessages({ filter: filter, max: 1, time: 25000, errors: ['time']})
                                                            .then(async msg => {
                                                                msg = msg.first()
                                                                if (!(msg.content).includes("-") || (msg.content).includes(")")) {
                                                                    msg.channel.send("Please seperate the odds with a dash -, cancelling this bet.")
                                                                    return;
                                                                }
                                                                let odds = msg.content.split("-")
                                                                if (msg.content.startsWith("!")) {
                                                                    msg.channel.send("Please do not start with ! for odds...");
                                                                    return;
                                                                }
                                                                odds[0] = parseFloat(odds[0]);
                                                                odds[1] = parseFloat(odds[1]);

                                                                const creationSetup4 = new EmbedBuilder()
                                                                .setColor('#D9D023')
                                                                .setTitle("Bet Creation Step 4")
                                                                .setDescription("The odds are: " + odds[0] + " against " + odds[1])
                                                                .addFields(
                                                                    { name: 'When should the bet be locked? Please use the following format: DD-MM-YYYY HH:MM', value: 'you have 25 seconds until the bet creation will be canceled' },
                                                                )
                                                                .setTimestamp();
                                                                await msg.channel.send({embeds: [creationSetup4]}).then(() => {
                                                                    msg.channel.awaitMessages({ filter: filter, max: 1, time: 25000, errors: ['time']})
                                                                        .then(async msg => {
                                                                            msg = msg.first()
                                                                            let timeDate = msg.content
                                                                            if (timeDate.startsWith("!") || (msg.content).includes(")")) {
                                                                                msg.channel.send("Please do not name an option starting with !");
                                                                                return;
                                                                            }

                                                                            if (!(msg.content).includes("-") || !(msg.content).includes(":")) {
                                                                                msg.channel.send("Wrong format! Make sure to use DD-MM-YY HH-MM (with HH meaning hour and MM meaning minutes.")
                                                                                return;
                                                                            }

                                                                            let dateTimeParts = timeDate.split(' ')
                                                                            let timeParts = dateTimeParts[1].split(':')
                                                                            let dateParts = dateTimeParts[0].split('-')
                                                                            let date = new Date(dateParts[2], parseInt(dateParts[1], 10) - 1, dateParts[0], timeParts[0], timeParts[1]);
                                                                            console.log(date.getTime());
                                                                            console.log(Date.now());
                                                                            if (date.getTime() <= Date.now()) {
                                                                                msg.channel.send("Lock in time has already passed!");
                                                                                return;
                                                                            }
                                                                            betEntry = generateBetEntry(title, option1, option2, odds[0], odds[1], date.getTime(), msg, authorID);
                                                                            client.setBet.run(betEntry);
                                                                            complete = true;
                                                                            console.log(betEntry);
                                                                            completeBet(client, betEntry, msg)
                                                                        })
                                                                    // .catch(collected => {
                                                                    //     msg.channel.send('Timeout, Make sure to respond in time2.')
                                                                    // });
                                                                });
                                                            })
                                                            .catch(collected => {
                                                                msg.channel.send('Timeout, Make sure to respond in time.')
                                                            });
                                                    })
                                                        .catch(collected => {
                                                            msg.channel.send('Timeout, Make sure to respond in time.')
                                                        });
                                                })
                                                .catch(collected => {
                                                    msg.channel.send('Timeout, Make sure to respond in time.')
                                                });
                                        })
                                            .catch(collected => {
                                                msg.channel.send('Timeout, Make sure to respond in time.')
                                            });
                                    })
                                    .catch(collected => {
                                        msg.channel.send('Timeout, Make sure to respond in time.')
                                    });
                            });
                        })
                        .catch(collected => {
                            msg.channel.send('Timeout, Make sure to respond in time.')
                        });
                })
                .catch(collected => {
                    msg.channel.send('Timeout, Make sure to respond in time.')
                });
        });
        console.log(complete);
    }
    else {
        if ((checkRole("Board", msg) || checkRole("Moderator", msg))) {
            approveBet(msg, args);
        } else {
            msg.channel.send("You do not have permissions for this command.");
            return;
        }
    }
}

function completeBet(client, betEntry, msg) {
    console.log("Bet succesfully created.");
    botChannel = client.channels.cache.get(process.env.BOTLOG_CHANNEL_ID);
    const dateObject = new Date(betEntry.lockin);
    const humanDate = dateObject.toLocaleString();
    botChannel.send(`Bet Created by <@${betEntry.author}> needs approval by someone from with the moderators or board role.\n` + "```" + `Bet: ${betEntry.title}\nID: ${betEntry.id}\n(${betEntry.odds1}) ${betEntry.option1} vs ${betEntry.option2} (${betEntry.odds2})\nLock in at ${humanDate}` + "```\nPlease approve, decline or remove the bet with `!bet id approve/decline/remove`");
    msg.channel.send("Bet succesfully created! Your bet is send to the moderators for approval.");
}

function approveBet(msg, args) {
    const client = msg.client;
    const bets = client.getBets.all();
    let found = false;
    bets.forEach(bet => {
        if (bet.id === args[0]) {
            found = true;
            if (args.length > 1) {
                if (args[1].toLowerCase() === "approve") {
                    bet.approved = 1;
                    client.setBet.run(bet);
                    msg.channel.send("Bet approved! Please do not remove the bet since that would remove the points of users, cancel the bet after lockin");
                    const nameID = bet.author;
                    client.users.fetch(nameID).then(user => {
                        user.send(`Your bet: ${bet.title} was approved by ${msg.author.username}`);
                    });
                } else if (args[1].toLowerCase() === "decline") {
                    if (bet.approved == 1) {
                        msg.channel.send("Bet has already been approved");
                    } else {
                        client.remBet.run(bet.id);
                        msg.channel.send("Bet declined and removed.");
                        const nameID = bet.author;
                        client.users.fetch(nameID).then(user => {
                            user.send(`Your bet: ${bet.title} was declined by ${msg.author.username}`);
                        });
                    }
                } else if (args[1].toLowerCase() === "remove") {
                    client.remBet.run(bet.id);
                    msg.channel.send("Bet removed.");
                    const nameID = bet.author;
                    client.users.fetch(nameID).then(user => {
                        user.send(`Your bet: ${bet.title} was removed by ${msg.author.username}`);
                    });
                } else {
                    msg.channel.send("Make sure to write approve or decline correctly");
                }
            } else {
                msg.channel.send("Please mention if you want to decline or approve the bet.");
            }
        }
    });
    if (!found) {
        msg.channel.send("Could not find specified bet with that id");
    }
}

function bet(msg, args) {
    const client = msg.client;
    const bets = client.getBets.all();
    let found = false;

    if (args.length < 3) {
        msg.channel.send("Bet should be in the format of ``!bet id option amount``");
        return;
    }

    let currentBet;
    bets.forEach(bet => {
        if (bet.id === args[0]) {
            found = true;
            currentBet = bet;
        }
    });
    if (!found) {
        msg.channel.send("Could not find specified bet with that id");
        return;
    } else {
        //Check if lock in has not yet passed and bet is already approved
        if (currentBet.locked == 1) {
            msg.channel.send("Bets lock in time has passed, no more bets are accepted for this bet.");
            return;
        } else if (currentBet.approved == 0) {
            msg.channel.send("Bet has not been approved by a moderator yet. You shouldnt even be able to see that bet??");
            return;
        }
        //Check if user has already bet on the options
        let user1IDs = currentBet.userBets1.split(",");
        let user2IDs = currentBet.userBets2.split(",");
        if (user1IDs.includes(msg.author.id) || user2IDs.includes(msg.author.id)) {
            msg.channel.send("You can only bet once on a bet!");
            return;
        }

        //Check if valid point amount
        let score = client.getScore.get(msg.author.id);

        if (!score) {
            score = generateScore(msg);
        }
        let bet = parsePoints(args[2], score);

        if (!validAmount(score, bet, msg)) {
            return;
        }

        //Subtract points from user and add bet to the bet entry
        //user has bet on option 1
        if (args[1] === "1") {
            score.points = score.points - bet;
            currentBet.userBets1 = currentBet.userBets1 + msg.author.id + ",";
            currentBet.amount1 = currentBet.amount1 + bet + ",";
            client.setScore.run(score);
            client.setBet.run(currentBet);
            msg.channel.send(`You have betted ${bet} AkPoints on ${currentBet.title} for option 1 ${currentBet.option1}`);
        } else if (args[1] === "2") { //user has bet on option 2
            score.points = score.points - bet;
            currentBet.userBets2 = currentBet.userBets2 + msg.author.id + ",";
            currentBet.amount2 = currentBet.amount2 + bet + ",";
            client.setScore.run(score);
            client.setBet.run(currentBet);
            msg.channel.send(`You have betted ${bet} AkPoints on ${currentBet.title} for option 2 ${currentBet.option2}`);
        } else {
            msg.channel.send("Unsure on what option you want to bet on, use 1 or 2 to indicate the option.")
            return;
        }

    }
}

//!bet win option id
function applyResults(msg, args) {
    const client = msg.client;
    const bets = client.getBets.all();
    let found = false;

    let currentBet;
    bets.forEach(bet => {
        if (bet.id === args[2]) {
            found = true;
            currentBet = bet;
        }
    });

    if (!found) {
        msg.channel.send("Can not find a bet with that ID.");
        return;
    }

    if (currentBet.locked == 0) {
        msg.channel.send("Bet has not been locked in yet.");
        return;
    }

    console.log(currentBet);
    console.log(msg.author.id);
    if ((currentBet.author == msg.author.id) || (checkRole("Board", msg) || checkRole("Moderator", msg))) {
        if (args[1] === "1") {
            let winnersIDs = currentBet.userBets1.split(",");
            let winnersAmount = currentBet.amount1.split(",");
            let losersIDs = currentBet.userBets2.split(",");
            let losersAmount = currentBet.amount2.split(",");

            for (let i = 0; i < winnersIDs.length - 1; i++) {
                let userEntry = client.getScore.get(winnersIDs[i]);
                let pointsGained = parseInt(parseInt(winnersAmount[i], 10) * currentBet.odds1, 10);
                userEntry.points += pointsGained;
                client.setScore.run(userEntry);
                msg.channel.send("<@" + winnersIDs[i] + "> has bet correctly and won " + pointsGained + " AkPoints.");
            }

            for (let i = 0; i < losersIDs.length -1; i++) {
                let pointslossed = parseInt(losersAmount[i], 10);
                msg.channel.send("<@" + losersIDs[i] + "> has lost the bet and lost " + pointslossed + " AkPoints.");
            }

            client.remBet.run(currentBet.id);
        } else if (args[1] === "2") {
            let winnersIDs = currentBet.userBets2.split(",");
            let winnersAmount = currentBet.amount2.split(",");
            let losersIDs = currentBet.userBets1.split(",");
            let losersAmount = currentBet.amount1.split(",");

            for (let i = 0; i < winnersIDs.length-1; i++) {
                let userEntry = client.getScore.get(winnersIDs[i]);
                let pointsGained = parseInt(parseInt(winnersAmount[i], 10) * currentBet.odds2, 10);
                userEntry.points += pointsGained;
                client.setScore.run(userEntry);
                msg.channel.send("<@" + winnersIDs[i] + "> has bet correctly and won " + pointsGained + " AkPoints.");
            }

            for (let i = 0; i < losersIDs.length-1; i++) {
                let pointslossed = parseInt(losersAmount[i], 10);
                msg.channel.send("<@" + losersIDs[i] + "> has lost the bet and lost " + pointslossed + " AkPoints.");
            }

            client.remBet.run(currentBet.id);
        }
    } else {
        msg.channel.send("Only the author of the bet and moderators can apply the results of that bet.");
        return;
    }
}

function cancelBet(msg, args) {
    const client = msg.client;
    const bets = client.getBets.all();
    let found = false;

    let currentBet;
    bets.forEach(bet => {
        if (bet.id === args[1]) {
            found = true;
            currentBet = bet;
        }
    });

    if (!found) {
        msg.channel.send("Can not find a bet with that ID.");
        return;
    }

    if (currentBet.locked == 0) {
        msg.channel.send("Bet has not been locked in yet.");
        return;
    }

    console.log(currentBet);
    console.log(msg.author.id);
    if ((currentBet.author == msg.author.id) || (checkRole("Board", msg) || checkRole("Moderator", msg))) {
        let winnersIDs = currentBet.userBets1.split(",");
        let winnersAmount = currentBet.amount1.split(",");
        let losersIDs = currentBet.userBets2.split(",");
        let losersAmount = currentBet.amount2.split(",");
        if (winnersIDs.length + losersIDs.length - 2 <= 0) {
            msg.channel.send("No bets were made.");
            client.remBet.run(currentBet.id);
            return;
        }

        if (winnersIDs.length - 1 > 0) {
            for (let i = 0; i < winnersIDs.length-1; i++) {
                let userEntry = client.getScore.get(winnersIDs[i]);
                let pointsGained = parseInt(winnersAmount[i], 10);
                userEntry.points += pointsGained;
                client.setScore.run(userEntry);
                msg.channel.send("Bet was canceled, <@" + winnersIDs[i] + "> got " + pointsGained + " AkPoints back.");
            }
        }
        if (losersIDs.length - 1 > 0) {
            for (let i = 0; i < losersIDs.length - 1; i++) {
                let userEntry = client.getScore.get(losersIDs[i]);
                let pointslossed = parseInt(losersAmount[i], 10);
                userEntry.points += pointslossed;
                client.setScore.run(userEntry);
                msg.channel.send("Bet was canceled, <@" + losersIDs[i] + "> got " + pointslossed + " AkPoints back.");
            }
        }

            client.remBet.run(currentBet.id);
    } else {
        msg.channel.send("Only the author of the bet and moderators can apply the results of that bet.");
        return;
    }
}
