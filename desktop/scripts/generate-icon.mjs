import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const iconPath = join(root, "src-tauri", "icons", "icon.ico");
const size = 256;
const headerSize = 40;
const maskStride = Math.ceil(size / 32) * 4;
const xorSize = size * size * 4;
const maskSize = maskStride * size;
const dibSize = headerSize + xorSize + maskSize;
const imageOffset = 6 + 16;
const file = Buffer.alloc(imageOffset + dibSize);

file.writeUInt16LE(0, 0);
file.writeUInt16LE(1, 2);
file.writeUInt16LE(1, 4);
file.writeUInt8(0, 6);
file.writeUInt8(0, 7);
file.writeUInt8(0, 8);
file.writeUInt8(0, 9);
file.writeUInt16LE(1, 10);
file.writeUInt16LE(32, 12);
file.writeUInt32LE(dibSize, 14);
file.writeUInt32LE(imageOffset, 18);

let offset = imageOffset;
file.writeUInt32LE(headerSize, offset);
file.writeInt32LE(size, offset + 4);
file.writeInt32LE(size * 2, offset + 8);
file.writeUInt16LE(1, offset + 12);
file.writeUInt16LE(32, offset + 14);
file.writeUInt32LE(0, offset + 16);
file.writeUInt32LE(xorSize + maskSize, offset + 20);
file.writeInt32LE(0, offset + 24);
file.writeInt32LE(0, offset + 28);
file.writeUInt32LE(0, offset + 32);
file.writeUInt32LE(0, offset + 36);
offset += headerSize;

for (let y = size - 1; y >= 0; y -= 1) {
  for (let x = 0; x < size; x += 1) {
    const center = (x > 48 && x < 208 && y > 44 && y < 212);
    const spine = (x > 112 && x < 144 && y > 72 && y < 184);
    const bar = (x > 78 && x < 178 && y > 104 && y < 136);
    const rim = x < 14 || y < 14 || x > 241 || y > 241;
    const alpha = rim ? 0 : 255;
    const blue = center ? 69 : 248;
    const green = center ? 78 : 247;
    const red = center ? 88 : 244;

    file.writeUInt8(spine || bar ? 255 : blue, offset);
    file.writeUInt8(spine || bar ? 255 : green, offset + 1);
    file.writeUInt8(spine || bar ? 255 : red, offset + 2);
    file.writeUInt8(alpha, offset + 3);
    offset += 4;
  }
}

mkdirSync(dirname(iconPath), { recursive: true });
writeFileSync(iconPath, file);
console.log(`Generated ${iconPath}`);
