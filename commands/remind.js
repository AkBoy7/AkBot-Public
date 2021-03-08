const read = require("./methods/read.js");
const write = require("./methods/write.js");
const cooldown = 172800000; //2 days

require('dotenv').config();

module.exports = function (client) {
    setInterval(function () {
        let reminderArray = read("./commands/reminderList.json");
        let alreadyRemindedArray = read("./commands/reminderDone.json");

        reminderArray.forEach(remindedUser => {
            if (alreadyRemindedArray.includes(remindedUser)) {
                console.log("already reminded");
            } else {
                let score = client.getScore.get(remindedUser);

                //creates mew table if user does not have one yet
                if (!score) {
                    score = generateScore(msg);
                }
    
                //check for cooldown
                if (!(score.cooldown !== 0 && cooldown - (Date.now() - score.cooldown) > 0)) {
                    //user cooldown is over and will be reminded here by a dm
                    client.users.fetch(remindedUser).then(user => {
                        alreadyRemindedArray.push(remindedUser)
                        write(alreadyRemindedArray, "./commands/reminderDone.json");
                        user.send("Friendly reminder to use ``!points get`` for AkPoints");
                        console.log("Sended reminder");
                    });
                }
            }
        });
    }, 1000 * 60 * 60);
}