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
    autoReadStream(vfReadable, {
      onChunk: async (vf) => {
        console.log(55555, vf.duration, vf.timestamp)
        vf.close()
      },
      onDone: () => {

      }
    })
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