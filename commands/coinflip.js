const validAmount = require("./methods/validAmount.js");
const generateScore = require("./methods/generateScore");
const parsePoints = require("./methods/parsePoints");

module.exports = function (msg, args) {
    // Start by flipping it :)
    const flip = Math.random();

    // Fetch client data
    const client = msg.client;
    let score = client.getScore.get(msg.author.id);
    // Creates new table if user does not have one yet
    if (!score) {
        score = generateScore(msg)
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
        msg.channel.send("This feature is disabled, try betting your points on bets. You can also create your own bets with `!bet create`");
        return;

        // let predicted = args[0].toUpperCase();

        // let bet = parsePoints(args[1], score);

        // // Check whether the predicted is valid
        // if (predicted !== "HEADS" && predicted !== "TAILS") {
        //     msg.channel.send("Specify heads/tails and the amount you want to bet");
        //     return;
        // }
        // // If the amount is not valid, let the validAmount return a message
        // if (!validAmount(score, bet, msg)) {
        //     return;
        // }

        // // Already subtract the points and update the client score
        // score.points = score.points - bet;
        // client.setScore.run(score);

        // // Check whether the user has made a valid prediction
        // msg.channel.send("Flipping coin, you predicted `" + predicted + "` with `" + bet + "` AkPoints at risk...");

        // let result;
        // // Actually the result of the flip
        // if (flip > 0.5) {
        //     result = "HEADS";
        // } else {
        //     result = "TAILS";
        // }

        // // Log made for Akam
        // console.log("Flipping coin, " + result + " with prediction " + predicted + " , with bet: " + bet);

        // // Remove/Add to balance
        // setTimeout(()=> {
        //     let score = client.getScore.get(msg.author.id);
        //     if (predicted === result) {
        //         msg.channel.send("Wow it's actually `" + result + "`, `" + bet + "` AkPoints have been added to your balance!");
        //         // Double the points because the original bet has already been deducted
        //         score.points = score.points + bet*2;
        //         client.setScore.run(score);
        //     } else {
        //         msg.channel.send("Welp, you predicted incorrectly, it was `" + result + "`, `" + bet + "` AkPoints have been removed from your balance!");
        //     }
        //     msg.channel.send("Your new total is `" + score.points + "`");
        // }, 1500)
    } else {
        msg.channel.send("To use coinflip either use ```!coinflip```");
    }
};
