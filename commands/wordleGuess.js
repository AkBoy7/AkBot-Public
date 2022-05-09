const read = require("./methods/read.js");
const write = require("./methods/write.js");
const checkGuess = require("./methods/checkGuess.js");
const generateScore = require("./methods/generateScore");

const TOTALPOINTSWIN = 2500

module.exports = function (msg, args) {
    if (args.length == 0) {
        msg.channel.send("This is a beta version of Akbot Wordle. How does this work?\n" +
        "Everyday there is a new 5 letter word generated, users can guess the word with the command `!wordle guess`\n" +
        "I will then send red squares for letters which are not in the word, yellow for letters that are in the word but in a different position,"+
        "and green squares for letters that are in the word and are in the correct position\n" +
        "You only have one guess each and you have to work together to find the words, onces the word is guessed the points will be shared to all of the users who have guessed.")
        return
    }

    if (msg.channel.id != process.env.AKBOT_CHANNEL_ID && msg.channel.id != process.env.TEST_CHANNELID) {
        msg.channel.send('Please use <#' + process.env.AKBOT_CHANNEL_ID + '> for this command.');
        return;
    }
    
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
            let score = client.getScore.get(user);
            // Creates new table if user does not have one yet
            if (!score) {
                score = generateScore(msg)
            }

            score.points = score.points + pointsDivided;
            msg.channel.send("<@" + user + "> has won " + pointsDivided + " AkPoints!")
            if (msg.author.id == user) {
                msg.channel.send("<@" + user + "> has won an additional 250 AkPoints for guessing the correct word!")
                score.points = score.points + 250;
            }
            client.setScore.run(score);
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