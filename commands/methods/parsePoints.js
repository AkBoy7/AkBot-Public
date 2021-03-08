module.exports = function(bet, score) {
    if (bet.toUpperCase() === "ALL") {
        return score.points;
    } else {
        return parseInt(bet, 10);
    }
};
