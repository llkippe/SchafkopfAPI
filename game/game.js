const Settings = require('./settings.js');
const Stack = require('./stack.js');
const Player = require('./player.js');
const Card = require('./card.js');

class Game {
    constructor(protocol, id, gamedata) {
        this.id = id;
        this.protocol = protocol;

        this.settings = new Settings(this, gamedata.type, gamedata.suit);
        this.stack = new Stack(this);
        this.players = [new Player(this, 1), new Player(this, 2), new Player(this, 3), new Player(this, 4)];
        this.createPlayers(gamedata.players);
        this.round = 0;
        this.currentPlayer = this.players[0];
        this.gameEnded = false;
    }

    createPlayers(playersData) {
        for (let i = 0; i < this.players.length; i++) {
            const cards = [];

            playersData[i].cards.forEach(card => {
                cards.push(new Card(this, card.symbol, card.suit));

            });
            this.players[i].cards = cards;
            this.players[i].nextPlayer = this.players[(i + 1) % this.players.length];
            if(this.protocol) {
            this.players[i].print();
            this.players[i].printCards();
            }
        }
    }

    newRound(winner, points) {
        winner.score += points;
        this.currentPlayer = winner;

        if(this.protocol) this.stack.print();

        this.round++;
        this.stack.reset();

        if (this.round == 8) {
            this.gameEnded = true;
            if (this.protocol) {
                for (const p of this.players) {
                    p.print();
                    p.printCards();
                }

                console.log("Game Ended");
            }
        }
    }

    getWinner() {
        let p = this.players[0];
        for (let i = 1; i < this.players.length; i++) {
            if (this.players[i].score > p.score) p = this.players[i];
        }
        return p.id;
    }


    print() {
            console.log("Players:");
            for (const player of this.players) {
                player.print();
                player.printCards();
            }
            console.log("Settings:")
            console.log(this.settings);
    }
}



module.exports = Game;