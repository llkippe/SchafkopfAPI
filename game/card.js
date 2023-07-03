

class Card {
    constructor(game, symbol, suit) {
        this.game = game;
        this.symbol = symbol;
        this.suit = suit;
        this.points = this.getPoints();
    }

    getRank() {
        const trumpOrder = this.game.settings.trumpOrder;
        for(let i = 0; i < trumpOrder.length; i++) {
            const trump  = trumpOrder[i];
            if(this.isCard(trump.symbol, trump.suit)) return i;
        }
        const suitOrder = this.game.settings.suitOrder;
        for(let i = 0; i < suitOrder.length; i++) {
            if(this.symbol == suitOrder[i]) return i + trumpOrder.length;
        }
    }

    isTrump() {
        const rank = this.getRank();
        return rank < this.game.settings.trumpOrder.length;
    }

    isCard(symbol,suit){
        return this.symbol == symbol && this.suit == suit;
    }

    getPoints() {
        if (this.symbol == "A") return 11;
        if (this.symbol == "10") return 10;
        if (this.symbol == "K") return 4;
        if (this.symbol == "O") return 3;
        if (this.symbol == "U") return 2;
        return 0;
    }

    print() {
        console.log(`Cards: ${this.suit}, ${this.symbol}, ${this.points}, rank: ${this.getRank()}, isTrump: ${this.isTrump()}`);
    }
}

module.exports = Card;