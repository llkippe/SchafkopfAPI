class Stack {
    constructor(game) {
        this.game = game;
        this.content = []; // stores cards and player who played card
        
    }

    addCard(card, player) {
        this.content.push({card: card, player: player});
        this.game.currentPlayer = player.nextPlayer;
        // check for sauass

        if(this.content.length > 4) this.game.newRound(this.getWinningPlayer(), this.getPoints());
    }
    reset() {
        this.content = [];
    }
    getWinningCard() {

    }
    getWinningPlayer() {

    }
    getPoints() {

    }
}

module.exports = Stack;