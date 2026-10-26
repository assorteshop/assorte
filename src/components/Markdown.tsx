import ReactMarkdown from "react-markdown";

// Article text is Markdown: ## headings, **bold**, - lists, [link](url), ![photo](url).
// Raw HTML is not rendered, so pasted text can never inject scripts.
export function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      components={{
        h1: ({ children }) => <h2 className="mt-10 text-[28px] leading-tight">{children}</h2>,
        h2: ({ children }) => <h2 className="mt-10 text-[26px] leading-tight">{children}</h2>,
        h3: ({ children }) => <h3 className="mt-8 text-[20px] leading-snug">{children}</h3>,
        p: ({ children }) => <p className="mt-4 text-[16px] leading-[1.7]">{children}</p>,
        ul: ({ children }) => <ul className="mt-4 list-disc space-y-1.5 pl-6 text-[16px] leading-[1.7]">{children}</ul>,
        ol: ({ children }) => <ol className="mt-4 list-decimal space-y-1.5 pl-6 text-[16px] leading-[1.7]">{children}</ol>,
        blockquote: ({ children }) => (
          <blockquote className="mt-6 border-l-2 border-red pl-5 text-[16px] italic leading-[1.7]">{children}</blockquote>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            className="text-red underline underline-offset-4"
            {...(href?.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {children}
          </a>
        ),
        img: ({ src, alt }) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={typeof src === "string" ? src : ""} alt={alt ?? ""} loading="lazy" className="mt-6 w-full rounded-[6px]" />
        ),
        strong: ({ children }) => <strong className="font-medium">{children}</strong>,
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
