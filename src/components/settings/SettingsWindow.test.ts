import { createElement, type ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setLocale } from "@/lib/i18n";
import type { AppSettingsSection } from "@/state/store";
import type { Switch } from "../SettingsPrimitives";

const fixture = vi.hoisted(() => ({
  section: "overview" as AppSettingsSection,
  advanced: false,
  admin: true as boolean | null,
  config: {} as Record<string, unknown>,
  setAdvancedMode: vi.fn(),
  dispatch: vi.fn(),
  switches: [] as Array<{ "aria-labelledby"?: string; checked: boolean; onClick?: (event: never) => void }>,
}));
vi.mock("@/state/store", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/state/store")>(),
  api: vi.fn(() => new Promise(() => {})),
  useStore: () => ({ state: { appSettingsSection: fixture.section, appSettingsPhonePairing: 0, appSettingsCloudLink: 0, instances: [], bots: [], config: fixture.config, activeView: "chat" }, dispatch: fixture.dispatch }),
}));
vi.mock("@/lib/interface-mode", () => ({ useAdvancedMode: () => fixture.advanced, setAdvancedMode: fixture.setAdvancedMode }));
vi.mock("@/lib/use-owner-or-admin", () => ({ useOwnerOrAdmin: () => fixture.admin }));
vi.mock("@/lib/analytics", () => ({ analyticsEnabled: () => false, setAnalyticsEnabled: vi.fn(), track: vi.fn() }));
vi.mock("../DesktopCapabilities", () => ({ useDesktopCapabilities: () => ({ capabilities: { host: { platform: "darwin" } } }), windowFramed: () => false }));
vi.mock("../SettingsPrimitives", async (importOriginal) => {
  const original = await importOriginal<typeof import("../SettingsPrimitives")>();
  return { ...original, Switch: (props: ComponentProps<typeof Switch>) => { fixture.switches.push(props as never); return createElement(original.Switch, props); } };
});

import { SettingsModal } from "../SettingsModal";
import { profileMenuItems } from "../SidebarProfileMenu";

const COMPANION = { state: () => new Promise(() => {}) };
const desktopHere = (extra: Record<string, unknown> = {}) => ({ ogb: { platform: "darwin", companion: COMPANION, environments: { state: () => new Promise(() => {}) }, ...extra } });

beforeEach(() => {
  vi.clearAllMocks();
  fixture.section = "overview";
  fixture.advanced = false;
  fixture.admin = true;
  fixture.config = {};
  fixture.switches = [];
  vi.stubGlobal("window", desktopHere());
  vi.stubGlobal("document", { documentElement: { dataset: {} } });
  vi.stubGlobal("location", { host: "studio.example.com" });
  setLocale("en");
});
afterEach(() => { vi.unstubAllGlobals(); setLocale("en"); });

const render = (section: AppSettingsSection = fixture.section) => { fixture.section = section; return renderToStaticMarkup(createElement(SettingsModal)); };
const navPages = (html: string) => [...html.matchAll(/data-settings-page="([a-z]+)"/g)].map((match) => match[1]);

describe("the Settings window", () => {
  it("heads the list with this computer's About row, lists Your account among the pages, and pins This app to its foot", () => {
    fixture.advanced = true;
    const html = render();
    expect(navPages(html)).toEqual(["overview", "phone", "ai", "bots", "desktops", "vault", "usage", "transfer", "data", "account", "general", "appearance", "app"]);
    expect(html).toContain("About this computer");
    expect(html).toContain("Your account");
    expect(html).toContain("This app");
    expect(html).toContain('aria-current="page"');
    // The foot holds This app's row, after the scrolling list, so the list can scroll under it.
    const foot = html.indexOf("data-settings-footer");
    expect(foot).toBeGreaterThan(html.indexOf('data-settings-page="overview"'));
    expect(html.indexOf('data-settings-page="appearance"')).toBeLessThan(foot);
    expect(html.indexOf('data-settings-page="app"')).toBeGreaterThan(foot);
    // The place row is one plain line, like the page rows: no badge tile and no second line under it.
    const identity = html.indexOf("data-settings-identity");
    const placeRow = html.slice(identity, html.indexOf("</button>", identity));
    expect(placeRow).not.toContain("data-place-badge");
    expect(placeRow.match(/<span/g)?.length).toBe(2);
  });

  it("titles Overview with this computer's About name and its status line, never For …", () => {
    const html = render("overview");
    expect(html).toMatch(/<h2[^>]*>About this computer<\/h2>/);
    expect(html).toContain("Updates with the app");
    expect(html).not.toMatch(/data-settings-scope[^>]*>[^<]*For /);
  });

  it("says which place a place page changes, and that account and app pages stay the same, without “place” for a person with one place", () => {
    expect(render("phone")).toContain("This computer");
    const account = render("account");
    expect(account).toContain("Your MausBot account");
    expect(account).not.toContain("Same on every place");
    expect(render("appearance")).toContain("MausBot on this device");
    expect(render("appearance")).toContain("This app");
  });

  // Owner decision (Nov 11): Simple's nav is shorter, the same for every person and every rail. Fork: this build is
  // local-only, so Plan & billing is not offered and the list has eight entries.
  const SIMPLE_NAV = ["overview", "phone", "ai", "vault", "transfer", "account", "appearance", "app"];
  const SIMPLE_PEOPLE: Array<[string, () => void]> = [
    ["a person with only this computer", () => vi.stubGlobal("window", desktopHere({ cloudAccount: { state: () => new Promise(() => {}), onState: () => () => {} } }))],
    ["This computer's rail, with My Cloud", () => vi.stubGlobal("window", desktopHere({ cloudAccount: { state: () => new Promise(() => {}), onState: () => () => {} }, workspaces: { state: () => new Promise(() => {}), places: () => new Promise(() => {}) } }))],
    ["My Cloud's rail in the desktop window", () => { vi.stubGlobal("window", { ogb: { platform: "darwin", cloudPlan: { state: () => new Promise(() => {}) }, workspaces: { state: () => new Promise(() => {}), places: () => new Promise(() => {}) } } }); fixture.config = { cloudHome: true }; }],
    ["My Cloud in a browser", () => { vi.stubGlobal("window", {}); fixture.config = { cloudHome: true }; }],
  ];
  it.each(SIMPLE_PEOPLE)("shows Simple's eight entries for %s", (_who, set) => {
    set();
    fixture.advanced = false;
    expect(navPages(render("overview"))).toEqual(SIMPLE_NAV);
    fixture.advanced = true;
    const advanced = navPages(render("overview"));
    for (const page of ["bots", "desktops", "usage", "data", "general"]) expect(advanced).toContain(page);
  });

  it("keeps the rows a Simple person needs: language and notifications on This app", () => {
    fixture.advanced = false;
    const app = render("app");
    expect(app).toContain('data-settings-block="typing"');
    expect(app).toContain("Updates, language, notifications and help.");
    fixture.advanced = true;
    expect(render("app")).not.toContain('data-settings-block="typing"');
  });

  it("opens a link to a page Simple doesn't show, and lands there", () => {
    fixture.advanced = false;
    expect(render("general")).toMatch(/data-settings-page-open="general"/);
    expect(render("backups")).toMatch(/data-settings-page-open="transfer"/);
  });

  const order = (html: string, marks: string[]) => marks.map((mark) => html.indexOf(mark));
  const ascending = (places: number[]) => places.every((at, index) => at >= 0 && (index === 0 || at > places[index - 1]!));
  describe.each([["Simple", false], ["Advanced", true]] as const)("Import & export in %s", (_mode, advanced) => {
    beforeEach(() => { fixture.advanced = advanced; });

    it("is in the menu and holds Bring things in, then Take things out, in the owner's order", () => {
      const html = render("transfer");
      expect(html).toMatch(/data-settings-page="transfer"[^>]*>[\s\S]*?Import &amp; export/);
      expect(html).toMatch(/<h2[^>]*>Import &amp; export<\/h2>/);
      expect(ascending(order(html, ['data-settings-block="bring-in"', 'data-import-section="grok"', "Move from Grok Bot", 'data-import-section="apps"',
        "From your AI apps", "Import backup", 'data-settings-block="take-out"', "Export full backup"]))).toBe(true);
      expect(html).not.toContain("Bring in a bot from another app");
    });

    it("draws the Grok Bot mark in the row's leading slot, and opens nothing until Start is pressed", () => {
      const html = render("transfer");
      const row = html.slice(html.indexOf('data-import-section="grok"'), html.indexOf('data-import-section="apps"'));
      expect(row).toMatch(/data-settings-slot=""[^>]*>\s*<span aria-hidden="true"[^>]*>\s*<svg[^>]*viewBox="0 0 70 70"/);
      expect(row).toContain("fill-[var(--color-ink)]");
      expect(row).toMatch(/data-grok-move-open[^>]*aria-expanded="false"|aria-expanded="false"[^>]*data-grok-move-open/);
      expect(row).not.toContain("data-grok-move=");
    });

    it("opens from the helper's link and an old backups link", () => {
      expect(render("import")).toMatch(/data-settings-page-open="transfer"/);
      expect(render("backups")).toMatch(/data-settings-page-open="transfer"/);
    });

    it("shows on My Cloud in a browser, to a team's admin, and not at all to a team's member", () => {
      vi.stubGlobal("window", {});
      fixture.config = { cloudHome: true };
      expect(render("transfer")).toContain("Move from Grok Bot");
      fixture.config = { cloudHome: true, team: { name: "Acme" } };
      expect(navPages(render("overview"))).toContain("transfer");
      expect(render("transfer")).toContain("Move from Grok Bot");
      fixture.admin = false;
      expect(navPages(render("overview"))).not.toContain("transfer");
      const member = render("import");
      expect(member).toMatch(/data-settings-page-open="overview"/);
      expect(member).not.toContain("Move from Grok Bot");
      expect(member).not.toContain("data-backup-export");
    });

    it("leaves no import, export or backup row on Overview or Data", () => {
      for (const page of ["overview", "data"] as const) {
        const html = render(page);
        for (const gone of ["data-backup-export", "data-backup-import", "data-import-section", "Your data"]) expect(html, `${page}: ${gone}`).not.toContain(gone);
      }
    });
  });

  it("adds rows in Advanced on the pages both modes show", () => {
    fixture.advanced = false;
    const simple = render("appearance");
    fixture.advanced = true;
    const advanced = render("appearance");
    expect(simple).not.toContain("Chat width");
    expect(advanced).toContain("Chat width");
    expect(simple).toContain("Light or dark");
    expect(simple).toContain("Browse themes");
  });

  it("keeps the Advanced switch off the nav footer in this Simple-only build, with the unlock row on This app as the door", () => {
    // Fork: SIMPLE_ONLY hides the footer switch every page; the ten-tap unlock on This app is the way in.
    for (const page of ["overview", "phone", "appearance"] as const) expect(render(page)).not.toContain('id="settings-advanced-mode"');
    expect(render("app")).toContain("data-fork-unlock");
  });

  it("shows This computer's phone page with its pairing loading under the same title", () => {
    vi.stubGlobal("ogb", desktopHere().ogb);
    const html = render("phone");
    expect(html).toContain('data-phone-pairing="computer"');
    expect(html).toMatch(/<h2[^>]*>Phone &amp; devices<\/h2>/);
  });

  it("on My Cloud's page in the window: Phone & devices keeps its name and pairs with the Cloud, and This app rows it can't reach say so", () => {
    vi.stubGlobal("window", { ogb: { platform: "darwin", workspaces: { state: () => new Promise(() => {}), places: () => new Promise(() => {}) } } });
    fixture.config = { cloudHome: true };
    const phone = render("phone");
    expect(phone).toMatch(/<h2[^>]*>Phone &amp; devices<\/h2>/);
    expect(phone).not.toContain("This server");
    expect(phone).toContain("My Cloud");
    expect(render("overview")).toContain("Always on");
    fixture.advanced = true;
    const app = render("general");
    expect(app).toContain("Open at login");
    expect(app).toContain('data-settings-inert=""');
  });

  it("decides This app's rows and the account's place from one home: a Cloud page that is the app's home has them live", () => {
    fixture.advanced = true;
    fixture.config = { cloudHome: true };
    const cloudPage = (home: boolean) => vi.stubGlobal("window", { ogb: { platform: "darwin", workspaces: { state: () => new Promise(() => {}), places: () => new Promise(() => {}) },
      rail: { openComputer: () => Promise.resolve() },
      ...(home ? { home: {}, openAtLogin: { state: () => new Promise(() => {}), set: () => new Promise(() => {}) }, exportDiagnostics: () => Promise.resolve() } : {}) } });
    cloudPage(false);
    expect(render("general")).toContain('data-settings-inert=""');
    expect(render("app")).toMatch(/Check for updates from This computer[\s\S]*data-settings-reason/);
    cloudPage(true);
    expect(render("general")).not.toContain('data-settings-inert=""');
    expect(render("account")).not.toContain("On This computer");
  });

  it("in a browser: This browser, saved in this browser, with no startup or window rows", () => {
    vi.stubGlobal("window", {});
    fixture.advanced = true;
    fixture.config = { cloudHome: true };
    const general = render("general");
    expect(general).toContain("This browser");
    expect(general).toContain("Saved in this browser");
    expect(general).not.toContain("Open at login");
    expect(render("appearance")).not.toContain("Window frame");
  });

  it("offers a team's member no AI page (an old link lands on Overview and says so), and shows People to admins only", () => {
    vi.stubGlobal("window", {});
    fixture.config = { cloudHome: true, team: { name: "Acme" } };
    fixture.admin = false;
    expect(render("ai")).toContain("AI isn&#x27;t on Acme.");
    expect(navPages(render("overview"))).not.toContain("ai");
    expect(navPages(render("overview"))).not.toContain("people");
    fixture.admin = true;
    expect(navPages(render("overview"))).toContain("people");
  });

  it("opens an old page's link on its new page", () => {
    expect(render("decisionModel")).toMatch(/data-settings-page-open="ai"/);
    expect(render("companion")).toMatch(/data-settings-page-open="phone"/);
    expect(render("logins")).toMatch(/data-settings-page-open="vault"/);
  });

  it("uses one switch and one button family: the window draws every row in the Settings look", () => {
    expect(render("appearance")).toContain('data-settings-look="simple"');
  });
});

describe("the outer menu", () => {
  // This fork drew its own outer menu (SidebarProfileMenu), so its API and order are what these rows assert.
  const phoneRow = { key: "phone-devices", label: "Phone & devices", onSelect: () => {} };
  const toolRow = { key: "automations", label: "Automations", onSelect: () => {} };
  const callbacks = {
    onUsage: () => {}, onSettings: () => {}, onShortcuts: () => {}, onAbout: () => {}, onHelp: () => {}, onFeedback: () => {}, onAccount: () => {},
  };

  it("keeps Phone & devices and Settings in Advanced, with your account last", () => {
    const keys = profileMenuItems({ phone: [phoneRow], usage: false, update: null, account: "Ada Lovelace", ...callbacks }).map((item) => item.key);
    expect(keys).toEqual(["phone-devices", "support", "settings", "account"]);
  });

  it("files the sidebar's tools first in Simple, with Settings before the rest", () => {
    const rows = profileMenuItems({ phone: [phoneRow], usage: false, update: null, account: "Ada Lovelace",
      simple: { tools: [toolRow], places: [] }, ...callbacks });
    expect(rows.map((item) => item.key)).toEqual(["automations", "settings"]);
  });
});
