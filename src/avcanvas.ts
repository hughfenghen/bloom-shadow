import { AVCanvas } from "@webav/av-canvas"

let avCanvas: AVCanvas | null = null

export const recorder = {
  init,
  start,
  getAVCanvas
}

function init(container: HTMLElement) {
  if (avCanvas != null) return avCanvas

  avCanvas = new AVCanvas(container, {
    bgColor: '#333',
    resolution: {
      width: 1920,
      height: 1080
    }
  })

  return avCanvas
}

function getAVCanvas() {
  if (avCanvas == null) throw Error('uninitialized')
  return avCanvas
}

function start() {
  if (avCanvas == null) throw Error('uninitialized')
  const stream = avCanvas.captureStream()
  const videoTrack = stream.getVideoTracks()[0]
  if (videoTrack != null) {
    const vfReadable = new MediaStreamTrackProcessor({
      track: videoTrack
    }).readable

    let fps = 0
    const t = performance.now()
    autoReadStream(vfReadable.pipeThrough(new class extends TransformStream<VideoFrame, EncodedVideoChunk> {
      constructor() {
        let ctrl: TransformStreamDefaultController | null = null
        const encoder = new VideoEncoder({
          error: console.error,
          output: (chunk) => {
            ctrl?.enqueue(chunk)
          }
        })
        encoder.configure({
          codec: 'avc1.4D0032',
          framerate: 30,
          // hardwareAcceleration: 'prefer-hardware',
          // 码率
          bitrate: 2e4,
          width: 1280,
          height: 720,
          // H264 不支持背景透明度
          alpha: 'discard',
          // macos 自带播放器只支持avc
          avc: { format: 'avc' }
          // mp4box.js 无法解析 annexb 的 mimeCodec ，只会显示 avc1
          // avc: { format: 'annexb' }
        })

        const transVF = encodeVideoFrame(30)
        super({
          start: (c) => {
            ctrl = c
          },
          transform(vf) {
            const data = transVF(vf)
            if (data == null) return
            encoder.encode(data.vf, data.opts)
            data.vf.close()
          }
        })
      }
    }), {
      onChunk: async (chunk) => {
        console.log(666, ~~(fps / (performance.now() - t) * 1000), chunk)
        fps += 1
      },
      onDone: () => { }
    })
  }
}

function encodeVideoFrame(expectFPS: number) {
  const startTime = performance.now()
  let lastTime = startTime

  const maxFPS = expectFPS * 1.1

  let frameCnt = 0
  return (frame: VideoFrame) => {
    const now = performance.now()
    const offsetTime = now - startTime
    // 避免帧率超出期望太高
    if ((frameCnt / offsetTime) * 1000 > maxFPS) {
      frame.close()
      return
    }

    const vf = new VideoFrame(frame, {
      // timestamp 单位 微妙
      timestamp: offsetTime * 1000,
      duration: (now - lastTime) * 1000
    })
    lastTime = now

    frameCnt += 1
    frame.close()
    return {
      vf,
      opts: { keyFrame: frameCnt % 150 === 0 }
    }
  }
}


function autoReadStream<ST extends ReadableStream>(
  stream: ST,
  cbs: {
    onChunk: ST extends ReadableStream<infer DT>
    ? (chunk: DT) => Promise<void>
    : never
    onDone: () => void
  }
) {
  let stoped = false
  async function run() {
    const reader = stream.getReader()

    while (!stoped) {
      const { value, done } = await reader.read()
      if (done) {
        cbs.onDone()
        return
      }
      await cbs.onChunk(value)
    }

    reader.releaseLock()
    await stream.cancel()
  }

  run().catch(console.error)

  return () => {
    stoped = true
  }
}