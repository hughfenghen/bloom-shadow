import mp4box, { SampleOpts } from '@webav/mp4box.js'

export class ChunkSlice {
  #chunks: EncodedVideoChunk[] = []

  #duration = 0

  meta?: EncodedVideoChunkMetadata

  append(chunk: EncodedVideoChunk) {
    this.#chunks.push(chunk)
    this.#duration += chunk.duration ?? 0
  }

  getChunks(): EncodedVideoChunk[] {
    return this.#chunks
  }

  getDuration(): number {
    return this.#duration
  }

  slice(start: number, end: number): ChunkSlice {
    const cs = new ChunkSlice()
    cs.meta = this.meta

    // todo： 二分查找
    const startIndex = this.#chunks.findIndex(c => c.timestamp >= start && c.type === 'key')
    const endIndex = this.#chunks.findLastIndex(c => c.timestamp <= end)
    for (const c of this.#chunks.slice(startIndex, endIndex)) {
      cs.append(new EncodedVideoChunk({
        type: c.type,
        timestamp: c.timestamp - start,
        duration: c.duration ?? 0,
        data: extractChunkData(c),
      }))
    }
    return cs
  }

  delete(start: number, end: number): void {
    const startIndex = this.#chunks.findIndex(c => c.timestamp >= start)
    let endIndex = this.#chunks.findLastIndex(c => c.timestamp <= end)
    for (let i = endIndex; i < this.#chunks.length; i++) {
      if (this.#chunks[i].type === 'key') {
        endIndex = i - 1
        break
      }
    }
    this.#chunks.splice(startIndex, endIndex - startIndex + 1)
    this.#duration = this.#chunks.reduce((acc, cur) => (cur.duration ?? 0) + acc, 0)
  }
}

function extractChunkData(chunk: EncodedVideoChunk) {
  const buf = new ArrayBuffer(chunk.byteLength)
  chunk.copyTo(buf)
  return buf
}

export function convertChunkSlice2MP4(chunkSlice: ChunkSlice) {
  const file = mp4box.createFile()
  const vTrackId = file.addTrack({
    timescale: 1e6,
    width: 1920,
    height: 1080,
    brands: ['isom', 'iso2', 'avc1', 'mp42', 'mp41'],
    avcDecoderConfigRecord: chunkSlice.meta?.decoderConfig?.description
  })
  for (const chunk of chunkSlice.getChunks()) {
    const s = chunk2MP4SampleOpts(chunk)
    file.addSample(vTrackId, s.data, s)
  }

  return file
}

/**
 * EncodedAudioChunk | EncodedVideoChunk 转换为 MP4 addSample 需要的参数
 */
function chunk2MP4SampleOpts(
  chunk: EncodedAudioChunk | EncodedVideoChunk
): SampleOpts & {
  data: ArrayBuffer
} {
  const buf = new ArrayBuffer(chunk.byteLength)
  chunk.copyTo(buf)
  const dts = chunk.timestamp
  return {
    duration: chunk.duration ?? 0,
    dts,
    cts: dts,
    is_sync: chunk.type === 'key',
    data: buf
  }
}
