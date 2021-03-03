//function for sending messages to users with dms
require('dotenv').config();

module.exports = function (msg, args) {
    if (msg.author.username === "AkBoy") {
        const client = msg.client;
        let nameID = args.shift();
        client.users.fetch(nameID).then(user => {
            let text = args.join(" ");
            user.send(text);
            console.log("Sended " + text);

            client.users.fetch(process.env.AKBOBID).then(akbob => {
                akbob.send("message sent to " + user.username);
            });
            return;
        });    
    }
};