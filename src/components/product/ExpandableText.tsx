"use client";

import { useEffect, useRef, useState } from "react";

// Long descriptions show about 7 lines with a "Читати більше" button.
const COLLAPSED = 176;

export function ExpandableText({ html }: { html: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [measured, setMeasured] = useState(false);
  const [overflow, setOverflow] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => {
      setOverflow(el.scrollHeight > COLLAPSED + 24);
      setMeasured(true);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [html]);

  const clamped = !open && (!measured || overflow);

  return (
    <div>
      <div className="relative">
        <div
          ref={box}
          id="product-description"
          style={clamped ? { maxHeight: COLLAPSED, overflow: "hidden" } : undefined}
          className="text-[15px] leading-[1.7] [&_li]:ml-1 [&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mt-3 [&_p:first-child]:mt-0 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        {clamped && overflow && (
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ivory to-transparent" />
        )}
      </div>
      {overflow && (
        <button
          type="button"
          aria-expanded={open}
          aria-controls="product-description"
          onClick={() => setOpen((v) => !v)}
          className="mt-3 text-[14px] font-medium text-red underline underline-offset-4"
        >
          {open ? "Згорнути" : "Читати більше"}
        </button>
      )}
    </div>
  );
}
