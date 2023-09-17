import { useEffect, useRef, useState } from 'react';
import { recorder } from './avcanvas';

export function Player() {
  const cvsEl = useRef<HTMLDivElement | null>(null);
  const recordMngRef = useRef<{
    pause: () => void;
    play: () => void;
    stop: () => void;
  } | null>(null);
  const [isRecording, setRecording] = useState(false);

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
            onClick={async () => {
              if (recordMngRef.current == null) {
                recordMngRef.current = await recorder.start();
              } else if (isRecording) {
                recordMngRef.current?.pause();
              } else {
                recordMngRef.current?.play();
              }
              setRecording(!isRecording);
            }}
          >
            {isRecording ? '暂停' : '录制'}
          </button>
        </div>
        <div className="ml-auto">
          <button>截图</button> | <button>生成动图</button> |{' '}
          <button
            onClick={() => {
              // todo: 通过 input:range 获取时间
              // recorder.exportVideo(1e6, 5e6);
              recorder.exportVideo(0, Infinity);
            }}
          >
            生成视频
          </button>
        </div>
      </div>
    </>
  );
}
