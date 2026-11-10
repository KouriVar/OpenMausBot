import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, X } from "lucide-react";

import { cn } from "@/lib/cn";
import { t } from "@/lib/i18n";
import { SettingRow } from "./SettingsPrimitives";

const STUDIO_SRC = "./bloub/index.html";

/** The upstream Bloub studio, unchanged, in a full-screen sheet. */
export function BloubStudioSheet({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);
  return createPortal(
    <div className="fixed inset-0 z-[120] flex flex-col bg-black/50 p-3 sm:p-6" role="dialog" aria-modal="true" aria-label={t("settings.bloubAvatar.studio")}>
      <div className="mx-auto flex h-full w-full max-w-[1200px] flex-col overflow-hidden rounded-2xl border border-hairline/50 bg-panel shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-hairline/40 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-semibold text-ink">{t("settings.bloubAvatar.studio")}</span>
            <a href={STUDIO_SRC} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[12px] text-accent-text hover:underline">
              {t("settings.bloubAvatar.studioNewTab")}
              <ArrowUpRight size={12} aria-hidden="true" />
            </a>
          </div>
          <button type="button" onClick={onClose} aria-label={t("settings.bloubAvatar.studioClose")} title={t("settings.bloubAvatar.studioClose")}
            className="flex size-8 items-center justify-center rounded-full text-ink-secondary hover:bg-control hover:text-ink">
            <X size={16} />
          </button>
        </div>
        <iframe src={STUDIO_SRC} title={t("settings.bloubAvatar.studio")} className="min-h-0 w-full flex-1 border-0 bg-panel" />
      </div>
    </div>,
    document.body,
  );
}

/** The Appearance row's second line: open the studio the avatars come from. */
export function BloubStudioButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <SettingRow title={t("settings.bloubAvatar.studio")} subtitle={t("settings.bloubAvatar.studioSubtitle")}>
        <button type="button" onClick={() => setOpen(true)}
          className={cn("rounded-lg bg-control px-3 py-1.5 text-[13px] font-medium text-ink hover:bg-raised-hover", className)}>
          {t("settings.bloubAvatar.studioOpen")}
        </button>
      </SettingRow>
      {open && <BloubStudioSheet onClose={() => setOpen(false)} />}
    </>
  );
}
