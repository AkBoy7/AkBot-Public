const read = require("./methods/read.js");
const locked = require("./methods/locked.js");
const Discord = require("discord.js");
const generateScore = require("./methods/generateScore");
const validAmount = require("./methods/validAmount.js");
const parsePoints = require("./methods/parsePoints");
require("dotenv").config();

module.exports = function (msg, args) {
  if (
    msg.channel.id != process.env.AKBOT_CHANNEL_ID &&
    msg.channel.id != process.env.TEST_CHANNELID
  ) {
    msg.channel.send(
      "Please use <#" + process.env.AKBOT_CHANNEL_ID + "> for this command."
    );
    return;
  }

  let matches = read("./commands/matches.json");
  let teams = read("./commands/teams.json");
  const client = msg.client;
  let score = client.getScore.get(msg.author.id);
  //creates mew table if user does not have one yet
  if (!score) {
    score = generateScore(msg);
  }

  if (args.length == 0) {
    teamMsg = teams.join(", ");
    matchesMsg = matches.join("``` \n```");
    users = client.getUsers.all();
    if (users.length == 0 || users == null) {
      msg.channel.send("This error is not supposed to happen...");
      return;
    }

    users.sort(function (a, b) {
      return a.points > b.points ? -1 : a.points == b.points ? 0 : 1;
    });

    let userLeaderboard = [];
    for (var i = 0; i < users.length; i++) {
      if (i == 0) {
        userLeaderboard.push(
          ":first_place: <@" + users[i].id + "> - " + parseInt(users[i].points)
        );
      } else if (i == 1) {
        userLeaderboard.push(
          ":second_place: <@" + users[i].id + "> - " + parseInt(users[i].points)
        );
      } else if (i == 2) {
        userLeaderboard.push(
          ":third_place: <@" + users[i].id + "> - " + parseInt(users[i].points)
        );
      } else if (i <= 9) {
        userLeaderboard.push(
          " <@" + users[i].id + "> - " + parseInt(users[i].points)
        );
      } else {
        break;
      }
    }

    userLeaderboardMsg = userLeaderboard.join(" \n");
    const betEmbed = new Discord.MessageEmbed()
      .setColor("#D9D023")
      .setTitle("Current possible bets")
      .setAuthor("AkBot", "https://i.imgur.com/y21mVd6.png")
      .setDescription(
        "The current teams you can bet on: ```" +
          teamMsg +
          "``` \nPlace bets by using the command: ```!bet teamName amount```\nNumbers in () are the multipliers of your AkPoints on a correct bet, this is based on odds and current standings of teams."
      )
      .setThumbnail("https://i.imgur.com/mXodbnH.png")
      .addFields({
        name: "Current matches",
        value: "```" + matchesMsg + " ```",
      })
      .addFields({ name: "Leaderboard", value: "" + userLeaderboardMsg + "" })
      .setTimestamp();

    msg.channel.send(betEmbed);
    return;
  }

  if (args.length != 2) {
    msg.channel.send("To bet for a team use ```!bet teamName betAmount```");
    return;
  }

  if (locked(null)) {
    msg.channel.send(
      "The bets are currently locked in. You can not bet anymore until new bets have been started by someone with the moderator/board role."
    );
    return;
  }

  let teamName = args.shift().toLowerCase();
  let bet = parsePoints(args[0], score);

  if (!validAmount(score, bet, msg)) {
    return;
  }

  //check input for !bid teamName bet
  if (!teams.includes(teamName)) {
    msg.channel.send(
      "Team does not exist or is not a Zephyr team. Please make sure you did not misspell the team name or it is in the list with ``!bet``"
    );
    return;
  }

  //if user already has bet on this team
  teamsBet = score.bids.split(",");
  amountBets = score.amount.split(",");
  for (var i = 0; i < amountBets.length; i++) {
    amountBets[i] = parseInt(amountBets[i], 10);
  }

  for (var i = 0; i < teamsBet.length; i++) {
    if (teamsBet[i] === teamName) {
      amountBets[i] += bet;
      score.amount = amountBets.join(",") + ",";
      score.points = score.points - bet;
      client.setScore.run(score);
      msg.channel.send(
        "You have bet " +
          bet +
          " AkPoints for " +
          teamName +
          ". Your current total AkPoints is " +
          score.points +
          "."
      );
      return;
    }
  }

  //Everything is fine
  score.bids = score.bids + teamName + ",";
  score.amount = score.amount + bet + ",";
  score.points = score.points - bet;
  client.setScore.run(score);
  msg.channel.send(
    "You have bet " +
      bet +
      " AkPoints for " +
      teamName +
      ". Your current total AkPoints is " +
      score.points +
      "."
  );
};
