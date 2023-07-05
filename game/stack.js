const { json } = require("express");

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

        this.handleAnnouncedAce(card);

        this.game.currentPlayer = player.nextPlayer;

    
        
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

    handleAnnouncedAce(card) {
        if(!this.game.settings.friendsKnown && this.game.settings.isAnnoucedAce(card)) {
            this.game.currentPlayer.friends.push(this.game.players[this.game.settings.annPlayer]);
            this.game.players[this.game.settings.annPlayer].friends.push(this.game.currentPlayer);

            const otherTeam = [];
            for (const p of this.game.players) {
                if(p.friends.length == 0) otherTeam.push(p);
            }
            otherTeam[0].friends.push(otherTeam[1]);
            otherTeam[1].friends.push(otherTeam[0]);
        }
    }

    print() {
        const winning  = this.getWinnerContent().card;
        
        console.log(`Current Stack:  Points: ${this.getPoints()}, winner: `)
        winning.print();
        console.log("content")
        for(let c of this.content) c.card.print();
    }

    getJSON() {
        let json = [];

        this.content.forEach(c => {
            const card = {"symbol": c.card.symbol,"suit": c.card.suit};
            const playerId = c.player.id;

            json.push({
                card: card,
                playerId: playerId
            });
        });

        return json;

    }


}

module.exports = Stack;