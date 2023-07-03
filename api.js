const Game = require('./game/game.js');
const Card = require('./game/card.js');



testData = {
    "type": "Sauspiel", // Sauspiel, Wenz, Farbsolo
    "suit": "e",

    "players": [
        {
            "name": "Player 1",
            "cards": [
                
                { "symbol": "A", "suit": "b" },
                { "symbol": "A", "suit": "h" },
                { "symbol": "10", "suit": "s" },
                { "symbol": "K", "suit": "e" },
                { "symbol": "O", "suit": "s" },
                { "symbol": "U", "suit": "e" },
                { "symbol": "9", "suit": "b" },
                { "symbol": "9", "suit": "s" }
            ]
        },
        {
            "name": "Player 2",
            "cards": [
                { "symbol": "O", "suit": "b" },
                { "symbol": "O", "suit": "h" },
                { "symbol": "9", "suit": "h" },
                { "symbol": "7", "suit": "h" },
                { "symbol": "K", "suit": "s" },
                { "symbol": "A", "suit": "e" },
                { "symbol": "8", "suit": "b" },
                { "symbol": "8", "suit": "s" }
            ]
        },
        {
            "name": "Player 3",
            "cards": [
                { "symbol": "K", "suit": "b" },
                { "symbol": "K", "suit": "h" },
                { "symbol": "O", "suit": "e" },
                { "symbol": "U", "suit": "b" },
                { "symbol": "U", "suit": "h" },
                { "symbol": "10", "suit": "e" },
                { "symbol": "10", "suit": "h" },
                { "symbol": "7", "suit": "s" }
            ]
        },
        {
            "name": "Player 4",
            "cards": [
                { "symbol": "8", "suit": "e" },
                { "symbol": "8", "suit": "h" },
                { "symbol": "7", "suit": "e" },
                { "symbol": "7", "suit": "b" },
                { "symbol": "A", "suit": "s" },
                { "symbol": "U", "suit": "s" },
                { "symbol": "9", "suit": "e" },
                { "symbol": "10", "suit": "b" }
            ]
        }
    ]
}

winnerAvg = [0,0,0,0];
timeAvg = 0;

for(let i = 0; i < 100000; i++) {
    const startTime = process.hrtime();
    const game = new Game(false ,i, testData);
    while(!game.gameEnded) {
        game.currentPlayer.playCard();
    }
    const winner = game.getWinner();
    winnerAvg[winner-1]++;
    const endTime = process.hrtime(startTime);
    const executionTime = (endTime[0] * 1000) + (endTime[1] / 1000000);
    timeAvg += executionTime;
}


console.log(winnerAvg);

console.log(timeAvg/1000);







