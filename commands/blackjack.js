const deckSetup = require("./classes/deck.js");
const generateScore = require("./methods/generateScore");

module.exports = async function (msg, args) {
    const client = msg.client;
    let score = client.getScore.get(msg.author.id);
    //creates new table if user does not have one yet
    if (!score) {
        score = generateScore(msg);
    }

    // For now only test channel
    if (msg.channel.id !== process.env.TEST_CHANNELID) {
        msg.channel.send("This command is not available in this channel");
        return;
    }

    let deck = new deckSetup();
    msg.channel.send(deck.deck.length);
    msg.channel.send(deck.drawSingle());
    msg.channel.send(deck.deck.length);
    let filter = m => m.author.id === msg.author.id;
    // Sent a message with a single card
    // If the user responds with "test" then the message gets edited and a new card is drawn
    msg.channel.send(deck.drawSingle()).then((sentMessage) => {
        msg.channel.awaitMessages(filter, {
            max: 1,
            time: 10000,
            errors: ['time']
        }).then(messages => {
            if (messages[0].content === "test") {
                msg.channel.send("The previous message should have been edited");
                sentMessage.edit("This message has been edited");
            } else {
                msg.channel.send("Not the correct keyword");
            }
        }).catch(messages => {
            msg.channel.send("You have not responded in time :(")
        })
    });



};
