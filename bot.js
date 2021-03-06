console.log("Starting bot up! This bot was made by Akam");

require('dotenv').config();
const reminder = require('./commands/remind.js');

const Discord = require('discord.js');
const client = new Discord.Client({
    partials: ['MESSAGE', 'CHANNEL', 'REACTION']
});
const SQLite = require("better-sqlite3");
const sql = new SQLite('./akbotData.sqlite');

client.login(process.env.BOTTOKEN);

client.on('ready', readyDiscord);

function readyDiscord() {
    client.user.setActivity("Zephyr", {type: 'PLAYING'});
    setupSQL();
    reminder(client);
    console.log('---login succesfull, bot is online---');
}
const commandHandler = require("./commands");
const {gotReaction, removeReaction} = require('./reactions.js');

client.on('message', commandHandler);

client.on("messageReactionAdd", gotReaction);
client.on("messageReactionRemove", removeReaction);

function setupSQL() {
    // Check if the table "points" exists.
    const table = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'akbotData';").get();
    if (!table['count(*)']) {
        // If the table isn't there, create it and setup the database correctly.
        sql.prepare("CREATE TABLE akbotData (id TEXT PRIMARY KEY, user TEXT, points INTEGER, bids TEXT, amount TEXT, cooldown INTEGER);").run();
        // Ensure that the "id" row is always unique and indexed.
        sql.prepare("CREATE UNIQUE INDEX idx_scores_id ON akbotData (id);").run();
        sql.pragma("synchronous = 1");
        sql.pragma("journal_mode = wal");
    }

    // And then we have two prepared statements to get and set the score data.
    client.getScore = sql.prepare("SELECT * FROM akbotData WHERE user = ?");
    client.setScore = sql.prepare("INSERT OR REPLACE INTO akbotData (id, user, points, bids, amount, cooldown) VALUES (@id, @user, @points, @bids, @amount, @cooldown);");
    client.getUsersBids = sql.prepare("SELECT * FROM akbotData WHERE bids != ?");
    client.getUsers = sql.prepare("SELECT * FROM akbotData");
}
