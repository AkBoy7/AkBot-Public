

const NUMBER_OF_GUESSES = 8;
const read = require("./methods/read.js");
const write = require("./methods/write.js");
const cooldown = 172800000; //2 days

require('dotenv').config();

module.exports = function (client) {
    setInterval(function () {
        const WORDS = read("./commands/words.json");
        let rightGuessString = [];
        rightGuessString.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
        rightGuessString.push(NUMBER_OF_GUESSES)
        rightGuessString.push("guessing")
        write(rightGuessString, "./commands/correctWord.json");
        console.log("new word, " + rightGuessString)
        botChannel = client.channels.cache.get(process.env.AKBOT_CHANNEL_ID);
        botChannel.send('<@&899285064226050108> There is a new Wordle! You all have 1 guess each and in total ' + NUMBER_OF_GUESSES + ' guesses.\n'+
        'You can win `3000` points in total shared among the people who helped with guessing, next wordle will be up in 2 days');
    }, 1000 * 60 * 60 * 48);
}