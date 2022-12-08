module.exports = function (msg) {
    return {
        id: `${msg.author.id}`,
        user: msg.author.username,
        wordleGuesses: 0,
        wordleCorrectGuess: 0,
        betsLost: 0,
        betsWon: 0,
        chatMessageCount: 0,
        eventsJoined: 0
    }
};