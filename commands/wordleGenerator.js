

const NUMBER_OF_GUESSES = 6;
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
    }, 1000 * 60 * 2);
}