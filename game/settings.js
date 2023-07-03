const Card = require('./card.js');

class Settings {
    constructor(type, suit) {
        this.type = type;
        this.suit = suit;
        this.suits = ["e", "b", "h", "s"]
        this.symbols = ["A", "10", "K", "O", "U", "9", "8", "7"]
        this.trumpOrder = []; // contains complete cards
        this.suitOrder = []; // contains only strings of symbols

        this.createTrumpOrder();
        this.createSuitOrder();
    }

    createTrumpOrder() {
        if (this.type == "Wenz") {
            this.suits.forEach(suit => this.trumpOrder.push(new Card("U", suit)));
            return;
        }
        // Sauspiel, Farbsolo, Ramsch
        this.suits.forEach(suit => this.trumpOrder.push(new Card("O", suit)));
        this.suits.forEach(suit => this.trumpOrder.push(new Card("U", suit)));

        let trumpSuit = "h"; // Ramsch, Sauspiel
        if (this.type == "Farbsolo") trumpSuit = this.suit; // Farbsolo

        this.symbols.forEach(symbol => {
            if (symbol != "U" && symbol != "O") this.trumpOrder.push(new Card(trumpSuit, symbol));
        });

        
    }


    createSuitOrder() {
        if (this.type === "Wenz") {
          this.suitOrder = this.symbols.filter(symbol => symbol !== "U");
        } else {
          this.suitOrder = this.symbols.filter(symbol => symbol !== "U" && symbol !== "O");
        }
      
        console.log(this.suitOrder);
      }

    
}

module.exports = Settings;