// Renders the Icon Composer source into the flat icons every platform build uses.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const root = process.cwd();
const art = readFileSync(`${root}/build/SullyCoe.icon/Assets/icon 2.svg`, "utf8");
const paths = [...art.matchAll(/<path[^>]*\/>/g)].map((match) => match[0]).join("\n");

function svg({ margin, radius, shadow }) {
  const size = 1024 - margin * 2;
  const scale = size / 1024;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024" role="img" aria-labelledby="title desc">
  <title id="title">OpenMausBot</title>
  <desc id="desc">Sully's monster: two big eyes on a light app tile.</desc>
  <defs>
    <linearGradient id="tile" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FBFBFC"/>
      <stop offset="1" stop-color="#E6E6E9"/>
    </linearGradient>
    <clipPath id="round"><rect x="${margin}" y="${margin}" width="${size}" height="${size}" rx="${radius}"/></clipPath>
    ${shadow ? `<filter id="shadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="10" stdDeviation="18" flood-color="#000000" flood-opacity="0.3"/></filter>` : ""}
  </defs>
  <g${shadow ? ` filter="url(#shadow)"` : ""}><rect x="${margin}" y="${margin}" width="${size}" height="${size}" rx="${radius}" fill="url(#tile)"/></g>
  <g clip-path="url(#round)">
    <g transform="translate(${margin} ${margin}) scale(${scale})">${paths.replaceAll('fill="#191919"', 'fill="#191919"')}</g>
  </g>
</svg>
`;
}

// macOS: the 824-square grid with a shadow, on a 1024 canvas.
writeFileSync(`${root}/build/icon.svg`, svg({ margin: 100, radius: 185, shadow: true }));
// Windows, Linux and in-app: full bleed, so small sizes keep the monster legible.
writeFileSync(`${root}/public/app-icon.svg`, svg({ margin: 0, radius: 224, shadow: false }));

const render = (source, out, size) => execFileSync("rsvg-convert", ["-w", String(size), "-h", String(size), "-o", out, source]);
render(`${root}/build/icon.svg`, `${root}/build/icon-1024.png`, 1024);
render(`${root}/public/app-icon.svg`, `${root}/electron/resources/app-icon.png`, 1024);
for (const [name, size] of Object.entries({ "16x16": 16, "16x16@2x": 32, "32x32": 32, "32x32@2x": 64, "64x64": 64, "64x64@2x": 128, "128x128": 128, "128x128@2x": 256, "256x256": 256, "256x256@2x": 512, "512x512": 512, "512x512@2x": 1024 })) {
  render(`${root}/build/icon.svg`, `${root}/build/icon.iconset/icon_${name}.png`, size);
}
render(`${root}/public/app-icon.svg`, `${root}/public/app-icon-192.png`, 192);
render(`${root}/public/app-icon.svg`, `${root}/public/app-icon-512.png`, 512);
render(`${root}/public/app-icon.svg`, `${root}/public/apple-touch-icon.png`, 180);
execFileSync("iconutil", ["-c", "icns", `${root}/build/icon.iconset`, "-o", `${root}/build/icon.icns`]);
execFileSync("magick", [
  `${root}/public/app-icon.svg`, "-background", "none", "-resize", "256x256", "-define", "icon:auto-resize=256,128,64,48,32,24,16", `${root}/build/icon.ico`,
]);
console.log("icons rendered");
