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

  slice(start: number, duration: number): ChunkSlice {
    const cs = new ChunkSlice()
    cs.meta = this.meta

    let first = true
    for (const [idx, chunk] of this.#chunks.entries()) {
      if (chunk.timestamp > start + duration) break

      // todo: timestamp 可能有偏差
      if (chunk.timestamp >= start) {
        if (first && chunk.type !== 'key') {
          for (let i = idx; i >= 0; i--) {
            if (this.#chunks[i].type === 'key') {
              const keyChunk = this.#chunks[i]
              cs.append(new EncodedVideoChunk({
                type: keyChunk.type,
                timestamp: keyChunk.timestamp - start,
                duration: keyChunk.duration ?? 0,
                data: extractChunkData(keyChunk),
              }))
              break
            }
          }
        }
        first = false
        cs.append(new EncodedVideoChunk({
          type: chunk.type,
          timestamp: chunk.timestamp - start,
          duration: chunk.duration ?? 0,
          data: extractChunkData(chunk),
        }))
      }
    }
    return cs
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
