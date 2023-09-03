import { useEffect, useRef } from 'react';
import { initCanvas } from './avcanvas';

export function Player() {
  const cvsEl = useRef(null);
  useEffect(() => {
    if (cvsEl.current == null) return;

    initCanvas(cvsEl.current);
  });

  return (
    <>
      <div className="cvs-container" ref={cvsEl}></div>
      <div className="time-range-wrap">
        <input
          type="range"
          id="time-handle"
          min="0"
          max="10"
          step="0.1"
          value="0"
          onChange={() => {}}
        />
        <span id="time-value-str">
          <span className="selected">0</span>/<span className="total">0</span>
        </span>
      </div>
    </>
  );
}
