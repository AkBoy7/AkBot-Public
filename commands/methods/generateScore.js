const checkRole = require("./methods/checkRole.js");

module.exports = function (msg) {
    let roles = [checkRole("Board", msg) || checkRole("Moderator", msg)]; // TODO:: ADD OTHER ROLES
    let rolesBonus = (roles.filter(Boolean).length / 10) + 1; // Is a bonus factor >= 1.0

    return {
        id: `${msg.author.id}`,
        user: msg.author.id,
        points: 0,
        bids: "",
        amount: "",
        cooldown: 0,
        bonus: rolesBonus
    }
};
