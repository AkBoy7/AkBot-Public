const read = require("./methods/read.js");
const write = require("./methods/write.js");
const checkGuess = require("./methods/checkGuess.js");
const generateScore = require("./methods/generateScore");

const TOTALPOINTSWIN = 3000

module.exports = function (msg, args) {
    let words = read("./commands/correctWord.json")
    let guessedUsers = read("./commands/guessedUsers.json")
    if (guessedUsers.includes(msg.author.id)) {
        msg.channel.send("You have already used your guess for this wordle.")
        return
    }
    const client = msg.client
    let correctString = words[0].toLowerCase()
    let amountOfGuesses = parseInt(words[1], 10)
    let state = words[2]
    if (state === "wrong" || state === "guessed") {
        msg.channel.send("Today's wordle is already done!")
        return
    }
    let result = checkGuess(msg, args[0], correctString)
    if (result === "correct") {
        state = "guessed"
        guessedUsers.push(msg.author.id)
        let pointsDivided = parseInt(TOTALPOINTSWIN/guessedUsers.length, 10)
        guessedUsers.forEach(user => {
            let score = client.getScore.get(msg.author.id);
            // Creates new table if user does not have one yet
            if (!score) {
                score = generateScore(msg)
            }

            score.points = score.points + pointsDivided;
            client.setScore.run(score);
            msg.channel.send("<@" + user + "> has won " + pointsDivided + " AkPoints!")
        });
        guessedUsers = []
    } else if (result === "wrong") {
        amountOfGuesses -= 1
        if (amountOfGuesses == 0) {
            msg.channel.send("You've run out of guesses! Game over!")
            msg.channel.send(`The right word was: "${correctString}"`)
            state = "wrong"
            guessedUsers = []
        } else {
            guessedUsers.push(msg.author.id)
        }
    }

    let newWords = [correctString, amountOfGuesses, state]
    write(newWords, "./commands/correctWord.json")
    write(guessedUsers, "./commands/guessedUsers.json")
}