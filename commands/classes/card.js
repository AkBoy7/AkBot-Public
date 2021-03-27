module.exports = class Card {
    constructor(suite, rank) {
        this.suite = suite;
        this.rank = rank;
        let num = Number.parseInt(this.rank);
        // The rank is either 2,3,...,10
        if (Number.isInteger(num)) {
            this.value = num;
        // The rank is A, so 11 or 1
        } else if (this.rank === "A") {
            this.value = 11;
        // The remaining ranks are J, Q, K
        } else {
            this.value = 10;
        }
    }

    // Return the suite of a card, could also use Card.suite
    getSuite() {
        return this.suite;
    }

    // Return the rank of a card, could also use Card.rank
    getRank() {
        return this.rank;
    }

    // Return the value of a card, could also use Card.value
    getValue() {
        return this.value;
    }

    // Print the card
    printCard() {
        return "|" + this.rank + " " + this.suite + "|";
    }

    // Print an empty card
    printEmpty() {
        return "|   |";
    }
};