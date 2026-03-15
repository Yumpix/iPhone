import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Учет телефонов",
  description: "Простой учет закупок и продаж телефонов"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <div className="min-h-screen bg-slate-950 text-slate-100">
          <header className="border-b border-slate-800">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
              <div>
                <p className="text-sm uppercase text-slate-400">Учет телефонов</p>
                <h1 className="text-2xl font-semibold">Партии, закупки и продажи</h1>
              </div>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                Next.js · Prisma · SQLite
              </span>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
