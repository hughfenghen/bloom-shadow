import { useEffect, useRef } from 'react';
import { recorder } from './avcanvas';

export function Player() {
  const cvsEl = useRef(null);
  useEffect(() => {
    if (cvsEl.current == null) return;

    recorder.init(cvsEl.current);
  });

  return (
    <>
      <div className="cvs-container relative" ref={cvsEl}></div>
      <div className="time-range-wrap flex">
        <input
          type="range"
          id="time-handle"
          min="0"
          max="10"
          step="0.1"
          value="0"
          className="flex-1"
          onChange={() => {}}
        />
        <span id="time-value-str" className="ml-4 text-right">
          <span className="selected">0</span>/<span className="total">0</span>
        </span>
      </div>
      <div className="flex">
        <div>
          <button
            onClick={() => {
              recorder.start();
            }}
          >
            录制/暂停
          </button>
        </div>
        <div className="ml-auto">
          <button>截图</button> | <button>生成动图</button> |{' '}
          <button>生成视频</button>
        </div>
      </div>
    </>
  );
}
