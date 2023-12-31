import { VideoSprite } from '@webav/av-canvas';
import { recorder } from '../avcanvas';
import { useAtom } from 'jotai';
import { resourceListAtom } from '../store/store';

export function AddResource() {
  const [resList, setResList] = useAtom(resourceListAtom);
  return (
    <div className="add-sprite">
      <div className="font-bold">添加素材</div>
      <div className="flex">
        <button
          className="border border-solid border-black mr-4 px-2"
          onClick={async () => {
            const mediaStream = await navigator.mediaDevices.getDisplayMedia({
              video: true,
              audio: true,
            });
            const cnt = resList.filter((it) => it.name.includes('屏幕')).length;
            const avCvs = recorder.getAVCanvas();
            const vs = new VideoSprite(`屏幕${cnt || ''}`, mediaStream, {
              audioCtx: avCvs.spriteManager.audioCtx,
            });
            await avCvs.spriteManager.addSprite(vs);
            // 自适应全屏
            const { w, h } = vs.rect;
            const ratio = w / h;
            if (ratio > 1280 / 720) {
              vs.rect.x = 0;
              vs.rect.w = 1280;
              vs.rect.h = vs.rect.w / ratio;
              vs.rect.y = (720 - vs.rect.h) / 2;
            } else {
              vs.rect.y = 0;
              vs.rect.h = 720;
              vs.rect.w = vs.rect.h * ratio;
              vs.rect.x = (1280 - vs.rect.w) / 2;
            }
            setResList(resList.concat(vs));
          }}
        >
          捕获屏幕
        </button>
        <button
          className="border border-solid border-black px-2"
          onClick={async () => {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
              video: {
                width: 900,
                height: 600,
              },
              audio: true,
            });
            const cnt = resList.filter((it) =>
              it.name.includes('演讲者')
            ).length;
            const avCvs = recorder.getAVCanvas();
            const vs = new VideoSprite(`演讲者${cnt || ''}`, mediaStream, {
              audioCtx: avCvs.spriteManager.audioCtx,
            });
            await avCvs.spriteManager.addSprite(vs);
            // 默认右下角
            const margin = 1280 * 0.015;
            vs.rect.w = 450;
            vs.rect.h = 300;
            vs.rect.x = 1280 - vs.rect.w - margin;
            vs.rect.y = 720 - vs.rect.h - margin;
            setResList(resList.concat(vs));
          }}
        >
          演讲者
        </button>
      </div>
    </div>
  );
}
