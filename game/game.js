const Settings = require('./settings.js');
const Stack = require('./stack.js');
const Player = require('./player.js');
const Card = require('./card.js');

class Game {
    constructor(id, gamedata) {
        this.id = id;
        
        this.settings = new Settings(this, gamedata.type, gamedata.suit);
        this.stack = new Stack(this);
        this.players = [new Player(this),new Player(this),new Player(this),new Player(this)]; 
        this.createPlayers(gamedata.players);
        this.round = 0;
        this.currentPlayer = this.players[0];
    }

    createPlayers(playersData) {
        for(let i = 0; i < this.players.length; i++) {
            const cards = [];
            
            playersData[i].cards.forEach(card => {
                cards.push(new Card(this, card.symbol, card.suit));
                
            });

            
           
            this.players[i].cards = cards;
            this.players[i].nextPlayer = this.players[(i+1) % this.players.length];
        }
    }

    newRound(winner, points) {
        winner.score += points;
        this.currentPlayer = winner;

        this.round++;
        this.stack.reset();
    }


    print() {
        console.log("Players:");
        for (const player of this.players) player.print();
        console.log("Settings:")
        console.log(this.settings);
    }
}



module.exports = Game;