import React, { useState } from "react";
import "./App.css";
import Board from "./Board.js";

const BLACK = false;
const WHITE = true;

const boardMap = [
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, WHITE, BLACK, null, null, null],
  [null, null, null, BLACK, WHITE, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null]
];

const App = () => {
  const [playersTurn, setPlayersTurn] = useState(BLACK);
  const [isLoading, setIsLoading] = useState(false);
  const [score, setScore] = useState([2, 2]);

  const flipChips = (x, y, paths) => {
    paths.forEach(path => {
      let localX = +x + path.i;
      let localY = +y + path.j;

      while (boardMap[localX][localY] !== playersTurn) {
        console.log(boardMap[localX][localY] === !playersTurn);
        if (boardMap[localX][localY] === !playersTurn) {
          const newScore = score;
          newScore[+playersTurn] += 1;
          newScore[+!playersTurn] -= 1;
          setScore(newScore);
        }
        boardMap[localX][localY] = playersTurn;

        localX += path.i;
        localY += path.j;
      }
    });
  };

  const isOnBoard = (x, y) => {
    return x >= 0 && y >= 0 && x < boardMap[0].length && y < boardMap.length;
  };

  const isValid = (x, y) => {
    const adjacentTiles = [];
    if ([x, y].includes(undefined) || boardMap[x][y] !== null) return false;

    for (let i = -1; i < 2; i++) {
      const testX = +x + i;

      for (let j = -1; j < 2; j++) {
        const testY = +y + j;

        if (
          isOnBoard(testX, testY) &&
          boardMap[testX][testY] === !playersTurn
        ) {
          // store adjacent opponent tiles
          adjacentTiles.push({ i: i, j: j });
        }
      }
    }

    const findValidPaths = tile => {
      let localX = +x + tile.i;
      let localY = +y + tile.j;
      // Check for validity first
      while (isOnBoard(localX, localY) && boardMap[localX][localY] !== null) {
        if (boardMap[localX][localY] === playersTurn) {
          return true;
        }
        localX += tile.i;
        localY += tile.j;
      }

      return false;
    };

    const paths = adjacentTiles.filter(findValidPaths);

    return paths.length ? paths : false;
  };

  const handleClick = e => {
    const x = e.target.getAttribute("x");
    const y = e.target.getAttribute("y");

    const validPaths = isValid(x, y);

    if (validPaths) {
      boardMap[x][y] = playersTurn;
      // Adjust the score
      const newScore = score;
      newScore[+playersTurn] += 1;
      setScore(newScore);
      // Flip the chips in between and cycle the turn
      flipChips(x, y, validPaths);
      setPlayersTurn(!playersTurn);
    }
  };

  const handlePass = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
    setPlayersTurn(!playersTurn);
  };

  const getScore = player => {
    return playersTurn === player ? `(${score[+player]})` : score[+player];
  };

  return (
    <div className="App">
      <header className="header">Othello</header>
      <div className="panel">
        <div>Player's turn: {playersTurn === BLACK ? "Black" : "White"}</div>
        <div>{`Score: ${getScore(BLACK)} / ${getScore(WHITE)}`}</div>
        <button className="button" disabled={isLoading} onClick={handlePass}>
          Pass
        </button>
      </div>
      <div onClick={handleClick}>
        <Board map={boardMap} />
      </div>
    </div>
  );
};

export default App;
