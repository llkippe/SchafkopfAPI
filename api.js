const Game = require("./game/game.js");
const Simulation = require("./simulation.js");

/*
    - checken ob gamesPlayed und score richtig zusammengezaeg;t wird
    - checken ob es sinn macht immer playerId score zu nehemen -> nein? nodes immer leerer stichm, neue runde
    - checken welche konstante 
    - nicht random speilen lassen 
    - go angeblich nur 1600 durchlaeufe
    - statt besten score zu waehlen anzahl der searches nutzen ?
*/

testData = {
  type: "Sauspiel", // Sauspiel, Wenz, Farbsolo, Ramsch
  suit: "b",
  annPlayer: 1,
  currentPlayer: 0,
  round: 0,
  friendsKnown: false,
  gameEnded: false,

  stack: [],

  players: [
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
  ],
};

testData2 = {
  type: "Sauspiel", // Sauspiel, Wenz, Farbsolo, Ramsch
  suit: "b",
  annPlayer: 1,
  currentPlayer: 1,
  round: 6,
  friendsKnown: false,
  gameEnded: false,

  stack: [
    { card: {
        symbol: "9", 
        suit: "b" 
      },
      playerId: 0
    }
  ],

  players: [
    {
      name: "Player 1",
      cards: [
        { symbol: "10", suit: "s" }
      ],
      friendIds: [],
      score: 7,
    },
    {
      name: "Player 2",
      cards: [
        { symbol: "K", suit: "b" },
        { symbol: "K", suit: "e" }
      ],
      friendIds: [],
      score: 44,
    },
    {
      name: "Player 3",
      cards: [
        { symbol: "A", suit: "b" },
        { symbol: "8", suit: "b" }
        
      ],
      friendIds: [],
      score: 0,
    },
    {
      name: "Player 4",
      cards: [
        { symbol: "8", suit: "e" },
        { symbol: "10", suit: "b" }
      ],
      friendIds: [],
      score: 30,
    },
  ],
};


const game = new Game(false, testData2);
const simulation = new Simulation(game, 1);
console.log(simulation.findBestCard());


/*
const TIMES_RUNNING = 100000;
winnerAvg = [0, 0, 0, 0];
timeAvg = 0;

for (let i = 0; i < TIMES_RUNNING; i++) {
  const startTime = process.hrtime();
  const game = new Game(false, testData);

  while (!game.gameEnded) {
    game.currentPlayer.playCard();
  }
  const winner = game.getWinner();
  for (const w of winner) {
    winnerAvg[w]++;
  }

  const endTime = process.hrtime(startTime);
  const executionTime = endTime[0] * 1000 + endTime[1] / 1000000;
  timeAvg += executionTime;
}

console.log(winnerAvg);

console.log(timeAvg, timeAvg / TIMES_RUNNING);
*/


/*
const game1 = new Game(true ,0, testData);

const game2 = new Game(true, 1, game1.getJSON());


while(!game1.gameEnded) {
game1.currentPlayer.createValidCards();
const validCards1 = game1.currentPlayer.validCards;
game1.currentPlayer.playCard(validCards1[0]);
game2.currentPlayer.createValidCards();
const validCards2 = game2.currentPlayer.validCards;
game2.currentPlayer.playCard(validCards2[0]);
}

const winner1 = game1.getWinner();
console.log(winner1);
const winner2 = game2.getWinner();
console.log(winner2);
*/

//let game = new Game(true ,0, testData);

//while(game.round < 5) {
//game.currentPlayer.createValidCards();
//const validCards = game.currentPlayer.validCards;
//   game.currentPlayer.playCard();
//}

/*
while(!game.gameEnded) {
    const simulation = new Simulation(game,game.currentPlayer.id);
    const card = simulation.findBestCard();
    game.currentPlayer.playCard(card);
    //game = new Game(true,0,game.getJSON());
}*/
