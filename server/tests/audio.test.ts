import { describe, expect, it } from 'vitest';
import { createSineWaveBuffer, floatTo16BitPCM } from '../src/services/audio/pcm.js';

describe('audio helpers', () => {
  it('converts float samples to PCM16 buffer', () => {
    const buffer = floatTo16BitPCM(new Float32Array([0, -1, 1]));
    expect(buffer.byteLength).toBe(6);
    expect(buffer.readInt16LE(0)).toBe(0);
    expect(buffer.readInt16LE(2)).toBe(-32768);
    expect(buffer.readInt16LE(4)).toBe(32767);
  });

  it('creates deterministic sine wave buffer', () => {
    const buffer = createSineWaveBuffer('hello world', 24000);
    expect(buffer.byteLength).toBeGreaterThan(0);
  });
});
