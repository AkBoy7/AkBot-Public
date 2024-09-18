console.log("Starting bot up! This bot was made by Akam");

require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");
const reminder = require("./commands/remind.js");
const lockin = require("./commands/checkLockin.js");
const wordleGenerator = require("./commands/wordleGenerator.js");
const notify = require("./commands/notify.js");
const tokenManager = require("./commands/tokenManager.js");

// const Discord = require('discord.js');
const {
  Client,
  Events,
  Partials,
  Intents,
  Collection,
  GatewayIntentBits,
} = require("discord.js");
const client = new Client({
  partials: [
    Partials.User,
    Partials.Message,
    Partials.GuildMember,
    Partials.Reaction,
    Partials.Channel,
  ],
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildPresences,
  ],
  allowedMentions: { parse: ["roles", "users"], repliedUser: true },
});
const SQLite = require("better-sqlite3");
const sql = new SQLite("./akbotData.sqlite");

client.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.login(process.env.BOTTOKEN);

//Execute this when ready and logged in
client.on("ready", readyDiscord);
function readyDiscord() {
  client.user.setActivity("Zephyr", { type: "PLAYING" });
  setupSQL();
  setupSQLBets();
  setupSQLDataCollection();
  setupSQLReqSchedule();
  setupSQLTokenData();
  // reminder(client);
  lockin(client);
  // wordleGenerator(client);
  notify(client);
  tokenManager(client);
  console.log("---init succesfull, bot is online---");
}

const commandHandler = require("./commands");
const { gotReaction, removeReaction } = require("./reactions.js");

client.on("messageCreate", commandHandler);

client.on("messageReactionAdd", gotReaction);
client.on("messageReactionRemove", removeReaction);

function setupSQL() {
  // Check if the table "points" exists.
  const table = sql
    .prepare(
      "SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'akbotData';"
    )
    .get();
  if (!table["count(*)"]) {
    // If the table isn't there, create it and setup the database correctly.
    sql
      .prepare(
        "CREATE TABLE akbotData (id TEXT PRIMARY KEY, user TEXT, points INTEGER, bids TEXT, amount TEXT, cooldown INTEGER, bonus DOUBLE);"
      )
      .run();
    // Ensure that the "id" row is always unique and indexed.
    sql.prepare("CREATE UNIQUE INDEX idx_scores_id ON akbotData (id);").run();
    sql.pragma("synchronous = 1");
    sql.pragma("journal_mode = wal");
  }

  // And then we have two prepared statements to get and set the score data.
  client.getScore = sql.prepare("SELECT * FROM akbotData WHERE user = ?");
  client.setScore = sql.prepare(
    "INSERT OR REPLACE INTO akbotData (id, user, points, bids, amount, cooldown, bonus) VALUES (@id, @user, @points, @bids, @amount, @cooldown, @bonus);"
  );
  client.getUsersBids = sql.prepare("SELECT * FROM akbotData WHERE bids != ?");
  client.getUsers = sql.prepare("SELECT * FROM akbotData");
}

function setupSQLBets() {
  // Check if the table "points" exists.
  const table = sql
    .prepare(
      "SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'betData';"
    )
    .get();
  if (!table["count(*)"]) {
    // If the table isn't there, create it and setup the database correctly.
    sql
      .prepare(
        "CREATE TABLE betData (id TEXT PRIMARY KEY, author TEXT, title TEXT, option1 TEXT, option2 TEXT, odds1 DOUBLE, odds2 DOUBLE, lockin TIMESTAMP, locked INTEGER, approved INTEGER, userBets1 TEXT, amount1 TEXT, userBets2 TEXT, amount2 TEXT);"
      )
      .run();
    // Ensure that the "id" row is always unique and indexed.
    sql.prepare("CREATE UNIQUE INDEX idx_bet_id ON betData (id);").run();
    sql.pragma("synchronous = 1");
    sql.pragma("journal_mode = wal");
  }

  // And then we have two prepared statements to get and set the score data.
  client.getBets = sql.prepare("SELECT * FROM betData");
  client.remBet = sql.prepare("DELETE FROM betData WHERE id = ?");
  client.setBet = sql.prepare(
    "INSERT OR REPLACE INTO betData (id, author, title, option1, option2, odds1, odds2, lockin, locked, approved, userBets1, amount1, userBets2, amount2) VALUES (@id, @author, @title, @option1, @option2, @odds1, @odds2, @lockin, @locked, @approved, @userBets1, @amount1, @userBets2, @amount2);"
  );
}

function setupSQLDataCollection() {
  // Check if the table "points" exists.
  const table = sql
    .prepare(
      "SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'userData';"
    )
    .get();
  if (!table["count(*)"]) {
    // If the table isn't there, create it and setup the database correctly.
    sql
      .prepare(
        "CREATE TABLE userData (id TEXT PRIMARY KEY, user TEXT, wordleGuesses INTEGER, wordleCorrectGuess INTEGER, betsLost INTEGER, betsWon INTEGER, chatMessageCount INTEGER, eventsJoined INTEGER);"
      )
      .run();
    // Ensure that the "id" row is always unique and indexed.
    sql.prepare("CREATE UNIQUE INDEX idx_scores_id ON userData (id);").run();
    sql.pragma("synchronous = 1");
    sql.pragma("journal_mode = wal");
  }

  // And then we have two prepared statements to get and set the score data.
  client.getData = sql.prepare("SELECT * FROM userData WHERE id = ?");
  client.setData = sql.prepare(
    "INSERT OR REPLACE INTO userData (id, user, wordleGuesses, wordleCorrectGuess, betsLost, betsWon, chatMessageCount, eventsJoined) VALUES (@id, @user, @wordleGuesses, @wordleCorrectGuess, @betsLost, @betsWon, @chatMessageCount, @eventsJoined);"
  );
}

// Initialize function and sql database for pc request schedule
function setupSQLReqSchedule() {
  // Check if the table "points" exists.
  const table = sql
    .prepare(
      "SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'scheduleData';"
    )
    .get();
  if (!table["count(*)"]) {
    // If the table isn't there, create it and setup the database correctly.
    sql
      .prepare(
        "CREATE TABLE scheduleData (trainingDate TIMESTAMP PRIMARY KEY, slot1 TEXT, slot2 TEXT);"
      )
      .run();
    // Ensure that the "id" row is always unique and indexed.
    sql
      .prepare("CREATE UNIQUE INDEX idx_bet_id ON scheduleData (trainingDate);")
      .run();
    sql.pragma("synchronous = 1");
    sql.pragma("journal_mode = wal");
  }

  // And then we have two prepared statements to get and set the score data.
  client.getSchedule = sql.prepare("SELECT * FROM scheduleData");
  client.remTrainingDay = sql.prepare(
    "DELETE FROM scheduleData WHERE trainingDate = ?"
  );
  client.setScheduleSlot = sql.prepare(
    "INSERT OR REPLACE INTO scheduleData (trainingDate, slot1, slot2) VALUES (@trainingDate, @slot1, @slot2);"
  );
  client.removeSchedule = sql.prepare("DELETE FROM scheduleData");
  client.removeDate = sql.prepare(
    "DELETE FROM scheduleData WHERE trainingDate = ?"
  );
}

// Initialize function and sql database for tokens for team captains
function setupSQLTokenData() {
  // Check if the table "points" exists.
  const table = sql
    .prepare(
      "SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'tokenData';"
    )
    .get();
  if (!table["count(*)"]) {
    // If the table isn't there, create it and setup the database correctly.
    sql
      .prepare(
        "CREATE TABLE tokenData (id TEXT PRIMARY KEY, captain TEXT, tokens INTEGER);"
      )
      .run();
    // Ensure that the "id" row is always unique and indexed.
    sql.prepare("CREATE UNIQUE INDEX idx_bet_id ON tokenData (id);").run();
    sql.pragma("synchronous = 1");
    sql.pragma("journal_mode = wal");
  }

  // And then we have two prepared statements to get and set the score data.
  client.getTokenData = sql.prepare("SELECT * FROM tokenData");
  client.setToken = sql.prepare(
    "INSERT OR REPLACE INTO tokenData (id, captain, tokens) VALUES (@id, @captain, @tokens);"
  );
  client.getUserToken = sql.prepare("SELECT * FROM tokenData WHERE id = ?");
}
