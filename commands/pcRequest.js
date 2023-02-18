const checkRole = require("./methods/checkRole.js");
require('dotenv').config();
let dateObj;

// Main method that is called after !pc
module.exports = function (msg, args) {
    // only allowed to be used in #pcrequest channel
    if (msg.channel.id != process.env.PC_REQUEST_CHANNEL_ID) {
        msg.channel.send("Wrong text channel, please use the pcrequest channel.\n" +
        "If you do not have acces to this channel then message the board or a moderator.");
        return;
    }

    // Command: !pc 
    // This will send a help menu
    if (args.length == 0) {

    }

    // Command: !pc help 
    // This will also send a help menu
    if (args.length == 1 && args[0].toLowerCase() === "help") {

    }

    // Command: !pc schedule 
    // This will send a schedule of this month and next month
    if (args.length == 1 && args[0].toLowerCase() === "schedule") {

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

}

// Cancel the reserved slot stored inside the dateObj and returns the token to the owner
function cancelSlot(msg) {

}

// Removes any reservation inside the dateObj, returns any tokens and removes the date from the schedule
function removeSlot(msg) {

}

// Checks if date is actually in a date format of DD-MM and return false if not correct
function checkDateFormat(date) {
    if (!(date.content).includes("-")) {
        msg.channel.send("Wrong date format! Make sure to write it in this formate `DD-MM`. Example 31-01 for 31st of January.");
        return false;
    }

    let dateParts = date.split('-');
    if (dateParts.length != 2) {
        msg.channel.send("Wrong date format! Make sure to write it in this formate `DD-MM`. Example 31-01 for 31st of January.");
        return false;
    }

    dateObj = new Date(parseInt(dateParts[1], 10) - 1, parseInt(dateParts[0], 10));
    if (!dateObj) {
        msg.channel.send("An unexpected error occured with processing the date.");
        return false;
    }

    return true;
}