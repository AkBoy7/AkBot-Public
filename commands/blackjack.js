const deckSetup = require("./classes/deck.js");
const Card = require("./classes/card");
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

    // TODO: REMOVE THE USER POINTS / CHECK IF THE USER HAS ENOUGH POINTS

    let deck = new deckSetup();

    let dealer = [deck.drawSingle()];
    let player = deck.drawMultiple(2);
    // TODO: REMOVE DOUBLE WHEN THE PLAYERS DOESNT HAVE ENOUGH POINTS
    // TODO: MAYBE ADD INSURANCE
    let options = ["STAND", "HIT", "DOUBLE"];

    // The idea: a message gets sent that shows the player it's 2 cards and the dealer showing 1 faceup card and 1 facedown card
    // Then the user has the option between: stand, hit, double (split might be later implemented but it's harder)
    // With stand the player doesnt get any new cards and the dealer reveals its card and the money is given/taken
    // With hit the player draws another card and now the player can choose stand or hit
    // With double the players gets drawn a single card after that the dealer will reveal its cards and the money is given/taken
    // TODO NOTE THE DEALER ALSO HAS TO KEEP DRAWING IF ITS SCORE IS NOT HIGH ENOUGH

    let filter = m => m.author.id === msg.author.id;
    // Async to wait for the user response
    msg.channel.send(generateMessage(player, dealer)).then(async (fullMessage) => {
        // TODO: ADD A WHILE LOOP SO THE USER CAN DO MULTIPLE THINGS

        // TODO: FOR NOW ONLY 1 MESSAGE ALLOWED LATER MAKE IT USER PROOF
        let collected = await msg.channel.awaitMessages(filter, {
            max: 1,
            time: 10000,
            errors: ['time']
        }).catch(() => {
            msg.channel.send("User did not type a message in 10 seconds");
        });
        let optionNumber = -1;
        if (!collected) {
            // TODO PROBABLY REMOVE THIS LINE
            msg.channel.send("User did not type a message in 10 seconds");
        } else {
            msg.channel.send("DEBUG: Fetched message contained: " + collected.first().content);
            for (let i = 0; i < options.length; i++) {
                if (collected.first().content.toUpperCase() === options[i]) {
                    optionNumber = i;
                    break;
                }
            }
        }
        msg.channel.send("DEBUG: The optionnumber is " + optionNumber);
        // STAND
        if (optionNumber === 1) {
            dealer.push(deck.drawSingle());
        // HIT
        } else if (optionNumber === 2) {
            player.push(deck.drawSingle());
        // TODO REMOVE MONEY
        // DOUBLE
        } else if (optionNumber === 3) {
            player.push(deck.drawSingle());
            dealer.push(deck.drawSingle());
            // The user has filled in a invalid option
        } else {
            // TODO SHOW THE AVAILABLE OPTIONS (OR NOT BECAUSE THEY SHOULD BE IN THE OG MESSAGE)
            msg.channel.send("Please provide a valid option")
        }
        fullMessage.edit(generateMessage(player, dealer));
    });

};

// TODO ALSO ADD THE OPTIONS
function generateMessage(playerCards, dealerCards) {
    let playerScoreArray = calculateScore(playerCards);
    let playerScore = "Your score is ";
    for (let i = 0; i < playerScoreArray.length; i++) {
        if (i !== 0) {
            playerScore = " or " + playerScore;
        }
        playerScore = playerScore + playerScoreArray[i];
    }
    let dealerScoreArray = calculateScore(dealerCards);
    let dealerScore = "The dealer its score is ";
    for (let i = 0; i < dealerScoreArray.length; i++) {
        if (i !== 0) {
            dealerScore = " or " + dealerScore ;
        }
        dealerScore = dealerScore + dealerScoreArray[i]
    }
    return printCards(dealerCards) + "\n" +
        printCards(playerCards) + "\n" +
        dealerScore + "\n" +
        playerScore;
}

function printCards(cards) {
    let string = "";
    cards.forEach(card => {
        string = string + card.printCard() + " ";
    });
    // for (let card in cards) {
    //     if (cards.hasOwnProperty(card) && card.hasOwnProperty('printCard')) {
    //         // Empty space at the end, should be fine
    //         string = string + card.printCard() + " ";
    //     } else {
    //         console.log("Card missing property");
    //     }
    // }
    return string;
}

// CalculateScore expects an array of type Card
function calculateScore(cards) {
    let sums = [0];
    let aces = 0;
    // Count up all the card values
    if (Array.isArray(cards)) {
        cards.forEach(card => {
            if (card.getRank() === "A") {
                aces++;
            }
            sums[0] += card.getValue();
        });
        // for (let card in cards) {
        //     if (cards.hasOwnProperty(card) && card.hasOwnProperty('getRank')) {
        //         if (card.getRank() === "A") {
        //             aces++;
        //         }
        //         sums[0] += card.getValue();
        //     }
        // }
    }
    // If there are 2 aces, create new copies of sums[0]
    // So in total we have an array with length 3
    // First index will not get touched
    // Index 2 will get its score - 10
    // Index 3 will get its score - 20
    // This is to account for all the possible aces scores
    for (let i = 0; i < aces; i++) {
        sums.push(sums[0]);
        sums[i] = sums[i] - i*10;
    }

    // Remove all values that are invalid
    // Has to be done front to back in order to not get index out of bounds/missing values
    let n = sums.length;
    for (let i = n; i >= 0; i--) {
        if (sums[i] <= 0 || sums[i] > 21) {
            sums.splice(i, 1);
        }
    }

    // The value returned could be an empty array, the normal code should deal with this appropriately
    return sums;
}

