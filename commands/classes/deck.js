const Card = require("./card");
module.exports = class Deck {
    constructor(client) {
        this.deck = [];
        this.ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
        this.suites = ["❤", "♣", "♠", "♦"];
        this.ranks.forEach(rank => {
           this.suites.forEach(suite => {
               this.deck.push(new Card(suite, rank));
           });
        });
    }

    // Returns the deck
    getDeck() {
        return this.deck
    }

    // Draw a single card from the deck
    drawSingle() {
        const ind = Math.floor(Math.random()*this.deck.length);
        const card = this.deck[ind];
        this.deck.splice(ind, 1);
        return card;
    }

    // Draw multiple cards from the deck
    drawMultiple(amount) {
        let cards = [];
        for (let i = 0; i < amount; i++) {
            const ind = Math.floor(Math.random()*this.deck.length);
            const card = this.deck[ind];
            this.deck.splice(ind, 1);
            cards.push(card)
        }
        return cards;
    }
};
