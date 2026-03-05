"use client";

import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">

        {/* Heading and description */}
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Welcome to Your AI Dashboard
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Start interacting with your AI assistant using the{" "}
            <span className="font-medium text-zinc-950 dark:text-zinc-50">Chat Bot</span>,
            where you can ask questions, generate ideas, or get instant support.
            <br /><br />
            Monitor and optimize performance with the{" "}
            <span className="font-medium text-zinc-950 dark:text-zinc-50">Analytics</span>
            dashboard — track usage, latency, and top insights in real time.
            Explore the tools below to get started quickly and efficiently.
          </p>
        </div>

        {/* New Buttons for App Routes */}
        <div className="mt-8 flex flex-col gap-4 text-base font-medium sm:flex-row">
          <Link
            href="/chat"
            className="flex h-12 w-full items-center justify-center rounded-full bg-blue-600 px-5 text-white transition-colors hover:bg-blue-700 md:w-[158px]"
          >
            Chat Bot
          </Link>
          <Link
            href="/analytics"
            className="flex h-12 w-full items-center justify-center rounded-full bg-green-600 px-5 text-white transition-colors hover:bg-green-700 md:w-[158px]"
          >
            Analytics
          </Link>
        </div>

      </main>
    </div>
  );
}