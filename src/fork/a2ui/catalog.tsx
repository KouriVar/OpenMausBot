// Each A2UI basic catalog entry, drawn by this chat's components. A catalog built
// from these replaces every built-in web component, so no default A2UI style or
// native control reaches the page.
import { createContext, useContext, useState, type CSSProperties, type ReactNode } from "react";

import { createComponentImplementation, createBinderlessComponentImplementation, MarkdownComponentContext } from "@a2ui/react";
import { Catalog, type ComponentApi } from "@a2ui/web_core";
import { BASIC_FUNCTIONS } from "@a2ui/web_core/catalogs/basic/v1";
import { cn } from "@/lib/cn";
import { t } from "@/lib/i18n";
import {
  ArrowLeft, ArrowRight, Bell, BellOff, Calendar, CalendarDays, Check, CircleAlert, CircleHelp, CreditCard, Download,
  EllipsisVertical, Eye, EyeOff, Folder, House, Image as ImageIcon, Info, Lock, Mail, MapPin, Menu, MoreHorizontal,
  Paperclip, Pause, Pencil, Phone, Play, Plus, RefreshCw, Search, Send, Settings, Share2, Square, Star, Trash2,
  TriangleAlert, Upload, User, UserRound, Volume2, X,
} from "@/lib/icons";
import { A2UI_BASIC_APIS, A2UI_CATALOG_ID, tableApi } from "./schema";
import { A2uiCheckBox, A2uiChoicePicker, A2uiDateTimeInput, A2uiSlider, A2uiTextField } from "./controls";

const JUSTIFY: Record<string, string> = {
  start: "justify-start", center: "justify-center", end: "justify-end",
  spaceBetween: "justify-between", spaceAround: "justify-around", spaceEvenly: "justify-evenly", stretch: "justify-start",
};
const ALIGN: Record<string, string> = { start: "items-start", center: "items-center", end: "items-end", stretch: "items-stretch" };

const weight = (value: number | undefined): CSSProperties | undefined => (value === undefined ? undefined : { flexGrow: value, flexBasis: 0 });

const ChildBuilder = createContext<(id: string) => ReactNode>(() => null);

function Children({ ids }: { ids: unknown }) {
  const build = useContext(ChildBuilder);
  const list = Array.isArray(ids) ? ids.filter((id): id is string => typeof id === "string") : [];
  return <>{list.map((id) => <Child key={id} id={id} build={build} />)}</>;
}

function Child({ id, build }: { id: string; build: (id: string) => ReactNode }) {
  return <>{build(id)}</>;
}

const Text = createComponentImplementation(A2UI_BASIC_APIS.Text, ({ props }) => {
  const Markdown = useContext(MarkdownComponentContext);
  return (
    <div dir="auto" className={props.variant === "caption" ? "text-[12px] leading-4 text-ink-secondary" : "text-[14px] leading-5 text-ink"}>
      {Markdown ? <Markdown markdown={props.text} /> : props.text}
    </div>
  );
});

const Row = createComponentImplementation(A2UI_BASIC_APIS.Row, ({ props, buildChild }) => (
  <div style={weight(props.weight)} className={cn("flex min-w-0 gap-2.5", JUSTIFY[props.justify ?? "start"], ALIGN[props.align ?? "stretch"])}>
    <ChildBuilder value={buildChild}><Children ids={props.children} /></ChildBuilder>
  </div>
));

const Column = createComponentImplementation(A2UI_BASIC_APIS.Column, ({ props, buildChild }) => (
  <div style={weight(props.weight)} className={cn("flex min-w-0 flex-col gap-2.5", JUSTIFY[props.justify ?? "start"], ALIGN[props.align ?? "stretch"])}>
    <ChildBuilder value={buildChild}><Children ids={props.children} /></ChildBuilder>
  </div>
));

const List = createComponentImplementation(A2UI_BASIC_APIS.List, ({ props, buildChild }) => (
  <div style={weight(props.weight)} className={cn("flex min-w-0 gap-2", props.direction === "horizontal" ? "flex-row flex-wrap" : "flex-col", ALIGN[props.align ?? "stretch"])}>
    <ChildBuilder value={buildChild}><Children ids={props.children} /></ChildBuilder>
  </div>
));

const Card = createComponentImplementation(A2UI_BASIC_APIS.Card, ({ props, buildChild }) => (
  <div style={weight(props.weight)} className="w-full min-w-0 rounded-2xl bg-composer p-4 ring-1 ring-composer-ring">
    {buildChild(props.child)}
  </div>
));

const Divider = createComponentImplementation(A2UI_BASIC_APIS.Divider, ({ props }) => (
  props.axis === "vertical"
    ? <span aria-hidden="true" className="mx-1 w-px self-stretch bg-hairline/60" />
    : <span aria-hidden="true" className="my-1 h-px w-full bg-hairline/60" />
));

const BUTTON = "inline-flex h-9 max-w-full shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-4 text-[14px] font-medium leading-5 transition-[background-color,color,filter,opacity] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-45";
const BUTTON_LOOK: Record<string, string> = {
  primary: "bg-accent text-accent-ink hover:brightness-110",
  default: "bg-ink/[0.07] text-ink hover:bg-ink/[0.12]",
  borderless: "px-1.5 text-accent hover:underline",
};

const Button = createComponentImplementation(A2UI_BASIC_APIS.Button, ({ props, buildChild }) => (
  <button type="button" onClick={() => void props.action()} disabled={props.isValid === false} className={cn(BUTTON, BUTTON_LOOK[props.variant ?? "default"])}>
    <span className="flex min-w-0 items-center gap-1.5">{buildChild(props.child)}</span>
  </button>
));

const TextField = createComponentImplementation(A2UI_BASIC_APIS.TextField, ({ props }) => (
  <A2uiTextField label={props.label} value={props.value} placeholder={props.placeholder} long={props.variant === "longText"} numeric={props.variant === "number"} onChange={props.setValue} />
));

const CheckBox = createComponentImplementation(A2UI_BASIC_APIS.CheckBox, ({ props }) => (
  <A2uiCheckBox label={props.label} checked={props.value === true} onChange={props.setValue} />
));

const ChoicePicker = createComponentImplementation(A2UI_BASIC_APIS.ChoicePicker, ({ props }) => (
  <A2uiChoicePicker label={props.label} options={props.options.map((option) => ({ label: option.label ?? option.value, value: option.value }))} value={(props.value ?? []) as string[]} onChange={props.setValue}
    multiple={props.variant === "multipleSelection"} chips={props.displayStyle === "chips"} />
));

const Slider = createComponentImplementation(A2UI_BASIC_APIS.Slider, ({ props }) => (
  <A2uiSlider label={props.label} value={props.value ?? props.min ?? 0} min={props.min ?? 0} max={props.max} steps={props.steps} onChange={props.setValue} />
));

const DateTimeInput = createComponentImplementation(A2UI_BASIC_APIS.DateTimeInput, ({ props }) => (
  <A2uiDateTimeInput value={props.value} onChange={props.setValue} enableDate={props.enableDate === true} enableTime={props.enableTime === true} min={props.min} max={props.max} />
));

const Tabs = createComponentImplementation(A2UI_BASIC_APIS.Tabs, ({ props, buildChild }) => {
  const [active, setActive] = useState(0);
  const tabs = props.tabs ?? [];
  const shown = tabs[Math.min(active, Math.max(0, tabs.length - 1))];
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div role="tablist" className="flex min-w-0 flex-wrap gap-1 rounded-full bg-ink/[0.06] p-1">
        {tabs.map((tab, index) => (
          <button key={`${tab.title}:${index}`} type="button" role="tab" aria-selected={index === active} onClick={() => setActive(index)}
            className={cn("min-w-0 rounded-full px-3 py-1 text-[13px] font-medium leading-[18px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
              index === active ? "bg-raised text-ink shadow-sm" : "text-ink-secondary hover:text-ink")}>
            <span dir="auto" className="block truncate">{tab.title}</span>
          </button>
        ))}
      </div>
      <div role="tabpanel" className="min-w-0">{shown ? buildChild(shown.child) : null}</div>
    </div>
  );
});

const ICONS: Record<string, typeof Check> = {
  accountCircle: UserRound, add: Plus, arrowBack: ArrowLeft, arrowForward: ArrowRight, attachFile: Paperclip,
  calendarToday: Calendar, call: Phone, check: Check, close: X, delete: Trash2, download: Download, edit: Pencil,
  event: CalendarDays, error: CircleAlert, folder: Folder, help: CircleHelp, home: House, info: Info, locationOn: MapPin,
  lock: Lock, mail: Mail, menu: Menu, moreVert: EllipsisVertical, moreHoriz: MoreHorizontal, notificationsOff: BellOff,
  notifications: Bell, pause: Pause, payment: CreditCard, person: User, phone: Phone, photo: ImageIcon, play: Play,
  refresh: RefreshCw, search: Search, send: Send, settings: Settings, share: Share2, star: Star, stop: Square,
  upload: Upload, visibility: Eye, visibilityOff: EyeOff, volumeUp: Volume2, warning: TriangleAlert,
};

const Icon = createComponentImplementation(A2UI_BASIC_APIS.Icon, ({ props }) => {
  const Glyph = typeof props.name === "string" ? ICONS[props.name] : undefined;
  return Glyph ? <Glyph aria-hidden="true" size={16} strokeWidth={1.8} className="shrink-0" /> : null;
});

function UnsupportedLine() {
  return <div className="text-[12px] leading-4 text-ink-tertiary">{t("a2ui.unsupported")}</div>;
}

// Image, Video, AudioPlayer and Modal are reserved for later: they say so in
// one gray line instead of failing the surface.
const Image = createComponentImplementation(A2UI_BASIC_APIS.Image, () => <UnsupportedLine />);
const Video = createBinderlessComponentImplementation(A2UI_BASIC_APIS.Video, () => <UnsupportedLine />);
const AudioPlayer = createBinderlessComponentImplementation(A2UI_BASIC_APIS.AudioPlayer, () => <UnsupportedLine />);
const Modal = createBinderlessComponentImplementation(A2UI_BASIC_APIS.Modal, () => <UnsupportedLine />);

const Table = createComponentImplementation(tableApi, ({ props }) => (
  <div style={weight(props.weight)} className="w-full min-w-0 overflow-x-auto">
    <table className="w-full border-collapse text-left text-[13px] leading-[18px] text-ink">
      <thead>
        <tr className="border-b border-hairline/60">
          {props.columns.map((column, index) => <th key={index} scope="col" dir="auto" className="px-2 py-1.5 font-medium text-ink-secondary">{column}</th>)}
        </tr>
      </thead>
      <tbody>
        {props.rows.map((row, rowIndex) => (
          <tr key={rowIndex} className="border-b border-hairline/30 last:border-0">
            {row.map((cell, cellIndex) => <td key={cellIndex} dir="auto" className="px-2 py-1.5 align-top">{cell}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
));

const implementations = [
  Text, Image, Icon, Video, AudioPlayer, Row, Column, List, Card, Tabs, Modal, Divider,
  Button, TextField, CheckBox, ChoicePicker, Slider, DateTimeInput, Table,
  // @a2ui/react's published types name zod's type from its peer (the app's zod 4),
  // while every schema here comes from web_core's zod 3; the values are what the
  // binder reads, so only the annotation needs bridging.
] as unknown as ComponentApi[];

// openUrl is pruned here as on the server: a component never opens a page by itself.
export const ombA2uiCatalog = new Catalog(A2UI_CATALOG_ID, "1.0", implementations, BASIC_FUNCTIONS.filter((entry) => entry.name !== "openUrl"));
