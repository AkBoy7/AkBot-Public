const checkRole = require("./methods/checkRole.js");
const write = require("./methods/write.js");
const read = require("./methods/read.js");

var ignoreList = read("./ignore.json");

module.exports = function (msg, args) {
    const client = msg.client;
    if (args.length == 0) {
        msg.channel.send("Please state if you want to remove or add");
    } else {
        if (!checkRole("Board", msg) && !checkRole("Moderator", msg)) {
            msg.channel.send("You do not have permissions for this command.");
        } else {
            let ignoreCommand = args.shift();
            if (ignoreCommand === 'add') {
                if (args.length == 0) {
                    msg.channel.send("Please state who you would like to add to the ignore list. Example ```!ignore add @username```");
                }
                if (args.length == 1) {
                    let nameID = args[0].substring(3, args[0].length - 1);
                    let reqUser = client.users.cache.find(user => user.id === nameID);
                    if (reqUser != null) {
                        if (!ignoreList.includes(reqUser.username)) {
                            ignoreList.push(reqUser.username);
                            write(ignoreList, "./ignore.json");
                            msg.channel.send(args[0] + " has been added to the ignore list.");
                            console.log(reqUser.username + " added to ignore list by " + msg.author.username);
                        } else {
                            msg.channel.send(args[0] + " is already on the ignore list.");
                        }
                    }
                }
                if (args.length > 1) {
                    msg.channel.send("Please write a single username");
                }
            } else if (ignoreCommand === 'remove') {
                if (args.length == 0) {
                    msg.channel.send("Please state who you would like to remove from the ignore list. Example ```!ignore remove @username```");
                }
                if (args.length == 1) {
                    let nameID = args[0].substring(3, args[0].length - 1);
                    let reqUser = client.users.cache.find(user => user.id === nameID);
                    if (typeof reqUser !== 'undefined') {
                        const index = ignoreList.indexOf(reqUser.username);
                        if (index > -1) {
                            ignoreList.splice(index, 1);
        
                            write(ignoreList, "./ignore.json");
                            msg.channel.send(args[0] + " has been removed from the ignore list.");
                            console.log(reqUser.username + " Removed from ignore list by " + msg.author.username);
                        } else {
                            msg.channel.send(args[0] + " is not on the ignore list.")
                        }
                    }
                }
                if (args.length > 1) {
                    msg.channel.send("Please write a single username");
                }
            }
        }
    }
}