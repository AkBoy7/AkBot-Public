const read = require("./methods/read.js");
const write = require("./methods/write.js");
const file = "C:/Users/akamb/Desktop/place/akbotDiscordNotifications.json";
require("dotenv").config();

module.exports = function (client) {
  loop(client);
};

// Helper function to send messages
async function sendMessageToUser(client, channel, userId, message) {
  const user = await client.users.fetch(userId);
  if (user) {
    await channel.send(`<@${userId}> ${message}`);
  }
}

function loop(client) {
  var time = 2 * 60 * 1000;
  setTimeout(function () {
    checkFileAndSendMessages(client);
    loop(client);
  }, time);
}

// Function to check and send messages
async function checkFileAndSendMessages(client) {
  let jsonData = read(file);
  if (jsonData == null) {
    console.error("Error reading file");
    return;
  }

  const channel = await client.channels.fetch(process.env.TEST_CHANNELID);
  let hasChanges = false; // To track if we need to write back to the file

  // Process akpoints messages
  for (const userId in jsonData.akpoints) {
    const akpoints = jsonData.akpoints[userId];
    if (akpoints.messenges && akpoints.messenges.length > 0) {
      // Send each message and then remove it
      while (akpoints.messenges.length > 0) {
        const message = akpoints.messenges.shift(); // Remove the first message
        await sendMessageToUser(client, channel, userId, message);
        hasChanges = true; // Mark that changes were made
      }
    }
  }

  // Process level messages
  for (const userId in jsonData.level) {
    const level = jsonData.level[userId];
    if (level.messenges && level.messenges.length > 0) {
      // Send each message and then remove it
      while (level.messenges.length > 0) {
        const message = level.messenges.shift(); // Remove the first message
        await sendMessageToUser(client, channel, userId, message);
        hasChanges = true; // Mark that changes were made
      }
    }
  }

  // Process game notifications and remove them after sending
  if (jsonData.game_notifications) {
    if (jsonData.game_notifications.wordle) {
      await channel.send(jsonData.game_notifications.wordle);
      delete jsonData.game_notifications.wordle; // Remove wordle notification after sending
      hasChanges = true;
    }

    if (jsonData.game_notifications.footprint) {
      await channel.send(jsonData.game_notifications.footprint);
      delete jsonData.game_notifications.footprint; // Remove footprint notification after sending
      hasChanges = true;
    }
  }

  // If any changes were made to the messages, write the updated data back to the file
  if (hasChanges) {
    write(jsonData, file);
  }
}
