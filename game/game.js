const Settings = require('./settings.js');
const Stack = require('./stack.js');
const Player = require('./player.js');
const Card = require('./card.js');

class Game {
    constructor(id, gamedata) {
        this.id = id;
        
        this.settings = new Settings(this, gamedata.type, gamedata.suit);
        this.stack = new Stack(this);
        this.players = [new Player(this,1),new Player(this,2),new Player(this,3),new Player(this,4)]; 
        this.createPlayers(gamedata.players);
        this.round = 0;
        this.currentPlayer = this.players[0];
        this.gameEnded = false;
    }

    createPlayers(playersData) {
        for(let i = 0; i < this.players.length; i++) {
            const cards = [];
            
            playersData[i].cards.forEach(card => {
                cards.push(new Card(this, card.symbol, card.suit));
                
            });
            this.players[i].cards = cards;
            this.players[i].nextPlayer = this.players[(i+1) % this.players.length];
            this.players[i].print();
            this.players[i].printCards();
        }
    }

    newRound(winner, points) {
        winner.score += points;
        this.currentPlayer = winner;

        this.stack.print();

        this.round++;
        this.stack.reset();

        if(this.round == 9) {
            this.gameEnded = true;
            console.log("Game Ended");
        }
    }


    print() {
        console.log("Players:");
        for (const player of this.players) player.print();
        console.log("Settings:")
        console.log(this.settings);
    }
}



module.exports = Game;