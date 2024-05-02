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
  annPlayer: 0,
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
        
        { symbol: "8", suit: "e" },
        { symbol: "A", suit: "b" }
      ],
      friendIds: [],
      score: 44,
    },
    {
      name: "Player 3",
      cards: [
        { symbol: "K", suit: "b" },
        { symbol: "K", suit: "e" },
      ],
      friendIds: [],
      score: 0,
    },
    {
      name: "Player 4",
      cards: [
        { symbol: "9", suit: "e" },
        { symbol: "10", suit: "b" }
      ],
      friendIds: [],
      score: 30,
    },
  ],
};

testData3 = {
  type: "Sauspiel", // Sauspiel, Wenz, Farbsolo, Ramsch
  suit: "b",
  annPlayer: 2,
  currentPlayer: 0,
  round: 4,
  friendsKnown: false,
  gameEnded: false,

  stack: [],

  players: [
    {
      name: "Player 1",
      cards: [
        { symbol: "A", suit: "s" },
        { symbol: "10", suit: "h" },
        { symbol: "U", suit: "e" },
        { symbol: "9", suit: "s" }
      ],
      friendIds: [],
      score: 7,
    },
    {
      name: "Player 2",
      cards: [
        
        { symbol: "8", suit: "e" },
        { symbol: "O", suit: "h" },
        { symbol: "7", suit: "e" },
        { symbol: "A", suit: "b" }
      ],
      friendIds: [],
      score: 25,
    },
    {
      name: "Player 3",
      cards: [
        { symbol: "K", suit: "b" },
        { symbol: "7", suit: "s" },
        { symbol: "8", suit: "h" },
        { symbol: "K", suit: "e" },
      ],
      friendIds: [],
      score: 0,
    },
    {
      name: "Player 4",
      cards: [
        { symbol: "9", suit: "e" },
        { symbol: "7", suit: "h" },
        { symbol: "U", suit: "s" },
        { symbol: "10", suit: "b" }
      ],
      friendIds: [],
      score: 15,
    },
  ],
};


/*const game = new Game(false,testData3);
game.currentPlayer.playCard()
game.currentPlayer.playCard()
game.currentPlayer.playCard()
game.currentPlayer.playCard()
game.currentPlayer.playCard()
game.print()
game.shuffleCardsApartFrom(0);
game.print();
//const simulation = new Simulation(game);
//console.log(simulation.findBestCard());
*/

test(80);


function test(TIMES_RUNNING, botId = 0, gameData = undefined) {
  
  // play random games
  let winnerAvgRandom = [0, 0, 0, 0];
  let timeAvgRandom = 0;

  let winnerAvgSim = [0, 0, 0, 0];
  let timeAvgSim = 0; 

  for (let i = 0; i < TIMES_RUNNING; i++) {
    let gameRandom;
    if(gameData) gameRandom = new Game(false, gameData); 
    else gameRandom = new Game(false)
    const gameSim = new Game(false, gameRandom.getJSON());

    const startTimeRandom = process.hrtime();

    while (!gameRandom.gameEnded) {
      gameRandom.currentPlayer.playCard();
    }
    
    const winnerRandom = gameRandom.getWinner();
    for (const w of winnerRandom) {
      winnerAvgRandom[w]++;
    }

    const endTimeRandom = process.hrtime(startTimeRandom);
    const executionTimeRandom = endTimeRandom[0] * 1000 + endTimeRandom[1] / 1000000;
    timeAvgRandom += executionTimeRandom;
  
    // play sim games
    const startTimeSim = process.hrtime();

    while (!gameSim.gameEnded) {
      if(gameSim.currentPlayer.id == botId) {
        const simulation = new Simulation(gameSim);
        gameSim.currentPlayer.playCard(simulation.findBestCard());
        continue;
      }
      gameSim.currentPlayer.playCard();
    } 
    const winnerSim = gameSim.getWinner();
    for (const w of winnerSim) {
      winnerAvgSim[w]++;
    }

    const endTimeSim = process.hrtime(startTimeSim);
    const executionTimeSim = endTimeSim[0] * 1000 + endTimeSim[1] / 1000000;
    timeAvgSim += executionTimeSim;
  } 
  

  console.log(`TEST  TIMES RUNNING: ${TIMES_RUNNING}, BOTID: ${botId}`)
  console.log(`random winner:    ${winnerAvgRandom}`);
  console.log(`random simulaton: ${winnerAvgSim}`);
  console.log(`TIME per game`)
  console.log(`random    ${(timeAvgRandom / TIMES_RUNNING).toFixed(2)}ms`)
  console.log(`simulated ${(timeAvgSim / TIMES_RUNNING).toFixed(2)}ms`)
  const performanceIncreasse =  (winnerAvgSim[botId] / winnerAvgRandom[botId] * 100 - 100).toFixed(2);
  console.log(`Performance Boost:  ${performanceIncreasse}%`);
}



