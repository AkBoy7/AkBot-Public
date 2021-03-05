module.exports = function(msg, args) {
    const client = msg.client;
    const filter = m => m.author.id === msg.author.id;
    msg.channel.awaitMessages(filter, {
        max: 1,
        time: 10000
    }).then( m => {
        msg.channel.send("new author id: " + m.author.id);
        msg.channel.send("old author id: " + msg.author.id);
        msg.channel.send("Just received the following message: " + m.first().content);
    }).catch( m => {
        msg.channel.send("new author id: " + m.author.id);
        msg.channel.send("old author id: " + msg.author.id);
        msg.channel.send("User did not type a message in 10 seconds");
    });

    msg.channel.send("Hallelujah (of hoe je dat ook spelt)").then(message => {
        setTimeout(() => {
            message.edit("This text has now been edited, cool right?")
        }, 3000);
    })

    msg.channel.send("That's all folks");

};
