const Settings = require('./settings.js');
const Stack = require('./stack.js');
const Player = require('./player.js');
const Card = require('./card.js');

class Game {
    constructor(id, gamedata) {
        this.id = id;
        
        this.settings = new Settings(gamedata.type, gamedata.suit);
        this.stack = new Stack();
        this.players = [new Player(),new Player(),new Player(),new Player()]; 
        this.createPlayers(gamedata.players);
        this.round = 0;
        this.currentPlayer = this.players[0];
    }

    createPlayers(playersData) {
        for(let i = 0; i < this.players.length; i++) {
            const cards = [];
            
            playersData[i].cards.forEach(card => {
                cards.push(new Card(card.symbol, card.suit));
            });
            this.players[i].cards = cards;
            this.players[i].nextPlayer = this.players[(i+1) % this.players.length];
        }
    }

    print() {
        console.log("Players:");
        this.players.forEach(player => console.log(player));
        console.log("Settings:")
        console.log(this.settings);
    }
}



module.exports = Game;