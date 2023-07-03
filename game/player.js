class Player {
    constructor(game, id) {
        this.id = id;
        this.game = game;
        this.cards = [];
        this.validCards = [];
        this.nextPlayer;
        this.friends = [];
        this.score = 0;
    }

    playCard(card) {
        this.createValidCards();

        if (card && this.isCardInValidCards(card)) {
            this.removeCard(card);
            this.game.stack.addCard(card, this);

            return true;
        }

        if (this.validCards.length > 0) {
            const randIndex = parseInt(Math.random() * this.validCards.length);
            card = this.validCards[randIndex];
            this.removeCard(card);
            this.game.stack.addCard(card, this);
            return true;
        }

        return false;
    }

    createValidCards() {
        // stack empty
        const stackC = this.game.stack.content;

        if (stackC.length == 0) { // first to play
            this.validCards = [...this.cards];
            return;
        }

        if (stackC[0].card.isTrump()) {
            this.validCards = this.cards.filter(c => c.isTrump());
        } else {
            // suit 
            const firstSuit = stackC[0].card.suit;
            this.validCards = this.cards.filter(c => !c.isTrump() && firstSuit == c.suit);
        }
        if (this.validCards.length > 0) return;

        // no available cards in color 
        this.validCards = [...this.cards];
    }

    isCardInValidCards(card) {
        for (const c of this.validCards) {
            if (c.isCard(card.symbol, card.suit)) return true;
        }
        return false;
    }

    removeCard(card) {
        this.cards = this.cards.filter(c => !c.isCard(card.symbol, card.suit));
    }

    print() {
        console.log(`Player ${this.id} -> Score: ${this.score}, Friends: ${this.friends.length} `);
        
    }
    printCards() {
        for (const card of this.cards) card.print();
    }

}


module.exports = Player;