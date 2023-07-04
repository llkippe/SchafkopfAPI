const Settings = require('./settings.js');
const Stack = require('./stack.js');
const Player = require('./player.js');
const Card = require('./card.js');

class Game {
    constructor(protocol, id, gamedata) {
        this.id = id;
        this.protocol = protocol;

        this.settings = new Settings(this, gamedata.type, gamedata.suit, gamedata.annPlayer);
        this.stack = new Stack(this);
        this.players = [new Player(this, 0), new Player(this, 1), new Player(this, 2), new Player(this, 3)];
        this.createPlayers(gamedata.players);
        this.round = gamedata.round;
        this.currentPlayer = this.players[gamedata.currentPlayer];
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

            for(const friend of playersData[i].friendIds) {
                this.players[i].friends.push(this.players[friend]);
            }


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
        let p = [this.players[0]];
        for (let i = 1; i < this.players.length; i++) {
            if (this.players[i].getTotalScore() > p[0].getTotalScore()) p = [this.players[i]];
            else if(this.players[i].getTotalScore() == p[0].getTotalScore()) p.push(this.players[i]);

        }
        let ids = [];
        for(const pla of p) ids.push(pla.id);
        return ids;
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