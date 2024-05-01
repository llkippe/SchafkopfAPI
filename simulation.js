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
    const mctsDepth = 10;

    // evalute more when its a first card, maybe with higher exploration?

    for (let i = 0; i < mctsDepth; i++) {
      this.root.mcts();
    }

    //console.log("displaying tree")
   // this.root.displayTree();

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

    return maxChild.child.card;
  }
}




class mctsNode {
  constructor(game, card, playerCardIdChild, botId, protocol) {
    this.protocol = protocol;

    if (card && this.protocol) {
      console.log(this.card); 
    }

    this.game = game;
    this.card = card;
    this.botId = botId;
    this.playerCardIdChild = playerCardIdChild;
    this.totalScore = 0;
    this.totalGamesPlayed = 0;
    this.children = [];
  }

  mcts() {
    // make a node for each player and let them play as good as possible for them using mcts
    if(this.game.gameEnded) {
      return {
        totalScore: this.game.players[this.playerCardIdChild].getTotalScore(), // the score of the player that played the last card
        totalGamesPlayed: 1,
      };
    }

    // selection
    // select the next child to look for based on UCT score
    if (this.children.length > 0) {
      this.selection();
    }

    // expansion
    // expand after the own was simulated
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
      console.log(`SIMULATE!"  playerid: ${this.playerCardIdChild}, games played: ${this.totalGamesPlayed}, totalScore: ${this.totalScore}`);
      if (this.card) console.log(this.card.symbol + " " + this.card.suit);
      else console.log("nn");
    }

    const TIMES_RUNNING = 100;
    let sumSimulatedScores = 0;

    for (let i = 0; i < TIMES_RUNNING; i++) {
      const simGame = this.determinize(new Game(false, this.game.getJSON()));

      while (!simGame.gameEnded) {
        simGame.currentPlayer.playCard();
      }
      
      // TODO not the current player but the player who played the last card
      // use the scores always for the currentplayer not the player we want to choose the card for in the end
      sumSimulatedScores += simGame.players[this.playerCardIdChild].getTotalScore();
    }

    this.totalScore += sumSimulatedScores / TIMES_RUNNING; // avg score of player with playerId

    if (this.protocol) console.log(sumSimulatedScores / TIMES_RUNNING);

    this.totalGamesPlayed++;
  }

  expansion() {
    if (this.protocol) {
      console.log("EXPAND!" + this.totalGamesPlayed + "  " + this.totalScore);
      if (this.card) console.log(this.card.symbol + " " + this.card.suit);
      else console.log("nn");
      // console.log(this.gameJSON.players[this.playerId].cards)
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

    if (this.children.length > 0) {
      const backpropagation = this.children[0].mcts();
      this.totalGamesPlayed += backpropagation.totalGamesPlayed;
      this.totalScore += backpropagation.totalScore;
    }
  }

  selection() {
    if (this.protocol) {
      console.log("SELECT!" + this.totalGamesPlayed + "  " + this.totalScore);
      if (this.card) console.log(this.card.symbol + " " + this.card.suit);
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


     // TODO: add and subtract the scores depending if its own or enemies score
    const backpropagation = maxChild.child.mcts();
    this.totalGamesPlayed += backpropagation.totalGamesPlayed;
    this.totalScore += backpropagation.totalScore;
  }

  determinize(detGame) {
    if (this.protocol) {
      console.log("DETERMINIZE!" + this.totalGamesPlayed + "  " + this.totalScore);
      if (this.card) console.log(this.card.symbol + " " + this.card.suit);
      else console.log("nn");
    }

    let playerCards = [];

    detGame.players.forEach(player => {
      if(this.botId == player.id) playerCards.push([]);
      else playerCards.push(player.cards); 
    });  

    const playerCardsNew = this.shuffleElementsAmongArrays(playerCards[0],playerCards[1],playerCards[2],playerCards[3]);

    detGame.players.forEach(player => {
      if(this.botId != player.id) player.cards = playerCardsNew[player.id];
      // else in first 30% also shuffle my cards ? https://www.youtube.com/watch?v=IQLkPgkLMNg
    });

    // include step to make annc player cards better than other cards of non anc players

    // if ann player has ruf ass dann swape karten !!!!
    if(detGame.players[detGame.settings.annPlayer].isAnnoucedAceInCards()) {
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

 

  calculateUCT(totalGamesPlayedParent) {
    const usc_CONSTANT = 10; // which is higher exploratiopn which explotation
    if (this.totalGamesPlayed == 0) return Number.POSITIVE_INFINITY;
    return (
      this.totalScore / this.totalGamesPlayed +
      usc_CONSTANT * Math.sqrt(Math.log(totalGamesPlayedParent) / this.totalGamesPlayed)
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
