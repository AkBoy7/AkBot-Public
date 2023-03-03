require('dotenv').config();
const schedule = require('node-schedule');

module.exports = function (client) {
    const job = schedule.scheduleJob('* * 1 * *', async function(){
        let tokenData = client.getTokenData.all();
        let captains = [];
        if (tokenData.length != 0) {
            tokenData.forEach(entry => {
                captains.push(entry.id);
            });
        }
        const id = process.env.ZEPHYR_SERVER_ID;
    
        const guild = client.guilds.cache.get(id);
        const members = await guild.members.fetch();
        members.forEach(member => {
            if (member.roles.cache.has(process.env.CAPTAIN_ROLE_ID)) {
                if (!captains.includes(member.user.id)) {
                    entry = {
                        id: member.user.id,
                        captain: member.user.username,
                        tokens: 1
                    };
                    client.setToken.run(entry);
                }
            }
        });

        tokenData.forEach(entry => {
             entry.tokens = 1;
             client.setToken.run(entry);
        });
    });
}