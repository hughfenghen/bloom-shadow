import { AVCanvas } from "@webav/av-canvas"
import { ChunkSlice, convertChunkSlice2MP4 } from "./chunk-slice"
import { file2stream } from "@webav/av-cliper"
import { TimeSprite } from "./time-sprite"

let avCanvas: AVCanvas | null = null
const CHUNK_SLICE = new ChunkSlice()

if (import.meta.hot) {
  import.meta.hot.accept(() => {
    avCanvas?.destroy()
    import.meta.hot?.invalidate()
  })
}

export const recorder = {
  init,
  start,
  getAVCanvas,
  exportVideo
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

  avCanvas.spriteManager.addSprite(new TimeSprite('ts'))

  return avCanvas
}

function getAVCanvas() {
  if (avCanvas == null) throw Error('uninitialized')
  return avCanvas
}

async function start() {
  if (avCanvas == null) throw Error('uninitialized')
  const stream = avCanvas.captureStream()
  const videoTrack = stream.getVideoTracks()[0]
  if (videoTrack == null) throw Error('AVCanvas not video track')

  const vfReadable = new MediaStreamTrackProcessor({
    track: videoTrack
  }).readable

  let fps = 0
  const t = performance.now()
  const encoder = new VideoEncoder({
    error: console.error,
    output: (chunk, meta) => {
      if (meta != null && CHUNK_SLICE.meta == null) CHUNK_SLICE.meta = meta
      CHUNK_SLICE.append(chunk)
    }
  })
  encoder.configure({
    codec: 'avc1.4D0032',
    framerate: 30,
    // 码率
    bitrate: 2e4,
    width: 1280,
    height: 720,
    alpha: 'discard',
    avc: { format: 'avc' }
  })

  const transVF = new VideoFrameTransformer(30)
  const stopRead = autoReadStream(vfReadable, {
    onChunk: async (vf) => {
      const vfWrap = transVF.transfrom(vf)
      if (vfWrap == null) return
      encoder.encode(vfWrap.vf, vfWrap.opts)
      vfWrap.vf.close()

      console.log(666, ~~(fps / (performance.now() - t) * 1000))
      fps += 1
    }
  })

  return {
    pause: () => {
      transVF.pause()
    },
    play: () => {
      transVF.play()
    },
    stop: stopRead
  }
}

// 
class VideoFrameTransformer {
  #startTime = performance.now()

  #lastTime = this.#startTime

  #frameCnt = 0

  #paused = false

  #pauseTime = 0

  constructor(readonly expectFPS: number) { }

  play() {
    console.log(55555, this.#paused)
    if (!this.#paused) return
    this.#paused = false

    console.log(111, this.#startTime, performance.now() - this.#pauseTime)
    this.#startTime += performance.now() - this.#pauseTime
    this.#lastTime += performance.now() - this.#pauseTime
  }

  pause() {
    if (this.#paused) return
    this.#paused = true
    this.#pauseTime = performance.now()
  }

  transfrom(frame: VideoFrame) {
    const now = performance.now()
    const offsetTime = now - this.#startTime
    if (
      this.#paused ||
      // 避免帧率超出期望太高
      (this.#frameCnt / offsetTime) * 1000 > this.expectFPS
    ) {
      frame.close()
      return
    }

    const vf = new VideoFrame(frame, {
      // timestamp 单位 微妙
      timestamp: offsetTime * 1000,
      duration: (now - this.#lastTime) * 1000
    })
    this.#lastTime = now

    this.#frameCnt += 1
    frame.close()
    return {
      vf,
      opts: { keyFrame: this.#frameCnt % 30 === 0 }
    }
  }
}

function autoReadStream<ST extends ReadableStream>(
  stream: ST,
  cbs: {
    onChunk: ST extends ReadableStream<infer DT>
    ? (chunk: DT) => Promise<void>
    : never
    onDone?: () => void
  }
) {
  let stoped = false
  async function run() {
    const reader = stream.getReader()

    while (!stoped) {
      const { value, done } = await reader.read()
      if (done) {
        cbs.onDone?.()
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

async function exportVideo(start: number, duration: number) {
  const file = convertChunkSlice2MP4(CHUNK_SLICE.slice(start, duration))
  const { stream, stop } = file2stream(file, 500)
  stop()
  const videoEl = createVideoEl()
  videoEl.src = URL.createObjectURL(await new Response(stream).blob())
  document.body.appendChild(videoEl)
  videoEl.play().catch(console.error)
}

function createVideoEl(): HTMLVideoElement {
  const videoEl = document.createElement('video')
  videoEl.controls = true
  videoEl.autoplay = true
  videoEl.style.cssText = `
    width: 900px;
    height: 500px;
    display: block;
  `
  return videoEl
}
