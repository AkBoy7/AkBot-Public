const checkRole = require("./methods/checkRole");
const read = require("./methods/read.js");
const write = require("./methods/write.js");
const locked = require("./methods/locked.js");

function globalList(word, array) {
    if (array.includes(word)) {
        return true;
    } else {
        array.forEach(element => {
            if (word.includes(element)) {
                return true
            }
        });
    }
    return false;
}

module.exports = function (msg, args) {
    let matches = read("./commands/matches.json");
    let teams = read("./commands/teams.json");
    if (checkRole("Board", msg) || checkRole("Moderator", msg)) {
        const client = msg.client;

        let command = args.shift();

        if (!locked(null) && command !== "lock") {
            msg.channel.send("Please first lock in the current bets before using the other !bids command by using the command: ```!bids lock true/false```");
            return;
        }
       
        if (command === "win" || command === "loss" || command === "cancel") {
            //If command is not complete !bids win teamName 
            if (args.length < 1) {
                msg.channel.send("Use the correct command: ```!bids win/lose/cancel teamname```");
                return;
            }
            let teamName = args.shift().toLowerCase();

            if (!teams.includes(teamName)) {
                msg.channel.send("Team does not exist.");
                return;
            }

            users = client.getUsersBids.all('');
            if (users.length == 0 || users == null) {
                msg.channel.send("There are no bets for that team currently.");
                return;
            }

            if (args.length == 0) {
                msg.channel.send("Please provide the ratio/odds");
                return;
            }

            let odds = parseFloat(args.shift());
            if (odds < 1 || odds > 2) {
                msg.channel.send("Please make sure that the ratio is at least 1 and at most 2");
                return;
            }

            users.forEach(user => {
                let teamBets = (user.bids).split(',');
                let amountBets = (user.amount).split(',');
                teamBets.pop();
                amountBets.pop();

                let amounts = [];
                amountBets.forEach(amount => {
                    amounts.push(parseInt(amount, 10));
                });

                if (command === "win") { //if team has won
                    let pointsGained = 0;

                    //if user betted correctly; teamName is in one of the bets
                    for (i = 0; i < teamBets.length; i++) {
                        if (teamName === teamBets[i]) {
                            pointsGained = Math.floor(amounts[i] * odds); //user wins 2 times the amount betted
    
                            //remove the bet in the two lists
                            const index = teamBets.indexOf(teamBets[i]);
                            if (index > -1) {
                                teamBets.splice(index, 1);
                                amountBets.splice(index, 1);  
                            }
    
                            msg.channel.send("<@" + user.id + "> has bet correctly and won " + pointsGained + " AkPoints.");
                            break;
                        }
                    }
    
                    //update the new row but first check if there are any bets left
                    user.points += pointsGained;
                } else if (command === "loss") { //if team has lost
                    for (i = 0; i < teamBets.length; i++) {
                        if (teamName === teamBets[i]) {
                            pointsLost = amounts[i]; //user does not gain anything
    
                            //remove the bet in the two lists
                            const index = teamBets.indexOf(teamBets[i]);
                            if (index > -1) {
                                teamBets.splice(index, 1);
                                amountBets.splice(index, 1);  
                            }
    
                            msg.channel.send("<@" + user.id + "> has lost the bet and lost " + pointsLost + " AkPoints.");
                            break;
                        }
                    }
                } else if (command === "cancel") {
                    pointsBet = 0;
                    //if user betted correctly; teamName is in one of the bets
                    for (i = 0; i < teamBets.length; i++) {
                        if (teamName === teamBets[i]) {
                            pointsBet = amounts[i]; //user wins 2 times the amount betted
        
                            //remove the bet in the two lists
                            const index = teamBets.indexOf(teamBets[i]);
                            if (index > -1) {
                                teamBets.splice(index, 1);
                                amountBets.splice(index, 1);  
                            }
        
                            if (teamBets.length == 0) {
                                user.bids = "";
                                user.amount = "";
                            } else {
                                user.bids = teamBets.join(',') + ',';
                                user.amount = amountBets.join(',') + ',';
                            }
                            user.points += pointsBet;
                            client.setScore.run(user);
        
                            msg.channel.send("Bet canceled bet AkPoints refunded to <@" + user.id + "> " + pointsBet + " AkPoints.");
                            break;
                        }
                    }
                }

                if (teamBets.length == 0) {
                    user.bids = "";
                    user.amount = "";
                } else {
                    user.bids = teamBets.join(',') + ',';
                    user.amount = amountBets.join(',') + ',';
                }
                client.setScore.run(user);
            });
        } else if (command === "lock") {
            if (args[0] === "true") {
                locked(true);
                msg.channel.send("Bets have been locked in, users can no longer bet.");
            } else if (args[0] === "false") {
                locked(false);
                msg.channel.send("Bets are now possible again!");
            } else {
                msg.channel.send("Please state if you want to lock the bettings with ```!bids lock true/false```");
            }
        } else if (command === "add") {
            teamToAdd = args[0].toLowerCase();
            if (args.length == 1) {
                if (globalList(teamToAdd, teams)) {
                    msg.channel.send(teamToAdd + " is already in the bet list.")
                } else {
                    teams.push(teamToAdd);
                    write(teams, "./commands/teams.json");
                    msg.channel.send(teamToAdd + " has been added to the bet list.");
                    console.log(teamToAdd + " Added by " + msg.author.username);
                }
            } else {
                msg.channel.send("Please write a single team name.");
                return;
            }
        } else if (command === "remove") {
            teamToRem = args[0].toLowerCase();
            if (args.length == 1) {
                const index = teams.indexOf(teamToRem);
                if (index > -1) {
                    teams.splice(index, 1);

                    write(teams, "./commands/teams.json");
                    msg.channel.send(teamToRem + " has been removed from the bet list.");
                    console.log(teamToRem + " Removed by " + msg.author.username);
                } else {
                    msg.channel.send(teamToRem + " is not on the bet list.")
                }
            } else {
                msg.channel.send("Please write a single team neam.");
            }
        } else if (command === "match") {
            matchToAdd = args.join(' ');
            matches.push(matchToAdd);
            matchMsg = matches.join('``` \n```');
            write(matches, "./commands/matches.json");
            msg.channel.send("Current matches now: ```" + matches + ' ```');
        } else if (command === "clear") {
            write([], "./commands/matches.json");
            msg.channel.send("Matches cleared.");
        }
    } else {
        msg.channel.send("You do not have permissions for this command.");
    }
}