import "~/styles/globals.css";

import { Inter } from "next/font/google";
import BrightnessToggleButton from "./_components/BrightnessToggleButton";
import { cookies } from "next/headers";
import { Toaster } from "~/components/ui/sonner";
import { ThemeModeScript } from "flowbite-react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Overlapp",
  description: "Generated by Mathis Lefranc",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const theme = cookieStore.get("theme")?.value ?? "light";

  return (
    <html lang="en">
      <head>
        <ThemeModeScript />
      </head>
      <body
        className={`font-sans ${inter.variable} ${theme === "dark" ? theme : ""}`}
      >
        <nav className="flex flex-row justify-between bg-slate-300 px-5 py-4 dark:bg-slate-900">
          <a href="/" className="my-auto text-xl font-extrabold">
            {metadata.title}
          </a>
          <BrightnessToggleButton theme={theme} />
        </nav>
        <main className="flex flex-col gap-6 px-8 py-20 sm:px-24 md:px-44 lg:px-72 xl:px-96">
          {children}
        </main>
        <footer className="flex flex-col p-3"></footer>
        <Toaster />
      </body>
    </html>
  );
}
