import React, { useState } from "react";
import "./App.css";
import Board from "./Board.js";

const boardMap = [
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, true, false, null, null, null],
  [null, null, null, false, true, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null]
];

const App = () => {
  const [playersTurn, setPlayersTurn] = useState(false);

  const flipChips = (x, y, paths) => {
    paths.forEach(path => {
      let localX = +x + path.i;
      let localY = +y + path.j;

      while (boardMap[localX][localY] !== playersTurn) {
        boardMap[localX][localY] = playersTurn;
        localX += path.i;
        localY += path.j;
      }
    });
  };

  const isOnBoard = (x, y) => {
    return x > 0 && y > 0 && x < boardMap[0].length && y < boardMap.length;
  };

  const isValid = (x, y) => {
    const adjacentTiles = [];
    if (!x || !y || boardMap[x][y] !== null) return false;

    for (let i = -1; i < 2; i++) {
      const testX = +x + i;

      for (let j = -1; j < 2; j++) {
        const testY = +y + j;

        if (
          !(+x === 0 && +y === 0) &&
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

      while (boardMap[localX][localY] !== null) {
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
      flipChips(x, y, validPaths);
      setPlayersTurn(!playersTurn);
    }
  };

  return (
    <div className="App">
      <header style={styles.header}>Othello</header>
      <div>Player's turn: {playersTurn === false ? "black" : "white"}</div>
      <div onClick={handleClick}>
        <Board map={boardMap} />
      </div>
    </div>
  );
};

const styles = {
  header: {
    fontSize: "24px",
    fontWeight: "bold",
    padding: "20px"
  }
};

export default App;
