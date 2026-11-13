// The painter's layer: a stream that sends the same page at two resolutions must not re-size (and so clear) the canvas
// for every frame, because a resize per frame is what made the browser panel flash black for a few frames.
import { afterEach, describe, expect, it, vi } from "vitest";

import { createPreviewFramePainter } from "./browser-stream-client";

interface CanvasSize {
  width: number;
  height: number;
}

const flush = async () => {
  for (let i = 0; i < 6; i++) await new Promise((resolve) => setTimeout(resolve, 0));
};

/** A canvas whose backing-store writes are visible: each `width`/`height` assignment clears it. */
function fakeCanvas(panel: CanvasSize) {
  const drawn: CanvasSize[] = [];
  const resets: CanvasSize[] = [];
  let width = 0;
  let height = 0;
  const canvas = {
    clientWidth: panel.width,
    clientHeight: panel.height,
    getContext: () => ({
      drawImage: (_image: unknown, _x: number, _y: number, toWidth: number, toHeight: number) => drawn.push({ width: toWidth, height: toHeight }),
    }),
  };
  Object.defineProperty(canvas, "width", {
    get: () => width,
    set: (value: number) => {
      width = value;
      height = 0;
      resets.push({ width, height });
    },
  });
  Object.defineProperty(canvas, "height", {
    get: () => height,
    set: (value: number) => {
      height = value;
    },
  });
  return { canvas: canvas as unknown as HTMLCanvasElement, drawn, resets, size: () => ({ width, height }) };
}

/** The sizes a real session mixes: a still at the page's own pixels, screencast frames capped to the panel, and half-size frames while scrolling. */
const frame = (size: CanvasSize) => size;

const painterFor = (panel: CanvasSize, frames: CanvasSize[], ratio = 2) => {
  const host = fakeCanvas(panel);
  const queue = [...frames];
  vi.stubGlobal("devicePixelRatio", ratio);
  vi.stubGlobal("createImageBitmap", async () => {
    const next = queue.shift() ?? frames.at(-1)!;
    return { ...next, close() {} };
  });
  return { host, painter: createPreviewFramePainter(host.canvas) };
};

afterEach(() => vi.unstubAllGlobals());

describe("the painter keeps one layer for one page", () => {
  it("draws a smaller frame of the same page into the layer it has, without clearing it", async () => {
    // A 600x780 panel on a 2x screen shows 1200x1560 device pixels; a still comes at the page's 2560x3118, the
    // screencast at 1200x1462, and a scrolling frame at 600x731.
    const { host, painter } = painterFor({ width: 600, height: 780 }, [
      frame({ width: 2560, height: 3118 }),
      frame({ width: 1200, height: 1462 }),
      frame({ width: 600, height: 731 }),
    ]);
    painter.paint(new ArrayBuffer(8));
    await flush();
    expect(host.size()).toEqual({ width: 1200, height: 1462 });
    expect(host.resets).toHaveLength(1);

    painter.paint(new ArrayBuffer(8));
    await flush();
    painter.paint(new ArrayBuffer(8));
    await flush();
    // No further resize: the canvas keeps its layer and every later frame is drawn into it.
    expect(host.resets).toHaveLength(1);
    expect(host.drawn).toEqual([
      { width: 1200, height: 1462 },
      { width: 1200, height: 1462 },
      { width: 1200, height: 1462 },
    ]);
  });

  it("never keeps a picture larger than the panel can show, and keeps its shape", async () => {
    const { host, painter } = painterFor({ width: 600, height: 780 }, [frame({ width: 4000, height: 3000 })]);
    painter.paint(new ArrayBuffer(8));
    await flush();
    expect(host.size()).toEqual({ width: 1200, height: 900 });
  });

  it("re-sizes for a picture of another shape, whose letterbox in the panel differs", async () => {
    const { host, painter } = painterFor({ width: 600, height: 780 }, [frame({ width: 1280, height: 800 }), frame({ width: 390, height: 844 })]);
    painter.paint(new ArrayBuffer(8));
    await flush();
    // The 1280-wide frame is cut to the panel's 1200 device pixels, keeping its shape.
    expect(host.size()).toEqual({ width: 1200, height: 750 });
    painter.paint(new ArrayBuffer(8));
    await flush();
    expect(host.size()).toEqual({ width: 390, height: 844 });
    expect(host.resets).toHaveLength(2);
  });

  it("grows the layer when a sharper frame of the same page arrives, then stays", async () => {
    const { host, painter } = painterFor({ width: 600, height: 780 }, [frame({ width: 600, height: 731 }), frame({ width: 1200, height: 1462 }), frame({ width: 1200, height: 1462 })]);
    painter.paint(new ArrayBuffer(8));
    await flush();
    expect(host.size()).toEqual({ width: 600, height: 731 });
    painter.paint(new ArrayBuffer(8));
    await flush();
    expect(host.size()).toEqual({ width: 1200, height: 1462 });
    painter.paint(new ArrayBuffer(8));
    await flush();
    expect(host.resets).toHaveLength(2);
  });
});
