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


    // Async to wait for the user response
    msg.channel.send(generateMessage(player, dealer)).then(async (fullMessage) => {
        let playerTurn = true;
        let dealerTurn = true;
        let gameOver = false;
        let turn = 0;

        while (playerTurn){
            let optionNumber = -1;
            let chances = 3;
            turn++;

            // Give the user 3 chances in order to type an option
            while (optionNumber === -1 && chances !== 0) {
                // TODO Make this text based on the options in options
                msg.channel.send("Please type either ```stand | hit | double```");
                optionNumber = await collecting(msg, options);
                chances--;
            }
            // If it's turn 2, remove the double option
            if (turn === 2) {
                options.pop();
            }

            // STAND
            if (optionNumber === 0) {
                dealer.push(deck.drawSingle());
                playerTurn = false;

            // HIT
            } else if (optionNumber === 1) {
                player.push(deck.drawSingle());

            // TODO REMOVE MONEY
            // DOUBLE
            } else if (optionNumber === 2) {
                player.push(deck.drawSingle());
                dealer.push(deck.drawSingle());
                playerTurn = false;

            // The user has filled in an invalid option
            } else {
                msg.channel.send("You have not provided an valid answer 3 times in a row, exiting now");
                return;
            }

            // Scenario where player killed itself
            if (calculateScore(player).length === 0) {
                dealerTurn = false;
                gameOver = true;
                dealer.push(deck.drawSingle());
                msg.channel.send("You lost, your score is higher than 21");
            }

            fullMessage.edit(generateMessage(player, dealer));
        }

        while (dealerTurn) {
            let arr = calculateScore(dealer);
            // The dealer has no valid scores, so it's death
            if (arr.length === 0) {
                dealerTurn = false;
                gameOver = true;
                msg.channel.send("Congrats player, you won");
            // Highest dealer score is in the first slot
            } else {
                // Keep drawing until 17 or higher
                if (arr[0] < 17) {
                    dealer.push((deck.drawSingle))
                } else {
                    dealerTurn = false;
                }
            }
        }
        // Sent a message because the dealers deck might have updated
        fullMessage.edit(generateMessage(player, dealer));
        // The game has been decided because either the player or dealer has drawn over 21
        if (gameOver) {
            return;
        }
        let playerScore = calculateScore(player)[0];
        let dealerScore = calculateScore(dealer)[0];
        if (playerScore > dealerScore) {
            msg.channel.send("Congrats player, you won");
        } else if (playerScore < dealerScore) {
            msg.channel.send("Unlucky, you lost");
        } else {
            msg.channel.send("It's a tie");
        }
    });

};

async function collecting(msg, options) {
    let filter = m => m.author.id === msg.author.id;
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
        const first = collected.first().content;
        msg.channel.send("DEBUG: Fetched message contained: " + first);
        for (let i = 0; i < options.length; i++) {
            if (first.toUpperCase() === options[i]) {
                optionNumber = i;
                break;
            }
        }
    }
    msg.channel.send("DEBUG: The optionnumber is " + optionNumber);
    return optionNumber;
}

// TODO ALSO ADD THE OPTIONS
function generateMessage(playerCards, dealerCards) {
    let playerScoreArray = calculateScore(playerCards);
    let playerScore = "Your score:\t ";
    for (let i = 0; i < playerScoreArray.length; i++) {
        if (i !== 0) {
            playerScore += " or " + playerScoreArray[i];
        } else {
            playerScore += playerScoreArray[i];
        }
    }
    let dealerScoreArray = calculateScore(dealerCards);
    let dealerScore = "Dealer score:\t ";
    for (let i = 0; i < dealerScoreArray.length; i++) {
        if (i !== 0) {
            dealerScore += " or " + dealerScoreArray[i];
        } else {
            dealerScore += dealerScoreArray[i];
        }
    }
    return "```" +
        "Dealer: " + printCards(dealerCards) + "\n" +
        "Player: " + printCards(playerCards) + "\n" +
        dealerScore + "\n" +
        playerScore +
        "```";
}

function printCards(cards) {
    let string = "";
    cards.forEach(card => {
        string = string + card.printCard() + " ";
    });
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
    }
    // If there are 2 aces, create new copies of sums[0]
    // So in total we have an array with length 3
    // First index will not get touched
    // Index 2 will get its score - 10
    // Index 3 will get its score - 20
    // This is to account for all the possible aces scores
    for (let i = 0; i < aces; i++) {
        sums.push(sums[0]);
    }
    for (let i = 1; i < sums.length; i++) {
        sums[i] = sums[i] - i*10;
    }

    // Remove all values that are invalid
    // Has to be done front to back in order to not get index out of bounds/missing values
    let n = sums.length-1;
    for (let i = n; i >= 0; i--) {
        if (sums[i] <= 0 || sums[i] > 21) {
            sums.splice(i, 1);
        }
    }
    // TODO: Als er geen valid scores zijn, print dan invalid score uit

    // The value returned could be an empty array, the normal code should deal with this appropriately
    return sums;
}

