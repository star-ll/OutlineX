function getRandomValues(bytes: Uint8Array) {
  if (typeof globalThis.crypto?.getRandomValues === "function") {
    return globalThis.crypto.getRandomValues(bytes);
  }
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  return bytes;
}

function hexByte(value: number) {
  return value.toString(16).padStart(2, "0");
}

export function uuidV7() {
  const now = Date.now();
  const timeHigh = Math.floor(now / 0x100000000);
  const timeLow = now >>> 0;

  const bytes = new Uint8Array(16);
  bytes[0] = (timeHigh >>> 8) & 0xff;
  bytes[1] = timeHigh & 0xff;
  bytes[2] = (timeLow >>> 24) & 0xff;
  bytes[3] = (timeLow >>> 16) & 0xff;
  bytes[4] = (timeLow >>> 8) & 0xff;
  bytes[5] = timeLow & 0xff;

  getRandomValues(bytes.subarray(6));

  bytes[6] = (bytes[6] & 0x0f) | 0x70;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  return (
    hexByte(bytes[0]) +
    hexByte(bytes[1]) +
    hexByte(bytes[2]) +
    hexByte(bytes[3]) +
    "-" +
    hexByte(bytes[4]) +
    hexByte(bytes[5]) +
    "-" +
    hexByte(bytes[6]) +
    hexByte(bytes[7]) +
    "-" +
    hexByte(bytes[8]) +
    hexByte(bytes[9]) +
    "-" +
    hexByte(bytes[10]) +
    hexByte(bytes[11]) +
    hexByte(bytes[12]) +
    hexByte(bytes[13]) +
    hexByte(bytes[14]) +
    hexByte(bytes[15])
  );
}
