var shortHash = require('short-hash');

module.exports = function (title, option1, option2, odds1, odds2, date, msg, authorID) {
    return {
        id: `akb7${shortHash(msg.id)}`,
        author: authorID,
        title: title,
        option1: option1,
        option2: option2,
        odds1: odds1,
        odds2: odds2,
        lockin: date,
        locked: 0,
        approved: 0,
        userBets1: "",
        amount1: "",
        userBets2: "",
        amount2: ""
    }
};