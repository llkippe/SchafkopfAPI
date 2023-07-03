class Stack {
    constructor(game) {
        this.game = game;
        this.content = []; // stores cards and player who played card
        
    }

    addCard(card, player) {
        
        this.content.push({card: card, player: player});

        if(this.game.protocol) {
        console.log("added to Stack")
        card.print();
        player.print();
        }

        this.game.currentPlayer = player.nextPlayer;
        // check for sauass
        
        if(this.content.length == 4) this.game.newRound(this.getWinnerContent().player, this.getPoints());
    }
    reset() {
        this.content = [];
    }
    getWinnerContent() {
        let winning = this.content[0];
        for(let i = 1; i < this.content.length; i++) {
            if(this.content[i].card.getRank() < winning.card.getRank()) {
                winning = this.content[i];
            }
        }
        return winning;
    }
    getPoints() {
        let points = 0;
        for(let c of this.content) points += c.card.points;
        return points;
    }

    print() {
        const winning  = this.getWinnerContent().card;
        
        console.log(`Current Stack:  Points: ${this.getPoints()}, winner: `)
        winning.print();
        console.log("content")
        for(let c of this.content) c.card.print();
    }
}

module.exports = Stack;