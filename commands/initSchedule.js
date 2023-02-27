const checkRole = require("./methods/checkRole.js");

module.exports = function (msg, args) {
    if (!(checkRole("Board", msg) || checkRole("Moderator", msg))) {
        msg.channel.send("You do not have permissions for this command.");
        return;
    }

    const client = msg.client;
    let schedule = client.getSchedule.all();
    if (schedule != null) {
        if (args.length == 0) {
            msg.channel.send("There already exist a schedule, are you sure you want to generate a new schedule for a new year? If so write the next command with force at the end.");
            return;
        } else if (args[0].toLowerCase() === "force") {
            msg.channel.send("Forced generating new Schedule...");
            //msg.client.removeSchedule.run();
        }
    } else {
        msg.channel.send("Generating new Schedule...");
    }

    let slot1 = ""
    let slot2 = ""

    var d = new Date();
    year = d.getYear(),
    trainingDates = [];
    console.log(year);
    d.setDate(1);

    // Get the first Monday or Wednesday in the month (0-6 Sunday - Saturday)
    while (d.getDay() !== 1 && d.getDay() !== 3) {
        d.setDate(d.getDate() + 1);
    }

    // Set time to 23:59:59
    d.setHours(23, 59, 59);


    // Get all the other Mondays and Wednesday in the current year
    while (d.getYear() === year) {
        var pushDate = new Date(d.getTime());
        trainingDates.push(pushDate);

        // if monday go to wednesday, else go from wednesday to monday
        if (d.getDay() == 1) {
            d.setDate(d.getDate() + 2);
        } else {
            d.setDate(d.getDate() + 5);
        }
    }
    console.log(d.getYear());

    for (let i = 0; i < trainingDates.length; i++) {
        entry = {
            id: i,
            trainingDate: trainingDates[i].getTime(),
            slot1: slot1,
            slot2: slot2
        };
        client.setScheduleSlot.run(entry);
    }
    msg.channel.send("Done with scheduling");
};