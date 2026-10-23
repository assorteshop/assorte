import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Адмінка — ASSORTE",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-ivory">{children}</div>;
}
