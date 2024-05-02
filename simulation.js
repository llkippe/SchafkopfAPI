const Game = require("./game/game.js");
const Card = require('./game/card.js');

class Simulation {
  constructor(game) {
    this.botId = game.currentPlayer.id;
    this.game = game;
    this.root = null;
    this.protocol = false;
  }

  findBestCard() {
    if (this.game.round == 7) {
      // only one card on hand left, recommand this card
      this.game.currentPlayer.createValidCards();
      const validCards = this.game.currentPlayer.validCards;
      return validCards[0];
    }

    this.root = new mctsNode(this.game, [], this.botId, this.botId, this.protocol);
    const mctsDepth = 100;

    // evalute more when its a first card, maybe with higher exploration?

    for (let i = 0; i < mctsDepth; i++) {
      this.root.mcts();
    }

    //console.log("displaying tree")
    //this.root.displayTree();

    let maxChild = {
      avgScore:
        this.root.children[0].totalScore /
        this.root.children[0].gamesPlayed,
      child: this.root.children[0],
    };

    for (let i = 1; i < this.root.children.length; i++) {
      const avgScore =
        this.root.children[i].totalScore /
        this.root.children[i].gamesPlayed;

      if (maxChild.avgScore < avgScore) {
        maxChild.avgScore = avgScore;
        maxChild.child = this.root.children[i];
      }
    }

    return maxChild.child.card;
  }
}



class mctsNode {
  constructor(game, card, playerCardId, botId, protocol) {
    this.protocol = protocol;

    if (card && this.protocol) {
      console.log(this.card); 
    }

    this.game = game;
    this.card = card;
    this.botId = botId;
    this.playerCardId = playerCardId;
    this.scores = [0,0,0,0];
    this.gamesPlayed = 0;
    this.children = [];
  }

  mcts() {
    // make a node for each player and let them play as good as possible for them using mcts
    if(this.game.gameEnded) {
      return {
        scores: this.game.getTotalScores(),
        gamesPlayed: 1
      };
    }

    // selection
    // select the next child to look for based on UCT score
    if (this.children.length > 0) {
      this.selection();
    }

    // expansion
    // expand after the own was simulated
    if (this.gamesPlayed > 0 && this.children.length == 0) {
      this.expansion();
    }

    // simulation
    if (this.gamesPlayed == 0) this.simulate();

    // backpropagation
    return {
      scores: this.scores,
      gamesPlayed: this.gamesPlayed,
    };
  }

  simulate() {
    if (this.protocol) {
      console.log(`SIMULATE!"  playerid: ${this.playerCardId}, games played: ${this.gamesPlayed}, scores: ${this.scores}`);
      if (this.card) console.log(this.card.symbol + " " + this.card.suit);
      else console.log("nn");
    }

    const TIMES_RUNNING = 50;
    let sumSimulatedScores = [0,0,0,0];

    for (let i = 0; i < TIMES_RUNNING; i++) {
      const simGame = this.determinize(new Game(false, this.game.getJSON()));

      while (!simGame.gameEnded) {
        simGame.currentPlayer.playCard();
      }
    
      // save all scores
      const endScore = simGame.getTotalScores();
      for(let i = 0; i < 4; i++) {
        sumSimulatedScores[i] += endScore[i];
      }
    }

    // add avg of simulation to node scores
    for(let i = 0; i < 4; i++) {
      this.scores[i] += sumSimulatedScores[i] / TIMES_RUNNING;
    }

    if (this.protocol) {
      console.log(this.scores);
    }

    this.gamesPlayed++;
  }

  expansion() {
    if (this.protocol) {
      console.log("EXPAND!" + this.gamesPlayed + "  " + this.scores);
      if (this.card) console.log(this.card.symbol + " " + this.card.suit);
      else console.log("nn");
    }

    this.game.currentPlayer.createValidCards();
    const playableCards = this.game.currentPlayer.validCards;
    
    for (const card of playableCards) {
      // create a deep copy of the game, and play the card
      let childGame = new Game(false, this.game.getJSON());
      let playerCardIdChild = childGame.currentPlayer.id;
      childGame.currentPlayer.playCard(card);

      this.children.push(
        new mctsNode(childGame, card, playerCardIdChild, this.botId, this.protocol)
      );
    }

    // TODO: add and subtract the scores depending if its own or enemies score create function

    // TODO: does this step need to be here? wouldnt also be selected in next round of selection
    if (this.children.length > 0) {
      const backpropagation = this.children[0].mcts();
      this.gamesPlayed += backpropagation.gamesPlayed;
      for(let i = 0; i < 4; i++) {
        this.scores[i] += backpropagation.scores[i];
      }
    }
  }

  selection() {
    if (this.protocol) {
      console.log("SELECT!" + this.gamesPlayed + "  " + this.scores);
      if (this.card) console.log(this.card.symbol + " " + this.card.suit);
      else console.log("nn");
    }

    let maxChild = {
      usc: this.children[0].calculateUCT(this.gamesPlayed),
      child: this.children[0],
    };

    for (let i = 1; i < this.children.length; i++) {
      const uscI = this.children[i].calculateUCT(this.gamesPlayed);
      if (this.protocol) console.log(i, uscI);
      if (maxChild.usc < uscI) {
        maxChild.usc = uscI;
        maxChild.child = this.children[i];
      }
    }
    if (this.protocol) console.log("MAX", maxChild.usc);


     // TODO: add and subtract the scores depending if its own or enemies score
    const backpropagation = maxChild.child.mcts();
    this.gamesPlayed += backpropagation.gamesPlayed;
    for(let i = 0; i < 4; i++) {
      this.scores[i] += backpropagation.scores[i];
    }
  }

  determinize(detGame) {
    if (this.protocol) {
      console.log("DETERMINIZE!" + this.gamesPlayed + "  " + this.scores);
      if (this.card) console.log(this.card.symbol + " " + this.card.suit);
      else console.log("nn");
    }


    detGame.shuffleCardsApartFrom(this.botId);
    // else in first 30% also shuffle my cards ? https://www.youtube.com/watch?v=IQLkPgkLMNg

    // include step to make annc player cards better than other cards of non anc players
    

    // if ann player has ruf ass dann swape karten !!!!
   /* if(detGame.players[detGame.settings.annPlayer].isAnnoucedAceInCards()) {
      const annAce = {symbol: "A", suit: detGame.settings.suit};

      // remove ace
      detGame.players[detGame.settings.annPlayer].removeCard(annAce);

      let cardAdded = false
      detGame.players.forEach(player => {
        if(!cardAdded && detGame.settings.annPlayer != player.id && this.botId != player.id) {
          const swapCard = player.cards.shift();

          // add first card from swaping partner 
          detGame.players[detGame.settings.annPlayer].cards.push(swapCard);
          // add ace to swaping partner
          player.cards.push(new Card(detGame, annAce.symbol, annAce.suit));
          
          cardAdded = true;
        } 
      });
    }
*/
    return detGame;
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

 

  calculateUCT(gamesPlayedParent) {
    const usc_CONSTANT = 10; // which is higher exploratiopn which explotation
    if (this.gamesPlayed == 0) return Number.POSITIVE_INFINITY;
    return (
      this.scores[this.playerCardId] / this.gamesPlayed +
      usc_CONSTANT * Math.sqrt(Math.log(gamesPlayedParent) / this.gamesPlayed)
    );
  }


  displayTree(indentation = " ") {
    if (this.card) {
      console.log(indentation + this.card.symbol + " " + this.card.suit + ",");
    } else {
      console.log(indentation + "nn");
    }
    for (const child of this.children) {
      child.displayTree(indentation + "  "); // Increase the indentation for each level
    }
  }
}

module.exports = Simulation;
