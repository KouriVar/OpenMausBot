// Fork: the new-bot greeting and the setup card's choices arrive from the server as English text, so a zh-CN
// screen showed them in English. These map the server's own words to the locale keys the card already has, for
// display only: a pick still sends the server the words it sent us.
import { t } from "@/lib/i18n";
import type { LocaleKey } from "@/locales";

const CHOICE_KEYS: Record<string, LocaleKey> = {
  "Research and digging into topics": "chat.setupCard.research",
  "Keeping an eye on things for me": "chat.setupCard.watch",
  "Email, calendar and messages": "chat.setupCard.inbox",
  "Bookings, shopping and errands": "chat.setupCard.errands",
  "Data, spreadsheets and reports": "chat.setupCard.data",
};

/** A setup choice as the locale writes it; an unknown choice keeps the server's words. */
export function localizedSetupChoice(choice: string): string {
  const key = CHOICE_KEYS[choice];
  return key ? t(key) : choice;
}

const GREETING = /^Hi, I'm (.+)\. What would you like me to do\?$/;

/** The new bot's opening line, in the locale, when it is exactly that line; anything else is left alone. */
export function localizedIntroText(text: string): string | null {
  const match = GREETING.exec(text);
  return match ? t("chat.setupCard.greeting", { name: match[1]! }) : null;
}
