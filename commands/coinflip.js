const validAmount = require("./methods/validAmount.js");
module.exports = function (msg, args) {
    // Start by flipping it :)
    const flip = Math.random();

    // Fetch client data
    const client = msg.client;
    let score = client.getScore.get(msg.author.id);
    // Creates new table if user does not have one yet
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
    // User has not specified it wants to bet points
    if (args.length === 0) {
        msg.channel.send("Flipping coin...");
        if (flip > 0.5) {
            setTimeout(() => {
                console.log("flipping coin, heads");
                msg.channel.send("It's HEADS!");
            }, 1500);
        } else {
            setTimeout(() => {
                console.log("flipping coin, tail");
                msg.channel.send("It's TAILS!");
            }, 1500);
        }
    // User predicts heads or tails and made a bet (and if the user filled in more, ignore it)
    } else if (args.length >= 2) {
        let predicted = args[0].toUpperCase();
        const bet = parseInt(args[1], 10);

        // Check whether the predicted is valid
        if (predicted !== "HEADS" && predicted !== "TAILS") {
            msg.channel.send("Specify heads/tails and the amount you want to bet");
            return;
        }
        // If the amount is not valid, let the validAmount return a message
        if (!validAmount(score, bet, msg)) {
            return;
        }

        // Check whether the user has made a valid prediction
        msg.channel.send("Flipping coin, you predicted `" + predicted + "` with `" + bet + "` AkPoints at risk...");

        let result;
        // Actually the result of the flip
        if (flip > 0.5) {
            result = "HEADS";
        } else {
            result = "TAILS";
        }

        // Log made for Akam
        console.log("Flipping coin, " + result + " with prediction " + predicted + " , with bet: " + bet);

        // Remove/Add to balance
        setTimeout(()=> {
            if (predicted === result) {
                msg.channel.send("Wow it's actually `" + result + "`, `" + bet + "` AkPoints have been added to your balance!");
                score.points = score.points + bet;
            } else {
                msg.channel.send("Welp, you predicted incorrectly, it was `" + result + "`, `" + bet + "` AkPoints have been removed from your balance!");
                score.points = score.points - bet;
            }
            msg.channel.send("Your new total is `" + score.points + "`"); 
            client.setScore.run(score)
        }, 1500)
    } else {
        msg.channel.send("To use coinflip either use ```!coinflip``` or ```!coinflip heads/tails amount```")
    }
};
