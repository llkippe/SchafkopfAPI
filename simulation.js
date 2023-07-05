const Game = require('./game/game.js');


class Simulation {
    constructor(game, playerId) {
        this.playerId = playerId;
        this.game = game;
        this.root = null;
    }

    findBestCard() {
        this.root = new mctsNode(this.game.getJSON(), null, this.playerId);
        const mctsDepth = 100;


        for(let i = 0; i < mctsDepth; i++) {
            this.root.mcts();
        }


        let maxChild = {
            usb: this.root.children[0].calculateUSB(this.root.totalGamesPlayed),
            child: this.root.children[0]
        }
        
        for(let i = 1; i < this.root.children.length; i++) {
            const usbI = this.root.children[i].calculateUSB(this.root.totalGamesPlayed)
            if(maxChild.usb < usbI) {
                maxChild.usb = usbI;
                maxChild.child = this.root.children[i];
            }
        }

        return maxChild.child.card;
    }
}
 
class mctsNode {
    constructor(gameJSON, card, playerId) {
        if(card) console.log("created node playing " + card.symbol + " " + card.suit);
        this.gameJSON = gameJSON;
        this.card = card;
        this.playerId = playerId;
        this.totalScore = 0; // avg around simulated games (for example divided by 100 when 100 games simulated)
        this.totalGamesPlayed = 0;
        this.children = [];
    }

    mcts() {
        // selection
        if(this.children.length > 0) {
            this.selection();
        }

        // expansion
        if(this.totalGamesPlayed > 0) {
            this.expansion();
        }

        // simulation
        if(this.totalGamesPlayed == 0) this.simulate();

        // backpropagation
        return {
            totalScore: this.totalScore,
            totalGamesPlayed: this.totalGamesPlayed
        }
    }

    simulate() {
        if(this.totalGamesPlayed > 0) console.log("simulating multiple times " + this.totalGamesPlayed);

        const TIMES_RUNNING = 1000;
        let avgScore = 0;

        for (let i = 0; i < TIMES_RUNNING; i++) {
            const game = new Game(false, i, this.gameJSON);

            while (!game.gameEnded) {
                game.currentPlayer.playCard();
            }
            avgScore += game.players[this.playerId].getTotalScore();
        }
        this.totalScore += avgScore / TIMES_RUNNING; // avg score of player with playerId
        this.totalGamesPlayed++;
    }

    expansion() {
        const game = new Game(false, 0, this.gameJSON);
        game.currentPlayer.createValidCards();
        const validCards = game.currentPlayer.validCards;
        validCards.forEach(card => {
            const branchGame = new Game(false,0,this.gameJSON);
            branchGame.currentPlayer.playCard(card);
            this.children.push(new mctsNode(branchGame.getJSON(), card,this.playerId));
        });
        
        const backpropagation = this.children[0].mcts();
        this.totalGamesPlayed += backpropagation.totalGamesPlayed;
        this.totalScore += backpropagation.totalScore;
    }

    selection() {
        let maxChild = {
            usb: this.children[0].calculateUSB(this.totalGamesPlayed),
            child: this.children[0]
        }
        
        for(let i = 1; i < this.children.length; i++) {
            const usbI = this.children[i].calculateUSB(this.totalGamesPlayed)
            if(maxChild.usb < usbI) {
                maxChild.usb = usbI;
                maxChild.child = this.children[i];
            }
        }

        const backpropagation = maxChild.child.mcts();
        this.totalGamesPlayed += backpropagation.totalGamesPlayed;
        this.totalScore += backpropagation.totalScore;
    }

    calculateUSB(totalScoreParent) {
        const USB_CONSTANT = 2;
        if(this.totalGamesPlayed == 0) return Number.POSITIVE_INFINITY;
        return this.totalScore / this.totalGamesPlayed + USB_CONSTANT * Math.sqrt(Math.log(totalScoreParent) / this.totalGamesPlayed);
    }
}  


module.exports = Simulation;




/*
    findBestCard() {
        let bestBranch = {
            card: null,
            avgWin: 0
        };

        this.game.currentPlayer.createValidCards();
        const validCards = this.game.currentPlayer.validCards;
        validCards.forEach(card => {
            const avgWin = this.simulateBranch(this.game.getJSON(), card);
            if(avgWin > bestBranch.avgWin) {
                bestBranch = {
                    card: card,
                    avgWin: avgWin
                }
            }
        });
        return bestBranch;
    }

    simulateBranch(gameJSON, card) {
        const TIMES_RUNNING = 5000;
        let winnerAvg = [0, 0, 0, 0];

        for (let i = 0; i < TIMES_RUNNING; i++) {
            const game = new Game(false, i, gameJSON);
            game.currentPlayer.playCard(card);

            while (!game.gameEnded) {
                game.currentPlayer.playCard();
            }
            const winner = game.getWinner();
            for (const w of winner) winnerAvg[w]++;
        }

        
        return winnerAvg[this.playerId] / TIMES_RUNNING;
    }*/

    /*
        findBestCard() {
            while (this.games.length > 0) {
                
                const gameInfo = this.games[0];
                if (gameInfo.game.gameEnded) {
                    const playerScore = gameInfo.game.players[this.playerId].getTotalScore(); 
                    if(playerScore > this.bestPath.score) {
                        this.bestPath.path = gameInfo.path;
                        this.bestPath.score = playerScore;
                    }
                    
    
                    this.games.shift(); // Remove the completed game from the front of the queue
                } else {
                    gameInfo.game.currentPlayer.createValidCards();
                    const validCards = gameInfo.game.currentPlayer.validCards;
                    validCards.forEach(card => {
                        this.newGame(gameInfo, card);
                    });
    
                    this.games.shift(); // Remove the current game from the front of the queue
                }
            }
    
            return this.bestPath;
        }
    
        newGame(gameInfo, card) {
            const game = new Game(false, this.games.length, gameInfo.game.getJSON());
            const path = [...gameInfo.path];
            //console.log(game.currentPlayer.id, game.currentPlayer.nextPlayer.id, game.id);
            //card.print();
    
            game.currentPlayer.playCard(card);
            path.push(card);
            
            this.games.push({
                game: game,
                path: path
            });
        }
        */
