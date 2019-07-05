import React, { memo } from "react";

const Cell = props => {
  return (
    <div x={props.x} y={props.y} className={`cell${props.className}`}>
      <div className={`chip ${props.color}`} />
    </div>
  );
};

export default memo(Cell);
