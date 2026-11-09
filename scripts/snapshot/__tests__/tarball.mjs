import { gzipSync } from "node:zlib";

/** Builds a gzipped tar archive for tests. Entries: `{ path, type, content, prefix }`. */
export function makeTarball(entries) {
  const blocks = [];
  for (const entry of entries) {
    const data = Buffer.from(entry.content ?? "");
    blocks.push(header({ ...entry, size: data.length }));
    blocks.push(data, Buffer.alloc((512 - (data.length % 512)) % 512));
  }
  blocks.push(Buffer.alloc(1024));
  return gzipSync(Buffer.concat(blocks));
}

function header({ path, type = "0", size, prefix = "", linkname = "" }) {
  const block = Buffer.alloc(512);
  block.write(path, 0, 100, "utf8");
  block.write("0000644\0", 100);
  block.write("0000000\0", 108);
  block.write("0000000\0", 116);
  block.write(`${size.toString(8).padStart(11, "0")}\0`, 124);
  block.write("00000000000\0", 136);
  block.fill(0x20, 148, 156);
  block.write(type, 156);
  block.write(linkname, 157, 100, "utf8");
  block.write("ustar\0", 257);
  block.write("00", 263);
  block.write(prefix, 345, 155, "utf8");
  let sum = 0;
  for (const byte of block) {
    sum += byte;
  }
  block.write(`${sum.toString(8).padStart(6, "0")}\0 `, 148);
  return block;
}

/** The body of a pax extended header that sets `path`. */
export function paxPath(path) {
  const record = ` path=${path}\n`;
  let length = record.length;
  while (`${length}${record}`.length !== length) {
    length = `${length}${record}`.length;
  }
  return `${length}${record}`;
}

export function manifest(fields = {}) {
  return JSON.stringify({
    name: "@salt-ds/core",
    version: "0.0.0-snapshot-20261002090000",
    ...fields,
  });
}

export function packageTarball(fields, extraEntries = []) {
  return makeTarball([
    { path: "package/package.json", content: manifest(fields) },
    { path: "package/dist/index.js", content: "export {};\n" },
    ...extraEntries,
  ]);
}
