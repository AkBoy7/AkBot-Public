const read = require("./methods/read.js");
const write = require("./methods/write.js");
const checkGuess = require("./methods/checkGuess.js");
const generateScore = require("./methods/generateScore");

const cooldown = 86400000; //1 day
const humanizeDuration = require('humanize-duration');

const TOTALPOINTSWIN = 2000

module.exports = function (msg, args) {
    if (args.length == 0) {
        msg.channel.send("This is Akbot Wordle. How does this work?\n" +
        "Every 12-24 hours there is a new 5 letter word generated, users can guess the word with the command `!wordle guess`\n" +
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

    let score = client.getScore.get(msg.author.id);
    // Creates new table if user does not have one yet
    if (score.cooldown !== 0 && cooldown - (Date.now() - score.cooldown) > 0) {
        // If user still has a cooldown
        const remaining = humanizeDuration(cooldown - (Date.now() - score.cooldown), { delimiter: " and ", round: true, units: ["d", "h", "m"] });
        msg.channel.send(`You must wait ${remaining} before you can do another Wordle. ` + "<@" + msg.author.id + ">.");
        return;
    } else {
        score.cooldown = Date.now();
        client.setScore.run(score);
    }
    
    let result = checkGuess(msg, args[0], correctString)
    let userData = client.getData.get(msg.author.id);
    userData.wordleGuesses += 1;

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

            score.points = score.points + (pointsDivided * score.bonus);
            msg.channel.send("<@" + user + "> has won " + (pointsDivided * score.bonus) + " AkPoints!")
            if (msg.author.id == user) {
                msg.channel.send("<@" + user + "> has won an additional " + (200 * score.bonus) + " AkPoints for guessing the correct word!")
                score.points = score.points + (200 * score.bonus);
            }
            client.setScore.run(score);

            userData.wordleCorrectGuess += 1;
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
    } else if (result === "error") {
	    userguess.tokens = userguess.tokens + 1;
        if (userguess.tokens > 2) {
            msg.channel.send("Something unexpected happened?? message AkBob please!");
            return;
        }
        client.setScore.run(userguess);
	    userData.wordleGuesses -= 1;
    }
    client.setData.run(userData);

    let newWords = [correctString, amountOfGuesses, state]
    write(newWords, "./commands/correctWord.json")
    write(guessedUsers, "./commands/guessedUsers.json")
}
