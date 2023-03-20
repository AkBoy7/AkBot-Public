// @ts-check
const checkRole = require("./methods/checkRole.js");
require('dotenv').config();
let dateObj;
let client;
const Discord = require('discord.js');
let requestedEntryDate;
const MAX_TOKENS = 2; // This should be the same as in tokenManager.js

// Main method that is called after !pc
module.exports = function (msg, args) {
    const { EmbedBuilder } = require('discord.js');
    // Only allowed to be used in #pcrequest channel
    if (msg.channel.id != process.env.PC_REQUEST_CHANNEL_ID) {
        msg.channel.send("Wrong text channel, please use the pcrequest channel.\n" +
        "If you do not have acces to this channel then message the board or a moderator.");
        return;
    }
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
        printSchedule(msg, EmbedBuilder);
        return;
    }

    // Command: !pc request DD-MM 
    // This will reserve a slot on the requested date and consume a token
    if (args.length == 2 && args[0].toLowerCase() === "request") {
        // First check if args[1] is in a date format: DD-MM before calling function
        if (!checkDateFormat(args[1], msg)) {
            return;
        }

        reserveSlot(msg, EmbedBuilder);
    }

    // Command: !pc cancel DD-MM; 
    // This will cancel the reservation the requested date and return the token
    if ((args.length == 2 && args[0].toLowerCase() === "cancel" && !checkRole("Board", msg)) || (args.length == 3 && args[0].toLowerCase() === "cancel" && checkRole("Board", msg))) {
        // First check if args[1] is in a date format: DD-MM before calling function
        if (!checkDateFormat(args[1], msg)) {
            return;
        }

        cancelSlot(msg, EmbedBuilder, args);
    } else if (checkRole("Board", msg) && args.length == 2 && args[0].toLowerCase() === "cancel") {
        msg.channel.send("As a board member you have to specify which slot you would like to cancel on the requested date with + " +
        "`!pc cancel DD-MM 1` for slot 1 or `!pc cancel DD-MM 2` for slot 2");
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
function reserveSlot(msg, EmbedBuilder) {
    let tokenUserData = client.getUserToken.get(msg.author.id);
    if (!tokenUserData) {
        msg.channel.send("There was an error with retrieving your data in the dataset." + 
        "This might be because you just got the captain role, try again at the start of next month. Or you might be mod abusing. If this is not the case then please contact AkBob.");
        return;
    }
    
    var now = new Date();
    if (now.getDate() < 15 && dateObj.getMonth() > now.getMonth() && !checkRole("Board", msg)) {
        msg.channel.send("You can only reserve slots in the next month after the 15th.");
        return;
    }

    if (requestedEntryDate.slot1 !== "" && requestedEntryDate.slot2 !== "") {
        msg.channel.send("The slots on the requested date are filled. If you are a board member than you can first cancel these reservations with `!pc cancel DD-MM slotnumber`");
        return;
    }

    // Check if the user has tokens left
    if ((tokenUserData.tokens > 0)) {
        console.log("here?");
        // Board members dont have to use tokens
        if (!checkRole("Board", msg)) {
            tokenUserData.tokens -= 1;
            client.setToken.run(tokenUserData);
        }

        // Check which slot is open and reserve the open slot
        let slot = 0;
        if (requestedEntryDate.slot1 === "") {
            requestedEntryDate.slot1 = msg.author.id;
            slot = 1;
        } else if (requestedEntryDate.slot2 === "") {
            requestedEntryDate.slot2 = msg.author.id;
            slot = 2;
        }

        client.setScheduleSlot.run(requestedEntryDate);
        msg.channel.send("Slot " + slot + " on " + dateObj.toLocaleDateString() + " has been reserved, you can cancel this reservation with `!pc cancel DD-MM`");
        printSchedule(msg, EmbedBuilder);
    } else {
        console.log(tokenUserData.tokens);
        msg.channel.send("You do not have any tokens left to reserve a slot.");
    }
}

// Cancel the reserved slot stored inside the dateObj and returns the token to the owner
function cancelSlot(msg, EmbedBuilder, args) {
    let tokenUserData = client.getUserToken.get(msg.author.id);
    if (!tokenUserData) {
        msg.channel.send("There was an error with retrieving your data in the dataset." + 
        "This might be because you just got the captain role, try again at the start of next month. If this is not the case then please contact AkBob.");
        return;
    }
    
    if (requestedEntryDate.slot1 === "" && requestedEntryDate.slot2 === "") {
        msg.channel.send("The slots on the requested date are already empty!");
        return;
    }

    // Board members dont have to use tokens
    if (!checkRole("Board", msg)) {
        let slot = 0;
        if (requestedEntryDate.slot1 === msg.author.id) {
            slot = 1;
            tokenUserData.tokens += 1;
            tokenUserData.tokens = Math.min(tokenUserData.tokens, MAX_TOKENS);
            requestedEntryDate.slot1 = "";
        } else if (requestedEntryDate.slot2 === msg.author.id) {
            slot = 2;
            tokenUserData.tokens += 1;
            tokenUserData.tokens = Math.min(tokenUserData.tokens, MAX_TOKENS);
            requestedEntryDate.slot2 = "";
        } else {
            msg.channel.send("You do not have any reserved slots on the requested date.");
            return;
        }
        
        client.setScheduleSlot.run(requestedEntryDate);
        client.setToken.run(tokenUserData);
        msg.channel.send("Slot " + slot + " on " + dateObj.toLocaleDateString() + " has been canceled. You got your token back.");
    } else {
        let tokenSlotUser;
        if (args[2] === "1" && requestedEntryDate.slot1 !== "") {
            tokenSlotUser = client.getUserToken.get(requestedEntryDate.slot1);
            if (!tokenSlotUser) {
                msg.channel.send("There was an error with retrieving the data of the user which reserved the slot, please contact AkBob if you encounter this issue.");
                return;
            }

            tokenSlotUser.tokens += 1;
            tokenSlotUser.tokens = Math.min(tokenSlotUser.tokens, MAX_TOKENS);
            requestedEntryDate.slot1 = "";
        } else if (args[2] === "2" && requestedEntryDate.slot2 !== "") {
            tokenSlotUser = client.getUserToken.get(requestedEntryDate.slot2);
            if (!tokenSlotUser) {
                msg.channel.send("There was an error with retrieving the data of the user which reserved the slot, please contact AkBob if you encounter this issue.");
                return;
            }

            tokenSlotUser.tokens += 1;
            tokenSlotUser.tokens = Math.min(tokenSlotUser.tokens, MAX_TOKENS);
            requestedEntryDate.slot2 = "";
        } else {
            msg.channel.send("Slot not found or slot was already empty!");
            return;
        }

        client.setScheduleSlot.run(requestedEntryDate);
        // @ts-ignore
        client.setToken.run(tokenSlotUser);
        msg.channel.send("The reservation on slot " + args[2] + " on " + dateObj.toLocaleDateString() + " was canceled and their token returned.");
        printSchedule(msg, EmbedBuilder);
    }
}

// Removes any reservation inside the dateObj, returns any tokens and removes the date from the schedule
function removeSlot(msg) {
    if (!checkRole("Board", msg)) {
        msg.channel.send("You do not have permission for this command!");
        return;
    }

    if (requestedEntryDate.slot1 !== "") {
        let tokenSlotUser = client.getUserToken.get(requestedEntryDate.slot1);
        if (!tokenSlotUser) {
            msg.channel.send("There was an error with retrieving the data of the user which reserved the slot, please contact AkBob if you encounter this issue.");
            return;
        }

        tokenSlotUser.tokens += 1;
        tokenSlotUser.tokens = Math.min(tokenSlotUser.tokens, MAX_TOKENS);
        client.setToken.run(tokenSlotUser);

        requestedEntryDate.slot1 = "";
        msg.channel.send("<@" + tokenSlotUser.id + "> got their token back.");
    }

    if (requestedEntryDate.slot2 !== "") {
        let tokenSlotUser = client.getUserToken.get(requestedEntryDate.slot2);
        if (!tokenSlotUser) {
            msg.channel.send("There was an error with retrieving the data of the user which reserved the slot, please contact AkBob if you encounter this issue.");
            return;
        }

        tokenSlotUser.tokens += 1;
        tokenSlotUser.tokens = Math.min(tokenSlotUser.tokens, MAX_TOKENS);
        client.setToken.run(tokenSlotUser);

        requestedEntryDate.slot2 = "";
        msg.channel.send("<@" + tokenSlotUser.id + "> got their token back.");
    }

    client.remTrainingDay.run(requestedEntryDate.trainingDate);
    msg.channel.send("The date " + dateObj.toLocaleDateString() + " has been removed from the schedule.");
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
        { name: 'Mod commands', value: '!pc cancel DD-MM slotnumber\n\n\n\n!pc remove DD-MM\n', inline: true },
        { name: 'Description', value: 'Cancel any reservation of the specified slot number on that date.\n\nRemove the date from the schedule and cancels any reservations on that date\n', inline: true },
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
    // dateObj.setHours(23, 59, 59);
    console.log(dateObj.getDate() + "-" +dateObj.getMonth());
    if (!dateObj) {
        msg.channel.send("An unexpected error occured with processing the date.");
        return false;
    }

    if (dateObj.getTime() < now.getTime()) {
        msg.channel.send("The requested date has already passed!");
        return false;
    }

    // Check if requested date is a training day
    let allDates = client.getSchedule.all();
    let isTrainingDay = false;
    allDates.forEach(entryDate => {
        let trainingDay = new Date(entryDate.trainingDate);
        if (trainingDay.getDate() == dateObj.getDate() && trainingDay.getMonth() == dateObj.getMonth()) {
            isTrainingDay = true;
            requestedEntryDate = entryDate;
        }
    });

    if (!isTrainingDay) {
        msg.channel.send("The requested date is not a valid training day.");
        return false;
    }

    console.log("Date checked and correct!");
    return true;
}

function printSchedule(msg, EmbedBuilder) {
    let formattedSchedule = [];
    let allDates = client.getSchedule.all();

    allDates.sort(function(a, b) {
        return ((a.trainingDate < b.trainingDate) ? -1 : ((a.trainingDate == b.trainingDate) ? 0 : 1));
    });

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
                let user = client.users.cache.get(entry.slot1);
                slot1 = user.username;
            }

            if (entry.slot2 === "") {
                slot2 = "---";
            } else {
                let user = client.users.cache.get(entry.slot2);
                slot2 = user.username;
            }
            formattedSchedule.push(humanDate + ": Slot 1: " + slot1 + "; " + "Slot 2: " + slot2);
        }
    });

    if (formattedSchedule.length == 0) {
        msg.channel.send("The schedule was empty. You might need to use `!initSchedule` if it is a new year.");
    } else {
        let formattedEmbedSchedule = formattedSchedule.join(" \n");

        const scheduleEmbed = new EmbedBuilder()
        .setColor('#D9D023')
        .setTitle('Current Schedule')
        .setAuthor({name: 'AkBot', iconURL: 'https://i.imgur.com/y21mVd6.png'})
        .setDescription("If you want to reserve a slot on a specific date below, than use the command `!pc request DD-MM`. " +
         "Do note you only have one token per month and you can only request a spot of the next month after the 15th of the current month.")
        .setThumbnail('https://i.imgur.com/mXodbnH.png')
        .addFields(
            { name: 'Schedule next two months', value:  "```" + formattedEmbedSchedule + "```"},
        )
        .setTimestamp();
    
        msg.channel.send({embeds: [scheduleEmbed]});
    }
    return;
}