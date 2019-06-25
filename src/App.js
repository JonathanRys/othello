import React, { useState } from "react";
import "./App.css";
import Board from "./Board.js";

const BLACK = false;
const WHITE = true;

const startingGrid = [
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, WHITE, BLACK, null, null, null],
  [null, null, null, BLACK, WHITE, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null]
];

const startingScore = [2, 2];

const cloneBoard = board => {
  const newBoard = [];
  for (let i = 0; i < board[0].length; i++) {
    newBoard[i] = [];
    for (let j = 0; j < board.length; j++) {
      newBoard[i][j] = board[i][j];
    }
  }
  return newBoard;
};

const App = () => {
  const [playersTurn, setPlayersTurn] = useState(BLACK);
  const [isLoading, setIsLoading] = useState(false);
  const [score, setScore] = useState([...startingScore]);
  const [boardMap, setBoardMap] = useState(cloneBoard(startingGrid));
  const [lastBoardMap, setLastBoardMap] = useState(null);
  const [gameOver, setGameOver] = useState(false);

  const updateBoardMap = (x, y) => {
    const newBoardMap = boardMap;
    newBoardMap[x][y] = playersTurn;

    setBoardMap(newBoardMap);
  };

  const setLoading = name => {
    setIsLoading(name);
    setTimeout(() => setIsLoading(false), 603);
  };

  const flipChips = (x, y, paths) => {
    paths.forEach(path => {
      let localX = +x + path.i;
      let localY = +y + path.j;

      while (boardMap[localX][localY] !== playersTurn) {
        if (boardMap[localX][localY] === !playersTurn) {
          const newScore = score;
          newScore[+playersTurn] += 1;
          newScore[+!playersTurn] -= 1;
          setScore(newScore);
          if (newScore[+BLACK] + newScore[+WHITE] === 64) {
            // Somebody won
            setGameOver(true);
          }
        }
        updateBoardMap(localX, localY);

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

    // This function needs to be in scope
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
    // Exclude events on elements lacking coordinates
    if (!e.target.hasAttribute("x") || !e.target.hasAttribute("y")) {
      return false;
    }
    const x = e.target.getAttribute("x");
    const y = e.target.getAttribute("y");

    const validPaths = isValid(x, y);

    if (validPaths) {
      setLastBoardMap(cloneBoard(boardMap));
      // add the new chip to the board
      updateBoardMap(x, y);

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
    if (gameOver) {
      setBoardMap(cloneBoard(startingGrid));
      setScore([...startingScore]);
      // @todo JR figure out the number of moves left and set gameOver if 0 for each
      setPlayersTurn(BLACK);
      setGameOver(false);
    } else {
      setLoading("pass");
      setPlayersTurn(!playersTurn);
    }
  };

  const handleUndo = () => {
    setLoading("undo");
    setBoardMap(lastBoardMap);
    setLastBoardMap(null);
    setPlayersTurn(!playersTurn);
  };

  const getScore = player => {
    const playerScore = score[+player];
    const opponentScore = score[+!player];
    if (gameOver) {
      if (playerScore > opponentScore) {
        return <span className="winner">{playerScore}</span>;
      } else if (playerScore < opponentScore) {
        return <span className="loser">{playerScore}</span>;
      }
    }

    return playerScore;
  };

  let gameStatus = playersTurn === BLACK ? "Black's turn" : "White's turn";

  const getCurrentScore = () => {
    const blackScore = score[0];
    const whiteScore = score[1];

    if (blackScore === whiteScore) {
      return null;
    } else if (blackScore > whiteScore) {
      return 0;
    } else {
      return 1;
    }
  };

  if (gameOver) {
    if (getCurrentScore()) {
      gameStatus = "White wins!";
    } else if (getCurrentScore() === 0) {
      gameStatus = "Black Wins!";
    }
  }

  return (
    <div className="App">
      <header className="header">Othello</header>
      <div className="panel">
        <div>{gameStatus}</div>
        <div>
          <span>Score: </span>
          {getScore(BLACK)}
          <span> / </span>
          {getScore(WHITE)}
        </div>
        <button
          className="button"
          disabled={isLoading === "pass"}
          onClick={handlePass}
        >
          {gameOver ? "New Game" : "Pass"}
        </button>
      </div>
      <Board map={boardMap} onClick={handleClick} />
      <div className="panel right">
        <button
          className="button"
          disabled={lastBoardMap === null || isLoading === "undo"}
          onClick={handleUndo}
        >
          Undo
        </button>
      </div>
    </div>
  );
};

export default App;

export { startingGrid };
