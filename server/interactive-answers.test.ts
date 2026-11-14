// One setting in three tiers: the card tools a conversation's agents server lists, and what the prompt teaches.
import { describe, expect, it } from "vitest";

import { COMPONENT_FENCE_TAG, INTERACTIVE_ANSWER_MODES, type InteractiveAnswerMode } from "../shared/interactive-answers.ts";
import { availableTools, catalogProfileFromEnv } from "./drivers/agents-catalog.ts";
import { INTERACTIVE_ANSWERS_ENV, interactiveAnswersFromEnv, toolListForInteractiveAnswers } from "./interactive-answers.ts";
import { COMPONENT_FENCE_PROMPT, HTML_PAGE_PROMPT, WIDGET_PROMPT, interactiveAnswersPrompt } from "./system-prompt.ts";

const TOOLS = ["attach_file", "show_widget", "show_html", "publish_page", "unpublish_page"].map((name) => ({ name }));

const listedAt = (mode: InteractiveAnswerMode) => availableTools(catalogProfileFromEnv({ [INTERACTIVE_ANSWERS_ENV]: mode })).map((tool) => tool.name);

describe("the interactive answers tier in a turn's environment", () => {
  it("is named OMB_INTERACTIVE_ANSWERS", () => {
    expect(INTERACTIVE_ANSWERS_ENV).toBe("OMB_INTERACTIVE_ANSWERS");
  });

  it("reads every tier back, and the whole card set from nothing", () => {
    for (const mode of INTERACTIVE_ANSWER_MODES) expect(interactiveAnswersFromEnv({ [INTERACTIVE_ANSWERS_ENV]: mode })).toBe(mode);
    expect(interactiveAnswersFromEnv({})).toBe("widgets+html");
    expect(interactiveAnswersFromEnv({ [INTERACTIVE_ANSWERS_ENV]: "" })).toBe("widgets+html");
    expect(interactiveAnswersFromEnv({ [INTERACTIVE_ANSWERS_ENV]: "components" })).toBe("widgets+html");
    expect(interactiveAnswersFromEnv({ [INTERACTIVE_ANSWERS_ENV]: "WIDGETS" })).toBe("widgets+html");
  });
});

describe("the card tools a tier leaves out", () => {
  it("takes both cards away at off, the page alone at widgets, and nothing at widgets+html", () => {
    expect(toolListForInteractiveAnswers(TOOLS, "off").map((tool) => tool.name)).toEqual(["attach_file", "publish_page", "unpublish_page"]);
    expect(toolListForInteractiveAnswers(TOOLS, "widgets").map((tool) => tool.name)).toEqual(["attach_file", "show_widget", "publish_page", "unpublish_page"]);
    expect(toolListForInteractiveAnswers(TOOLS, "widgets+html").map((tool) => tool.name)).toEqual(TOOLS.map((tool) => tool.name));
  });

  it("leaves the page-posting tools listed at every tier, and the list in its own order", () => {
    for (const mode of INTERACTIVE_ANSWER_MODES) expect(toolListForInteractiveAnswers(TOOLS, mode).map((tool) => tool.name)).toEqual(expect.arrayContaining(["publish_page", "unpublish_page"]));
    expect(toolListForInteractiveAnswers([], "off")).toEqual([]);
  });

  it("reaches the catalog a turn's agents server lists", () => {
    expect(listedAt("off")).not.toEqual(expect.arrayContaining(["show_widget", "show_html"]));
    expect(listedAt("widgets")).toEqual(expect.arrayContaining(["show_widget"]));
    expect(listedAt("widgets")).not.toContain("show_html");
    expect(listedAt("widgets+html")).toEqual(expect.arrayContaining(["show_widget", "show_html"]));
    for (const mode of INTERACTIVE_ANSWER_MODES) expect(listedAt(mode)).toEqual(expect.arrayContaining(["publish_page", "unpublish_page"]));
  });
});

describe("what the prompt teaches at each tier", () => {
  it("says nothing at all when replies carry no components", () => {
    expect(interactiveAnswersPrompt("off")).toBe("");
  });

  it("teaches the inline component fence below the widget tool's own sentence at widgets", () => {
    const prompt = interactiveAnswersPrompt("widgets");
    expect(prompt).toBe(WIDGET_PROMPT + COMPONENT_FENCE_PROMPT);
    expect(prompt).toContain(`fenced code block tagged ${COMPONENT_FENCE_TAG}`);
    expect(prompt).toContain("whose body is the same JSON widget tree show_widget takes");
    expect(prompt).toContain("Open the block on a line of its own, never inside a sentence");
    expect(prompt).toContain("nothing the person touches in it comes back to you, so a question they answer is still show_widget");
    expect(prompt).toContain("a Card with a Row of Buttons, one per option, whose onClickAction sends that option in one tap");
    expect(prompt).not.toContain("show_html");
    expect(prompt).not.toContain(HTML_PAGE_PROMPT);
  });

  it("adds the page guidance only at widgets+html, where a component still comes first", () => {
    const prompt = interactiveAnswersPrompt("widgets+html");
    expect(prompt).toBe(WIDGET_PROMPT + COMPONENT_FENCE_PROMPT + HTML_PAGE_PROMPT);
    expect(prompt).toContain("prefer a component; write HTML only for animation, a simulation, a canvas or something else a component cannot do");
  });
});
