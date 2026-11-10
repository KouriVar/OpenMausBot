import { afterEach, describe, expect, it } from "vitest";

import { setLocale } from "@/lib/i18n";
import { localizedIntroText, localizedSetupChoice } from "./zh-intro";

afterEach(() => setLocale(undefined));

describe("zh-CN for the new bot's greeting and setup card", () => {
  it("maps the server's five setup choices to the card's zh-CN labels", () => {
    setLocale("zh");
    expect(localizedSetupChoice("Research and digging into topics")).toBe("调研和深挖各种主题");
    expect(localizedSetupChoice("Keeping an eye on things for me")).toBe("帮我盯着一些事情");
    expect(localizedSetupChoice("Email, calendar and messages")).toBe("邮件、日历和消息");
    expect(localizedSetupChoice("Bookings, shopping and errands")).toBe("预订、购物和跑腿");
    expect(localizedSetupChoice("Data, spreadsheets and reports")).toBe("数据、表格和报告");
  });

  it("leaves an unknown choice in the server's own words", () => {
    setLocale("zh");
    expect(localizedSetupChoice("Something the server made up")).toBe("Something the server made up");
  });

  it("writes the opening line in zh-CN and keeps the bot's name", () => {
    setLocale("zh");
    expect(localizedIntroText("Hi, I'm Ava. What would you like me to do?")).toBe("你好，我是 Ava。你希望我先帮你做什么？");
  });

  it("only touches that exact opening line", () => {
    setLocale("zh");
    expect(localizedIntroText("Hi, I'm Ava.")).toBeNull();
    expect(localizedIntroText("Morning, I'm Ava. What should we do?")).toBeNull();
  });

  it("leaves English alone", () => {
    setLocale("en");
    expect(localizedIntroText("Hi, I'm Ava. What would you like me to do?")).toBe("Hi, I'm Ava. What would you like me to do?");
    expect(localizedSetupChoice("Research and digging into topics")).toBe("Research and digging into topics");
  });
});
