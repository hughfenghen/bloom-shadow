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
            const avCvs = recorder.getAVCanvas();
            const vs = new VideoSprite('display', mediaStream, {
              audioCtx: avCvs.spriteManager.audioCtx,
            });
            await avCvs.spriteManager.addSprite(vs);
            // 自适应全屏
            const { w, h } = vs.rect;
            const ratio = w / h;
            if (ratio > 1920 / 1080) {
              vs.rect.x = 0;
              vs.rect.w = 1920;
              vs.rect.h = vs.rect.w / ratio;
              vs.rect.y = (1080 - vs.rect.h) / 2;
            } else {
              vs.rect.y = 0;
              vs.rect.h = 1080;
              vs.rect.w = vs.rect.h * ratio;
              vs.rect.x = (1920 - vs.rect.w) / 2;
            }
            setResList(resList.concat(vs));
          }}
        >
          分享屏幕
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
            const avCvs = recorder.getAVCanvas();
            const vs = new VideoSprite('speaker', mediaStream, {
              audioCtx: avCvs.spriteManager.audioCtx,
            });
            await avCvs.spriteManager.addSprite(vs);
            // 默认右下角
            const margin = 1920 * 0.015;
            vs.rect.w = 450;
            vs.rect.h = 300;
            vs.rect.x = 1920 - vs.rect.w - margin;
            vs.rect.y = 1080 - vs.rect.h - margin;
            setResList(resList.concat(vs));
          }}
        >
          演讲者
        </button>
      </div>
    </div>
  );
}
