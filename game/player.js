class Player {
    constructor(game) {
        this.game = game;
        this.cards = [];
        this.validCards;
        this.nextPlayer;
        this.friends = [];
        this.score = 0;
    }

    createValidCards() {
        // stack empty
        if(this.game.stack.content.length == 0) {
            this.validCards = this.cards.splice();
            return;
        }
    }

    print() {
        console.log(`Player -> Score: ${this.score}, Friends: ${this.friends.length} `);
        for (const card of this.cards) card.print();
    }    
}

module.exports = Player;