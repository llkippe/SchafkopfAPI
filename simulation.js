const Game = require('./game/game.js');


class Simulation {
    constructor(game, playerId) {
        this.playerId = playerId;
        this.game = game;
        this.root = null;
        this.protocol = false;
    }

    findBestCard() {
        this.root = new mctsNode(this.game.getJSON(), null, this.playerId, this.protocol);
        const mctsDepth = 100;


        for (let i = 0; i < mctsDepth; i++) {
            this.root.mcts();
            this.root.displayTree();
            if (this.protocol) console.log(this.root.children.length);
        }

        let maxChild = {
            usb: this.root.children[0].calculateUSB(this.root.totalGamesPlayed),
            child: this.root.children[0]
        }

        for (let i = 1; i < this.root.children.length; i++) {
            const usbI = this.root.children[i].calculateUSB(this.root.totalGamesPlayed)
            if (maxChild.usb < usbI) {
                maxChild.usb = usbI;
                maxChild.child = this.root.children[i];
            }
        }

        return maxChild.child.card;
    }
}

class mctsNode {
    constructor(gameJSON, card, playerId, protocol) {
        this.protocol = protocol


        if (card && this.protocol) {
            console.log("created node playing " + card.symbol + " " + card.suit + "   " + playerId);
            console.log(gameJSON.players[playerId]);
        }

        this.gameJSON = gameJSON;
        this.card = card;
        this.playerId = playerId;
        this.totalScore = 0; // avg around simulated games (for example divided by 100 when 100 games simulated)
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
            totalGamesPlayed: this.totalGamesPlayed
        }
    }

    simulate() {
        if (this.protocol) {
            console.log("SIMULATE!" + this.totalGamesPlayed + "  " + this.totalScore);
            if (this.card) console.log(this.card.symbol + this.card.suit);
            else console.log("nn");
            console.log(this.gameJSON.players[this.playerId].cards)

            if (this.totalGamesPlayed > 0) console.log("simulating multiple times " + this.totalGamesPlayed);
        }

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

        if (this.protocol) console.log(avgScore / TIMES_RUNNING);

        this.totalGamesPlayed++;
    }

    expansion() {
        if (this.protocol) {
            console.log("EXPAND!" + this.totalGamesPlayed + "  " + this.totalScore);
            if (this.card) console.log(this.card.symbol + this.card.suit);
            else console.log("nn");
            console.log(this.gameJSON.players[this.playerId].cards)
        }



        const game = new Game(false, 0, this.gameJSON);


        while (game.currentPlayer.id !== this.playerId) {
            game.currentPlayer.playCard();
            if (game.gameEnded) {
                console.log("game ended");
                return;
            }
        }


        game.currentPlayer.createValidCards();
        const validCards = game.currentPlayer.validCards;

        for (const card of validCards) {
            const branchGame = new Game(false, 0, this.gameJSON);
            branchGame.currentPlayer.playCard(card);
            this.children.push(new mctsNode(branchGame.getJSON(), card, this.playerId, this.protocol));
        }

        const backpropagation = this.children[0].mcts();
        this.totalGamesPlayed += backpropagation.totalGamesPlayed;
        this.totalScore += backpropagation.totalScore;

    }


    selection() {
        if (this.protocol) {
            console.log("SELECT!" + this.totalGamesPlayed + "  " + this.totalScore);
            if (this.card) console.log(this.card.symbol + this.card.suit);
            else console.log("nn");
            console.log(this.gameJSON.players[this.playerId].cards)
        }
        let maxChild = {
            usb: this.children[0].calculateUSB(this.totalGamesPlayed),
            child: this.children[0]
        }

        if (this.protocol) console.log(0, maxChild.usb);



        for (let i = 1; i < this.children.length; i++) {
            const usbI = this.children[i].calculateUSB(this.totalGamesPlayed)
            if (this.protocol) console.log(i, usbI);
            if (maxChild.usb < usbI) {
                maxChild.usb = usbI;
                maxChild.child = this.children[i];
            }
        }

        if (this.protocol) console.log("MAX", maxChild.usb);

        const backpropagation = maxChild.child.mcts();
        this.totalGamesPlayed += backpropagation.totalGamesPlayed;
        this.totalScore += backpropagation.totalScore;
    }

    calculateUSB(totalScoreParent) {
        const USB_CONSTANT = 1;
        if (this.totalGamesPlayed == 0) return Number.POSITIVE_INFINITY;
        return this.totalScore / this.totalGamesPlayed + USB_CONSTANT * Math.sqrt(Math.log(totalScoreParent) / this.totalGamesPlayed);
    }

    displayTree(indentation = ' ') {
        if (this.card) {
            console.log(indentation + this.card.symbol + this.card.suit);
        } else {
            console.log(indentation + "nn");
        }
        for (const child of this.children) {
            child.displayTree(indentation + '  '); // Increase the indentation for each level

        }
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
