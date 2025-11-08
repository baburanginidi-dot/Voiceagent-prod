
export const float32ToPCM16 = (input: Float32Array): ArrayBuffer => {
  const buffer = new ArrayBuffer(input.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < input.length; i += 1) {
    const sample = Math.max(-1, Math.min(1, input[i]));
    view.setInt16(i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
  }
  return buffer;
};

export const decodePCM16ToAudioBuffer = async (
  data: ArrayBuffer,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
) => {
  const int16 = new Int16Array(data);
  const frameCount = int16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel += 1) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i += 1) {
      channelData[i] = int16[i * numChannels + channel] / 0x8000;
    }
  }

  return buffer;
};
