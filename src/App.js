import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import Board from "./Board.js";

/* Globals */
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

/* Helpers */
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

const isOnBoard = (board, x, y) => {
  return x >= 0 && y >= 0 && x < board[0].length && y < board.length;
};

const isSelf = (x, y) => x === 0 && y === 0;

/* Scoring Functions */
const findActiveNeighbors = (board, tile) => {
  const activeTiles = [];
  const availableTiles = [];

  for (let i = -1; i < 2; i++) {
    const x = tile.i + i;
    for (let j = -1; j < 2; j++) {
      const y = tile.j + j;
      const neighbor = {
        i: tile.i,
        j: tile.j,
        x: x,
        y: y
      };

      if (isSelf(i, j) || !isOnBoard(board, x, y)) continue;

      if (board[x][y] !== null) {
        activeTiles.push(neighbor);
      } else {
        availableTiles.push(neighbor);
      }
    }
  }

  return {
    neighbors: activeTiles,
    available: availableTiles
  };
};

const findDiscsInPlay = board => {
  const neighbors = [];

  for (let i = 0; i < board[0].length; i++) {
    for (let j = 0; j < board.length; j++) {
      if (isSelf(i, j)) continue;
      if (board[i][j] !== null) {
        neighbors.push({ i: i, j: j });
      }
    }
  }
  return neighbors;
};

const findFrontierDiscs = board => {
  const discsInPlay = findDiscsInPlay(board);
  const activeNeighbors = [];

  for (let disc in discsInPlay) {
    if (discsInPlay.hasOwnProperty(disc)) {
      activeNeighbors.push(findActiveNeighbors(board, discsInPlay[disc]));
    }
  }
  return activeNeighbors;
};

const getNumMoves = board => {
  const frontierDiscs = findFrontierDiscs(board);

  const legalMoves = frontierDiscs
    .map(disc => {
      const moves = {
        true: [],
        false: []
      };

      disc.available.forEach(tile => {
        const myColor = board[tile.i][tile.j];

        const diffI = tile.i - tile.x;
        const diffJ = tile.j - tile.y;

        let x = tile.i + diffI;
        let y = tile.j + diffJ;

        while (true) {
          if (!isOnBoard(board, x, y) || board[x][y] === null) {
            break;
          } else if (board[x][y] === !myColor) {
            moves[!myColor].push({ x: tile.x, y: tile.y });
            break;
          }
          x += diffI;
          y += diffJ;
        }
      });
      return moves;
    })
    .reduce((acc, moves) => {
      // convert these to forEach loops
      for (let move in moves) {
        if (moves.hasOwnProperty(move)) {
          moves[move].forEach(spot => acc[move].push(spot));
        }
      }

      return acc;
    });
  return legalMoves;
};

/****************************************
 ********        Main App        ********
 ****************************************/

const App = () => {
  const [playersTurn, setPlayersTurn] = useState(BLACK);
  const [isLoading, setIsLoading] = useState(false);
  const [score, setScore] = useState([...startingScore]);
  const [boardMap, setBoardMap] = useState(cloneBoard(startingGrid));
  const [lastBoardMap, setLastBoardMap] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [hintClass, setHintClass] = useState("");
  const [moves, setMoves] = useState([]);

  useEffect(() => {
    setIsLoading(false);
  }, [boardMap]);

  // create a memoized function so it can be used as a dependency in useEffect
  // without causing it to execute on every rerender
  const memoMoves = useCallback(player => getNumMoves(boardMap)[player], [
    boardMap
  ]);

  useEffect(() => {
    setMoves(memoMoves(playersTurn));
  }, [playersTurn, memoMoves]);

  const updateBoardMap = (x, y) => {
    const newBoardMap = boardMap;
    newBoardMap[x][y] = playersTurn;

    setBoardMap(newBoardMap);
  };

  const setLoading = name => {
    setIsLoading(name);
    return setTimeout(() => setIsLoading(false), 603);
  };

  const gameIsOver = score => {
    return (
      score[+BLACK] + score[+WHITE] === 64 ||
      (!memoMoves(playersTurn).length && !memoMoves(!playersTurn).length)
    );
  };

  const flipDiscs = (x, y, paths) => {
    paths.forEach(path => {
      let localX = +x + path.i;
      let localY = +y + path.j;
      const newScore = score;

      while (boardMap[localX][localY] !== playersTurn) {
        if (boardMap[localX][localY] === !playersTurn) {
          newScore[+playersTurn] += 1;
          newScore[+!playersTurn] -= 1;
          setScore(newScore);
        }
        updateBoardMap(localX, localY);

        localX += path.i;
        localY += path.j;
      }

      if (gameIsOver(newScore)) {
        // Somebody won
        setGameOver(true);
      }
    });
  };

  const isValid = (x, y) => {
    const adjacentTiles = [];
    // Exclude other elements and occupied tiles
    if ([x, y].includes(undefined) || boardMap[x][y] !== null) return false;

    for (let i = -1; i < 2; i++) {
      const testX = +x + i;
      for (let j = -1; j < 2; j++) {
        const testY = +y + j;

        if (
          isOnBoard(boardMap, testX, testY) &&
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
      while (
        isOnBoard(boardMap, localX, localY) &&
        boardMap[localX][localY] !== null
      ) {
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

      // Flip the discs in between and cycle the turn
      flipDiscs(x, y, validPaths);
      setPlayersTurn(!playersTurn);
      setHintClass("");
    }
  };

  const handlePass = () => {
    setHintClass("");
    if (gameOver) {
      setBoardMap(cloneBoard(startingGrid));
      setLastBoardMap(null);
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
    setHintClass("");
    setLoading("undo");
    setBoardMap(lastBoardMap);
    setLastBoardMap(null);
    setPlayersTurn(!playersTurn);
  };

  const getPlayerScore = player => {
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

  const toggleHint = () => {
    const newClass = hintClass === "" ? " show-hint" : "";
    setHintClass(newClass);
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
    const currentScore = getCurrentScore();
    if (currentScore) {
      gameStatus = "White wins!";
    } else if (currentScore === 0) {
      gameStatus = "Black Wins!";
    } else if (currentScore === null) {
      gameStatus = "Tied game";
    }
  }

  /****************************************
   ********      Render Block      ********
   ****************************************/

  return (
    <div className={`App${hintClass}`}>
      <header className="header">Othello</header>
      <div className="panel">
        <div>{gameStatus}</div>
        <div>
          <span>Score: </span>
          {getPlayerScore(BLACK)}
          <span> / </span>
          {getPlayerScore(WHITE)}
        </div>
        <button
          className="button"
          disabled={isLoading === "pass" || memoMoves(playersTurn).length}
          onClick={handlePass}
        >
          {gameOver ? "New Game" : "Pass"}
        </button>
      </div>
      <Board map={boardMap} moves={moves} onClick={handleClick} />
      <div className="panel">
        <button
          className="button"
          disabled={isLoading === "hint" || gameOver}
          onClick={toggleHint}
        >
          Hint
        </button>
        <button
          className="button"
          disabled={lastBoardMap === null || isLoading === "undo" || gameOver}
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
