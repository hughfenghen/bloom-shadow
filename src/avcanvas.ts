import { AVCanvas } from "@webav/av-canvas"

let avCanvas: AVCanvas | null = null

export function initCanvas(container: HTMLElement) {
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

export function getAVCanvas() {
  if (avCanvas == null) throw Error('uninitialized')
  return avCanvas
}