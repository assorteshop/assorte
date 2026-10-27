import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { RichTextEditor } from "./RichTextEditor";

describe("RichTextEditor renders", () => {
  it("shows the toolbar and keeps old plain text as paragraphs", () => {
    const html = renderToString(createElement(RichTextEditor, { name: "description", initial: "Перший\n\nДругий", label: "Опис" }));
    expect(html).toContain('aria-label="Жирний (Cmd+B)"');
    expect(html).toContain('aria-label="Курсив (Cmd+I)"');
    expect(html).toContain('aria-label="Підкреслений (Cmd+U)"');
    expect(html).toContain("<p>Перший</p>");
    expect(html).toContain('name="description"');
  });
  it("starts empty without a description", () => {
    const html = renderToString(createElement(RichTextEditor, { name: "description", initial: null, label: "Опис" }));
    expect(html).toContain('value=""');
  });
});
