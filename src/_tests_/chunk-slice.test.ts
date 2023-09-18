import { test, expect } from 'bun:test'
import { ChunkSlice } from '../chunk-slice'

test('ChunkSlice duration', () => {
  const cs = new ChunkSlice()
  for (let i = 0; i < 10; i++) {
    cs.append({
      timestamp: i,
      duration: 1
    } as EncodedVideoChunk)
  }
  expect(cs.getDuration()).toBe(10)
})

test('ChunkSlice delete slice', () => {
  const cs = new ChunkSlice()
  for (let i = 0; i < 10; i++) {
    cs.append({
      timestamp: i,
      duration: 1
    } as EncodedVideoChunk)
  }
  cs.delete(2, 3)
  expect(cs.getDuration()).toBe(6)
})