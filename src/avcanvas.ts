import { AVCanvas } from "@webav/av-canvas"
import { ChunkSlice, convertChunkSlice2MP4 } from "./chunk-slice"
import { file2stream } from "@webav/av-cliper"

let avCanvas: AVCanvas | null = null
const CHUNK_SLICE = new ChunkSlice()

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
  if (videoTrack == null) return () => { }

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

  const transVF = encodeVideoFrame(30)
  const stopRead = autoReadStream(vfReadable, {
    onChunk: async (vf) => {
      const vfWrap = transVF(vf)
      if (vfWrap == null) return
      encoder.encode(vfWrap.vf, vfWrap.opts)
      vfWrap.vf.close()

      console.log(666, ~~(fps / (performance.now() - t) * 1000))
      fps += 1
    }
  })

  return () => {
    stopRead()
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
      opts: { keyFrame: frameCnt % 30 === 0 }
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

function createDownloadBtn(url: string) {
  const downloadEl = document.createElement('button')
  downloadEl.textContent = 'download'
  downloadEl.onclick = () => {
    const aEl = document.createElement('a')
    document.body.appendChild(aEl)
    aEl.setAttribute('href', url)
    aEl.setAttribute('download', `WebAv-export-${Date.now()}.mp4`)
    aEl.setAttribute('target', '_self')
    aEl.click()
  }
  return downloadEl
}