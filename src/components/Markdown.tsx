import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { rewriteHref } from "@/lib/article-html";

// Article text is Markdown: ## headings, **bold**, - lists, [link](url), ![photo](url).
// Raw HTML is not rendered, so pasted text can never inject scripts.
export function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => <h2 className="mt-10 text-[28px] leading-tight">{children}</h2>,
        h2: ({ children }) => <h2 className="mt-10 text-[26px] leading-tight">{children}</h2>,
        h3: ({ children }) => <h3 className="mt-8 text-[20px] leading-snug">{children}</h3>,
        ul: ({ children }) => <ul className="mt-4 list-disc space-y-1.5 pl-6 text-[16px] leading-[1.7]">{children}</ul>,
        ol: ({ children }) => <ol className="mt-4 list-decimal space-y-1.5 pl-6 text-[16px] leading-[1.7]">{children}</ol>,
        blockquote: ({ children }) => (
          <blockquote className="mt-6 border-l-2 border-red pl-5 text-[16px] italic leading-[1.7]">{children}</blockquote>
        ),
        table: ({ children }) => (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[440px] border-collapse text-[15px] leading-normal">{children}</table>
          </div>
        ),
        th: ({ children }) => (
          <th className="bg-graphite px-4 py-3 text-left font-medium text-white first:rounded-tl-[10px] last:rounded-tr-[10px]">{children}</th>
        ),
        td: ({ children }) => <td className="border-b border-[#E6E2DC] px-4 py-3">{children}</td>,
        tr: ({ children }) => <tr className="even:bg-[#FAF8F5]">{children}</tr>,
        a: ({ href, children }) => (
          <a
            href={href ? rewriteHref(href) : href}
            className="text-red underline underline-offset-4"
            {...(href?.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {children}
          </a>
        ),
        img: ({ src, alt, title }) => (
          <figure className="mt-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={typeof src === "string" ? src : ""} alt={alt ?? ""} loading="lazy" className="w-full rounded-[16px]" />
            {title && <figcaption className="mt-2.5 text-[14px] text-[#8A847C]">{title}</figcaption>}
          </figure>
        ),
        p: ({ node, children }) => {
          // An image alone in a paragraph becomes a <figure>: avoid <figure> inside <p>.
          const only = node?.children.length === 1 && node.children[0].type === "element" && node.children[0].tagName === "img";
          return only ? <>{children}</> : <p className="mt-4 text-[17px] leading-[1.7]">{children}</p>;
        },
        strong: ({ children }) => <strong className="font-medium">{children}</strong>,
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
