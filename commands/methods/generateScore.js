module.exports = function (msg) {
    return {
        id: `${msg.author.id}`,
        user: msg.author.id,
        points: 0,
        bids: "",
        amount: "",
        cooldown: 0,
        tokens: 2
    }
};
