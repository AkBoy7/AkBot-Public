const checkRole = require("./checkRole.js");

module.exports = function (msg) {
    const id = process.env.ZEPHYR_SERVER_ID;
    const client = msg.client;
    
    // Cache the any members not already in the cache
    let rolesBonus = 0;

    msg.member.roles.cache.forEach(role => {
        if (role.name.includes("Committee")) {
            rolesBonus += 1;
        }
    });

    // let roles = [checkRole("Board", msg), checkRole("Moderator", msg), checkRole("Intro Committee"), checkRole("Esports Committee"), checkRole("Activity Committee"),
    // checkRole("LoL Committee"), checkRole("Smash Committee"), checkRole("CS:GO Committee"), checkRole("Dota Committee")]; // TODO:: ADD OTHER ROLES
    // let rolesBonus = (roles.filter(Boolean).length / 10) + 1; // Is a bonus factor >= 1.0

    return {
        id: `${msg.author.id}`,
        user: msg.author.id,
        points: 100,
        bids: "",
        amount: "",
        cooldown: 0,
        bonus: 1 + (rolesBonus / 10.0),
    }
};
