const checkRole = require("./methods/checkRole.js");
require('dotenv').config();
let dateObj;
let client;
const Discord = require('discord.js');

// Main method that is called after !pc
module.exports = function (msg, args) {
    const { EmbedBuilder } = require('discord.js');
    // only allowed to be used in #pcrequest channel
    // if (msg.channel.id != process.env.PC_REQUEST_CHANNEL_ID) {
    //     msg.channel.send("Wrong text channel, please use the pcrequest channel.\n" +
    //     "If you do not have acces to this channel then message the board or a moderator.");
    //     return;
    // }
    client = msg.client;

    // Command: !pc 
    // This will send a help menu
    if (args.length == 0) {
        helpDescription(msg, EmbedBuilder);
        return;
    }

    // Command: !pc help 
    // This will also send a help menu
    if (args.length == 1 && args[0].toLowerCase() === "help") {
        helpDescription(msg, EmbedBuilder);
        return;
    }

    // Command: !pc schedule 
    // This will send a schedule of this month and next month
    if (args.length == 1 && args[0].toLowerCase() === "schedule") {
        let formattedSchedule = [];
        let allDates = client.getSchedule.all();
        var now = new Date();
        allDates.forEach(entry => {
            const dateObject = new Date(entry.trainingDate);
            if (dateObject.getMonth() >= now.getMonth() && dateObject.getMonth() <= now.getMonth() + 1 && dateObject.getTime() >= now.getTime()) {
                const humanDate = dateObject.toLocaleDateString();
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
                formattedSchedule.push(humanDate + ": Slot 1: " + slot1 + "; " + "Slot 2: " + slot2);
            }
        });

        if (formattedSchedule.length == 0) {
            msg.channel.send("The schedule was empty. You might need to use `!initSchedule` if it is a new year.");
        } else {
            formattedSchedule = formattedSchedule.join(" \n");

            const scheduleEmbed = new EmbedBuilder()
            .setColor('#D9D023')
            .setTitle('Current Schedule')
            .setAuthor({name: 'AkBot', iconURL: 'https://i.imgur.com/y21mVd6.png'})
            .setDescription("If you want to reserve a slot on a specific date below, than use the command `!pc request DD-MM`. " +
             "Do note you only have one token per month and you can only request a spot of the next month after the 15th of the current month.")
            .setThumbnail('https://i.imgur.com/mXodbnH.png')
            .addFields(
                { name: 'Schedule next two months', value:  "```" + formattedSchedule + "```"},
            )
            .setTimestamp();
        
            msg.channel.send({embeds: [scheduleEmbed]});
        }
        return;
    }

    // Command: !pc request DD-MM 
    // This will reserve a slot on the requested date and consume a token
    if (args.length == 2 && args[0].toLowerCase() === "request") {
        // First check if args[1] is in a date format: DD-MM before calling function
        if (!checkDateFormat(args[1], msg)) {
            return;
        }

        reserveSlot(msg);
    }

    // Command: !pc cancel DD-MM; 
    // This will cancel the reservation the requested date and return the token
    if (args.length == 2 && args[0].toLowerCase() === "cancel") {
        // First check if args[1] is in a date format: DD-MM before calling function
        if (!checkDateFormat(args[1], msg)) {
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
        if (!checkDateFormat(args[1], msg)) {
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

function helpDescription(msg, EmbedBuilder) {
    const helpEmbed = new EmbedBuilder()
    .setColor('#D9D023')
    .setTitle('PC Request Commands')
    .setAuthor({name: 'AkBot', iconURL: 'https://i.imgur.com/y21mVd6.png'})
    .setDescription('Made by Akam.\nIf you experience any issues with this bot please contact AkBob')
    .setThumbnail('https://i.imgur.com/mXodbnH.png')
    .addFields(
        { name: 'User commands', value: '!pc help \n\n!pc schedule \n\n!pc request DD-MM \n\n!pc cancel DD-MM \n', inline: true },
        { name: 'Description', value: 'Gives a list of commands related to pc requests \nSend the current schedule of this month and next month \nRequest and reserve a slot on the requested date \nCancel your reservation on the requested date', inline: true },
        { name: '\u200B', value: '\u200B' },
    )
    .addFields(
        { name: 'Mod commands', value: '!pc remove DD-MM\n', inline: true },
        { name: 'Description', value: 'Remove the date from the schedule and cancels any reservations on that date\n', inline: true },
    )
    .setTimestamp();

    msg.channel.send({embeds: [helpEmbed]});
}


// Checks if date is actually in a date format of DD-MM and return false if not correct
function checkDateFormat(date, msg) {
    var now = new Date();
    // Check formatting of the date in the message
    if (!(date).includes("-")) {
        msg.channel.send("Wrong date format! Make sure to write it in this formate `DD-MM`. Example 31-01 for 31st of January.");
        return false;
    }

    let dateParts = date.split('-');
    if (dateParts.length != 2) {
        msg.channel.send("Wrong date format! Make sure to write it in this formate `DD-MM`. Example 31-01 for 31st of January.");
        return false;
    }

    if (dateParts[0].length != 2 || dateParts[1].length != 2) {
        msg.channel.send("Wrong date format! Make sure to write it in this formate `DD-MM`. Example 31-01 for 31st of January.");
        return false;
    }
    
    if (!(parseInt(dateParts[0], 10) > 0 && parseInt(dateParts[0], 10) <= 31 && parseInt(dateParts[1], 10) > 0 && parseInt(dateParts[1], 10) <= 12)) {
        msg.channel.send("The date requested was not a proper date format with correct numbers");
        return false;
    }

    // Make a date object for later
    dateObj = new Date(now.getFullYear(), parseInt(dateParts[1], 10) - 1, parseInt(dateParts[0], 10));
    if (!dateObj) {
        msg.channel.send("An unexpected error occured with processing the date.");
        return false;
    }

    // Check if requested date is a training day
    let allDates = client.getSchedule.all();
    let isTrainingDay = false;
    allDates.forEach(entryDate => {
        let trainingDay = new Date(entryDate.trainingDate);
        console.log(entryDate.id + "day: " + trainingDay.getDate() + " month: " + trainingDay.getMonth());
        console.log(entryDate.id + "req day: " + dateObj.getDate() + " req month: " + dateObj.getMonth());
        if (trainingDay.getDay() == dateObj.getDay() && trainingDay.getMonth() == dateObj.getMonth()) {
            isTrainingDay = true;
        }
    });

    if (!isTrainingDay) {
        msg.channel.send("The requested date is not a valid training day.");
        return false;
    }

    console.log("Date checked and correct!");
    return true;
}