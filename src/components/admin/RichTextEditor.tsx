"use client";

import { useRef, useState } from "react";
import { Bold, Italic, List, ListOrdered, RemoveFormatting, Underline } from "lucide-react";
import { richTextToHtml, sanitizeRichText } from "@/lib/rich-text";

// A small editor for product descriptions: bold, italic, underline, lists.
// It stores clean HTML in a hidden field; the server cleans it once more before saving.
export function RichTextEditor({ name, initial, label }: { name: string; initial?: string | null; label: string }) {
  // The starting text is fixed once; later edits live in the editable box itself.
  const [start] = useState(() => richTextToHtml(initial));
  const box = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState(start);

  const sync = () => setHtml(sanitizeRichText(box.current?.innerHTML ?? ""));

  const run = (command: string) => {
    box.current?.focus();
    document.execCommand(command);
    sync();
  };

  const tool =
    "grid size-9 place-items-center rounded-[4px] border border-line bg-white hover:border-graphite";

  return (
    <div>
      <p className="text-[13px]">{label}</p>
      <div className="mt-1.5 rounded-[4px] border border-line bg-white">
        <div className="flex flex-wrap gap-1.5 border-b border-line p-2" role="toolbar" aria-label="Форматування тексту">
          {[
            { cmd: "bold", icon: Bold, title: "Жирний (Cmd+B)" },
            { cmd: "italic", icon: Italic, title: "Курсив (Cmd+I)" },
            { cmd: "underline", icon: Underline, title: "Підкреслений (Cmd+U)" },
            { cmd: "insertUnorderedList", icon: List, title: "Маркований список" },
            { cmd: "insertOrderedList", icon: ListOrdered, title: "Нумерований список" },
            { cmd: "removeFormat", icon: RemoveFormatting, title: "Прибрати форматування" },
          ].map(({ cmd, icon: Icon, title }) => (
            <button
              key={cmd}
              type="button"
              title={title}
              aria-label={title}
              // mousedown keeps the selection inside the text while a button is pressed
              onMouseDown={(e) => {
                e.preventDefault();
                run(cmd);
              }}
              className={tool}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>
        <div
          ref={box}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label={label}
          onInput={sync}
          onBlur={sync}
          onPaste={(e) => {
            // Only plain text comes in: no colours, fonts or links from other pages.
            e.preventDefault();
            document.execCommand("insertText", false, e.clipboardData.getData("text/plain"));
          }}
          dangerouslySetInnerHTML={{ __html: start }}
          className="min-h-[140px] px-4 py-3 text-[14px] leading-relaxed outline-none focus:ring-2 focus:ring-red/30 [&_li]:ml-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-6"
        />
      </div>
      <input type="hidden" name={name} value={html} />
    </div>
  );
}
