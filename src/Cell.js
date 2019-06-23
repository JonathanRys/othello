import React from "react";

const Cell = props => {
  return (
    <div x={props.x} y={props.y} style={styles.cell}>
      <div style={Object.assign({}, styles.chip, styles[props.color])} />
    </div>
  );
};

const styles = {
  cell: {
    backgroundColor: "#36bc56",
    border: "1px solid black",
    display: "inline-block",
    height: "40px",
    width: "40px"
  },
  chip: {
    borderRadius: "50%",
    display: "none",
    height: "32px",
    width: "32px",
    margin: "3px"
  },
  black: {
    backgroundColor: "black",
    display: "block"
  },
  white: {
    border: "1px solid black",
    backgroundColor: "white",
    display: "block"
  }
};

export default Cell;
