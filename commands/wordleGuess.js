const read = require("./methods/read.js");
const write = require("./methods/write.js");
const checkGuess = require("./methods/checkGuess.js");

module.exports = function (msg, args) {
    let words = read("./commands/correctWord.json")
    let correctString = words[0]
    let amountOfGuesses = parseInt(words[1], 10)
    let state = words[2]
    if (state === "wrong" || state === "guessed") {
        msg.channel.send("Today's wordle is already done!")
        return
    }
    let result = checkGuess(msg, args[0], correctString)
    if (result === "correct") {
        state = "guessed"
    } else if (result === "wrong") {
        amountOfGuesses -= 1
        if (amountOfGuesses == 0) {
            msg.channel.send("You've run out of guesses! Game over!")
            msg.channel.send(`The right word was: "${correctString}"`)
            state = "wrong"
        }
    }

    let newWords = [correctString, amountOfGuesses, state]
    write(newWords, "./commands/correctWord.json")
}