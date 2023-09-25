import { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { Slider } from 'antd';
import { recorder } from '../avcanvas';
import { useAtom } from 'jotai';
import { expFilesAtom } from '../store/store';

export function Player() {
  const cvsEl = useRef<HTMLDivElement | null>(null);
  const recordMngRef = useRef<{
    pause: () => void;
    play: () => void;
    stop: () => void;
  } | null>(null);
  const [isRecording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [range, setRange] = useState<[number, number]>([0, 0]);
  const timeStr = String(duration);

  const [expFiles, setexpFiles] = useAtom(expFilesAtom);

  useEffect(() => {
    if (cvsEl.current == null) return;

    recorder.init(cvsEl.current);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const duration = Math.round(recorder.getDuration() / 1e6);
      setDuration(duration);
      if (isRecording) {
        setRange([0, duration]);
      }
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [isRecording]);

  return (
    <>
      <div className="cvs-container relative" ref={cvsEl}></div>
      <div className="time-range-wrap flex">
        <div className="flex-1">
          <Slider
            range
            min={0}
            max={duration}
            step={0.01}
            value={range}
            disabled={isRecording || duration === 0}
            onChange={(v) => setRange(v)}
          />
        </div>
        <span id="time-value-str" className="ml-4 text-right">
          {timeStr}
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
          </button>{' '}
          |{' '}
          <button
            disabled={isRecording}
            onClick={() => {
              recorder.delete(range[0] * 1e6, range[1] * 1e6);
            }}
          >
            删除片段
          </button>
        </div>
        <div className="ml-auto">
          <button disabled={duration === 0}>截图</button> |{' '}
          <button disabled={duration === 0}>生成动图</button> |{' '}
          <button
            disabled={duration === 0}
            onClick={async () => {
              // recorder.exportVideo(1, Infinity);
              const [start, end] = range;
              const v = await recorder.exportVideo(start * 1e6, end * 1e6);
              setexpFiles(
                expFiles.concat({
                  type: 'video',
                  url: v.url,
                  duration: Math.floor(v.duration / 1e6),
                  createTime: format(Date.now(), 'MM-dd HH:mm:ss'),
                })
              );
            }}
          >
            生成视频
          </button>
        </div>
      </div>
    </>
  );
}
