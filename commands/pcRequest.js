const checkRole = require("./methods/checkRole.js");
require('dotenv').config();
let dateObj;
let client;

// Main method that is called after !pc
module.exports = function (msg, args) {
    // only allowed to be used in #pcrequest channel
    if (msg.channel.id != process.env.PC_REQUEST_CHANNEL_ID) {
        msg.channel.send("Wrong text channel, please use the pcrequest channel.\n" +
        "If you do not have acces to this channel then message the board or a moderator.");
        return;
    }
    client = msg.client;

    // Command: !pc 
    // This will send a help menu
    if (args.length == 0) {
        // TODO: write a list of commands in an embedded message
    }

    // Command: !pc help 
    // This will also send a help menu
    if (args.length == 1 && args[0].toLowerCase() === "help") {
        // TODO: write a list of commands in an embedded message
    }

    // Command: !pc schedule 
    // This will send a schedule of this month and next month
    if (args.length == 1 && args[0].toLowerCase() === "schedule") {
        let formattedSchedule = "";
        let allDates = client.getSchedule.all();
        var now = new Date();
        allDates.forEach(entry => {
            const dateObject = new Date(entry.trainingDate);
            if (now.getMonth() >= dateObject.getMonth() && now.getMonth() + 2 < dateObject.getMonth()) {
                const humanDate = dateObject.toLocaleString();
                let slot1;
                let slot2;
                if (entry.slot1 === "") {
                    slot1 = "---";
                } else {
                    slot1 = entry.slot1;
                }
    
                if (entry.slot2 === "") {
                    slot2 = "---";
                } else {
                    slot2 = entry.slot2;
                }
                formattedSchedule.push("```" + humanDate + ": Slot 1: " + slot1 + "; " + + ": Slot 2: " + slot2 + "```");
            }
        });

        msg.channel.send(formattedSchedule);
        return;
    }

    // Command: !pc request DD-MM 
    // This will reserve a slot on the requested date and consume a token
    if (args.length == 2 && args[0].toLowerCase() === "request") {
        // First check if args[1] is in a date format: DD-MM before calling function
        if (!checkDateFormat(args[1])) {
            return;
        }

        reserveSlot(msg);
    }

    // Command: !pc cancel DD-MM; 
    // This will cancel the reservation the requested date and return the token
    if (args.length == 2 && args[0].toLowerCase() === "cancel") {
        // First check if args[1] is in a date format: DD-MM before calling function
        if (!checkDateFormat(args[1])) {
            return;
        }

        cancelSlot(msg);
    }

    // Command only for board and moderators: !pc remove DD-MM; 
    // This will remove the reservation on the requested date, return the token to the owner and remove the date in the schedule
    if (args.length == 2 && args[0].toLowerCase() === "remove") {
        // Check if board or Moderator requested this command
        if (!(checkRole("Board", msg) || checkRole("Moderator", msg))) {
            msg.channel.send("You do not have permissions for this command. You might want to use `cancel` instead of `remove`.");
            return;
        }
        // Check if args[1] is in a date format: DD-MM before calling function
        if (!checkDateFormat(args[1])) {
            return;
        }
        
        removeSlot(msg);
    }
}

// Reserve the slot stored inside the dateObj and consumes a token
function reserveSlot(msg) {
    // TODO: write function
}

// Cancel the reserved slot stored inside the dateObj and returns the token to the owner
function cancelSlot(msg) {
    // TODO: write function
}

// Removes any reservation inside the dateObj, returns any tokens and removes the date from the schedule
function removeSlot(msg) {
    // TODO: write function
}


// Checks if date is actually in a date format of DD-MM and return false if not correct
function checkDateFormat(date) {
    // Check formatting of the date in the message
    if (!(date.content).includes("-")) {
        msg.channel.send("Wrong date format! Make sure to write it in this formate `DD-MM`. Example 31-01 for 31st of January.");
        return false;
    }

    let dateParts = date.split('-');
    if (dateParts.length != 2) {
        msg.channel.send("Wrong date format! Make sure to write it in this formate `DD-MM`. Example 31-01 for 31st of January.");
        return false;
    }

    if (!Number.isSafeInteger(parseInt(dateParts[0], 10)) || !Number.isSafeInteger(parseInt(dateParts[1], 10))) {
        msg.channel.send("The date requested was not a proper date format with numbers");
        return false;
    }

    // Make a date object for later
    dateObj = new Date(parseInt(dateParts[1], 10) - 1, parseInt(dateParts[0], 10));
    if (!dateObj) {
        msg.channel.send("An unexpected error occured with processing the date.");
        return false;
    }

    // Check if requested date is a training day
    let allDates = client.getSchedule.all();
    let isTrainingDay = false;
    allDates.forEach(entryDate => {
        if (entryDate.trainingDate === date) {
            isTrainingDay = true;
        }
    });

    if (!isTrainingDay) {
        msg.channel.send("The requested date is not a valid training day.");
        return false;
    }

    return true;
}