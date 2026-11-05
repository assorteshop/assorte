"use client";

import { useSyncExternalStore } from "react";

const subscribe = (onChange: () => void) => {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
};
const scrolled = () => window.scrollY > 24;

// On the home page the header lies over the photo, transparent with white text,
// and turns white as soon as the visitor scrolls. Elsewhere it is the usual white sticky header.
export function HeaderFrame({ overlay = false, children }: { overlay?: boolean; children: React.ReactNode }) {
  const solid = useSyncExternalStore(subscribe, scrolled, () => false);

  if (!overlay) return <header className="sticky top-0 z-30 bg-white">{children}</header>;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-30 transition-colors duration-300 ${
        solid
          ? "bg-white text-graphite shadow-[0_1px_0_rgba(0,0,0,0.06)]"
          : "bg-transparent text-white [--logo-heart:#ffffff]"
      }`}
    >
      {children}
    </header>
  );
}
