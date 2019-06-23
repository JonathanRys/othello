import React from "react";

const Cell = props => {
  return (
    <div x={props.x} y={props.y} className="cell">
      <div className={`chip ${props.color}`} />
    </div>
  );
};

export default Cell;
