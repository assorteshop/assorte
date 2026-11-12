"use client";

import { useId } from "react";
import { zhereb as t } from "@/content/zhereb";
import { HINT_MAX, visibleHints, type Hints } from "@/lib/zhereb";

const chip = (on: boolean) =>
  `rounded-full border px-4 py-2 text-[14px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-graphite ${
    on ? "border-red bg-red text-white" : "border-line bg-white hover:border-graphite"
  }`;
const field =
  "mt-2 w-full rounded-[14px] border border-line bg-white px-4 py-3 text-[15px] placeholder:text-muted/70 focus:border-graphite focus:outline-none focus-visible:ring-2 focus-visible:ring-graphite/30";
const label = "block font-heading text-[16px] font-bold";

/** A change to the answers: new values, or one «Що точно не надсилати?» chip to switch on or off. */
export type HintPatch = Partial<Hints> & { toggleAvoid?: string };

/** One-of chips (pressing the chosen one again clears it). */
function OneOf({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const id = useId();
  return (
    <div role="group" aria-labelledby={id}>
      <p id={id} className={label}>
        {title}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((o) => (
          <button key={o} type="button" aria-pressed={value === o} onClick={() => onChange(value === o ? "" : o)} className={chip(value === o)}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function Text({
  title,
  placeholder,
  value,
  onChange,
}: {
  title: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className={label}>
        {title}
      </label>
      <input
        id={id}
        value={value}
        maxLength={HINT_MAX}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={field}
      />
    </div>
  );
}

/** «Підказки для долі»: optional questions; the gift ones and the «Чистий жереб» rules follow lib/zhereb. */
export function HintsForm({ mood, hints, onPatch }: { mood: string | null; hints: Hints; onPatch: (p: HintPatch) => void }) {
  const q = t.hints;
  const shown = new Set(visibleHints(mood, hints.forWhom, q.forWhom.gift));
  const gift = hints.forWhom === q.forWhom.gift;
  const set = onPatch;
  const avoidId = useId();

  return (
    <div className="space-y-6">
      <OneOf title={q.forWhom.label} options={q.forWhom.options} value={hints.forWhom} onChange={(v) => set({ forWhom: v })} />
      {shown.has("onRepeat") && (
        <Text
          title={gift ? q.onRepeat.giftLabel : q.onRepeat.label}
          placeholder={q.onRepeat.placeholder}
          value={hints.onRepeat}
          onChange={(v) => set({ onRepeat: v })}
        />
      )}
      {shown.has("familiar") && (
        <OneOf title={q.familiar.label} options={q.familiar.options} value={hints.familiar} onChange={(v) => set({ familiar: v })} />
      )}
      {shown.has("language") && (
        <OneOf title={q.language.label} options={q.language.options} value={hints.language} onChange={(v) => set({ language: v })} />
      )}
      <div role="group" aria-labelledby={avoidId}>
        <p id={avoidId} className={label}>
          {q.avoid.label}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {q.avoid.options.map((o) => {
            const on = hints.avoid.includes(o);
            return (
              <button
                key={o}
                type="button"
                aria-pressed={on}
                onClick={() => set({ toggleAvoid: o })}
                className={chip(on)}
              >
                {o}
              </button>
            );
          })}
        </div>
        <label className="mt-3 block text-[14px] text-muted">
          {q.avoid.otherLabel}
          <input
            value={hints.avoidOther}
            maxLength={HINT_MAX}
            onChange={(e) => set({ avoidOther: e.target.value })}
            className={field}
          />
        </label>
      </div>
      <Text
        title={gift ? q.have.giftLabel : q.have.label}
        placeholder={q.have.placeholder}
        value={hints.have}
        onChange={(v) => set({ have: v })}
      />
      {shown.has("about") && (
        <Text title={q.about.label} placeholder={q.about.placeholder} value={hints.about} onChange={(v) => set({ about: v })} />
      )}
      {shown.has("cardWords") && (
        <Text
          title={q.cardWords.label}
          placeholder={q.cardWords.placeholder}
          value={hints.cardWords}
          onChange={(v) => set({ cardWords: v })}
        />
      )}
    </div>
  );
}
