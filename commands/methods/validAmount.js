// Auxiliary function to determine whether a bet is actually valid
// When it's invalid, type a message in the channel letting the user know and return false
// When it's valid, return true
module.exports = function (score, bet, msg) {
    if (bet <= 0) {
        msg.channel.send("Please bet at least 1 point.");
        return false
    }else if (!Number.isSafeInteger(bet)) {
        msg.channel.send("Please bet an integer amount of points.");
        return false
    } else if (bet > score.points) {
        msg.channel.send("Your bet is higher than your current total points.");
        return false
    } else {
        return true
    }
};