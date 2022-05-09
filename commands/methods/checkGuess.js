const read = require("./read.js");

module.exports = function (msg, guessString, rightGuessString) {
    const WORDS = read("./commands/words.json");
    let rightGuess = Array.from(rightGuessString)
    guessString = guessString.toLowerCase()
    let currentGuess = Array.from(guessString)
    if (guessString.length != 5) {
        msg.channel.send(guessString + " is not 5 letters long!")
        return "error"
    }

    if (!WORDS.includes(guessString)) {
        msg.channel.send(guessString + " is not a word I know.")
        return "error"
    }

    let letterBlock = ''
    let letterColor = ''
    for (let i = 0; i < 5; i++) {
        if (currentGuess[i] === rightGuess[i]) {
            rightGuess[i] = "$"
        }
    }
    for (let i = 0; i < 5; i++) {

        let letter = currentGuess[i]
        letterBlock += `:regional_indicator_${letter}:`
        let letterPosition = rightGuess.indexOf(currentGuess[i])
        // is letter in the correct guess
        if (letterPosition === -1 && rightGuess[i] !== "$") {
            letterColor += ':red_square:'
        } else {
            // now, letter is definitely in word
            // if letter index and right guess index are the same
            // letter is in the right position 
            if (currentGuess[i] === rightGuess[i] || rightGuess[i] === "$") {
                // shade green 
                letterColor += ':green_square:'
            } else {
                // shade box yellow
                letterColor += ':yellow_square:'
                rightGuess[letterPosition] = "#"
            }
        }
    }
    msg.channel.send(letterBlock)
    msg.channel.send(letterColor)
    if (guessString === rightGuessString) {
        msg.channel.send(guessString + " is the correct word!")
        return "correct"
    } else {
        return "wrong"
    }
}
