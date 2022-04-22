console.log("Starting bot up! This bot was made by Akam");

require('dotenv').config();
const reminder = require('./commands/remind.js');
const lockin = require('./commands/checkLockin.js');
const wordleGenerator = require('./commands/wordleGenerator.js');

// const Discord = require('discord.js');
const { Client, Intents } = require('discord.js');
const client = new Client({
    partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'GUILD_MEMBERS'],
    intents: Intents.FLAGS.GUILD_MEMBERS
});
const SQLite = require("better-sqlite3");
const sql = new SQLite('./akbotData.sqlite');

client.login(process.env.BOTTOKEN);

client.on('ready', readyDiscord);

function readyDiscord() {
    client.user.setActivity("Zephyr", {type: 'PLAYING'});
    setupSQL();
    setupSQLBets();
    reminder(client);
    lockin(client);
    wordleGenerator(client);
    console.log('---login succesfull, bot is online---');
    // const id = '157096621631471616';
    // const guild = client.guilds.cache.get(id);
    // console.log(guild.members);
    // guild.members.cache.forEach((member) => console.log(member.user.username));
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

function setupSQLBets() {
    // Check if the table "points" exists.
    const table = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'betData';").get();
    if (!table['count(*)']) {
        // If the table isn't there, create it and setup the database correctly.
        sql.prepare("CREATE TABLE betData (id TEXT PRIMARY KEY, author TEXT, title TEXT, option1 TEXT, option2 TEXT, odds1 DOUBLE, odds2 DOUBLE, lockin TIMESTAMP, locked INTEGER, approved INTEGER, userBets1 TEXT, amount1 TEXT, userBets2 TEXT, amount2 TEXT);").run();
        // Ensure that the "id" row is always unique and indexed.
        sql.prepare("CREATE UNIQUE INDEX idx_bet_id ON betData (id);").run();
        sql.pragma("synchronous = 1");
        sql.pragma("journal_mode = wal");
    }

    // And then we have two prepared statements to get and set the score data.
    client.getBets = sql.prepare("SELECT * FROM betData");
    client.remBet = sql.prepare("DELETE FROM betData WHERE id = ?");
    client.setBet = sql.prepare("INSERT OR REPLACE INTO betData (id, author, title, option1, option2, odds1, odds2, lockin, locked, approved, userBets1, amount1, userBets2, amount2) VALUES (@id, @author, @title, @option1, @option2, @odds1, @odds2, @lockin, @locked, @approved, @userBets1, @amount1, @userBets2, @amount2);");
}
