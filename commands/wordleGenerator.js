const NUMBER_OF_GUESSES = 8;
const read = require("./methods/read.js");
const write = require("./methods/write.js");

require('dotenv').config();

module.exports = function (client) {
    loop(client);  
}

function loop(client) {
    const max = 1000 * 60 * 60 * 12;
    const min = 1000 * 60 * 60 * 24;
    var rand = parseInt(Math.random() * (max - min) + min); 
    console.log(rand);
    setTimeout(function() {
        const WORDS = read("./commands/wordleAnswers.json");
        let rightGuessString = [];
        rightGuessString.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
        rightGuessString.push(NUMBER_OF_GUESSES)
        rightGuessString.push("guessing")
        write(rightGuessString, "./commands/correctWord.json");
        write([], "./commands/guessedUsers.json");
        console.log("new word, " + rightGuessString)
        botChannel = client.channels.cache.get(process.env.AKBOT_CHANNEL_ID);
        botChannel.send('<@&899285064226050108> There is a new Wordle! You all have 1 guess each and in total ' + NUMBER_OF_GUESSES + ' guesses.\n'+
        'You can win `2500` points in total shared among the people who helped with guessing, next wordle will be up in 24 hours');
        loop(client);
    }, rand);
}