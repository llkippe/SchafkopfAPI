const Game = require("./game/game.js");

class Simulation {
  constructor(game) {
    this.playerId = game.currentPlayer.id;
    this.game = game;
    this.root = null;
    this.protocol = true;
  }

  findBestCard() {
    if (this.game.round == 7) {
      // only one card on hand left, recommand this card
      this.game.currentPlayer.createValidCards();
      const validCards = this.game.currentPlayer.validCards;
      return validCards[0];
    }

    this.root = new mctsNode(this.game, [], this.playerId, this.protocol);
    const mctsDepth = 20;

    // evalute more when its a first card, maybe with higher exploration?

    for (let i = 0; i < mctsDepth; i++) {
      this.root.mcts();
    }

    this.root.displayTree();

    let maxChild = {
      avgScore:
        this.root.children[0].totalScore /
        this.root.children[0].totalGamesPlayed,
      child: this.root.children[0],
    };

    for (let i = 1; i < this.root.children.length; i++) {
      const avgScore =
        this.root.children[i].totalScore /
        this.root.children[i].totalGamesPlayed;

      if (maxChild.avgScore < avgScore) {
        maxChild.avgScore = avgScore;
        maxChild.child = this.root.children[i];
      }
    }

    return maxChild.child.cards[0];
  }
}

class mctsNode {
  constructor(game, cards, playerId, protocol) {
    this.protocol = protocol;

    if (cards && this.protocol) {
      if (this.cards) this.printCards(this.cards);
    }

    this.game = game;
    this.cards = cards;
    this.playerId = playerId;
    this.totalScore = 0;
    this.totalGamesPlayed = 0;
    this.children = [];
  }

  mcts() {
    /*if(this.gameJSON.gameEnded) {
            return {
                totalScore: this.totalScore,
                totalGamesPlayed: this.totalGamesPlayed
            }
        }*/

    // selection
    if (this.children.length > 0) {
      this.selection();
    }

    // expansion
    if (this.totalGamesPlayed > 0 && this.children.length == 0) {
      this.expansion();
    }

    // simulation
    if (this.totalGamesPlayed == 0) this.simulate();

    // backpropagation
    return {
      totalScore: this.totalScore,
      totalGamesPlayed: this.totalGamesPlayed,
    };
  }

  simulate() {
    if (this.protocol) {
      console.log("SIMULATE!" + this.totalGamesPlayed + "  " + this.totalScore);
      if (this.card) this.printCards("");
      else console.log("nn");

      if (this.totalGamesPlayed > 0)
        console.log("simulating multiple times " + this.totalGamesPlayed);
    }

    const TIMES_RUNNING = 100;
    let sumSimulatedScores = 0;

    for (let i = 0; i < TIMES_RUNNING; i++) {
      const simGame = new Game(false, this.game.getJSON());
      const playingCardOrder = this.cards.slice();
      // hier neue random games todo, shuffle alle nicht playerId cards

      while (!simGame.gameEnded) {
        if ((simGame.currentPlayer.id = this.playerId)) {
          // play card according to mcts tree if possible
          if (playingCardOrder.length == 0) continue;

          const playingCardWasPossible = simGame.currentPlayer.playCard(
            playingCardOrder.shift()
          );
          if (!playingCardWasPossible) {
            console.log(playingCardOrder);
            console.log(simGame.getJSON());
            break;
          }
        }
        // play random cards for other players
        simGame.currentPlayer.playCard();
      }

      sumSimulatedScores += simGame.players[this.playerId].getTotalScore();
    }

    this.totalScore += sumSimulatedScores / TIMES_RUNNING; // avg score of player with playerId

    if (this.protocol) console.log(sumSimulatedScores / TIMES_RUNNING);

    this.totalGamesPlayed++;
  }

  expansion() {
    if (this.protocol) {
      console.log("EXPAND!" + this.totalGamesPlayed + "  " + this.totalScore);
      if (this.cards) this.printCards("");
      else console.log("nn");
      // console.log(this.gameJSON.players[this.playerId].cards)
    }

    /*
        while (game.currentPlayer.id !== this.playerId) { 
            game.currentPlayer.playCard();
            if (game.gameEnded) {
                console.log("game ended");
                return;
            }
        }*/

    const playableCards = this.game.players[this.playerId].cards;
    const playedCards = this.cards;

    const unplayedCards = playableCards.filter(
      (card) =>
        !playedCards.some(
          (playedCard) =>
            card.suit === playedCard.suit && card.symbol === playedCard.symbol
        )
    );

    for (const card of unplayedCards) {
      // Create a copy of the cards array and add the new card
      const newCards = this.cards.slice();
      newCards.push(card);

      this.children.push(
        new mctsNode(this.game, newCards, this.playerId, this.protocol)
      );
    }

    if (this.children.length > 0) {
      const backpropagation = this.children[0].mcts();
      this.totalGamesPlayed += backpropagation.totalGamesPlayed;
      this.totalScore += backpropagation.totalScore;
    }
  }

  selection() {
    if (this.protocol) {
      console.log("SELECT!" + this.totalGamesPlayed + "  " + this.totalScore);
      if (this.cards) this.printCards("");
      else console.log("nn");
    }

    let maxChild = {
      usc: this.children[0].calculateUCT(this.totalGamesPlayed),
      child: this.children[0],
    };
    for (let i = 1; i < this.children.length; i++) {
      const uscI = this.children[i].calculateUCT(this.totalGamesPlayed);
      if (this.protocol) console.log(i, uscI);
      if (maxChild.usc < uscI) {
        maxChild.usc = uscI;
        maxChild.child = this.children[i];
      }
    }
    if (this.protocol) console.log("MAX", maxChild.usc);

    const backpropagation = maxChild.child.mcts();
    this.totalGamesPlayed += backpropagation.totalGamesPlayed;
    this.totalScore += backpropagation.totalScore;
  }

  calculateUCT(totalGamesPlayedParent) {
    const usc_CONSTANT = 15;
    if (this.totalGamesPlayed == 0) return Number.POSITIVE_INFINITY;
    return (
      this.totalScore / this.totalGamesPlayed +
      usc_CONSTANT *
        Math.sqrt(Math.log(totalGamesPlayedParent) / this.totalGamesPlayed)
    );
  }

  displayTree(indentation = " ") {
    if (this.cards) {
      this.printCards(indentation);
    } else {
      console.log(indentation + "nn");
    }
    for (const child of this.children) {
      child.displayTree(indentation + "  "); // Increase the indentation for each level
    }
  }

  printCards(indentation) {
    for (const card of this.cards) {
      console.log(indentation + card.symbol + " " + card.suit + ",");
    }
  }
}

module.exports = Simulation;
