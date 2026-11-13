/** On Windows titleBarStyle "hidden" without titleBarOverlay removes the caption buttons too, so the renderer draws them:
 * the WCO overlay API cannot style hover. */
/** The canvas colour a window paints before the renderer loads: the light or dark theme's, so neither flashes the other. */
export function windowBackground(prefersDark) {
  return prefersDark ? "#121212" : "#fcfcfc";
}

/** macOS: the system material behind the sidebar. `sidebar` is the one Finder's and Aside's columns use; `under-window`
 * samples the whole desktop behind the window instead. OMB_VIBRANCY_STYLE picks one for comparing them by hand. */
export function sidebarVibrancyStyle(env = process.env) {
  return env.OMB_VIBRANCY_STYLE === "under-window" ? "under-window" : "sidebar";
}

/** The window's own material options: nothing outside macOS, where the sidebar keeps its solid ground. */
export function windowVibrancyOptions(platform, env = process.env) {
  if (platform !== "darwin") return {};
  return { vibrancy: sidebarVibrancyStyle(env), visualEffectState: "followWindow", backgroundColor: "#00000000" };
}

/** macOS: where the traffic lights (14px) sit. In the frame's 28px top bar, 12px in, while the page beside the rail draws
 * that frame (src/components/WindowFrameBar.tsx); where an older page made room for them otherwise. The window opens with
 * them in the bar, and main moves them as each page says (chrome-rail.mjs). */
export const TRAFFIC_LIGHTS = { framed: { x: 12, y: 7 }, unframed: { x: 16, y: 16 } };

/** `frame`: the window draws its own frame (the person may turn it off): on macOS the traffic lights open where it puts
 * them, and on Windows the app draws its caption buttons, or else the system's own title bar comes back. */
export function windowChromeOptions(platform, frame = true) {
  if (platform === "darwin") {
    return { titleBarStyle: "hiddenInset", trafficLightPosition: frame ? TRAFFIC_LIGHTS.framed : TRAFFIC_LIGHTS.unframed };
  }
  if (platform === "win32") {
    return frame ? { titleBarStyle: "hidden" } : {};
  }
  return {};
}
