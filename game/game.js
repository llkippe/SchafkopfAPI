const Settings = require('./settings.js');
const Stack = require('./stack.js');
const Player = require('./player.js');
const Card = require('./card.js');


class Game {
    constructor(protocol, gamedata) {
        this.protocol = protocol;

        if(!gamedata) {
            this.initRandomGame();
            return;
        }

        this.initGameFromData(gamedata);
    }

    initGameFromData(gamedata) {
        this.round = gamedata.round;
        this.gameEnded = gamedata.gameEnded;

        this.settings = new Settings(this, gamedata.type, gamedata.suit, gamedata.annPlayer, gamedata.friendsKnown);
        this.stack = new Stack(this);
        
        this.players = [new Player(this, 0), new Player(this, 1), new Player(this, 2), new Player(this, 3)];
        this.createPlayers(gamedata.players);
        this.checkForFriends(gamedata.players);
        this.currentPlayer = this.players[gamedata.currentPlayer];

        this.createStack(gamedata.stack);
    }

    initRandomGame() {
        this.round = 0
        this.gameEnded = false;

        const types = ["Sauspiel", "Wenz", "Farbsolo", "Ramsch"]
        const suits = ['e','b','h','s']
        const randomIndex = (arr) => Math.floor(Math.random() * arr.length)

        let selectedType = types[randomIndex(types)];
        let selectedSuit;
            
        // Logic for selecting suit based on type
        if (selectedType === "Wenz" || selectedType === "Ramsch") {
            selectedSuit = ""; // No suit for Wenz or Ramsch
        } else {
            // For Sauspiel, ensure suit is not hearts ('h')
            do {
                selectedSuit = suits[randomIndex(suits)];
            } while (selectedType === "Sauspiel" && selectedSuit === 'h');
        }
        
        this.settings = new Settings(
            this,
            selectedType,
            selectedSuit,
            Math.floor(Math.random() * 4),
            false
        );

        this.stack = new Stack(this)
        this.players = [new Player(this, 0), new Player(this, 1), new Player(this, 2), new Player(this, 3)];

        const playersData = [
            {
              name: "Player 1",
              cards: [
                { symbol: "A", suit: "b" },
                { symbol: "A", suit: "h" },
                { symbol: "10", suit: "s" },
                { symbol: "K", suit: "e" },
                { symbol: "O", suit: "s" },
                { symbol: "U", suit: "e" },
                { symbol: "9", suit: "b" },
                { symbol: "9", suit: "s" },
              ],
              friendIds: [],
              score: 0,
            },
            {
              name: "Player 2",
              cards: [
                { symbol: "O", suit: "b" },
                { symbol: "O", suit: "h" },
                { symbol: "9", suit: "h" },
                { symbol: "7", suit: "h" },
                { symbol: "K", suit: "s" },
                { symbol: "A", suit: "e" },
                { symbol: "8", suit: "b" },
                { symbol: "8", suit: "s" },
              ],
              friendIds: [],
              score: 0,
            },
            {
              name: "Player 3",
              cards: [
                { symbol: "K", suit: "b" },
                { symbol: "K", suit: "h" },
                { symbol: "O", suit: "e" },
                { symbol: "U", suit: "b" },
                { symbol: "U", suit: "h" },
                { symbol: "10", suit: "e" },
                { symbol: "10", suit: "h" },
                { symbol: "7", suit: "s" },
              ],
              friendIds: [],
              score: 0,
            },
            {
              name: "Player 4",
              cards: [
                { symbol: "8", suit: "e" },
                { symbol: "8", suit: "h" },
                { symbol: "7", suit: "e" },
                { symbol: "7", suit: "b" },
                { symbol: "A", suit: "s" },
                { symbol: "U", suit: "s" },
                { symbol: "9", suit: "e" },
                { symbol: "10", suit: "b" },
              ],
              friendIds: [],
              score: 0,
            },
        ]

        this.createPlayers(playersData);
        this.checkForFriends(playersData);
        this.shuffleCards();

        this.currentPlayer = this.players[0];
    }

    // shuffles all cards, 
    // when apartfromplayerid is given this player is left out of shuffling
    shuffleCardsApartFrom(apartFromid) {
        let playersCard = [];

        this.players.forEach(player => {
          if(apartFromid == player.id) playersCard.push([]);
          else playersCard.push(player.cards); 
        });  

        const playersCardNew = this.shuffleElementsAmongArrays(playersCard[0],playersCard[1],playersCard[2],playersCard[3]);

        this.players.forEach(player => {
          if(apartFromid != player.id) player.cards = playersCardNew[player.id];
        });
    }

    shuffleCards() {
        let playersCard = [];

        this.players.forEach(player => {
            playersCard.push(player.cards); 
        });

        const playersCardNew = this.shuffleElementsAmongArrays(playersCard[0],playersCard[1],playersCard[2],playersCard[3]);

        this.players.forEach(player => {
            player.cards = playersCardNew[player.id]
        });
    }


    // handles friends, scores, and adds cards to each player
    createPlayers(playersData) {
        if (!this.settings.friendsKnown) { // add solo friends
            if (this.settings.type == "Wenz" || this.settings.type == "Farbsolo") {
                let team = [];
                for (const p of this.players) if (p != this.players[this.settings.annPlayer]) team.push(p);
                team[0].friends.push(team[1], team[2]);
                team[1].friends.push(team[0], team[2]);
                team[2].friends.push(team[0], team[1]);
            }
        }


        for (let i = 0; i < this.players.length; i++) {
            const cards = [];

            playersData[i].cards.forEach(card => {
                cards.push(new Card(this, card.symbol, card.suit));
            });

            this.players[i].cards = cards;
            this.players[i].nextPlayer = this.players[(i + 1) % this.players.length];
            this.players[i].score = playersData[i].score;

            if (this.protocol) {
                this.players[i].print();
                this.players[i].printCards();
            }
        }
    }

    checkForFriends(playersData) {
        // add known friends
        if (this.settings.friendsKnown) {
            for (let i = 0; i < this.players.length; i++) {
                for (const friend of playersData[i].friendIds) {
                    this.players[i].friends.push(this.players[friend]);
                }
            }   
            return;
        }

        // FRIENDS NOT KNOWN

        // add teams when someone is playing solo
        if (this.settings.type == "Wenz" || this.settings.type == "Farbsolo") {
            let team = [];
            for (const p of this.players) if (p != this.players[this.settings.annPlayer]) team.push(p);
            team[0].friends.push(team[1], team[2]);
            team[1].friends.push(team[0], team[2]);
            team[2].friends.push(team[0], team[1]);
        }
        
        // add ann player as friend
        if(this.settings.type == "Sauspiel") {
            for (let i = 0; i < this.players.length; i++) {
                if(this.players[i].isAnnoucedAceInCards()) {
                    this.players[i].friends.push(this.players[this.settings.annPlayer]);
                }
            }
        } 
            
        
    }

    createStack(stackData) {
        stackData.forEach(content => {
            const c = content.card;
            const p = content.playerId;
            this.stack.addCard(new Card(this, c.symbol, c.suit), this.players[p]);
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
                    //p.printCards();
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

    getTotalScores() {
        return [this.players[0].getTotalScore(),this.players[1].getTotalScore(),this.players[2].getTotalScore(),this.players[3].getTotalScore()]
    }

    getJSON() {
        return {
            "type": this.settings.type, // Sauspiel, Wenz, Farbsolo, Ramsch
            "suit": this.settings.suit,
            "annPlayer": this.settings.annPlayer,
            "currentPlayer": this.currentPlayer.id,
            "round": this.round,
            "gameEnded": this.gameEnded,
            "friendsKnown": this.settings.friendsKnown,
            "stack": this.stack.getJSON(),
            "players": [this.players[0].getJSON(), this.players[1].getJSON(), this.players[2].getJSON(), this.players[3].getJSON()]
        }
    }

    shuffleElementsAmongArrays(...arrays) {
        const flattenedArray = arrays.flat();
        const shuffledIndices = [...Array(flattenedArray.length).keys()].sort(() => Math.random() - 0.5);
        let index = 0;
        return arrays.map(arr => {
            const shuffledArray = [];
            for (let i = 0; i < arr.length; i++) {
                shuffledArray.push(flattenedArray[shuffledIndices[index]]);
                index++;
            }
            return shuffledArray;
        });
      }


    print() {
        console.log("Players:");
        for (const player of this.players) {
            player.print();
            player.printCards();
        }
        
        this.settings.print();
        this.stack.print()
    }
}



module.exports = Game;