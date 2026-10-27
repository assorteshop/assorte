import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/app/actions/review", () => ({ submitReview: async () => ({ status: "idle" }) }));

import { ProductTabs } from "./ProductTabs";
import { ReviewsPanel } from "./ReviewsPanel";
import { ReviewsSummaryLink } from "./ReviewsSummaryLink";
import { Stars } from "./Stars";

const text = (html: string) => html.replace(/<!-- -->/g, "");

describe("ProductTabs", () => {
  const html = text(
    renderToString(
      createElement(ProductTabs, {
        description: createElement("p", null, "ТЕКСТ ОПИСУ"),
        specs: createElement("p", null, "ТЕКСТ ХАРАКТЕРИСТИК"),
        reviews: createElement("p", null, "ТЕКСТ ВІДГУКІВ"),
        reviewCount: 3,
      }),
    ),
  );
  it("has three tabs in the right order, the review count on the last", () => {
    const labels = [...html.matchAll(/role="tab"[^>]*>([^<]+)</g)].map((m) => m[1]);
    expect(labels).toEqual(["Опис", "Характеристики", "Відгуки (3)"]);
  });
  it("opens Опис by default and keeps the other panels hidden but in the page", () => {
    expect(html).toMatch(/id="tab-description"[^>]*aria-selected="true"/);
    expect(html).toMatch(/id="tab-specs"[^>]*aria-selected="false"/);
    expect(html).toMatch(/id="panel-description"[^>]*role="tabpanel"(?![^>]*hidden)/);
    expect(html).toMatch(/id="panel-specs"[^>]*hidden/);
    expect(html).toMatch(/id="panel-reviews"[^>]*hidden/);
    for (const t of ["ТЕКСТ ОПИСУ", "ТЕКСТ ХАРАКТЕРИСТИК", "ТЕКСТ ВІДГУКІВ"]) expect(html).toContain(t);
  });
  it("shows plain 'Відгуки' without a number when there are none", () => {
    const empty = text(
      renderToString(createElement(ProductTabs, { description: null, specs: null, reviews: null, reviewCount: 0 })),
    );
    expect(empty).toContain(">Відгуки<");
  });
});

describe("rating under the price", () => {
  it("never shows a rating when there are no reviews", () => {
    const html = text(renderToString(createElement(ReviewsSummaryLink, { count: 0, average: 0 })));
    expect(html).toContain("Поки немає відгуків");
    expect(html).toContain('aria-label="Ще без оцінок"');
    expect(html).toContain("width:0%");
  });
  it("shows the average and the count of real reviews", () => {
    const html = text(renderToString(createElement(ReviewsSummaryLink, { count: 12, average: 4.5 })));
    expect(html).toContain("4,5");
    expect(html).toContain("12 відгуків");
    expect(html).toContain("width:90%");
    expect(html).toContain('aria-label="Рейтинг 4,5 з 5"');
  });
  it("fills stars in proportion to the rating", () => {
    expect(text(renderToString(createElement(Stars, { rating: 5 })))).toContain("width:100%");
    expect(text(renderToString(createElement(Stars, { rating: 3.5 })))).toContain("width:70%");
  });
});

describe("ReviewsPanel", () => {
  it("lists reviews with author, text and a form; empty state otherwise", () => {
    const html = text(
      renderToString(
        createElement(ReviewsPanel, {
          slug: "p",
          reviews: {
            count: 2,
            average: 4.5,
            items: [
              { id: "1", author_name: "Олена", rating: 5, body: "Чудовий товар, рекомендую.", created_at: "2026-10-20T10:00:00Z" },
              { id: "2", author_name: "Іван", rating: 4, body: "Непогано, але доставка довга.", created_at: "2026-10-21T10:00:00Z" },
            ],
          },
        }),
      ),
    );
    expect(html).toContain("Олена");
    expect(html).toContain("Чудовий товар");
    expect(html).toContain("2 відгуки");
    expect(html).toContain("Залишити відгук");
    const none = text(renderToString(createElement(ReviewsPanel, { slug: "p", reviews: { count: 0, average: 0, items: [] } })));
    expect(none).toContain("Відгуків поки немає");
    expect(none).toContain('name="website"');
  });
  it("escapes review text so nothing can inject markup", () => {
    const html = renderToString(
      createElement(ReviewsPanel, {
        slug: "p",
        reviews: { count: 1, average: 5, items: [{ id: "1", author_name: "<b>x</b>", rating: 5, body: "<script>alert(1)</script> текст", created_at: "2026-10-20T10:00:00Z" }] },
      }),
    );
    expect(html).not.toContain("<script>alert");
    expect(html).toContain("&lt;script&gt;");
  });
});
