const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const floatTo16BitPCM = (input: Float32Array): Buffer => {
  const buffer = Buffer.allocUnsafe(input.length * 2);
  for (let i = 0; i < input.length; i += 1) {
    let sample = clamp(input[i], -1, 1);
    sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    buffer.writeInt16LE(sample, i * 2);
  }
  return buffer;
};

export const bufferToBase64 = (input: Buffer): string => input.toString('base64');

export const mergeAudioBuffers = (chunks: Buffer[]): Buffer => Buffer.concat(chunks);

export const createSineWaveBuffer = (text: string, sampleRate = 24000): Buffer => {
  const durationSeconds = Math.max(1, Math.min(5, text.length / 15));
  const totalSamples = Math.floor(durationSeconds * sampleRate);
  const buffer = Buffer.allocUnsafe(totalSamples * 2);
  for (let i = 0; i < totalSamples; i += 1) {
    const progress = i / totalSamples;
    const freq = 400 + (text.length % 200) + 200 * Math.sin(progress * Math.PI * 2);
    const sample = Math.sin((2 * Math.PI * freq * i) / sampleRate);
    buffer.writeInt16LE(sample * 0x7fff, i * 2);
  }
  return buffer;
};
