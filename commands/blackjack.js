const deckSetup = require("./classes/deck.js");

module.exports = async function (msg, args) {
    const client = msg.client;
    let score = client.getScore.get(msg.author.id);
    //creates mew table if user does not have one yet
    if (!score) {
        score = {
            id: `${msg.author.id}`,
            user: msg.author.id,
            points: 0,
            bids: "",
            amount: "",
            cooldown: 0
        }
    }

    // For now only test channel
    if (msg.channel.id !== process.env.TEST_CHANNELID) {
        msg.channel.send("This command is not available in this channel");
        return;
    }

    let deck = new deckSetup();
    let filter = m => m.author.id === msg.author.id;
    // Sent a message with a single card
    // If the user responds with "test" then the message get's edited and a new card is drawn
    msg.channel.send(deck.drawSingle()).then((sentMessage) => {
        msg.channel.awaitMessages(filter, {
            max: 1,
            time: 10000,
            errors: ['time']
        }).then(messages => {
            for (let message in messages) {
                if (message.content === "test") {
                    sentMessage.edit(deck.drawSingle());
                    break;
                }
            }
        }).catch(messages => {
                msg.channel.send("You have not responded in time :(")
            })
    });



};
