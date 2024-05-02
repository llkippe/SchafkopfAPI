const Card = require('./card.js');

class Settings {
    constructor(game, type, suit, annPlayer,friendsKnown) {
        this.game = game;

        this.suits = ["e", "b", "h", "s"]
        this.symbols = ["A", "10", "K", "O", "U", "9", "8", "7"]
        this.trumpOrder = []; // contains complete cards
        this.suitOrder = []; // contains only strings of symbols
        this.annPlayer = annPlayer;
        this.friendsKnown = friendsKnown;

        this.type = type;
        this.suit = suit;
        if(this.type === "Ramsch") {
            this.suit = ""
            this.friendsKnown = true;
        }

        


        this.createTrumpOrder();
        this.createSuitOrder();
    }

    createTrumpOrder() {
        // Wenz only
        if (this.type === "Wenz") {
            this.suits.forEach(suit => this.trumpOrder.push(new Card(this.game, "U", suit)));
            return;
        }

        // Sauspiel, Farbsolo, Ramsch
        this.suits.forEach(suit => this.trumpOrder.push(new Card(this.game,"O", suit)));
        this.suits.forEach(suit => this.trumpOrder.push(new Card(this.game,"U", suit)));

        let trumpSuit = "h"; // Ramsch, Sauspiel
        if (this.type === "Farbsolo") trumpSuit = this.suit; // Farbsolo

        this.symbols.forEach(symbol => {
            if (symbol != "U" && symbol != "O") this.trumpOrder.push(new Card(this.game, symbol, trumpSuit));
        });   
    }

    createSuitOrder() {
        if (this.type === "Wenz") {
          this.suitOrder = this.symbols.filter(symbol => symbol !== "U");
        } else {
          this.suitOrder = this.symbols.filter(symbol => symbol !== "U" && symbol !== "O");
        }
    }

    isAnnoucedAce(card) {
        if(this.type !== "Sauspiel") return false;

        if(card.isCard("A", this.suit)) return true;

        return false;
    }
    
    print() {
        console.log("Settings:")
        console.log(this.trumpOrder);
        console.log(this.suitOrder);
        console.log(this.annPlayer);
        console.log(this.friendsKnown);
        console.log(this.type);
        console.log(this.suit);
    }
}

module.exports = Settings;