import React from "react";
import Cell from "./Cell.js";

const BOARD_SIZE = 8;

const Board = props => {
  const board = [];

  for (let i = 0; i < BOARD_SIZE; i++) {
    const row = [];
    for (let j = 0; j < BOARD_SIZE; j++) {
      let color = "";

      if (props.map[i][j] === false) {
        color = "black";
      } else if (props.map[i][j] === true) {
        color = "white";
      }

      row.push(<Cell x={i} y={j} key={`cell-${i}${j}`} color={color} />);
    }
    board.push(
      React.createElement("div", { key: `row-${i}`, style: styles.row }, row)
    );
  }
  return <div style={styles.board}>{board}</div>;
};

const styles = {
  board: {
    border: "2px solid black",
    display: "inline-block"
  },
  row: {
    marginBottom: "-4px"
  }
};

export default Board;
