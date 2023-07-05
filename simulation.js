const Game = require('./game/game.js');


class Simulation {
    constructor(game, playerId) {
        this.playerId = playerId;
        this.game = game;
    }

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
    }

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
}

module.exports = Simulation;
