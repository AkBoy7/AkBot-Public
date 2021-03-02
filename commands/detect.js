const checkRole = require("./methods/checkRole.js");
const write = require("./methods/write.js");
const read = require("./methods/read.js");

var badwordsArray = read("./badwordslist.json");

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

module.exports = function (msg, args) {
    if (args.length == 0) {
        msg.channel.send("Please state if you want to remove or add");
    } else {
        let detectCommand = args.shift();
        if (!checkRole("Board", msg) && !checkRole("Moderator", msg)) {
            msg.channel.send("You do not have permissions for this command.");
        } else {
            if (detectCommand === 'remove') {
                console.log(msg.author.username + " is removing a bad word");
                if (args.length == 0) {
                    msg.channel.send("Please state what you would like to remove on the detection list with: ```!detect remove WORD```");
                }

                if (args.length == 1) {
                    const index = badwordsArray.indexOf(args[0]);
                    if (index > -1) {
                        badwordsArray.splice(index, 1);

                        write(badwordsArray, "./badwordslist.json");
                        msg.channel.send(args[0] + " has been removed from the detection list.");
                        console.log(args[0] + " Removed by " + msg.author.username);
                    } else {
                        msg.channel.send(args[0] + " is not on the detection list.")
                    }

                }

                if (args.length > 1) {
                    msg.channel.send("Please type a single word to remove");
                }
            } else if (detectCommand === 'add') {
                console.log(msg.author.username + " is adding a bad word");
                if (args.length == 0) {
                    msg.channel.send("Please state what you would like to add on the detection list with: ```!detect add WORD```");
                }

                if (args.length == 1) {
                    if (badMessage(args[0])) {
                        msg.channel.send(args[0] + " is already in the detection list.")
                    } else {
                        badwordsArray.push(args[0]);
                        write(badwordsArray, "./badwordslist.json");
                        msg.channel.send(args[0] + " has been added to the detection list.");
                        console.log(args[0] + " Added by " + msg.author.username);
                    }
                }

                if (args.length > 1) {
                    msg.channel.send("Please type a single word to add");
                }
            }
        }
    }
};
