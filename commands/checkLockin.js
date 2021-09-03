require('dotenv').config();

module.exports = function (client) {
    setInterval(function () {
        let bets = client.getBets.all();
        bets.forEach(bet => {
            if (bet.lockin <= Date.now() && bet.locked == 0) {
                let nameID = bet.author;
                if (bet.approved == 0) {
                    client.remBet.run(bet.id);
                    client.users.fetch(nameID).then(user => {
                        user.send(`Your bet: ${bet.title} lock in time has passed but has not been approved. Please message one of the moderators to look at your bet next time.`);
                    });
                } else {
                    console.log("lock");
                    bet.locked = 1;
                    client.setBet.run(bet);
                    client.users.fetch(nameID).then(user => {
                        user.send(`Your bet: ${bet.title} lock in time has passed. Bets have been locked in.`);
                    });
                    akbotChannel = client.channels.cache.get(process.env.AKBOT_CHANNEL_ID);
                    akbotChannel.send("Bets for `" + bet.title + "` has been locked in!");
                }
            }
        });
    }, 1000 * 60 * 1);
}