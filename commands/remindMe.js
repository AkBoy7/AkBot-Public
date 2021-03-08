const read = require("./methods/read.js");
const write = require("./methods/write.js");

module.exports = function (msg, args) {
    let reminderArray = read("./commands/reminderList.json");

    if (reminderArray.includes(msg.author.id)) {
        const index = reminderArray.indexOf(msg.author.id);
        if (index > -1) {
            reminderArray.splice(index, 1);

            write(reminderArray, "./commands/reminderList.json");
            msg.channel.send("You will no longer be reminded for ``!points get``");
            console.log(msg.author.username + " is no longer reminded.");
        }
    } else {
        reminderArray.push(msg.author.id);
        write(reminderArray, "./commands/reminderList.json");
        msg.channel.send("You will now be reminded when ``!points get`` is possible again.");
        console.log(msg.author.username + " is added to the reminder list.");
    }
}