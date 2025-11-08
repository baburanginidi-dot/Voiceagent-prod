import { describe, expect, it } from 'vitest';
import { float32ToPCM16 } from './audioUtils';

describe('audioUtils', () => {
  it('encodes float32 audio frames to PCM16', () => {
    const buffer = float32ToPCM16(new Float32Array([0, 0.5, -0.5]));
    expect(buffer.byteLength).toBe(6);
  });
});
