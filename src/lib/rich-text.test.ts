import { describe, expect, it } from "vitest";
import { onlineDiscount } from "./pricing";
import { plainTextOf, richTextToHtml, sanitizeRichText } from "./rich-text";

describe("sanitizeRichText", () => {
  it("keeps bold, italic, underline, breaks and lists", () => {
    const out = sanitizeRichText("<p>Текст <b>жирний</b>, <i>курсив</i>, <u>підкреслений</u><br>рядок</p><ul><li>один</li></ul>");
    expect(out).toContain("<strong>жирний</strong>");
    expect(out).toContain("<em>курсив</em>");
    expect(out).toContain("<u>підкреслений</u>");
    expect(out).toContain("<br />");
    expect(out).toContain("<li>один</li>");
  });
  it("removes scripts, links, styles and event handlers", () => {
    const out = sanitizeRichText(
      '<p style="color:red" onclick="x()">а<script>alert(1)</script><a href="javascript:alert(1)">клік</a><img src=x onerror=alert(1)></p>',
    );
    expect(out).toBe("<p>аклік</p>");
  });
});

describe("richTextToHtml", () => {
  it("turns old plain text into paragraphs and escapes it", () => {
    expect(richTextToHtml("Перший\n\nДругий: 5 < 6 & ще")).toBe("<p>Перший</p><p>Другий: 5 &lt; 6 &amp; ще</p>");
    expect(richTextToHtml("рядок1\nрядок2")).toBe("<p>рядок1<br>рядок2</p>");
  });
  it("returns an empty string for empty input", () => {
    expect(richTextToHtml(null)).toBe("");
    expect(richTextToHtml("   ")).toBe("");
  });
  it("cleans stored HTML again when showing it", () => {
    expect(richTextToHtml("<p>ок</p><script>1</script>")).toBe("<p>ок</p>");
  });
});

describe("plainTextOf / onlineDiscount", () => {
  it("strips tags", () => {
    expect(plainTextOf("<p>Привіт <strong>світ</strong></p><p>ще</p>")).toBe("Привіт світ ще");
  });
  it("is 5 percent, rounded", () => {
    expect(onlineDiscount(1500)).toBe(75);
    expect(onlineDiscount(1990)).toBe(100);
    expect(onlineDiscount(0)).toBe(0);
  });
});
