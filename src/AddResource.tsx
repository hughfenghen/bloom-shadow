import { VideoSprite } from '@webav/av-canvas';
import { getAVCanvas } from './avcanvas';

export function AddResource() {
  return (
    <div className="add-sprite">
      <div className="font-bold">添加素材</div>
      <div>
        <button
          onClick={async () => {
            const mediaStream = await navigator.mediaDevices.getDisplayMedia({
              video: true,
              audio: true,
            });
            const avCvs = getAVCanvas();
            const vs = new VideoSprite('display', mediaStream, {
              audioCtx: avCvs.spriteManager.audioCtx,
            });
            await avCvs.spriteManager.addSprite(vs);
          }}
        >
          屏幕
        </button>
        <button>摄像头/麦克风</button>
      </div>
    </div>
  );
}
