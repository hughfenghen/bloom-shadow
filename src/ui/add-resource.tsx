import { VideoSprite } from "@webav/av-canvas";
import { recorder } from "../avcanvas";

export function AddResource() {
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
            const vs = new VideoSprite("display", mediaStream, {
              audioCtx: avCvs.spriteManager.audioCtx,
            });
            await avCvs.spriteManager.addSprite(vs);
          }}
        >
          分享屏幕
        </button>
        <button className="border border-solid border-black px-2">
          摄像头/麦克风
        </button>
      </div>
    </div>
  );
}
