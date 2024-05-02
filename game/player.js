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
            const length = this.validCards.length;
            const randIndex = Math.floor(Math.random() * length);

            card = this.validCards[randIndex];
            this.removeCard(card, randIndex, this.validCards.length);
            this.game.stack.addCard(card, this);
            return true;
        }

        return false;
    }

    createValidCards() {
        if(this.cards == undefined || this.cards.length == 0 ){
            this.game.print();
        }

        const stackC = this.game.stack.content;

        // stack empty
        if (stackC.length == 0) { // first to play
            this.validCards = [...this.cards];
            this.handleAnnouncedAceInValidCards();
            return;
        }

        if (stackC[0].card.isTrump()) {
            this.validCards = this.cards.filter(c => {
                // TODO REMOVE PRINT STATEMENTS fix issue when swaping ace
                if(c == undefined) {
                    this.game.print();
                }
                c.isTrump()
            });
        } else {
            // suit 
            const firstSuit = stackC[0].card.suit;
            this.validCards = this.cards.filter(c => {
                if(c == undefined) {
                    this.game.print();
                }
                return !c.isTrump() && firstSuit == c.suit
            });
        }

        if (this.validCards.length > 0) {
            // sauass zwang
            this.handleAnnouncedAceInValidCards();

            return;
        }

        // no available cards in color 
        this.validCards = [...this.cards];
    }

    isCardInValidCards(card) {
        for (const c of this.validCards) {
            if (c.isCard(card.symbol, card.suit)) return true;
        }
        return false;
    }

    isCardInCards(card) {
        for (const c of this.cards) {
            if (c.isCard(card.symbol, card.suit)) return true;
        }
        return false;
    }

    isAnnoucedAceInValidCards() {
        for (let i = 0; i < this.validCards.length; i++) {
            const card = this.validCards[i];
            if (this.game.settings.isAnnoucedAce(card)) {
                return true;
            }
        }
        return false;
    }

    isAnnoucedAceInCards() {
        for (let i = 0; i < this.cards.length; i++) {
            const card = this.cards[i];
            if (this.game.settings.isAnnoucedAce(card)) {
                return true;
            }
        }
        return false;
    }

    handleAnnouncedAceInValidCards() {
        if (this.isAnnoucedAceInValidCards() && !this.game.settings.friendsKnown && this.numberOfCardsOfSuitInValidCards(this.game.settings.suit) < 4) {
            for (let i = 0; i < this.validCards.length; i++) {
                const card = this.validCards[i];
                if (!this.game.settings.isAnnoucedAce(card) && this.game.settings.suit == card.suit) {
                    this.validCards.splice(i, 1);
                    return;
                }
            }
        }
    }

    numberOfCardsOfSuitInValidCards(suit) {
        let number = 0;
        this.validCards.forEach(card => {
            if (card.suit == suit) number++;
        })
        return number;
    }

    removeCard(card) {
        this.cards = this.cards.filter(c => !c.isCard(card.symbol, card.suit));
        return;
    }

    getTotalScore() {
        let score = this.score;
        for (const p of this.friends) {
            score += p.score;
        }
        return score;
    }

    print() {
        console.log(`Player ${this.id} -> Score: ${this.score}, total: ${this.getTotalScore()}, Friends: ${this.friends.length} `);
    }
    printCards() {
        for (const card of this.cards) {
            if(card == undefined) console.log(card)
            else card.print();
        }
    }

    getJSON() {
        const cards = [];
        const friendIds = [];

        this.cards.forEach(c => {
            cards.push({ "symbol": c.symbol, "suit": c.suit });
        });

        this.friends.forEach(f => {
            friendIds.push(f.id);
        });


        return {
            name: `Player ${this.id}`,
            cards: cards,
            friendIds: friendIds,
            score: this.score
        }
    }

}


module.exports = Player;