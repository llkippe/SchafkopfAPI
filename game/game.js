const Settings = require('./settings.js');
const Stack = require('./stack.js');
const Player = require('./player.js');
const Card = require('./card.js');

class Game {
    constructor(protocol, id, gamedata) {
        this.id = id;
        this.protocol = protocol;
        this.round = gamedata.round;
        this.gameEnded = false;

        this.settings = new Settings(this, gamedata.type, gamedata.suit, gamedata.annPlayer);
        this.stack = new Stack(this);
        this.players = [new Player(this, 0), new Player(this, 1), new Player(this, 2), new Player(this, 3)];
        this.createPlayers(gamedata.players);
        this.currentPlayer = this.players[gamedata.currentPlayer];

        this.createStack(gamedata.stack);
        
        
        
    }

    createPlayers(playersData) {
        if (this.round == 0) { // add solo friends
            if(this.settings.type == "Wenz" || this.settings.type == "Farbsolo") {
                let team = [];
                for(const p of this.players) if(p != this.players[this.settings.annPlayer]) team.push(p);
                team[0].friends.push(team[1],team[2]);
                team[1].friends.push(team[0],team[2]);
                team[2].friends.push(team[0],team[1]);
            }
        }


        for (let i = 0; i < this.players.length; i++) {
            const cards = [];

            playersData[i].cards.forEach(card => {
                cards.push(new Card(this, card.symbol, card.suit));
            });

            this.players[i].cards = cards;
            this.players[i].nextPlayer = this.players[(i + 1) % this.players.length];

            
             // add known friends
            for (const friend of playersData[i].friendIds) {
                this.players[i].friends.push(this.players[friend]);
            }

            if (this.protocol) {
                this.players[i].print();
                this.players[i].printCards();
            }
        }
    }

    createStack(stackData) {
        console.log(stackData[0]);
        stackData.forEach(content => {
            console.log(content);
            const c = content.card;
            const p = content.playerId;
            this.stack.addCard(new Card(this,c.symbol, c.suit), this.players[p]);
        });
    }

    newRound(winner, points) {
        winner.score += points;
        this.currentPlayer = winner;

        if (this.protocol) this.stack.print();

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
            else if (this.players[i].getTotalScore() == p[0].getTotalScore()) p.push(this.players[i]);

        }
        let ids = [];
        for (const pla of p) ids.push(pla.id);
        return ids;
    }

    getJSON() {
        return {
            "type": this.settings.type, // Sauspiel, Wenz, Farbsolo, Ramsch
            "suit": this.settings.suit,
            "annPlayer": this.settings.annPlayer,
            "currentPlayer": this.currentPlayer.id,
            "round": this.round, 
            "stack": this.stack.getJSON(),
            "players": [this.players[0].getJSON(),this.players[1].getJSON(),this.players[2].getJSON(),this.players[3].getJSON()]
        }
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