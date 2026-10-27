import { Fragment, type ReactNode } from "react";
import { Markdown } from "@/components/Markdown";
import { cleanArticleHtml, isHtmlArticle, splitProductMarkers } from "@/lib/article-html";

// One renderer for the site and for the admin preview ("Як виглядатиме").
// renderProduct draws a [[product:slug]] card; the site passes real product data.
export function ArticleBody({
  body,
  preview = false,
  renderProduct,
}: {
  body: string;
  preview?: boolean;
  renderProduct: (slug: string) => ReactNode;
}) {
  const html = isHtmlArticle(body);
  return (
    <div className="article-body text-[17px] leading-[1.7] text-graphite">
      {splitProductMarkers(body).map((part, i) =>
        part.type === "product" ? (
          <Fragment key={i}>{renderProduct(part.slug)}</Fragment>
        ) : html ? (
          <div key={i} dangerouslySetInnerHTML={{ __html: cleanArticleHtml(part.value, { keepPlaceholders: preview }) }} />
        ) : (
          <Markdown key={i}>{part.value}</Markdown>
        ),
      )}
    </div>
  );
}
