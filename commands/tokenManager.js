require('dotenv').config();
const schedule = require('node-schedule');
const MAX_TOKENS = 2;
const TOKEN_GEN = 1;

// Generates Tokens for new Captains and old captain every first day of the month
module.exports = function (client) {
    // This runs at the start of every month on the first 01-XX-20XX
    const job = schedule.scheduleJob('* * 1,15 * *', async function(){
        console.log("New Month generating tokens");
        let tokenData = client.getTokenData.all();
        // Get a list of captains already in the dataset
        let captains = [];
        if (tokenData.length != 0) {
            tokenData.forEach(entry => {
                captains.push(entry.id);
            });
        }
        const id = process.env.ZEPHYR_SERVER_ID;
    
        // Cache the any members not already in the cache
        const guild = client.guilds.cache.get(id);
        const members = await guild.members.fetch();

        members.forEach(member => {
            if (member.roles.cache.has(process.env.CAPTAIN_ROLE_ID) || member.roles.cache.has(process.env.BOARD_ROLE_ID)) {
                // Check if there are any new captains and make a new entry for them, else we give them a more tokens
                if (!captains.includes(member.user.id)) {
                    entry = {
                        id: member.user.id,
                        captain: member.user.username,
                        tokens: MAX_TOKENS
                    };
                    client.setToken.run(entry);
                } else {
                    entry = {
                        id: member.user.id,
                        captain: member.user.username,
                        tokens: Math.min(client.getUserToken.get(member.user.id).tokens + TOKEN_GEN, MAX_TOKENS)
                    };
                    client.setToken.run(entry);
                }
                
            }
        });

        tokenData.forEach(entry => {
             entry.tokens = Math.min(entry.tokens + TOKEN_GEN, MAX_TOKENS);
             client.setToken.run(entry);
        });
    });
}
