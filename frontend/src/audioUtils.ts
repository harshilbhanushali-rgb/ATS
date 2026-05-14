
export const GEMINI_TTS_SAMPLE_RATE = 24000;

// This function decodes a base64 string into a Uint8Array.
export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// This function decodes raw PCM audio data (as Uint8Array) into an AudioBuffer.
// The browser's native `decodeAudioData` is for file formats (like mp3, wav), not raw streams.
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  // The raw data is 16-bit signed integers (Int16).
  // Ensure we have an even number of bytes for Int16Array
  const byteLength = data.byteLength;
  const alignedLength = byteLength - (byteLength % 2);
  const dataInt16 = new Int16Array(data.buffer, data.byteOffset, alignedLength / 2);
  
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      // Convert the Int16 value to a Float32 value between -1.0 and 1.0
      // Handle potential out of bounds if numChannels is > 1 and data is short
      const index = i * numChannels + channel;
      if (index < dataInt16.length) {
        channelData[i] = dataInt16[index] / 32768.0;
      } else {
        channelData[i] = 0;
      }
    }
  }
  return buffer;
}
