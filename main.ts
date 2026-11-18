// news-image-20261118: the entry program.
//
// It copies the front-page image bundled in this repository to the output
// directory the grader provides. Node 22, standard library only.
// No network, no clock, no randomness: both runs write identical bytes.
import * as fs from "node:fs";
import * as crypto from "node:crypto";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const IMAGE_PATH = fileURLToPath(new URL("./entry.png", import.meta.url));
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const LIMIT_BYTES = 1048576;

const JPEG_SOI = Buffer.from([0xff, 0xd8, 0xff]);
const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const image = fs.readFileSync(IMAGE_PATH);
const looksJpeg = image.subarray(0, 3).equals(JPEG_SOI);
const looksPng = image.subarray(0, 8).equals(PNG_SIG);
if (!looksJpeg && !looksPng) {
  throw new Error("entry.png is neither a JPEG nor a PNG file");
}
if (image.length > LIMIT_BYTES) {
  throw new Error(`entry.png is ${image.length} bytes, over the 1 MiB limit`);
}

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
const target = path.join(OUTPUT_DIR, "entry.png");
const digest = (buf: Buffer) => crypto.createHash("sha256").update(buf).digest("hex");

if (fs.existsSync(target) && digest(fs.readFileSync(target)) === digest(image)) {
  console.log(`${target} already holds the same image, nothing to copy`);
} else {
  const kind = looksJpeg ? "JPEG" : "PNG";
  fs.copyFileSync(IMAGE_PATH, target);
  console.log(`Copied ${kind} entry.png (${image.length} bytes) to ${target}`);
}
